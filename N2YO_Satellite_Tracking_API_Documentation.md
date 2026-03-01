# N2YO Satellite Tracking API Documentation

## 1) Get TLE

### Purpose
Retrieve the Two-Line Element (TLE) set for a satellite identified by its NORAD ID.

This endpoint is used when you need raw orbital elements to perform your own satellite propagation using models such as SGP4. It is ideal for building custom tracking engines or offline orbital calculations.

### Endpoint
`GET /tle/{id}`

### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | NORAD satellite ID |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `satid` | integer | NORAD ID used in input |
| `satname` | string | Satellite name |
| `transactionscount` | integer | API transactions in last 60 minutes |
| `tle` | string | TLE as single-line string (split using `\r\n`) |

### Example Request
`https://api.n2yo.com/rest/v1/satellite/tle/25544&apiKey=YOUR_API_KEY`

### Example JSON Response
```json
{
  "info": {
    "satid": 25544,
    "satname": "SPACE STATION",
    "transactionscount": 4
  },
  "tle": "1 25544U 98067A   18077.09047010  .00001878  00000-0  35621-4 0  9999\r\n2 25544  51.6412 112.8495 0001928 208.4187 178.9720 15.54106440104358"
}
```

---

## 2) Get Satellite Positions

### Purpose
Retrieve future satellite positions as ground track data (latitude, longitude) and observer-relative coordinates.

Each element in the response array represents one second of calculated position. The first element corresponds to the current UTC time.

This endpoint is useful for:
- Displaying live satellite positions on maps
- Tracking azimuth and elevation for antenna control
- Creating real-time dashboards

### Endpoint
`GET /positions/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{seconds}`

### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | NORAD ID |
| `observer_lat` | float | Yes | Observer latitude (decimal degrees) |
| `observer_lng` | float | Yes | Observer longitude (decimal degrees) |
| `observer_alt` | float | Yes | Observer altitude above sea level (meters) |
| `seconds` | integer | Yes | Future seconds to calculate (max 300) |

### Response Parameters

| Parameter | Type | Description |
|---|---|---|
| `satlatitude` | float | Satellite footprint latitude |
| `satlongitude` | float | Satellite footprint longitude |
| `sataltitude` | float | Satellite altitude (km) |
| `azimuth` | float | Observer-relative azimuth (degrees) |
| `elevation` | float | Observer-relative elevation (degrees) |
| `ra` | float | Right ascension (degrees) |
| `dec` | float | Declination (degrees) |
| `timestamp` | integer | Unix UTC timestamp |

### Example Request
`https://api.n2yo.com/rest/v1/satellite/positions/25544/41.702/-76.014/0/2/&apiKey=YOUR_API_KEY`

### Example JSON Response
```json
{
  "info": {
    "satname": "SPACE STATION",
    "satid": 25544,
    "transactionscount": 5
  },
  "positions": [
    {
      "satlatitude": -39.90318514,
      "satlongitude": 158.28897924,
      "sataltitude": 417.85,
      "azimuth": 254.31,
      "elevation": -69.09,
      "ra": 44.77078138,
      "dec": -43.99279118,
      "timestamp": 1521354418
    }
  ]
}
```

---

## 3) Get Visual Passes

### Purpose
Retrieve predicted visually observable satellite passes relative to a given location.

A visual pass occurs when:
- The satellite is above the horizon
- The satellite is illuminated by the Sun
- The sky is dark enough for observation

Useful for astronomy applications and observation planning.

### Endpoint
`GET /visualpasses/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{days}/{min_visibility}`

### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | integer | Yes | NORAD ID |
| `observer_lat` | float | Yes | Observer latitude |
| `observer_lng` | float | Yes | Observer longitude |
| `observer_alt` | float | Yes | Observer altitude (m) |
| `days` | integer | Yes | Prediction window (max 10 days) |
| `min_visibility` | integer | Yes | Minimum visible seconds |

### Example Request
`https://api.n2yo.com/rest/v1/satellite/visualpasses/25544/41.702/-76.014/0/2/300/&apiKey=YOUR_API_KEY`

### Example JSON Response
```json
{
  "info": {
    "satid": 25544,
    "satname": "SPACE STATION",
    "transactionscount": 4,
    "passescount": 1
  },
  "passes": [
    {
      "startAz": 307.21,
      "startAzCompass": "NW",
      "startEl": 13.08,
      "startUTC": 1521368025,
      "maxAz": 225.45,
      "maxAzCompass": "SW",
      "maxEl": 78.27,
      "maxUTC": 1521368345,
      "endAz": 132.82,
      "endAzCompass": "SE",
      "endEl": 0,
      "endUTC": 1521368660,
      "mag": -2.4,
      "duration": 485
    }
  ]
}
```

---

## 4) Get Radio Passes

### Purpose
Retrieve predicted radio communication passes for satellites.

Unlike visual passes, optical visibility is not required. This endpoint is primarily used for:
- Amateur radio tracking
- CubeSat ground stations
- Antenna alignment systems

### Endpoint
`GET /radiopasses/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{days}/{min_elevation}`

### Example Request
`https://api.n2yo.com/rest/v1/satellite/radiopasses/25544/41.702/-76.014/0/2/40/&apiKey=YOUR_API_KEY`

### Example JSON Response
```json
{
  "info": {
    "satid": 25544,
    "satname": "SPACE STATION",
    "transactionscount": 2,
    "passescount": 1
  },
  "passes": [
    {
      "startAz": 311.57,
      "startAzCompass": "NW",
      "startUTC": 1521451295,
      "maxAz": 37.98,
      "maxAzCompass": "NE",
      "maxEl": 52.19,
      "maxUTC": 1521451615,
      "endAz": 118.6,
      "endAzCompass": "ESE",
      "endUTC": 1521451925
    }
  ]
}
```

---

## 5) What’s Up? (Above Function)

### Purpose
Return satellites currently located above the observer’s position within a specified search radius and optional category filter.

This endpoint is suitable for:
- Live sky dashboards
- Satellite density visualization
- Category-specific filtering (e.g., Amateur Radio, GPS, Starlink)

### Endpoint
`GET /above/{observer_lat}/{observer_lng}/{observer_alt}/{search_radius}/{category_id}`

### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `observer_lat` | float | Yes | Observer latitude |
| `observer_lng` | float | Yes | Observer longitude |
| `observer_alt` | float | Yes | Observer altitude (m) |
| `search_radius` | integer | Yes | Search radius (0–90 degrees) |
| `category_id` | integer | Yes | Category ID (`0` for all categories) |

### Example Request
`https://api.n2yo.com/rest/v1/satellite/above/41.702/-76.014/0/70/18/&apiKey=YOUR_API_KEY`

### Example JSON Response
```json
{
  "info": {
    "category": "Amateur radio",
    "transactionscount": 17,
    "satcount": 1
  },
  "above": [
    {
      "satid": 20480,
      "satname": "JAS 1B (FUJI 2)",
      "intDesignator": "1990-013C",
      "launchDate": "1990-02-07",
      "satlat": 49.5744,
      "satlng": -96.7081,
      "satalt": 1227.9326
    }
  ]
}
```

---

## Notes
- Base URL (as used in examples): `https://api.n2yo.com/rest/v1/satellite`
- All requests require `apiKey` as a query parameter.
- Timestamps in examples are UTC.
