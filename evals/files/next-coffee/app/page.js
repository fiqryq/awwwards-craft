import styles from "./page.module.css";

const beans = [
  { name: "Gayo Highland", notes: "Dark chocolate, cedar, brown sugar", origin: "Aceh" },
  { name: "Ijen Natural", notes: "Strawberry, cacao nib, red wine", origin: "East Java" },
  { name: "Kintamani Honey", notes: "Orange peel, honey, jasmine", origin: "Bali" },
];

export default function Home() {
  return (
    <main>
      <nav className={styles.nav}>
        <span>Kopi Tani</span>
        <button className={styles.menuBtn}>Menu</button>
      </nav>
      <section className={styles.hero}>
        <h1>Roasted slowly, in small batches.</h1>
        <p>Single-origin coffee from smallholder farms across the Indonesian archipelago.</p>
        <a href="#beans" className={styles.btn}>Shop beans</a>
      </section>
      <section id="beans" className={styles.beans}>
        <h2>This season</h2>
        <div className={styles.grid}>
          {beans.map((b) => (
            <article key={b.name} className={styles.card}>
              <h3>{b.name}</h3>
              <p>{b.notes}</p>
              <small>{b.origin}</small>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.story}>
        <h2>From farm to cup</h2>
        <p>We work directly with 40 farming families, paying above fair-trade prices and roasting every Tuesday in our Bandung roastery.</p>
      </section>
      <footer className={styles.footer}>© 2026 Kopi Tani Roastery · Bandung</footer>
    </main>
  );
}
