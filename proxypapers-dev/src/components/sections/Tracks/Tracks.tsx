"use client";

import { useRef } from "react";
import s from "./Tracks.module.css";
import tracks from "@/data/en/tracks.json";
import { SplitText } from "@/components/shared/SplitText";
import { useTracks } from "@/lib/animations/useTracks";

// Tracks — "Two ways to work together" (Figma 123:75, PRofilTypes). A full-bleed
// Proxy-Blue card (the brand at full presence) carrying two collaboration modes side
// by side, split by a hairline: TRACK 01 Peer referral · TRACK 02 Business
// introduction. The title rises word-by-word and the columns settle in on scroll
// (see useTracks). BLUE surface (navbar flips to the blue theme). Below 1024 the two
// columns stack and the section sizes off the fluid tokens.
export function Tracks() {
  const root = useRef<HTMLElement>(null);
  useTracks(root, s);

  return (
    <section
      className={s.tracks}
      aria-label="Two ways to work together"
      data-nav-theme="blue"
      ref={root}
    >
      <div className={s.content}>
        <header className={s.head}>
          <SplitText as="h2" className={s.title} words={tracks.title.split(" ")} />
          <p className={s.intro}>{tracks.intro}</p>
        </header>

        <div className={s.row}>
          {tracks.tracks.map((track) => (
            <div className={s.col} key={track.id} data-track={track.id}>
              <div className={s.colHead}>
                <p className={s.eyebrow}>{track.eyebrow}</p>
                <p className={s.name}>{track.name}</p>
              </div>

              <p className={s.scope}>{track.scope}</p>

              <div className={s.detail}>
                <p className={s.body}>{track.body}</p>
                <ul className={s.points}>
                  {track.points.map((point, i) => (
                    <li className={s.point} key={i}>
                      <Dot />
                      <span className={s.pointText}>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className={s.tag}>{track.tag}</p>
            </div>
          ))}

          <span className={s.divider} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

// Bullet marker — a bone dot inside a ring (Figma node 123:91); currentColor so it
// inherits the column's bone text tone.
function Dot() {
  return (
    <svg className={s.dot} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="4" fill="currentColor" />
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
    </svg>
  );
}
