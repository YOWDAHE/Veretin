import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { Hero } from "@/components/Hero/Hero";
import { Backdrop } from "@/components/Backdrop/Backdrop";
import { Splash } from "@/components/Splash/Splash";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.top}>
      <Splash />
      <Backdrop />
      <SiteHeader />
      <main>
        <Hero />
      </main>
    </div>
  );
}
