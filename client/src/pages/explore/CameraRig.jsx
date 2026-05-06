import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

// Third-person follow camera. Sits behind+above the avatar with a small
// trailing lag. User can rotate the orbit horizontally with mouse drag /
// touch swipe (handled by the orbit controls in the parent scene).
const SHOULDER_OFFSET = new THREE.Vector3(0, 4.5, 7); // y up, z behind
const LOOK_OFFSET = new THREE.Vector3(0, 1.4, 0);
const FOLLOW_LERP = 6;

export default function CameraRig({ targetRef, yawRef }) {
  const { camera } = useThree();
  const tmp = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    if (!targetRef.current) return;
    const target = targetRef.current.position;
    const yaw = yawRef.current ?? 0;

    // Rotate the offset around the avatar by yaw.
    const cos = Math.cos(yaw);
    const sin = Math.sin(yaw);
    const off = SHOULDER_OFFSET;
    const desired = tmp.current.set(
      target.x + off.x * cos + off.z * sin,
      target.y + off.y,
      target.z - off.x * sin + off.z * cos
    );

    camera.position.lerp(desired, Math.min(1, FOLLOW_LERP * dt));
    camera.lookAt(
      target.x + LOOK_OFFSET.x,
      target.y + LOOK_OFFSET.y,
      target.z + LOOK_OFFSET.z
    );
  });

  return null;
}
