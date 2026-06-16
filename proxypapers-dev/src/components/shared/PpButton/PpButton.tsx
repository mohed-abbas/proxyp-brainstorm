// Shared pill CTA (Hero, Profiles). The label is a masked two-copy element so it
// can roll-swap on hover (the pill fills bone and the label rolls to Proxy Blue) —
// the same mechanic as the Trust certs / menu links. Visual + roll CSS live on the
// global .pp-btn / .pp-btn__* classes in globals.css.
export function PpButton({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a className={className ? `pp-btn ${className}` : "pp-btn"} href={href}>
      <span className="pp-btn__roll">
        <span className="pp-btn__main">{label}</span>
        <span className="pp-btn__clone" aria-hidden="true">
          {label}
        </span>
      </span>
    </a>
  );
}
