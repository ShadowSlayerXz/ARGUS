import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const EARTH_RADIUS = 1;
const SCALE = EARTH_RADIUS / 6371; // km → scene units

/* ------------------------------------------------------------------ */
/*  Earth                                                              */
/* ------------------------------------------------------------------ */
function Earth() {
    const ref = useRef<THREE.Mesh>(null);

    useFrame((_, dt) => {
        if (ref.current) ref.current.rotation.y += dt * 0.03;
    });

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
            <meshStandardMaterial color="#0a1628" roughness={0.9} metalness={0.1} />
        </mesh>
    );
}

/* ------------------------------------------------------------------ */
/*  Grid + atmosphere (imperative to avoid JSX type issues)            */
/* ------------------------------------------------------------------ */
function GridAndAtmosphere() {
    const { scene } = useThree();

    useEffect(() => {
        const group = new THREE.Group();
        group.name = 'grid-atmosphere';
        const r = EARTH_RADIUS + 0.002;
        const mat = new THREE.LineBasicMaterial({ color: '#1a3050', transparent: true, opacity: 0.5 });
        const eqMat = new THREE.LineBasicMaterial({ color: '#1e4060', transparent: true, opacity: 0.7 });

        // Latitude lines every 30°
        for (let lat = -60; lat <= 60; lat += 30) {
            const pts: THREE.Vector3[] = [];
            const phi = (90 - lat) * (Math.PI / 180);
            for (let i = 0; i <= 64; i++) {
                const th = (i / 64) * Math.PI * 2;
                pts.push(new THREE.Vector3(
                    r * Math.sin(phi) * Math.cos(th),
                    r * Math.cos(phi),
                    r * Math.sin(phi) * Math.sin(th),
                ));
            }
            group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat));
        }

        // Longitude lines every 30°
        for (let lon = 0; lon < 180; lon += 30) {
            const pts: THREE.Vector3[] = [];
            const th = lon * (Math.PI / 180);
            for (let i = 0; i <= 64; i++) {
                const phi = (i / 64) * Math.PI;
                pts.push(new THREE.Vector3(
                    r * Math.sin(phi) * Math.cos(th),
                    r * Math.cos(phi),
                    r * Math.sin(phi) * Math.sin(th),
                ));
            }
            group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
        }

        // Equator
        const eqPts: THREE.Vector3[] = [];
        for (let i = 0; i <= 64; i++) {
            const th = (i / 64) * Math.PI * 2;
            eqPts.push(new THREE.Vector3(r * Math.cos(th), 0, r * Math.sin(th)));
        }
        group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(eqPts), eqMat));

        // Atmosphere
        const atmoGeo = new THREE.SphereGeometry(EARTH_RADIUS + 0.02, 64, 64);
        const atmoMat = new THREE.MeshStandardMaterial({
            color: '#1a3a5c', transparent: true, opacity: 0.08, side: THREE.BackSide,
        });
        group.add(new THREE.Mesh(atmoGeo, atmoMat));

        scene.add(group);
        return () => { scene.remove(group); };
    }, [scene]);

    return null;
}

/* ------------------------------------------------------------------ */
/*  Orbits + markers (imperative)                                      */
/* ------------------------------------------------------------------ */
interface SatData {
    id: string;
    name: string;
    altitude_km: number;
    inclination_deg: number;
    status: string;
}

const COLORS: Record<string, string> = {
    sat_iss: '#3b82f6',
    sat_demo1: '#22c55e',
    sat_starlink: '#a855f7',
    sat_debris: '#ef4444',
    sat_cubesat: '#06b6d4',
};

function getColor(id: string, status: string) {
    if (status === 'INACTIVE') return '#6b7280';
    return COLORS[id] || '#60a5fa';
}

function Orbits({ satellites, onSelect }: { satellites: SatData[]; onSelect: (id: string) => void }) {
    const { scene } = useThree();
    const markersRef = useRef<{ mesh: THREE.Mesh; sat: SatData; phase: number }[]>([]);

    // Build orbit rings + marker meshes
    useEffect(() => {
        const group = new THREE.Group();
        group.name = 'orbits';
        const markers: { mesh: THREE.Mesh; sat: SatData; phase: number }[] = [];

        satellites.forEach((sat) => {
            const color = getColor(sat.id, sat.status);
            const r = EARTH_RADIUS + sat.altitude_km * SCALE;
            const inc = sat.inclination_deg * (Math.PI / 180);

            // Orbit ring
            const pts: THREE.Vector3[] = [];
            for (let i = 0; i <= 128; i++) {
                const a = (i / 128) * Math.PI * 2;
                const x = r * Math.cos(a);
                const yOrb = r * Math.sin(a);
                pts.push(new THREE.Vector3(x, yOrb * Math.sin(inc), yOrb * Math.cos(inc)));
            }
            const ringMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 });
            group.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), ringMat));

            // Marker
            const markerGeo = new THREE.SphereGeometry(0.018, 10, 10);
            const markerMat = new THREE.MeshBasicMaterial({ color });
            const mesh = new THREE.Mesh(markerGeo, markerMat);
            group.add(mesh);

            const phase = (sat.altitude_km * 0.1) % (Math.PI * 2);
            markers.push({ mesh, sat, phase });
        });

        markersRef.current = markers;
        scene.add(group);
        return () => {
            scene.remove(group);
            markersRef.current = [];
        };
    }, [satellites, scene, onSelect]);

    // Animate markers
    useFrame(({ clock }) => {
        markersRef.current.forEach(({ mesh, sat, phase }) => {
            const r = EARTH_RADIUS + sat.altitude_km * SCALE;
            const inc = sat.inclination_deg * (Math.PI / 180);
            const period = 20 + sat.altitude_km * 0.02;
            const a = phase + (clock.getElapsedTime() / period) * Math.PI * 2;
            const x = r * Math.cos(a);
            const yOrb = r * Math.sin(a);
            mesh.position.set(x, yOrb * Math.sin(inc), yOrb * Math.cos(inc));
        });
    });

    return null;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
interface GlobeViewProps {
    satellites: SatData[];
    onSelectSatellite: (id: string) => void;
}

const GlobeView: React.FC<GlobeViewProps> = ({ satellites, onSelectSatellite }) => {
    return (
        <div className="panel" style={{ height: 420, position: 'relative' }}>
            <div className="panel-header">
                <span>Orbital View</span>
                <span className="badge">{satellites.length} objects</span>
            </div>

            <div style={{ height: 'calc(100% - 37px)', background: '#0a0d12', borderRadius: '0 0 6px 6px' }}>
                <Canvas camera={{ position: [0, 1.2, 2.8], fov: 45 }} gl={{ antialias: true }}>
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[5, 3, 5]} intensity={0.8} />
                    <pointLight position={[-5, -3, -5]} intensity={0.2} />

                    <Earth />
                    <GridAndAtmosphere />
                    <Orbits satellites={satellites} onSelect={onSelectSatellite} />

                    <OrbitControls
                        enablePan={false}
                        minDistance={2}
                        maxDistance={6}
                        enableDamping
                        dampingFactor={0.05}
                        rotateSpeed={0.5}
                    />
                </Canvas>
            </div>

            {/* Legend */}
            <div style={{
                position: 'absolute', bottom: 12, left: 14,
                display: 'flex', gap: 12, fontSize: 10, color: '#6b7280',
            }}>
                {satellites.map((sat) => (
                    <span
                        key={sat.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                        onClick={() => onSelectSatellite(sat.id)}
                    >
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: getColor(sat.id, sat.status), display: 'inline-block',
                        }} />
                        {sat.name}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default GlobeView;
