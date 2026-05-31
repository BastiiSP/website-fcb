/**
 * Instagram-Overlay (Neuimplementierung nach shailendrakumar19999/social-card,
 * nur Instagram). Dekoratives Element – die ganze Card ist bereits der Link,
 * daher KEIN eigener Anchor (verschachtelte Anchors wären ungültig).
 *
 * Effekt: Beim Hover der Card poppt die Box deutlich auf (Scale-Overshoot +
 * Slide-up), füllt sich gestaffelt mit dem Instagram-Markengradient und
 * leuchtet. Auf Touch-Geräten (kein Hover) ist die Box dauerhaft sichtbar.
 * Styling liegt in globals.css (.insta-overlay*).
 */

const InstagramIcon = () => (
  <svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z" />
  </svg>
);

export default function InstagramOverlay({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`insta-overlay ${className}`}>
      {/* Gradient-Fläche – blendet gestaffelt nach der Box ein */}
      <span className="insta-overlay-bg insta-gradient" />
      <span className="insta-overlay-icon">
        <InstagramIcon />
      </span>
    </span>
  );
}
