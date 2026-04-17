import { useCallback, useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Reliable pointer-drag for R3F meshes.
 *
 * Two realities we have to handle:
 *  - Stock R3F `onPointerMove` on a mesh only fires while the pointer is
 *    inside that mesh — so drags get "stuck" the moment the finger leaves.
 *  - R3F's event `target` is a Three.js Object3D, not a DOM element, so
 *    `e.target.setPointerCapture(…)` fails silently.
 *
 * Once `startDrag(e)` is called (from a mesh `onPointerDown` handler),
 * this hook:
 *  1. captures the pointer on the renderer's canvas DOM element,
 *  2. attaches `pointermove` / `pointerup` / `pointercancel` listeners to
 *     `window` (NOT the canvas) so moves keep firing even if the finger
 *     leaves the canvas entirely,
 *  3. unprojects each client coord onto the z=0 world plane and forwards
 *     world (x, y) to `onMove`.
 *
 * Works the same on mouse, touch and pen input.
 */
export default function useDrag({ onStart, onMove, onEnd }) {
  const { gl, camera } = useThree();
  const [dragging, setDragging] = useState(false);
  const pointerIdRef = useRef(null);
  const tmp = useRef(new THREE.Vector3());

  const unproject = useCallback((clientX, clientY) => {
    const rect = gl.domElement.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
    tmp.current.set(ndcX, ndcY, 0.5).unproject(camera);
    const dir = tmp.current.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const out = camera.position.clone().add(dir.multiplyScalar(distance));
    return [out.x, out.y];
  }, [gl, camera]);

  useEffect(() => {
    if (!dragging) return;

    const handleMove = (e) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      e.preventDefault();
      const [x, y] = unproject(e.clientX, e.clientY);
      onMove?.(x, y);
    };
    const handleUp = (e) => {
      if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) return;
      try { gl.domElement.releasePointerCapture(pointerIdRef.current); } catch { /* ignore */ }
      pointerIdRef.current = null;
      setDragging(false);
      onEnd?.();
    };

    // Listen on window — guarantees we keep getting moves even if the
    // finger drifts off the canvas or the browser takes pointer capture
    // away for any reason.
    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [dragging, gl, onMove, onEnd, unproject]);

  const startDrag = useCallback((e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const pointerId = e?.pointerId ?? e?.nativeEvent?.pointerId ?? null;
    pointerIdRef.current = pointerId;
    if (pointerId !== null) {
      try { gl.domElement.setPointerCapture(pointerId); } catch { /* ignore */ }
    }
    const clientX = e?.clientX ?? e?.nativeEvent?.clientX;
    const clientY = e?.clientY ?? e?.nativeEvent?.clientY;
    if (clientX != null && clientY != null) {
      const [x, y] = unproject(clientX, clientY);
      onStart?.(x, y);
    } else {
      onStart?.();
    }
    setDragging(true);
  }, [gl, onStart, unproject]);

  return { dragging, startDrag };
}
