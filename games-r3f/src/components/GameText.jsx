import { forwardRef } from 'react';
import { Text } from '@react-three/drei';
import fontUrl from '../assets/open-sans.ttf?url';

/**
 * Wrapper around drei's `<Text>` that forces the bundled Open Sans TTF as
 * the font source.
 *
 * Why: drei's default <Text> asynchronously fetches a Google Fonts URL.
 * If that fetch fails for ANY reason (offline, CSP, CDN hiccup, headless
 * browser), troika-three-text throws inside React render. The exception
 * bubbles up and unmounts the whole 3D scene — with catastrophic effect:
 * every mesh is gone, raycasting hits nothing, pointer events silently
 * fail. In testing this was why clicks, drags and swipes appeared to do
 * nothing.
 *
 * Bundling a single TTF via Vite's `?url` import guarantees the font is
 * served alongside the game assets on the same origin, with no network
 * fallback required.
 */
const GameText = forwardRef(function GameText(props, ref) {
  return <Text ref={ref} font={fontUrl} {...props} />;
});

export default GameText;
