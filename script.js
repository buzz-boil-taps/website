/* =========================================================
   BUZZ BOIL TAPS — interactions
   ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- boot sequence ---------- */
(function boot() {
  const el = document.getElementById("boot");
  const log = document.getElementById("boot-log");

  // only play once per browser session
  let seen = false;
  try { seen = sessionStorage.getItem("bbt-booted") === "1"; } catch (e) {}
  if (seen || reduceMotion) { el.remove(); return; }

  const lines = [
    "[    0.000000] BBT-OS kernel 6.6.6-bbt booting...",
    "[    0.041337] <span class='ok'>[ OK ]</span> mounted /dev/brain0",
    "[    0.133700] <span class='ok'>[ OK ]</span> loaded module: caffeine.ko",
    "[    0.271828] <span class='warn'>[WARN]</span> sleep_schedule.service not found",
    "[    0.314159] <span class='ok'>[ OK ]</span> started gdb, ghidra, burpsuite",
    "[    0.420000] <span class='ok'>[ OK ]</span> 3/3 operators online",
    "[    0.500000] generating team name... <span class='big'>BUZZ BOIL TAPS</span>",
    "",
    "access granted_",
  ];

  let i = 0;
  let timer;
  const finish = () => {
    clearTimeout(timer);
    el.classList.add("done");
    try { sessionStorage.setItem("bbt-booted", "1"); } catch (e) {}
    setTimeout(() => el.remove(), 700);
    window.removeEventListener("keydown", finish);
    el.removeEventListener("click", finish);
  };
  const next = () => {
    if (i >= lines.length) { timer = setTimeout(finish, 450); return; }
    log.innerHTML += lines[i++] + "\n";
    timer = setTimeout(next, 120 + Math.random() * 140);
  };
  window.addEventListener("keydown", finish);
  el.addEventListener("click", finish);
  next();
})();

