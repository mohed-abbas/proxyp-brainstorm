import s from "./Hero.module.css";

type Chip = { t: string; due?: boolean };
export type Doc = { cat: string; title: string; sub: string; chips: Chip[] };

// lucide "file" icon (stroke = currentColor).
function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function DocRow({ doc }: { doc: Doc }) {
  return (
    <article className={s.docRow}>
      <span className={s.docRowIcon}>
        <FileIcon />
      </span>
      <span className={s.docRowMain}>
        <span className={s.docRowTitle}>{doc.title}</span>
        <span className={s.docRowSub}>{doc.sub}</span>
        <span className={s.docRowChips}>
          {doc.chips.map((c, i) => (
            <span
              key={i}
              className={`${s.docRowChip}${c.due ? ` ${s.docRowChipDue}` : ""}`}
            >
              {c.t}
            </span>
          ))}
        </span>
      </span>
      <span className={s.docRowCat}>{doc.cat}</span>
    </article>
  );
}

function SkeletonRow() {
  return (
    <article className={`${s.docRow} ${s.docRowSkeleton}`}>
      <span className={s.docRowIcon}>
        <FileIcon />
      </span>
      <span className={s.docRowMain}>
        <span className={`${s.skBar} ${s.skBarTitle}`} />
        <span className={`${s.skBar} ${s.skBarSub}`} />
        <span className={s.docRowChips}>
          <span className={`${s.skBar} ${s.skBarChip}`} />
          <span className={`${s.skBar} ${s.skBarChip}`} />
        </span>
      </span>
      <span className={`${s.skBar} ${s.skBarCat}`} />
    </article>
  );
}

// Two synced tracks: a skeleton layer masked left of centre, a content layer
// masked right of centre — a row enters left unstructured and emerges from
// behind the brand card as readable data. Each track holds two passes of the
// documents so the marquee loop is seamless.
export function Conveyor({ documents }: { documents: Doc[] }) {
  const doubled = [...documents, ...documents];
  return (
    <div className={s.conveyor} aria-hidden="true">
      <div className={`${s.layer} ${s.layerSkeleton}`}>
        <div className={s.track}>
          {doubled.map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
      <div className={`${s.layer} ${s.layerContent}`}>
        <div className={s.track}>
          {doubled.map((doc, i) => (
            <DocRow key={i} doc={doc} />
          ))}
        </div>
      </div>
    </div>
  );
}
