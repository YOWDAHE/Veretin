"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { LANGUAGES, translate, type LangCode } from "./translations";
import { useIntroDone } from "@/lib/intro";
import styles from "./TryIt.module.css";

// Typed out one after another in the empty box.
// What Ditto does, typed out one line at a time (each has a real translation in SAMPLES).
const PROMPTS = [
  "Speak in English and Ditto types it in their language.",
  "Send voice notes in their language, in your own voice.",
  "Works in WhatsApp, Slack, Gmail and every app you type in.",
  "No copy and paste. Just talk, and it's already translated.",
];

const FLASH = ["var(--violet)", "var(--teal)", "var(--pink)", "var(--orange)"];

type Result = { id: number; source: string; text: string; lang: LangCode };

const segmenter =
  typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;
// Split by grapheme so Hindi vowel signs and emoji stay attached to their letter.
const graphemes = (s: string) =>
  segmenter
    ? Array.from(segmenter.segment(s), (g) => g.segment)
    : Array.from(s);

/** Types each prompt, holds, deletes it, moves to the next. Pauses while `active` is false. */
function useTypedPrompt(active: boolean) {
  const [state, setState] = useState({ index: 0, shown: "" });

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(
        () => setState({ index: 0, shown: PROMPTS[0] }),
        0,
      );
      return () => window.clearTimeout(t);
    }
    let index = state.index;
    let len = state.shown.length;
    let deleting = false;
    let t = 0;
    const step = () => {
      const full = PROMPTS[index];
      if (!deleting) {
        len++;
        if (len >= full.length) {
          len = full.length;
          deleting = true;
          setState({ index, shown: full });
          t = window.setTimeout(step, 1800);
          return;
        }
        setState({ index, shown: full.slice(0, len) });
        t = window.setTimeout(step, 38 + Math.random() * 40);
      } else {
        len--;
        if (len <= 0) {
          deleting = false;
          index = (index + 1) % PROMPTS.length;
          setState({ index, shown: "" });
          t = window.setTimeout(step, 350);
          return;
        }
        setState({ index, shown: full.slice(0, len) });
        t = window.setTimeout(step, 18);
      }
    };
    t = window.setTimeout(step, 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resumes from the current prompt when re-activated
  }, [active]);

  return { prompt: PROMPTS[state.index], shown: state.shown };
}

export function TryIt() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState<LangCode>("zh");
  const [result, setResult] = useState<Result | null>(null);
  const [focused, setFocused] = useState(false);

  // Once the box is emptied, let the old translation linger a moment, then clear it
  // so the typed example prompts start again.
  useEffect(() => {
    if (text || !result) return;
    const t = window.setTimeout(() => setResult(null), 2500);
    return () => window.clearTimeout(t);
  }, [text, result]);

  const introDone = useIntroDone();
  const showPrompt = !text && !focused && !result;
  const { prompt, shown } = useTypedPrompt(showPrompt && introDone);

  const run = (source: string, to: LangCode) => {
    const clean = source.trim();
    if (!clean) return;
    const t = translate(clean, to);
    setResult((prev) => ({
      id: (prev?.id ?? 0) + 1,
      source: clean,
      text: t.text,
      lang: to,
    }));
  };

  const submit = () => {
    // An empty box translates the example currently being typed out, so one click shows the idea.
    if (!text.trim()) {
      setText(prompt);
      run(prompt, lang);
      return;
    }
    run(text, lang);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onLang = (to: LangCode) => {
    setLang(to);
    if (result) run(result.source, to);
  };

  const stale = !!result && text.trim() !== result.source;
  const langName = LANGUAGES.find((l) => l.code === lang)?.name;

  return (
    <form
      className={styles.box}
      onSubmit={onSubmit}
      data-intro-item=""
      style={{ "--intro-i": 2 } as React.CSSProperties}
    >
      <div className={styles.inputWrap}>
        <textarea
          className={styles.input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? "Type anything in English…" : ""}
          aria-label="Type something in English to translate"
          rows={2}
          maxLength={120}
          spellCheck={false}
          enterKeyHint="go"
        />
        {showPrompt && (
          <span className={styles.prompt} aria-hidden="true">
            {shown}
            <span className={styles.caret} />
          </span>
        )}
      </div>

      <div
        className={styles.output}
        aria-live="polite"
        data-stale={stale || undefined}
      >
        {result && (
          <p key={result.id} lang={result.lang} className={styles.result}>
            {graphemes(result.text).map((g, i) => (
              <span
                key={i}
                className={styles.g}
                style={
                  {
                    animationDelay: `${i * 22}ms`,
                    "--flash": FLASH[i % FLASH.length],
                  } as React.CSSProperties
                }
              >
                {g}
              </span>
            ))}
          </p>
        )}
      </div>

      <div className={styles.bar}>
        <label className={styles.lang}>
          <span className={styles.srOnly}>Translate to</span>
          <svg
            className={styles.globe}
            width="12"
            height="12"
            viewBox="0 0 14 14"
            aria-hidden="true"
          >
            <circle
              cx="7"
              cy="7"
              r="5.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M1.6 7h10.8M7 1.4c1.6 1.6 2.3 3.5 2.3 5.6S8.6 11 7 12.6M7 1.4C5.4 3 4.7 4.9 4.7 7s.7 4 2.3 5.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
          <select
            value={lang}
            onChange={(e) => onLang(e.target.value as LangCode)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
          <svg
            className={styles.chev}
            width="9"
            height="9"
            viewBox="0 0 8 8"
            aria-hidden="true"
          >
            <path
              d="M1.5 3 4 5.5 6.5 3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </label>

        <button
          type="submit"
          className={styles.go}
          aria-label={`Translate to ${langName}`}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M8 13V3.5M3.8 7.6 8 3.4l4.2 4.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
