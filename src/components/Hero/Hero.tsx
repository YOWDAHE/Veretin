import { ScrambleText, type ScrambleSegment } from "@/components/ScrambleText/ScrambleText";
import { HeroCursor } from "@/components/HeroCursor/HeroCursor";
import { ChatDemo } from "@/components/ChatDemo/ChatDemo";
import { TryIt } from "@/components/TryIt/TryIt";
import styles from "./Hero.module.css";

const headline: ScrambleSegment[][] = [
  [{ text: "Speak your language." }],
  [{ text: "Send theirs." }],
];

export function Hero() {
  return (
    <section className={styles.hero}>
      <HeroCursor />

      <div className={styles.inner} data-intro-item="" style={{ "--intro-i": 1 } as React.CSSProperties}>
        <ScrambleText lines={headline} scrambleLines={[1]} replayWord="language" className={styles.headline} />
      </div>

      <div className={styles.stageWrap}>
        <ChatDemo>
          <TryIt />
        </ChatDemo>
      </div>
    </section>
  );
}
