import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { Hero } from "@/components/Hero/Hero";
import { DemoVideo } from "@/components/DemoVideo/DemoVideo";
import { Backdrop } from "@/components/Backdrop/Backdrop";
import { Splash } from "@/components/Splash/Splash";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Splash />
      <div className={styles.page}>
        <Backdrop />
        <SiteHeader />
        <main>
          <Hero />
          <DemoVideo />
          {/* Placeholder until the next sections exist */}
          <div className="scroll-spacer" aria-hidden="true" />
        </main>
      </div>
    </>
  );
}
