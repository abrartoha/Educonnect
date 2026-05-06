import { Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { ArrowLeft, MapPin, Train, Bus, X } from 'lucide-react';
import { BUILDINGS, TRANSIT_STOPS, BOUNDARY_RADIUS_METERS, CAMPUS_CENTRE } from './data';
import { latLngToLocal } from './coords';
import Avatar from './Avatar';
import CameraRig from './CameraRig';
import GoogleTiles from './GoogleTiles';
import Markers from './Markers';
import { MiniMap, Joystick } from './HUD';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Simple boundary visual — gold ring at the edge of the explorable area.
function Boundary({ radius }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <ringGeometry args={[radius - 1, radius, 96]} />
      <meshBasicMaterial color="#facc15" transparent opacity={0.7} side={THREE.DoubleSide} />
    </mesh>
  );
}

// Procedural ground that fills in when Google 3D Tiles isn't configured yet.
function PlaceholderGround({ tilesEnabled }) {
  if (tilesEnabled) return null;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[BOUNDARY_RADIUS_METERS, 96]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* light grid lines so you can see your motion */}
      <gridHelper args={[BOUNDARY_RADIUS_METERS * 2, 80, '#334155', '#1e293b']} position={[0, 0.01, 0]} />
    </>
  );
}

function PickModal({ pick, onClose }) {
  if (!pick) return null;
  const isTransit = pick.kind === 'transit';
  const item = pick.data;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 22px',
            background: isTransit
              ? 'linear-gradient(135deg, #0ea5e9, #7c3aed)'
              : 'linear-gradient(135deg, #7c3aed, #ec4899)',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{item.name}</h2>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                width: 30,
                height: 30,
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
          {isTransit ? (
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: 13, textTransform: 'capitalize' }}>
              {item.type} stop
            </p>
          ) : (
            <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: 13 }}>
              {item.tags?.join(' · ')}
            </p>
          )}
        </div>
        <div style={{ padding: 22 }}>
          <p style={{ margin: 0, color: '#334155', fontSize: 14, lineHeight: 1.5 }}>
            {item.summary}
          </p>
          {isTransit && item.routes?.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h3
                style={{
                  margin: '0 0 10px',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  color: '#64748b',
                  fontWeight: 700,
                }}
              >
                Routes
              </h3>
              {item.routes.map((r) => (
                <div
                  key={r.line}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: r.colour,
                      color: '#fff',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {r.line}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, color: '#0f172a', fontSize: 13, fontWeight: 600 }}>
                      {r.from} ⇄ {r.to}
                    </p>
                    {r.notes && (
                      <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 12 }}>{r.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExploreCampus() {
  const navigate = useNavigate();
  const inputRef = useRef({ x: 0, y: 0, run: false });
  const avatarRef = useRef();
  const yawRef = useRef(0);
  const [pick, setPick] = useState(null);
  const [nearestBuilding, setNearestBuilding] = useState(null);
  const [tilesReady, setTilesReady] = useState(!!GOOGLE_KEY);

  // Wire keyboard controls.
  useEffect(() => {
    const keys = new Set();
    const onDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      keys.add(e.key.toLowerCase());
      inputRef.current.run = e.shiftKey;
      computeFromKeys();
    };
    const onUp = (e) => {
      keys.delete(e.key.toLowerCase());
      inputRef.current.run = e.shiftKey;
      computeFromKeys();
    };
    const computeFromKeys = () => {
      let x = 0;
      let y = 0;
      if (keys.has('w') || keys.has('arrowup')) y -= 1;
      if (keys.has('s') || keys.has('arrowdown')) y += 1;
      if (keys.has('a') || keys.has('arrowleft')) x -= 1;
      if (keys.has('d') || keys.has('arrowright')) x += 1;
      const len = Math.hypot(x, y) || 1;
      inputRef.current.x = x / len;
      inputRef.current.y = y / len;
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  // Track nearest building for the location label.
  const handlePosition = (pos) => {
    let best = null;
    let bestDist = Infinity;
    for (const b of BUILDINGS) {
      const [bx, , bz] = latLngToLocal(b.lat, b.lng, CAMPUS_CENTRE);
      const d = Math.hypot(pos.x - bx, pos.z - bz);
      if (d < bestDist) {
        bestDist = d;
        best = b;
      }
    }
    if (best && bestDist < 60) {
      setNearestBuilding(best);
    } else {
      setNearestBuilding(null);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', overflow: 'hidden' }}>
      {/* The 3D scene */}
      <Canvas
        shadows
        camera={{ fov: 60, near: 0.5, far: 5000, position: [0, 6, 12] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[80, 120, 60]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <Sky distance={4500} sunPosition={[80, 60, 60]} inclination={0.5} azimuth={0.25} />
          <Environment preset="city" />

          <PlaceholderGround tilesEnabled={tilesReady} />
          {tilesReady && <GoogleTiles apiKey={GOOGLE_KEY} />}

          <Boundary radius={BOUNDARY_RADIUS_METERS} />

          <Avatar
            ref={avatarRef}
            inputRef={inputRef}
            boundaryRadius={BOUNDARY_RADIUS_METERS}
            onPositionChange={handlePosition}
          />

          <Markers
            buildings={BUILDINGS}
            transitStops={TRANSIT_STOPS}
            onPick={setPick}
            avatarRef={avatarRef}
          />

          <CameraRig targetRef={avatarRef} yawRef={yawRef} />
        </Suspense>
      </Canvas>

      {/* HUD — back / location card / minimap / controls hint */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(15,23,42,0.7)',
              border: '1px solid rgba(124,58,237,0.4)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <ArrowLeft size={14} /> End tour
          </button>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(15,23,42,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(124,58,237,0.4)',
              color: '#fff',
              maxWidth: 240,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: '#a78bfa',
                fontWeight: 700,
              }}
            >
              Now exploring
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>
              {nearestBuilding ? `Near ${nearestBuilding.name}` : 'University of Melbourne'}
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 2 }}>Parkville · VIC</div>
          </div>
        </div>

        <div style={{ pointerEvents: 'auto' }}>
          <MiniMap
            avatarPosRef={avatarRef}
            buildings={BUILDINGS}
            transitStops={TRANSIT_STOPS}
            boundaryRadius={BOUNDARY_RADIUS_METERS}
          />
        </div>
      </div>

      {/* Bottom controls hint (auto-fades after first move) */}
      <FadeAfterMove>
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 16px',
            borderRadius: 999,
            background: 'rgba(15,23,42,0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(124,58,237,0.4)',
            color: '#cbd5e1',
            fontSize: 12,
            fontWeight: 600,
            pointerEvents: 'none',
            zIndex: 15,
          }}
        >
          WASD or arrow keys to walk · hold Shift to run · click any pin to learn more
        </div>
      </FadeAfterMove>

      {/* Touch joystick — visible only on coarse pointers */}
      <CoarsePointerOnly>
        <Joystick
          onChange={(v) => {
            inputRef.current.x = v.x;
            inputRef.current.y = v.y;
          }}
        />
      </CoarsePointerOnly>

      {/* Marker click → modal */}
      <PickModal pick={pick} onClose={() => setPick(null)} />

      {/* No-API-key overlay */}
      {!tilesReady && <NoTilesNotice onClose={() => setTilesReady(true)} />}
    </div>
  );
}

function FadeAfterMove({ children }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 600ms ease' }}>{children}</div>
  );
}

function CoarsePointerOnly({ children }) {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(pointer: coarse)');
    setTouch(m.matches);
    const fn = (e) => setTouch(e.matches);
    m.addEventListener('change', fn);
    return () => m.removeEventListener('change', fn);
  }, []);
  return touch ? children : null;
}

function NoTilesNotice({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        padding: '14px 18px',
        borderRadius: 14,
        background: 'rgba(15,23,42,0.92)',
        border: '1px solid rgba(245,158,11,0.5)',
        color: '#fef9c3',
        maxWidth: 320,
        fontSize: 13,
        zIndex: 25,
        boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
      }}
    >
      <p style={{ margin: 0, fontWeight: 700, color: '#fde68a' }}>
        Real Melbourne not loaded yet
      </p>
      <p style={{ margin: '6px 0 0', color: '#cbd5e1', lineHeight: 1.5 }}>
        Add <code style={{ color: '#fde68a' }}>VITE_GOOGLE_MAPS_API_KEY</code> to{' '}
        <code style={{ color: '#fde68a' }}>client/.env.local</code>, restart the dev server, and the
        photoreal 3D tiles will stream around the campus. Building markers and avatar already work.
      </p>
      <button
        onClick={onClose}
        style={{
          marginTop: 10,
          background: 'transparent',
          border: '1px solid rgba(252,211,77,0.5)',
          color: '#fde68a',
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 700,
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