/* ---------- code rain background ---------- */
(function rain() {
  const canvas = document.getElementById("rain");
  const ctx = canvas.getContext("2d");
  const chars = "01アイウエオカキクケコサシスセソ<>/{}[]$#@&*BUZZBOILTAPS".split("");
  const size = 16;
  let cols, drops, w, h;

  const resize = () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cols = Math.ceil(w / size);
    drops = Array.from({ length: cols }, () => Math.random() * -h / size);
  };
  resize();
  window.addEventListener("resize", resize);

  const draw = () => {
    ctx.fillStyle = "rgba(5, 5, 10, 0.12)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${size}px JetBrains Mono, monospace`;
    for (let i = 0; i < cols; i++) {
      const ch = chars[(Math.random() * chars.length) | 0];
      const y = drops[i] * size;
      ctx.fillStyle = i % 7 === 0 ? "#ff2bd6" : (Math.random() > 0.975 ? "#ffffff" : "#00f0ff");
      ctx.fillText(ch, i * size, y);
      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.5;
    }
  };

  if (reduceMotion) { draw(); return; }
  let last = 0;
  const loop = (t) => {
    if (t - last > 50) { draw(); last = t; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();

/* ---------- typed hero tagline ---------- */
(function typed() {
  const el = document.getElementById("typed");
  const phrases = [
    "we capture flags.",
    "we break things (responsibly).",
    "we ship at hackathons.",
    "we read assembly for fun.",
    "three students. one terminal.",
  ];
  if (reduceMotion) { el.textContent = phrases[4]; return; }

  let p = 0, c = 0, deleting = false;
  const tick = () => {
    const word = phrases[p];
    el.textContent = word.slice(0, c);
    if (!deleting && c < word.length) { c++; setTimeout(tick, 55 + Math.random() * 60); }
    else if (!deleting) { deleting = true; setTimeout(tick, 1800); }
    else if (c > 0) { c--; setTimeout(tick, 28); }
    else { deleting = false; p = (p + 1) % phrases.length; setTimeout(tick, 350); }
  };
  setTimeout(tick, 600);
})();

/* ---------- reveal on scroll + stat counters ---------- */
(function reveal() {
  const countUp = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const start = performance.now();
    const dur = 1400;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 90}ms`;
    io.observe(el);
  });
})();

/* ---------- nav: mobile toggle + active section ---------- */
(function nav() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  const map = new Map([...links.querySelectorAll("a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      map.forEach((a) => a.classList.remove("active"));
      map.get(e.target.id)?.classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, id) => io.observe(document.getElementById(id)));
})();

/* ---------- crew cards: 3D tilt + cursor glow ---------- */
(function tilt() {
  if (reduceMotion || window.matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      card.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => { card.style.transform = ""; });
  });
})();

/* ---------- achievement filters ---------- */
(function filters() {
  const buttons = document.querySelectorAll(".filter");
  const entries = document.querySelectorAll(".entry");
  const label = document.getElementById("filter-label");
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      buttons.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn);
      });
      label.textContent = f;
      entries.forEach((en) => {
        const show = f === "all" || en.dataset.type === f;
        en.classList.toggle("hidden", !show);
        if (show) en.classList.add("visible");
      });
    })
  );
})();

/* ---------- interactive shell ---------- */
(function shell() {
  const out = document.getElementById("shell-out");
  const form = document.getElementById("shell-form");
  const input = document.getElementById("shell-cmd");
  const history = [];
  let hIdx = 0;

  // flag is base64'd so it's not sitting in plain text. go on, decode it.
  const FLAG = atob("YmJ0e3JuZ19uYW1lX2dvZF9ibGVzc2VkX3VzfQ==");

  const print = (html, cls = "out") => {
    const p = document.createElement("p");
    p.className = cls;
    p.innerHTML = html;
    out.appendChild(p);
    out.scrollTop = out.scrollHeight;
  };
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const commands = {
    help: () =>
      `available commands:
  <span class="hl">whoami</span>      who are we
  <span class="hl">members</span>     list the crew
  <span class="hl">contact</span>     how to reach us
  <span class="hl">origin</span>      where the name came from
  <span class="hl">ls</span>          list files
  <span class="hl">clear</span>       clear the screen
  ...and maybe some hidden ones`,
    whoami: () => "guest. but you could be one of us someday.",
    members: () =>
      `<span class="neon-c">Member One</span>    @handle_one    pwn / rev
<span class="neon-m">Member Two</span>    @handle_two    web / crypto
<span class="hl">Member Three</span>  @handle_three  forensics / hardware`,
    contact: () =>
      `member1@example.com
member2@example.com
member3@example.com`,
    origin: () => `first CTF. needed a team name. hit "random". got "Buzz Boil Taps". never looked back.`,
    ls: () => "origin_story.txt  mission.txt  members/  achievements.log  flag.txt",
    "cat flag.txt": () => ({ html: "cat: flag.txt: Permission denied", cls: "out err" }),
    "sudo cat flag.txt": () => ({ html: `guest is not in the sudoers file. This incident will be reported.\n...just kidding: <span class="flag">${FLAG}</span>`, cls: "out" }),
    sudo: () => "nice try.",
    "rm -rf /": () => ({ html: "rm: refusing to delete the internet", cls: "out err" }),
    hack: () => "hacking the mainframe... ████████████ 100%\naccess denied. (it's never that easy)",
    date: () => new Date().toString(),
    echo: (args) => esc(args),
    exit: () => "there is no escape.",
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = "";
    print(`<span class="neon-c">guest@bbt</span>:<span class="neon-m">~</span>$ ${esc(raw)}`, "");
    if (!raw) return;
    history.push(raw);
    hIdx = history.length;

    if (raw === "clear") { out.innerHTML = ""; return; }

    const [cmd, ...rest] = raw.split(/\s+/);
    const handler = commands[raw] || commands[cmd];
    if (!handler) { print(`bbt: command not found: ${esc(cmd)}. try <span class="hl">help</span>`, "out err"); return; }
    const res = handler(rest.join(" "));
    if (typeof res === "object") print(res.html, res.cls);
    else print(res);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" && hIdx > 0) { input.value = history[--hIdx]; e.preventDefault(); }
    if (e.key === "ArrowDown") { hIdx = Math.min(hIdx + 1, history.length); input.value = history[hIdx] || ""; }
  });

  document.querySelector(".shell").addEventListener("click", () => input.focus());
})();

/* ---------- misc ---------- */
document.getElementById("year").textContent = new Date().getFullYear();

console.log(
  "%cBUZZ BOIL TAPS",
  "font: 700 32px monospace; color: #00f0ff; text-shadow: 0 0 10px #00f0ff;"
);
console.log("%cpoking around the console? you'd fit right in. hint: the shell at #connect has more commands than it admits.", "color:#ff2bd6");
