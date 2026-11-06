"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { onIntro } from "@/lib/intro";
import styles from "./ChatDemo.module.css";

/**
 * Endless conversation split around the hero's text box: your messages on the
 * left, theirs on the right, both panels angled in 3D toward the box. Each side
 * shows its newest message plus one faded message above it; when the script
 * ends it simply starts again. Each message animates itself; the loop below
 * only decides when the next one arrives.
 */

type Line =
  | { kind: "meText"; en: string; zh: string; via: "menu" | "auto" }
  | { kind: "themText"; zh: string; en: string }
  | {
      kind: "voice";
      who: "me" | "them";
      src: string;
      dst: string;
      time: string;
    };

const SCRIPT: Line[] = [
  {
    kind: "meText",
    en: "Are we still on for dinner tonight?",
    zh: "我们今晚还一起吃晚饭吗？",
    via: "menu",
  },
  { kind: "themText", zh: "当然！七点见？", en: "Of course! See you at 7?" },
  {
    kind: "voice",
    who: "me",
    src: "“Perfect, I’ll bring the wine!”",
    dst: "“太好了，我带酒来！”",
    time: "0:03",
  },
  {
    kind: "voice",
    who: "them",
    src: "“好呀，待会儿见！”",
    dst: "“Yay, see you later!”",
    time: "0:02",
  },
  {
    kind: "meText",
    en: "Should I bring dessert too?",
    zh: "我也要带甜点吗？",
    via: "auto",
  },
  {
    kind: "themText",
    zh: "不用啦，我做了提拉米苏！",
    en: "No need, I made tiramisu!",
  },
  {
    kind: "voice",
    who: "me",
    src: "“No way, you’re the best!”",
    dst: "“真的吗？你太棒了！”",
    time: "0:02",
  },
  {
    kind: "voice",
    who: "them",
    src: "“哈哈，路上小心！”",
    dst: "“Haha, get here safe!”",
    time: "0:02",
  },
];

// When each message switches to its next phase (ms after it appears).
const PHASES = {
  menu: [700, 1350, 1610, 3150, 3650], // dots → text → press → menu (held so you can read it) → pick → translated
  auto: [700, 1450], // dots → text → translated
  themText: [800], // dots → text
  voice: [1100], // recording → voice note
};

// How long to wait before the next message arrives.
const GAP: Record<string, number> = {
  menu: 4700,
  auto: 2500,
  themText: 2100,
  voice: 3300,
};
const gapFor = (l: Line) => GAP[l.kind === "meText" ? l.via : l.kind];

// The first message waits this long after the page appears, so the UI settles first.
const FIRST_DELAY = 2000;
const KEEP = 8; // messages kept in state across both sides
const OWN = 3; // own messages per column: newest, one faded, one on its way out

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Steps through phases on its own clock. Jumps straight to the end when motion is reduced. */
function usePhase(times: number[], instant: boolean) {
  const [phase, setPhase] = useState(instant ? times.length : 0);
  useEffect(() => {
    if (instant) return;
    const ids = times.map((t, i) =>
      window.setTimeout(() => setPhase(i + 1), t),
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per message
  }, []);
  return phase;
}

/** Types `text` out character by character. Untyped characters keep their space, so nothing reflows. */
function Type({
  text,
  speed = 32,
  delay = 0,
  onDone,
}: {
  text: string;
  speed?: number;
  delay?: number;
  onDone?: () => void;
}) {
  const chars = Array.from(text);
  const [n, setN] = useState(0);
  const done = useRef(onDone);

  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    const total = Array.from(text).length;
    const instant = reducedMotion();
    let i = 0;
    let t = window.setTimeout(
      function step() {
        i = instant ? total : i + 1;
        setN(i);
        if (i < total) t = window.setTimeout(step, speed);
        else done.current?.();
      },
      instant ? 0 : delay,
    );
    return () => window.clearTimeout(t);
  }, [text, speed, delay]);

  return (
    <>
      {chars.slice(0, n).join("")}
      <span className={styles.ghost}>{chars.slice(n).join("")}</span>
    </>
  );
}

/** Original line gets struck through, then the translation types in under it. */
function Translation({
  src,
  dst,
  typeSrc,
  dstSpeed = 48,
}: {
  src: string;
  dst: string;
  typeSrc: boolean;
  dstSpeed?: number;
}) {
  const [struck, setStruck] = useState(!typeSrc);
  return (
    <>
      {/* Inline inner span so the strike line follows the text, not the box width. */}
      <span className={styles.src} data-struck={struck || undefined}>
        <span className={styles.strike}>
          {typeSrc ? (
            <Type
              text={src}
              speed={20}
              onDone={() => window.setTimeout(() => setStruck(true), 260)}
            />
          ) : (
            src
          )}
        </span>
      </span>
      {struck && (
        <span className={styles.grow}>
          <span className={styles.dst}>
            <Type text={dst} speed={dstSpeed} delay={260} />
          </span>
        </span>
      )}
    </>
  );
}

