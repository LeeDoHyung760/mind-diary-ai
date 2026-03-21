const recommendedMusic = [
  "아이유 - 마음",
  "적재 - 나랑 같이 걸을래",
  "Coldplay - Fix You",
];

function SupportPanel() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="panel p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
          Today Message
        </p>
        <h3 className="mt-2 text-lg font-bold text-ink">오늘의 문구</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          오늘 감정이 흔들렸다는 건 그만큼 많은 일을 견디고 있다는 뜻일 수도 있습니다.
          지금의 마음을 있는 그대로 인정해 주는 것만으로도 충분합니다.
        </p>
      </article>

      <article className="panel p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
          Today Music
        </p>
        <h3 className="mt-2 text-lg font-bold text-ink">오늘의 노래</h3>
        <ul className="mt-3 space-y-3">
          {recommendedMusic.map((song) => (
            <li
              key={song}
              className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
            >
              {song}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

export default SupportPanel;
