# Add polished 3D effects to Smooth Navigation

## Scope
- Bring the linked `smooth-navigation` Tevexxo site into this project, preserving its existing pages, content, navigation, and visual system.
- Enhance the existing 3D hero form rather than replacing the site or turning it into a game.

## Interaction and visual changes
- Add pointer-responsive parallax and camera easing to the hero’s 3D object, with slow autonomous motion when idle.
- Improve the object’s depth with layered geometry, warm/cool studio lighting, local reflections, and restrained particles or orbital accents.
- Add subtle perspective tilt and light-follow effects to service and product cards, while keeping links fully usable.
- Give the brand mark a small dimensional response and keep navigation text stable and readable.
- Disable motion for reduced-motion users and simplify effects on touch/mobile devices.

## Technical details
- Keep React Three Fiber and Three.js already used by the source project; avoid new runtime dependencies unless necessary.
- Gate browser-only rendering to prevent server/client mismatches.
- Cap pixel density, pause offscreen animation, clamp frame timing, and avoid expensive shadows/post-processing.
- Keep all colors, lighting roles, shadows, and motion values aligned with the existing semantic design system.
- Preserve page-specific metadata and add any missing social metadata required for content pages.

## Validation
- Verify the homepage and navigation in a real browser at desktop and mobile sizes.
- Confirm the 3D scene is visible, responds smoothly, navigation remains clickable, reduced-motion is respected, and the console is clean.