function Dots() {
  return (
    <span className={styles.dots} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

function Mic() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="4.5" y="1" width="5" height="8" rx="2.5" fill="currentColor" />
      <path
        d="M2.5 6.5a4.5 4.5 0 0 0 9 0M7 11v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

const BARS = [5, 9, 14, 8, 12, 17, 11, 6, 13, 16, 9, 12, 7, 15, 10, 6, 11, 8];

/** One row. Its height springs open so everything above glides up instead of jumping. */
function Row({ who, children }: { who: "me" | "them"; children: ReactNode }) {
  return (
    <div className={`${styles.row} ${styles.grow}`}>
      <div className={`${styles.align} ${styles[who]}`}>{children}</div>
    </div>
  );
}

const REACTIONS = ["❤️", "😂", "👍", "😮", "🙏"];

function ReplyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M5.5 3 2 6.5 5.5 10M2.4 6.5h5.6a4 4 0 0 1 4 4V11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <rect
        x="4.5"
        y="4.5"
        width="7.5"
        height="7.5"
        rx="1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M9.5 2.6A1.6 1.6 0 0 0 8 2H3.6A1.6 1.6 0 0 0 2 3.6V8a1.6 1.6 0 0 0 .6 1.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MeText({
  en,
  zh,
  via,
  instant,
}: {
  en: string;
  zh: string;
  via: "menu" | "auto";
  instant: boolean;
}) {
  const p = usePhase(PHASES[via], instant);
  const translated = via === "menu" ? p >= 5 : p >= 2;
  const pressed = via === "menu" && (p === 2 || p === 3 || p === 4);
  const menu = via === "menu" && (p === 3 || p === 4);

  return (
    <Row who="me">
      {p === 0 ? (
        <span className={`${styles.bubble} ${styles.pop}`} key="dots">
          <Dots />
        </span>
      ) : (
        <span
          className={styles.pressWrap}
          key="msg"
          data-menu-open={menu || undefined}
        >
          {menu && (
            <span className={styles.popover}>
              <span className={styles.reactions}>
                {REACTIONS.map((r, i) => (
                  <span key={r} style={{ animationDelay: `${60 + i * 35}ms` }}>
                    {r}
                  </span>
                ))}
              </span>
              <span className={styles.menu}>
                <span
                  className={`${styles.menuItem} ${styles.primary}`}
                  data-picked={p === 4 || undefined}
                >
                  <span className={styles.menuLabel}>Translate</span>
                  <span className={styles.toLang}>→ 中文</span>
                  {p === 4 && <span className={styles.tap} />}
                </span>
                <span className={styles.sep} />
                <span className={styles.menuItem}>
                  <span className={styles.menuLabel}>Reply</span>
                  <ReplyIcon />
                </span>
                <span className={styles.menuItem}>
                  <span className={styles.menuLabel}>Copy</span>
                  <CopyIcon />
                </span>
              </span>
            </span>
          )}
          <span
            className={`${styles.bubble} ${styles.pop}`}
            data-pressed={pressed || undefined}
            data-translated={translated || undefined}
          >
            {translated ? (
              <Translation src={en} dst={zh} typeSrc={false} />
            ) : (
              en
            )}
            {p === 2 && <span className={styles.tap} />}
          </span>
          {via === "auto" && translated && (
            <span className={styles.badge}>Auto-translated</span>
          )}
        </span>
      )}
    </Row>
  );
}

function ThemText({
  zh,
  en,
  instant,
}: {
  zh: string;
  en: string;
  instant: boolean;
}) {
  const p = usePhase(PHASES.themText, instant);
  return (
    <Row who="them">
      {p === 0 ? (
        <span className={`${styles.bubble} ${styles.pop}`} key="dots">
          <Dots />
        </span>
      ) : (
        <span className={styles.stack} key="msg">
          <span className={`${styles.bubble} ${styles.pop}`}>{zh}</span>
          <span className={styles.caption}>
            <Type text={`“${en}”`} speed={18} delay={250} />
          </span>
        </span>
      )}
    </Row>
  );
}

