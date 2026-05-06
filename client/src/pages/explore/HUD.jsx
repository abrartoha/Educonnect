import { useEffect, useRef, useState } from 'react';
import { latLngToLocal } from './coords';
import { CAMPUS_CENTRE } from './data';

// Minimap — top-down 2D canvas showing the avatar position and all markers
// relative to the campus centre and the boundary ring.
export function MiniMap({ avatarPosRef, buildings, transitStops, boundaryRadius }) {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const SIZE = canvas.width;
    const HALF = SIZE / 2;
    const PAD = 12;
    const SCALE = (HALF - PAD) / boundaryRadius; // metres per pixel

    const buildingPositions = buildings.map((b) => latLngToLocal(b.lat, b.lng, CAMPUS_CENTRE));
    const transitPositions = transitStops.map((s) => latLngToLocal(s.lat, s.lng, CAMPUS_CENTRE));

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);
      // background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, SIZE, SIZE);
      // boundary ring
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(HALF, HALF, boundaryRadius * SCALE, 0, Math.PI * 2);
      ctx.stroke();
      // buildings
      ctx.fillStyle = '#a78bfa';
      buildingPositions.forEach(([x, , z]) => {
        ctx.beginPath();
        ctx.arc(HALF + x * SCALE, HALF + z * SCALE, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      // transit
      ctx.fillStyle = '#38bdf8';
      transitPositions.forEach(([x, , z]) => {
        ctx.fillRect(HALF + x * SCALE - 2, HALF + z * SCALE - 2, 4, 4);
      });
      // avatar
      const a = avatarPosRef.current;
      if (a) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(HALF + a.x * SCALE, HALF + a.z * SCALE, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [avatarPosRef, buildings, transitStops, boundaryRadius]);

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={180}
      style={{
        width: 180,
        height: 180,
        borderRadius: 12,
        border: '2px solid rgba(124,58,237,0.4)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
        display: 'block',
      }}
    />
  );
}

// Touch joystick — bottom-left, drag to walk.
export function Joystick({ onChange }) {
  const [active, setActive] = useState(false);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const baseRef = useRef();
  const RADIUS = 50;

  const handleStart = (e) => {
    setActive(true);
    handleMove(e);
  };

  const handleMove = (e) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const t = e.touches?.[0] || e;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = t.clientX - cx;
    let dy = t.clientY - cy;
    const r = Math.hypot(dx, dy);
    if (r > RADIUS) {
      dx = (dx / r) * RADIUS;
      dy = (dy / r) * RADIUS;
    }
    setKnob({ x: dx, y: dy });
    onChange({ x: dx / RADIUS, y: dy / RADIUS });
  };

  const handleEnd = () => {
    setActive(false);
    setKnob({ x: 0, y: 0 });
    onChange({ x: 0, y: 0 });
  };

  return (
    <div
      ref={baseRef}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseMove={(e) => active && handleMove(e)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      style={{
        position: 'fixed',
        left: 24,
        bottom: 24,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'rgba(15, 23, 42, 0.5)',
        border: '2px solid rgba(124,58,237,0.5)',
        backdropFilter: 'blur(8px)',
        touchAction: 'none',
        userSelect: 'none',
        zIndex: 30,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: '#7c3aed',
          boxShadow: '0 4px 14px rgba(124,58,237,0.6)',
          transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`,
        }}
      />
    </div>
  );
}
