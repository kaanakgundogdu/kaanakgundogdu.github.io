(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} },
  };

  const toast = (msg) => {
    $$(".toast").forEach((t) => t.remove());
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = msg;
    document.body.append(t);
    setTimeout(() => t.remove(), 2600);
  };

  const themeLabel = () => $$("[data-theme-label]").forEach((el) => { el.textContent = root.dataset.theme; });
  const setTheme = (t) => {
    root.dataset.theme = t;
    store.set("theme", t);
    themeLabel();
  };
  const toggleTheme = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  themeLabel();
  $$("[data-theme-toggle]").forEach((b) => b.addEventListener("click", toggleTheme));

  const toggleCrt = () => {
    const on = root.classList.toggle("crt");
    store.set("crt", on ? "1" : null);
    toast(on ? "crt mode: on" : "crt mode: off");
  };

  const clock = $("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Europe/Istanbul" });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  $$("[data-uptime]").forEach((el) => {
    const start = new Date(el.dataset.uptime + "T00:00:00+03:00");
    const days = Math.floor((Date.now() - start) / 864e5);
    el.textContent = `${days}d`;
  });

  $$("[data-print]").forEach((b) => b.addEventListener("click", () => window.print()));

  $$("[data-missing]").forEach((el) => { el.textContent = location.pathname; });

  $$(".prose pre").forEach((pre) => {
    if (!navigator.clipboard) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "copy";
    b.textContent = "copy";
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector("code")?.innerText ?? pre.innerText);
        b.textContent = "copied";
      } catch (e) {
        b.textContent = "error";
      }
      setTimeout(() => { b.textContent = "copy"; }, 1500);
    });
    pre.append(b);
  });

  const navLinks = $$("[data-nav]");
  const navIndex = navLinks.findIndex((a) => a.getAttribute("aria-current") === "page");

  let posts = [];
  try { posts = JSON.parse($("#site-index")?.textContent || "[]"); } catch (e) {}

  const go = (u) => { location.href = u; };
  const commands = [
    ...navLinks.map((a) => ({ t: a.textContent.replace(/^>\s*/, "").toLowerCase(), k: "goto", run: () => go(a.href) })),
    { t: "toggle theme", k: "cmd", run: toggleTheme },
    { t: "toggle crt mode", k: "cmd", run: toggleCrt },
    ...($("[data-donut-toggle]") ? [{ t: "toggle donut", k: "cmd", run: () => $("[data-donut-toggle]").click() }] : []),
    { t: "random post", k: "cmd", run: () => posts.length && go(posts[Math.floor(Math.random() * posts.length)].u) },
    { t: "rss feed", k: "link", run: () => go("/atom.xml") },
    { t: "github", k: "link", run: () => go("https://github.com/kaanakgundogdu") },
    { t: "linkedin", k: "link", run: () => go("https://www.linkedin.com/in/kaanakgundogdu/") },
    { t: "email", k: "link", run: () => go("mailto:kaanakgundogdu@gmail.com") },
    { t: "copy page url", k: "cmd", run: () => navigator.clipboard?.writeText(location.href).then(() => toast("url copied")) },
    ...posts.map((p) => ({ t: p.t, k: "post", s: p.g, run: () => go(p.u) })),
  ];

  const easter = {
    "sudo": () => toast("kaan is not in the sudoers file. this incident will be reported."),
    "rm -rf /": () => toast("nice try."),
    "exit": () => toast("there is no escape. try esc."),
    "vim": () => toast("you are already in it."),
    "hello": () => toast("hi :)"),
  };

  const dialog = $("[data-palette]");
  const input = dialog && $("input", dialog);
  const list = dialog && $(".palette__list", dialog);
  let shown = [];
  let sel = 0;

  const score = (c, q) => {
    const hay = `${c.t} ${c.s || ""}`.toLowerCase();
    if (!q) return c.k === "post" ? 1 : 2;
    if (hay.startsWith(q)) return 4;
    if (hay.includes(q)) return 3;
    let i = 0;
    for (const ch of hay) if (ch === q[i]) i++;
    return i === q.length ? 1 : 0;
  };

  const render = () => {
    const q = input.value.trim().toLowerCase().replace(/^\//, "");
    const scored = commands.map((c) => [c, score(c, q)]).filter(([, s]) => s > 0);
    const strict = scored.filter(([, s]) => s > 1);
    shown = (q && strict.length ? strict : scored).sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 12);
    sel = Math.min(sel, Math.max(shown.length - 1, 0));
    list.replaceChildren();
    if (!shown.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = easter[q] ? "press enter" : `command not found: ${q}`;
      list.append(li);
      return;
    }
    shown.forEach((c, i) => {
      const li = document.createElement("li");
      li.id = `pal-${i}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === sel));
      const a = document.createElement("span");
      a.textContent = c.t;
      const b = document.createElement("span");
      b.textContent = c.k;
      li.append(a, b);
      li.addEventListener("mousemove", () => { if (sel !== i) { sel = i; render(); } });
      li.addEventListener("click", () => run(i));
      list.append(li);
    });
    input.setAttribute("aria-activedescendant", `pal-${sel}`);
    $(`#pal-${sel}`)?.scrollIntoView({ block: "nearest" });
  };

  const run = (i) => {
    const q = input.value.trim().toLowerCase();
    const c = shown[i];
    dialog.close();
    if (c) c.run();
    else if (easter[q]) easter[q]();
  };

  const openPalette = () => {
    if (!dialog || dialog.open) return;
    input.value = "";
    sel = 0;
    render();
    dialog.showModal();
    input.focus();
  };

  if (dialog) {
    $$("[data-palette-open]").forEach((b) => b.addEventListener("click", openPalette));
    input.addEventListener("input", () => { sel = 0; render(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(shown.length, 1); render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(shown.length, 1); render(); }
      else if (e.key === "Enter") { e.preventDefault(); run(sel); }
    });
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  }

  const typing = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kpos = 0;

  document.addEventListener("keydown", (e) => {
    kpos = e.key === konami[kpos] ? kpos + 1 : e.key === konami[0] ? 1 : 0;
    if (kpos === konami.length) { kpos = 0; toggleCrt(); return; }
    if (typing(e.target) || e.altKey || dialog?.open) return;
    if ((e.key === "/" && !e.ctrlKey && !e.metaKey) || (e.key === "k" && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      openPalette();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (/^[1-9]$/.test(e.key) && navLinks[+e.key - 1]) { go(navLinks[+e.key - 1].href); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      if (!navLinks.length || document.activeElement?.closest("pre, .prose table")) return;
      const step = e.key === "ArrowRight" ? 1 : -1;
      const next = navIndex < 0 ? 0 : (navIndex + step + navLinks.length) % navLinks.length;
      go(navLinks[next].href);
    }
  });
})();
