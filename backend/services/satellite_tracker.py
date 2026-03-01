"""
Satellite Tracking Service
Combines N2YO API with SGP4 propagation
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from .n2yo_client import n2yo_client
from .orbital_propogator import orbital_propagator
import asyncio


class SatelliteTracker:
    """Manages satellite tracking with live TLE data"""
    
    def __init__(self):
        self.tracked_satellites = []  # List of NORAD IDs we're tracking
        self.satellite_info = {}  # Cache of satellite metadata
        self.last_tle_update = {}  # Track when TLEs were last fetched
    
    async def add_satellite(self, norad_id: int) -> bool:
        """
        Add a satellite to tracking list and fetch its TLE
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Fetch TLE from N2YO
            tle_data = await n2yo_client.get_tle(norad_id)
            
            if not tle_data or 'tle' not in tle_data:
                print(f"Failed to fetch TLE for {norad_id}")
                return False
            
            # Parse TLE
            tle_string = tle_data['tle']
            tle_lines = tle_string.split('\r\n')
            
            if len(tle_lines) < 2:
                print(f"Invalid TLE format for {norad_id}")
                return False
            
            # Load into SGP4
            success = orbital_propagator.load_tle(norad_id, tle_lines[0], tle_lines[1])
            
            if success:
                if norad_id not in self.tracked_satellites:
                    self.tracked_satellites.append(norad_id)
                
                # Cache satellite info
                self.satellite_info[norad_id] = {
                    'norad_id': norad_id,
                    'name': tle_data['info']['satname'],
                    'tle_epoch': datetime.utcnow().isoformat() + 'Z'
                }
                self.last_tle_update[norad_id] = datetime.utcnow()
                
                print(f"[+] Added satellite {norad_id} ({tle_data['info']['satname']})")
                return True
            
            return False
            
        except Exception as e:
            print(f"Error adding satellite {norad_id}: {e}")
            return False
    
    async def get_current_position(self, norad_id: int) -> Optional[Dict[str, Any]]:
        """Get current position of a satellite"""
        
        if norad_id not in self.tracked_satellites:
            await self.add_satellite(norad_id)
        
        if norad_id in self.last_tle_update:
            age = datetime.utcnow() - self.last_tle_update[norad_id]
            if age > timedelta(hours=24):
                print(f"Refreshing TLE for {norad_id} (age: {age})")
                await self.add_satellite(norad_id)
        
        state = orbital_propagator.propagate(norad_id)
        
        if state and norad_id in self.satellite_info:
            state['name'] = self.satellite_info[norad_id]['name']
            state['norad_id'] = norad_id
        
        return state
    
    async def get_all_positions(self) -> List[Dict[str, Any]]:
        positions = []
        
        for norad_id in self.tracked_satellites:
            state = await self.get_current_position(norad_id)
            if state:
                positions.append(state)
        
        return positions
    
    async def predict_positions(self, norad_id: int, duration_minutes: int = 90, interval_seconds: int = 60) -> List[Dict[str, Any]]:
        """
        Predict future positions of a satellite
        
        Args:
            norad_id: Satellite NORAD ID
            duration_minutes: How far into the future to predict
            interval_seconds: Time step between predictions
            
        Returns:
            List of position states
        """
        if norad_id not in self.tracked_satellites:
            await self.add_satellite(norad_id)
        
        predictions = []
        current_time = datetime.utcnow()
        
        for i in range(0, duration_minutes * 60, interval_seconds):
            target_time = current_time + timedelta(seconds=i)
            state = orbital_propagator.propagate(norad_id, target_time)
            
            if state:
                predictions.append(state)
        
        return predictions
    
    async def initialize_default_satellites(self):
        default_sats = [
            25544,  # ISS
            48274,  # Starlink-1234
            43658,  # Starlink-1007
            44713,  # Starlink-1130
        ]
        
        print("\n[*] Initializing satellite tracking...")
        for norad_id in default_sats:
            await self.add_satellite(norad_id)
        print(f"[OK] Tracking {len(self.tracked_satellites)} satellites\n")


satellite_tracker = SatelliteTracker()