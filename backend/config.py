"""
configuration for the argus backend , this will load the settings from environment variables and provide a singleton instance of the configuration to be used throughout the application.
"""

import os
import pathlib 
from dotenv import load_dotenv

# Load environment variables from .env file in the same directory
env_path = pathlib.Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

class Config:
    
    # API keys and base URLs
    N2YO_API_KEY = os.getenv('N2YO_API_KEY','')
    N2YO_BASE_URL = os.getenv('N2YO_BASE_URL','https://api.n2yo.com/rest/v1/satellite')
    
    ENVIRONMENT: str = os.getenv('ENVIRONMENT', 'development')
    DEBUG: bool = os.getenv('DEBUG', 'True').lower() == 'true'
    API_HOST: str = os.getenv('API_HOST', '0.0.0.0')
    API_PORT: int = int(os.getenv('API_PORT', 8000))
    
    #cache settings
    CACHE_TTL_SECONDS: int = int(os.getenv('CACHE_TTL_SECONDS', '300'))
    ENABLE_CACHE: bool = os.getenv('ENABLE_CACHE', 'False').lower() == 'true'
    
    #Default observer location (lat, lon, alt)
    DEFAULT_OBSERVER_LAT: float = float(os.getenv('DEFAULT_OBSERVER_LAT', '17.3850'))
    DEFAULT_OBSERVER_LNG: float = float(os.getenv('DEFAULT_OBSERVER_LNG', '78.4867'))
    DEFAULT_OBSERVER_ALT: float = float(os.getenv('DEFAULT_OBSERVER_ALT', '0.0'))
    
    @classmethod
    def validate(cls) -> bool:
        """Validate critical configuration"""
        if not cls.N2YO_API_KEY or cls.N2YO_API_KEY == 'YOUR_API_KEY_HERE':
            print("[!] WARNING: N2YO_API_KEY not set. Live data features will be disabled.")
            return False
        return True
    
    @classmethod
    def display(cls):
        """Display current configuration (for debugging)"""
        print("\n" + "="*50)
        print("ARGUS Backend Configuration")
        print("="*50)
        print(f"Environment:        {cls.ENVIRONMENT}")
        print(f"Debug Mode:         {cls.DEBUG}")
        print(f"API Host:           {cls.API_HOST}:{cls.API_PORT}")
        print(f"N2YO API:           {'[OK] Configured' if cls.N2YO_API_KEY and cls.N2YO_API_KEY != 'YOUR_API_KEY_HERE' else '[X] Not configured'}")
        print(f"Cache Enabled:      {cls.ENABLE_CACHE}")
        print(f"Cache TTL:          {cls.CACHE_TTL_SECONDS}s")
        print(f"Default Location:   ({cls.DEFAULT_OBSERVER_LAT}, {cls.DEFAULT_OBSERVER_LNG})")
        print("="*50 + "\n")


# Global config instance
config = Config()
    

