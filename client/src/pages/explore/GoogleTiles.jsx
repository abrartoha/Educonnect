import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { TilesRenderer } from '3d-tiles-renderer';
import {
  GoogleCloudAuthPlugin,
  TileCompressionPlugin,
  UpdateOnChangePlugin,
  TilesFadePlugin,
} from '3d-tiles-renderer/plugins';
import { CAMPUS_CENTRE } from './data';

// Renders Google Photorealistic 3D Tiles around CAMPUS_CENTRE.
// The TilesRenderer keeps its own internal scene and streams meshes lazily.
//
// Without VITE_GOOGLE_MAPS_API_KEY this component renders nothing and the
// procedural ground+placeholders in the parent scene stand in.
export default function GoogleTiles({ apiKey }) {
  const { scene, camera, gl } = useThree();
  const tilesRef = useRef(null);

  useEffect(() => {
    if (!apiKey) return undefined;

    const tiles = new TilesRenderer();
    tiles.registerPlugin(new GoogleCloudAuthPlugin({ apiToken: apiKey, autoRefreshToken: true }));
    tiles.registerPlugin(new TileCompressionPlugin());
    tiles.registerPlugin(new UpdateOnChangePlugin());
    tiles.registerPlugin(new TilesFadePlugin());

    // Position the tiles group so CAMPUS_CENTRE is at the origin and Y is up.
    // Google's tiles arrive in ECEF coordinates (centre of earth). We rotate
    // them so a local horizon plane sits flat at y=0 around our spawn.
    const group = tiles.group;
    group.rotation.set(-Math.PI / 2, 0, 0);

    // Use lat/lng to set the tiles' frame origin.
    if (typeof tiles.setLatLonToYUp === 'function') {
      tiles.setLatLonToYUp(
        (CAMPUS_CENTRE.lat * Math.PI) / 180,
        (CAMPUS_CENTRE.lng * Math.PI) / 180
      );
    }

    scene.add(group);
    tilesRef.current = tiles;

    return () => {
      scene.remove(group);
      tiles.dispose();
      tilesRef.current = null;
    };
  }, [apiKey, scene]);

  useFrame(() => {
    const tiles = tilesRef.current;
    if (!tiles) return;
    tiles.setCamera(camera);
    tiles.setResolutionFromRenderer(camera, gl);
    tiles.update();
  });

  return null;
}
