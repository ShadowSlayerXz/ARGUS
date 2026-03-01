"""
SGP4 Orbital Propagation Service
Converts TLE data to real satellite positions
"""

from sgp4.api import Satrec, jday
from datetime import datetime, timezone
import math
from typing import Dict, Any, Optional


class OrbitalPropagator:
    """Propagates satellite orbits using SGP4"""
    
    def __init__(self):
        self.satellites = {}  # Cache of Satrec objects
    
    def load_tle(self, norad_id: int, tle_line1: str, tle_line2: str):
        """Load TLE into SGP4 propagator"""
        try:
            satellite = Satrec.twoline2rv(tle_line1, tle_line2)
            self.satellites[norad_id] = satellite
            return True
        except Exception as e:
            print(f"Error loading TLE for {norad_id}: {e}")
            return False
    
    def propagate(self, norad_id: int, target_time: datetime = None) -> Optional[Dict[str, Any]]:
        """
        Propagate satellite position at given time
        
        Returns:
            Dictionary with position (x,y,z km) and velocity (vx,vy,vz km/s)
        """
        if norad_id not in self.satellites:
            return None
        
        satellite = self.satellites[norad_id]
        
        # Use current time if not specified
        if target_time is None:
            target_time = datetime.now(timezone.utc)
        
        # Convert to Julian date
        jd, fr = jday(
            target_time.year,
            target_time.month,
            target_time.day,
            target_time.hour,
            target_time.minute,
            target_time.second + target_time.microsecond / 1e6
        )
        
        # Propagate
        error_code, position, velocity = satellite.sgp4(jd, fr)
        
        if error_code != 0:
            print(f"SGP4 error code {error_code} for satellite {norad_id}")
            return None
        
        # Calculate altitude
        x, y, z = position
        r = math.sqrt(x*x + y*y + z*z)
        altitude_km = r - 6371.0  # Earth radius
        
        # Calculate lat/lng
        lat = math.degrees(math.asin(z / r))
        lng = math.degrees(math.atan2(y, x))
        
        return {
            "position": {
                "x": position[0],
                "y": position[1],
                "z": position[2]
            },
            "velocity": {
                "x": velocity[0],
                "y": velocity[1],
                "z": velocity[2]
            },
            "altitude_km": altitude_km,
            "latitude": lat,
            "longitude": lng,
            "timestamp": target_time.isoformat() + "Z"
        }
    
    def calculate_distance(self, pos1: Dict, pos2: Dict) -> float:
        """Calculate distance between two positions in km"""
        dx = pos1['x'] - pos2['x']
        dy = pos1['y'] - pos2['y']
        dz = pos1['z'] - pos2['z']
        return math.sqrt(dx*dx + dy*dy + dz*dz)


# Global propagator instance
orbital_propagator = OrbitalPropagator()