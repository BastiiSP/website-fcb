/**
 * Dekorative Instagram-Box (Inspiration: shailendrakumar19999/social-card).
 *
 * Wichtig: Die gesamte Card ist bereits ein <a> auf den Instagram-Permalink –
 * diese Box ist deshalb bewusst KEIN eigener Link (verschachtelte Anchors wären
 * ungültiges HTML), sondern ein dekoratives Element, das den Instagram-Bezug
 * signalisiert und bei `group-hover` der Card im Instagram-Markengradient
 * aufleuchtet. Der Card-<a> trägt das aria-label.
 */

const InstagramIcon = () => (
  <svg
    viewBox="0 0 30 30"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 fill-current"
    aria-hidden
  >
    <path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z" />
  </svg>
);

export default function InstagramLink({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={[
        "relative z-20 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl",
        "border border-white/15 text-white/60 transition-all duration-300",
        "group-hover:scale-105 group-hover:border-transparent group-hover:text-white",
        "group-hover:shadow-[0_0_18px_-2px_rgba(214,41,118,0.7)]",
        className,
      ].join(" ")}
    >
      {/* Instagram-Markengradient – beim Card-Hover eingeblendet */}
      <span className="insta-gradient absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="relative">
        <InstagramIcon />
      </span>
    </span>
  );
}
