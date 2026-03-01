"""
N2YO API Client
Handles all communication with the N2YO satellite tracking API
"""

import httpx
from typing import Optional, Dict, Any
from datetime import datetime
import asyncio

from config import config

class N2YOClient:
    
    def __init__(self):
        self.api_key = config.N2YO_API_KEY
        self.base_url = config.N2YO_BASE_URL
        self.client = httpx.AsyncClient(timeout=30.0)
        
    async def close(self):
        """Close any resources if needed (e.g., HTTP client)"""
        await self.client.aclose()
        
    def _build_url(self, endpoint: str) -> str:
        """Construct the full API URL for a given endpoint"""
        return f"{self.base_url}{endpoint}&apiKey={self.api_key}"
    
        
    async def get_tle(self, norad_id: int) -> Optional[Dict[str, Any]]:
        """
        Get Two-Line Element set for a satellite
        
        Args:
            norad_id: NORAD satellite ID
            
        Returns:
            TLE data including satellite info and orbital elements
        """
        try:
            url = self._build_url(f"/tle/{norad_id}")
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching TLE for {norad_id}: {e}")
            return None
    
    async def get_positions(
        self,
        norad_id: int,
        observer_lat: float,
        observer_lng: float,
        observer_alt: float,
        seconds: int = 300
    ) -> Optional[Dict[str, Any]]:
        """
        Get future satellite positions
        
        Args:
            norad_id: NORAD satellite ID
            observer_lat: Observer latitude (degrees)
            observer_lng: Observer longitude (degrees)
            observer_alt: Observer altitude (meters)
            seconds: Future seconds to calculate (max 300)
            
        Returns:
            Position data including lat/lng/alt and observer-relative coords
        """
        try:
            url = self._build_url(
                f"/positions/{norad_id}/{observer_lat}/{observer_lng}/{observer_alt}/{seconds}"
            )
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching positions for {norad_id}: {e}")
            return None
    
    async def get_visual_passes(
        self,
        norad_id: int,
        observer_lat: float,
        observer_lng: float,
        observer_alt: float,
        days: int = 10,
        min_visibility: int = 300
    ) -> Optional[Dict[str, Any]]:
        """
        Get predicted visual passes
        
        Args:
            norad_id: NORAD satellite ID
            observer_lat: Observer latitude
            observer_lng: Observer longitude
            observer_alt: Observer altitude (meters)
            days: Prediction window (max 10 days)
            min_visibility: Minimum visible seconds
            
        Returns:
            List of visual passes with timing and geometry
        """
        try:
            url = self._build_url(
                f"/visualpasses/{norad_id}/{observer_lat}/{observer_lng}/{observer_alt}/{days}/{min_visibility}"
            )
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching visual passes for {norad_id}: {e}")
            return None
    
    async def get_radio_passes(
        self,
        norad_id: int,
        observer_lat: float,
        observer_lng: float,
        observer_alt: float,
        days: int = 10,
        min_elevation: int = 40
    ) -> Optional[Dict[str, Any]]:
        """
        Get predicted radio communication passes
        
        Args:
            norad_id: NORAD satellite ID
            observer_lat: Observer latitude
            observer_lng: Observer longitude
            observer_alt: Observer altitude (meters)
            days: Prediction window (max 10 days)
            min_elevation: Minimum elevation angle (degrees)
            
        Returns:
            List of radio passes with timing and geometry
        """
        try:
            url = self._build_url(
                f"/radiopasses/{norad_id}/{observer_lat}/{observer_lng}/{observer_alt}/{days}/{min_elevation}"
            )
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching radio passes for {norad_id}: {e}")
            return None
    
    async def get_above(
        self,
        observer_lat: float,
        observer_lng: float,
        observer_alt: float,
        search_radius: int = 70,
        category_id: int = 0
    ) -> Optional[Dict[str, Any]]:
        """
        Get satellites currently above observer location
        
        Args:
            observer_lat: Observer latitude
            observer_lng: Observer longitude
            observer_alt: Observer altitude (meters)
            search_radius: Search radius (0-90 degrees)
            category_id: Category ID (0 for all categories)
            
        Returns:
            List of satellites currently above the location
        """
        try:
            url = self._build_url(
                f"/above/{observer_lat}/{observer_lng}/{observer_alt}/{search_radius}/{category_id}"
            )
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"Error fetching satellites above location: {e}")
            return None


# Global client instance
n2yo_client = N2YOClient()