(() => {
  const pre = document.querySelector("[data-donut]");
  if (!pre) return;

  const W = 60;
  const H = 24;
  const chars = ".,-~:;=!*#$@";
  let A = 1;
  let B = 0;

  const frame = () => {
    const out = new Array(W * H).fill(" ");
    const z = new Array(W * H).fill(0);
    const cA = Math.cos(A), sA = Math.sin(A), cB = Math.cos(B), sB = Math.sin(B);
    for (let j = 0; j < 6.28; j += 0.07) {
      const ct = Math.cos(j), st = Math.sin(j);
      for (let i = 0; i < 6.28; i += 0.02) {
        const sp = Math.sin(i), cp = Math.cos(i);
        const h = ct + 2;
        const D = 1 / (sp * h * sA + st * cA + 5);
        const t = sp * h * cA - st * sA;
        const x = Math.floor(W / 2 + 26 * D * (cp * h * cB - t * sB));
        const y = Math.floor(H / 2 + 13 * D * (cp * h * sB + t * cB));
        const o = x + W * y;
        const N = Math.floor(8 * ((st * sA - sp * ct * cA) * cB - sp * ct * sA - st * cA - cp * ct * sB));
        if (y >= 0 && y < H && x >= 0 && x < W && D > z[o]) {
          z[o] = D;
          out[o] = chars[N > 0 ? N : 0];
        }
      }
    }
    let s = "";
    for (let k = 0; k < H; k++) s += out.slice(k * W, k * W + W).join("") + "\n";
    pre.textContent = s;
  };

  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const btn = document.querySelector("[data-donut-toggle]");
  const saved = (() => { try { return localStorage.getItem("donut"); } catch (e) { return null; } })();
  let playing = saved ? saved === "on" : !still.matches;
  let visible = true;
  let last = 0;
  let raf = 0;

  const loop = (t) => {
    raf = requestAnimationFrame(loop);
    if (t - last < 45) return;
    last = t;
    A += 0.05;
    B += 0.025;
    frame();
  };

  const sync = () => {
    cancelAnimationFrame(raf);
    if (playing && visible && !document.hidden) raf = requestAnimationFrame(loop);
    if (btn) {
      btn.textContent = playing ? "pause" : "play";
      btn.setAttribute("aria-pressed", String(playing));
    }
  };

  frame();
  sync();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(pre);
  document.addEventListener("visibilitychange", sync);
  still.addEventListener?.("change", () => { if (!saved) { playing = !still.matches; sync(); } });
  btn?.addEventListener("click", () => {
    playing = !playing;
    try { localStorage.setItem("donut", playing ? "on" : "off"); } catch (e) {}
    sync();
  });

  pre.closest("figure")?.addEventListener("pointermove", (e) => {
    const r = pre.getBoundingClientRect();
    const dx = (e.clientX - r.left) / r.width - 0.5;
    B += dx * 0.08;
    if (!playing) frame();
  });
})();
