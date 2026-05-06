import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

// Three.js's public sample model — comes with Idle / Walk / Run animations
// and is free to redistribute. Swap to a Ready Player Me URL or your own GLB
// later by changing this constant.
const MODEL_URL = 'https://threejs.org/examples/models/gltf/Soldier.glb';

const WALK_SPEED = 4.5; // metres / second
const RUN_SPEED = 8.5;
const TURN_SPEED = 8;

const Avatar = forwardRef(function Avatar(
  { inputRef, boundaryRadius, onPositionChange },
  ref
) {
  const group = useRef();
  // Expose the inner group so parent components (CameraRig, HUD minimap) can
  // read .position imperatively.
  useImperativeHandle(ref, () => group.current);

  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const { camera } = useThree();
  const [mixer, setMixer] = useState(null);
  const actions = useRef({});
  const currentAction = useRef(null);

  useEffect(() => {
    if (!gltf?.scene || !group.current) return;
    const m = new THREE.AnimationMixer(gltf.scene);
    setMixer(m);
    gltf.animations.forEach((clip) => {
      actions.current[clip.name] = m.clipAction(clip);
    });
    const idle = actions.current['Idle'];
    if (idle) {
      idle.play();
      currentAction.current = idle;
    }
    // Soldier model casts shadows once we set the flag on its meshes.
    gltf.scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return () => m.stopAllAction();
  }, [gltf]);

  const playAction = (name) => {
    const next = actions.current[name];
    if (!next || next === currentAction.current) return;
    next.reset().fadeIn(0.2).play();
    if (currentAction.current) currentAction.current.fadeOut(0.2);
    currentAction.current = next;
  };

  const tmpDir = useRef(new THREE.Vector3());
  const tmpQuat = useRef(new THREE.Quaternion());
  const tmpEuler = useRef(new THREE.Euler());

  useFrame((_, dt) => {
    if (mixer) mixer.update(dt);
    if (!group.current || !inputRef.current) return;

    const { x: ix, y: iz, run } = inputRef.current;
    const len = Math.hypot(ix, iz);
    const moving = len > 0.05;
    const speed = run ? RUN_SPEED : WALK_SPEED;

    if (moving) {
      const forward = camera.getWorldDirection(tmpDir.current).setY(0).normalize();
      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
      const move = new THREE.Vector3()
        .addScaledVector(forward, -iz)
        .addScaledVector(right, ix)
        .normalize();

      const next = group.current.position.clone().addScaledVector(move, speed * dt);
      const r = Math.hypot(next.x, next.z);
      if (r > boundaryRadius) {
        next.x = (next.x / r) * boundaryRadius;
        next.z = (next.z / r) * boundaryRadius;
      }
      group.current.position.copy(next);

      const yaw = Math.atan2(move.x, move.z);
      tmpEuler.current.set(0, yaw, 0);
      const target = tmpQuat.current.setFromEuler(tmpEuler.current);
      group.current.quaternion.slerp(target, Math.min(1, TURN_SPEED * dt));

      playAction(run ? 'Run' : 'Walk');
    } else {
      playAction('Idle');
    }

    onPositionChange?.(group.current.position);
  });

  return (
    <group ref={group}>
      {gltf?.scene && <primitive object={gltf.scene} position={[0, 0, 0]} scale={1} />}
    </group>
  );
});

export default Avatar;
