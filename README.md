# ARGUS

**Open-source space debris tracking and collision avoidance platform.**

---

## About

Earth orbit hosts over 30,000 tracked objects alongside millions of untracked debris fragments. At orbital velocities of 7–8 km/s, even a minor collision can destroy an operational satellite and produce thousands of additional fragments — accelerating the cascading effect known as the Kessler Syndrome.

Current conjunction assessment workflows are fragmented, manual, and dependent on periodic government-issued data messages. They do not scale to the growing density of the orbital environment.

ARGUS addresses this gap by consolidating debris tracking, conjunction detection, risk assessment, and manoeuvre planning into a single, unified platform. It provides satellite operators with the situational awareness needed to protect orbital assets and make timely, informed decisions.

---

## Platform Capabilities

ARGUS delivers an end-to-end conjunction assessment workflow through five core functions:

- **Track** — Ingest orbital data and maintain a continuously updated catalogue of tracked objects.
- **Detect** — Identify upcoming close approaches between objects and compute miss distance, relative velocity, and collision probability.
- **Assess** — Classify conjunction events by severity (HIGH / MEDIUM / LOW) to support operator prioritisation.
- **Visualise** — Render the orbital environment in an interactive 3D view, enabling rapid geometric understanding of conjunction scenarios.
- **Recommend** — For manoeuvrable satellites, generate avoidance manoeuvre options with estimated delta-v, direction, timing, and fuel cost.

---

## Key Features

- **Real-time 3D orbital visualisation** with interactive globe, satellite trajectories, and animated position markers.
- **Automated conjunction detection** with collision probability, miss distance, and time-to-closest-approach computation.
- **Risk classification engine** that categorises events by severity for prioritised operator response.
- **Manoeuvre recommendation system** providing actionable avoidance options with associated resource costs.
- **Live data streaming** via WebSocket for continuous situational awareness without manual refresh.

---

## Development Status

ARGUS is currently in the **Minimum Viable Product (MVP)** stage. The platform demonstrates the core user experience and interface design using simulated orbital data. Integration with live data sources such as Space-Track.org is planned for subsequent development phases.

---

## Documentation

Detailed technical and setup documentation is maintained separately:

| Document | Description |
|---|---|
| [Architecture Overview](ARCHITECTURE.md) | Project structure, API surface, technology stack, and system internals |
| [Setup Guide](SETUP_GUIDE.md) | Installation, configuration, and local development instructions |

---

## Roadmap

Planned development milestones include:

- Integration with live TLE data from Space-Track.org
- SGP4 orbit propagation for high-fidelity positioning
- Persistent storage layer (PostgreSQL)
- User authentication and role-based access control
- Alerting infrastructure (email and SMS) for high-risk conjunction events
- Cloud deployment (AWS / GCP)
- Historical conjunction analysis and trend reporting

---

## Contributing

Contributions are welcome. Please open an issue to discuss proposed changes before submitting a pull request.

## License

Apache 2.0
