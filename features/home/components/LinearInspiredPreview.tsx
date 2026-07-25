import styles from "./LinearInspiredPreview.module.css";

export default function LinearInspiredPreview() {
  return (
    <div className={styles.page} dir="rtl">
      <section className={styles.hero} aria-labelledby="preview-home-title">
        <div className={styles.heroGrid} aria-hidden="true" /><div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.container}>
          <h1 id="preview-home-title">تکباکس</h1>
          <p className={styles.heroLead}>پاتوق بچه‌های فناوری اطلاعات</p>
        </div>
      </section>
    </div>
  );
}
