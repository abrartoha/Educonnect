import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { latLngToLocal } from './coords';
import { CAMPUS_CENTRE } from './data';

// Floating marker — pulsing pin + label, opens a modal on click.
function Marker({ pos, emoji, label, accent, onClick, avatarRef }) {
  const ref = useRef();
  const [hover, setHover] = useState(false);

  useFrame(({ clock }) => {
    if (ref.current) {
      // Subtle bob to draw the eye.
      ref.current.position.y = pos[1] + 1.6 + Math.sin(clock.elapsedTime * 2 + pos[0]) * 0.08;
    }
  });

  // Compute distance to avatar for fade-in proximity hint
  let near = false;
  if (avatarRef?.current) {
    const a = avatarRef.current.position;
    const dx = a.x - pos[0];
    const dz = a.z - pos[2];
    near = dx * dx + dz * dz < 14 * 14; // 14m
  }

  return (
    <group position={[pos[0], pos[1] + 1.6, pos[2]]} ref={ref}>
      {/* Pin shaft */}
      <mesh position={[0, -0.8, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 8]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      {/* HTML label */}
      <Html
        center
        distanceFactor={20}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <button
          onClick={onClick}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 999,
            border: `2px solid ${accent}`,
            background: hover || near ? '#fff' : 'rgba(255,255,255,0.92)',
            color: '#0f172a',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            whiteSpace: 'nowrap',
            transform: near ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 120ms ease, background 120ms ease',
          }}
        >
          <span style={{ fontSize: 14 }}>{emoji}</span>
          {label}
        </button>
      </Html>
    </group>
  );
}

const TRANSIT_ACCENT = {
  tram: '#7c3aed',
  train: '#dc2626',
  bus: '#0ea5e9',
};

export default function Markers({ buildings, transitStops, onPick, avatarRef }) {
  return (
    <>
      {buildings.map((b) => {
        const pos = latLngToLocal(b.lat, b.lng, CAMPUS_CENTRE);
        return (
          <Marker
            key={b.id}
            pos={pos}
            emoji={b.emoji}
            label={b.name}
            accent="#7c3aed"
            avatarRef={avatarRef}
            onClick={() => onPick({ kind: 'building', data: b })}
          />
        );
      })}
      {transitStops.map((s) => {
        const pos = latLngToLocal(s.lat, s.lng, CAMPUS_CENTRE);
        const emoji = s.type === 'train' ? '🚆' : s.type === 'bus' ? '🚌' : '🚊';
        return (
          <Marker
            key={s.id}
            pos={pos}
            emoji={emoji}
            label={s.name}
            accent={TRANSIT_ACCENT[s.type] || '#0ea5e9'}
            avatarRef={avatarRef}
            onClick={() => onPick({ kind: 'transit', data: s })}
          />
        );
      })}
    </>
  );
}