function Voice({
  who,
  src,
  dst,
  time,
  instant,
}: {
  who: "me" | "them";
  src: string;
  dst: string;
  time: string;
  instant: boolean;
}) {
  const p = usePhase(PHASES.voice, instant);
  return (
    <Row who={who}>
      {p === 0 ? (
        <span className={`${styles.recording} ${styles.pop}`} key="rec">
          <span className={styles.recMic}>
            <Mic />
          </span>
          Recording
          <Dots />
        </span>
      ) : (
        <span className={styles.stack} key="voice">
          <span
            className={`${styles.bubble} ${styles.pop} ${styles.voiceBubble}`}
          >
            <span className={styles.voice}>
              <span className={styles.play} aria-hidden="true">
                <svg width="9" height="10" viewBox="0 0 9 10">
                  <path
                    d="M1 1.2v7.6a.6.6 0 0 0 .9.5l6.2-3.8a.6.6 0 0 0 0-1L1.9.7a.6.6 0 0 0-.9.5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className={styles.wave} aria-hidden="true">
                {BARS.map((h, i) => (
                  <i
                    key={i}
                    style={{ height: h, animationDelay: `${i * 22}ms` }}
                  />
                ))}
              </span>
              <span className={styles.time}>{time}</span>
            </span>
          </span>
          <span className={styles.caption}>
            <Translation
              src={src}
              dst={dst}
              typeSrc
              dstSpeed={who === "me" ? 48 : 24}
            />
          </span>
        </span>
      )}
    </Row>
  );
}

type Item = { id: number; line: Line; instant: boolean };

const sideOf = (l: Line): "me" | "them" =>
  l.kind === "meText" ? "me" : l.kind === "themText" ? "them" : l.who;

function renderLine({ id, line, instant }: Item) {
  switch (line.kind) {
    case "meText":
      return <MeText key={id} {...line} instant={instant} />;
    case "themText":
      return <ThemText key={id} {...line} instant={instant} />;
    case "voice":
      return <Voice key={id} {...line} instant={instant} />;
  }
}

/**
 * Both columns lay out the same recent messages in the same order. The other
 * person's messages are rendered invisibly, so each side keeps a gap exactly
 * where the reply sits on the opposite side — it reads as one conversation.
 */
function Column({ items, side }: { items: Item[]; side: "me" | "them" }) {
  // Walk back until this side has OWN messages, so the oldest one is still
  // mounted while it animates out rather than vanishing.
  let start = items.length;
  for (let n = 0; start > 0 && n < OWN;) {
    start--;
    if (sideOf(items[start].line) === side) n++;
  }
  const list = items.slice(start);
  let own = 0;
  const ages = list
    .slice()
    .reverse()
    .map((item) => (sideOf(item.line) === side ? own++ : -1))
    .reverse();

  return (
    <div className={`${styles.col} ${styles[side]}`} aria-hidden="true">
      <div
        className={styles.colInner}
        data-intro-item=""
        style={{ "--intro-i": side === "me" ? 3 : 4 } as React.CSSProperties}
      >
        {list.map((item, i) => (
          <div
            key={item.id}
            className={styles.item}
            data-spacer={ages[i] === -1 || undefined}
            data-age={ages[i] === -1 ? undefined : Math.min(ages[i], 2)}
          >
            {renderLine(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Narrow screens: one flat feed under the box, both people's messages visible.
 * Shows the latest two; a third is kept only so it can fade out as it leaves.
 */
function Feed({ items }: { items: Item[] }) {
  const list = items.slice(-3);
  return (
    <div
      className={styles.feed}
      aria-hidden="true"
      data-intro-item=""
      style={{ "--intro-i": 3 } as React.CSSProperties}
    >
      {list.map((item, i) => (
        <div
          key={item.id}
          className={styles.item}
          data-feed-age={list.length - 1 - i}
        >
          {renderLine(item)}
        </div>
      ))}
    </div>
  );
}

export function ChatDemo({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (reducedMotion()) {
      // Show the conversation once, fully settled.
      const t = window.setTimeout(
        () => setItems(SCRIPT.map((line, id) => ({ id, line, instant: true }))),
        0,
      );
      return () => window.clearTimeout(t);
    }

    let id = 0;
    let timer = 0;
    let visible = false;

    const next = () => {
      timer = 0;
      if (!visible) return;
      const line = SCRIPT[id % SCRIPT.length];
      const item = { id: id++, line, instant: false };
      setItems((prev) => [...prev, item].slice(-KEEP));
      timer = window.setTimeout(next, gapFor(line));
    };

    // Only advances while on screen; picks up where it left off.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !timer)
        timer = window.setTimeout(next, id === 0 ? FIRST_DELAY : 600);
      if (!visible) {
        window.clearTimeout(timer);
        timer = 0;
      }
    });
    // Starts once the opening splash has handed over to the page.
    const off = onIntro(() => io.observe(root));
    return () => {
      off();
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.stage} id="demo">
      <p className={styles.srOnly}>
        Demo conversation: English messages are translated to Chinese and
        Chinese replies back to English, as text and as voice notes.
      </p>
      <Column items={items} side="me" />
      <div className={styles.center}>{children}</div>
      <Column items={items} side="them" />
      <Feed items={items} />
    </div>
  );
}
