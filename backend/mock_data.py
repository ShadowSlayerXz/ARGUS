"""
Mock data loader for ARGUS MVP
Loads satellite and conjunction data from external files
"""

import json
import math
import os
from datetime import datetime, timedelta

# Resolve the data directory relative to this file
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


def _load_satellites():
    """Load satellite records from the data file."""
    filepath = os.path.join(DATA_DIR, "satellites.txt")
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def _load_conjunctions():
    """Load conjunction records from the data file and compute timestamps."""
    filepath = os.path.join(DATA_DIR, "conjunctions.txt")
    with open(filepath, "r", encoding="utf-8") as f:
        raw = json.load(f)

    conjunctions = []
    for entry in raw:
        conj = dict(entry)

        # Compute TCA from offset
        tca_offset = conj.pop("tca_offset_days", 0)
        conj["tca"] = (datetime.utcnow() + timedelta(days=tca_offset)).isoformat() + "Z"

        # Compute maneuver execution time from offset
        maneuver = conj.get("recommended_maneuver")
        if maneuver is not None:
            exec_offset = maneuver.pop("execution_offset_days", 0)
            maneuver["execution_time"] = (
                datetime.utcnow() + timedelta(days=exec_offset)
            ).isoformat() + "Z"

        conjunctions.append(conj)

    return conjunctions


# Module-level data loaded once on import
SATELLITES = _load_satellites()
CONJUNCTIONS = _load_conjunctions()


def propagate_satellite(sat, time_offset_seconds=0):
    """
    Simple circular orbit propagation for visualization.
    Suitable for demonstration purposes only.
    """
    # Constants
    earth_radius = 6371000  # metres
    mu = 3.986004418e14     # Earth gravitational parameter (m^3/s^2)

    # Orbital parameters
    altitude = sat["altitude_km"] * 1000  # metres
    inclination = math.radians(sat["inclination_deg"])

    # Orbital radius and period
    r = earth_radius + altitude
    period = 2 * math.pi * math.sqrt(r**3 / mu)

    # Angular position in orbit
    angle = (time_offset_seconds / period) * 2 * math.pi

    # Position in orbital plane
    x_orbit = r * math.cos(angle)
    y_orbit = r * math.sin(angle)

    # Apply inclination (rotate around x-axis)
    x = x_orbit
    y = y_orbit * math.cos(inclination)
    z = y_orbit * math.sin(inclination)

    # Velocity (perpendicular to position, in orbital plane)
    v_magnitude = math.sqrt(mu / r)
    vx = -v_magnitude * math.sin(angle)
    vy = v_magnitude * math.cos(angle) * math.cos(inclination)
    vz = v_magnitude * math.cos(angle) * math.sin(inclination)

    return {
        "position": {
            "x": x / 1000,   # km
            "y": y / 1000,
            "z": z / 1000,
        },
        "velocity": {
            "x": vx / 1000,  # km/s
            "y": vy / 1000,
            "z": vz / 1000,
        },
        "altitude_km": sat["altitude_km"],
        "speed_kmh": v_magnitude * 3.6,  # m/s to km/h
    }


def get_all_satellites():
    """Return all satellites with current positions."""
    result = []
    for sat in SATELLITES:
        state = propagate_satellite(sat)
        result.append({**sat, "current_state": state})
    return result


def get_satellite_by_id(sat_id):
    """Get a specific satellite with its current position."""
    sat = next((s for s in SATELLITES if s["id"] == sat_id), None)
    if sat:
        state = propagate_satellite(sat)
        return {**sat, "current_state": state}
    return None


def get_all_conjunctions():
    """Return all conjunctions."""
    return CONJUNCTIONS


def get_conjunction_by_id(conj_id):
    """Get a specific conjunction."""
    return next((c for c in CONJUNCTIONS if c["id"] == conj_id), None)


def get_conjunctions_for_satellite(sat_id):
    """Get all conjunctions for a specific satellite."""
    return [c for c in CONJUNCTIONS if c["primary_satellite_id"] == sat_id]
