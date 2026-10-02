/* =========================================================
   BUZZ BOIL TAPS — renders data.json + interactions
   ========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel) => document.querySelector(sel);

/* ---------- helpers ---------- */
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// escape, then turn *text* into a highlighted span
const fmt = (s) => esc(s).replace(/\*(.+?)\*/g, '<span class="hl">$1</span>');

// block javascript: and other odd schemes in links from data.json
const safeUrl = (u = "#") => (/^(https?:|mailto:|#|\/|\.)/i.test(u) ? u : "#");

const ACCENT_CLASS = { cyan: "neon-c", magenta: "neon-m", lime: "hl", orange: "neon-o" };

/* =========================================================
   RENDER
   ========================================================= */
function render(data) {
  const { team, stats, members, achievements } = data;

  // hero
  const name = $("#team-name");
  name.textContent = team.name;
  name.dataset.text = team.name;
  $("#hero-tags").innerHTML = team.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");

  // about: lore terminal
  const prompt = (file) =>
    `<p><span class="neon-c">bbt@origin</span>:<span class="neon-m">~/lore</span>$ ${file}</p>`;
  $("#lore").innerHTML =
    prompt("cat origin_story.txt") +
    team.origin.map((p) => `<p class="out">${fmt(p)}</p>`).join("") +
    prompt("cat mission.txt") +
    team.mission.map((p) => `<p class="out">${fmt(p)}</p>`).join("") +
    prompt('<span class="cursor">█</span>');

  // about: stats
  $("#stats").innerHTML = stats
    .map(
      (s) => `
      <div class="stat">
        <span class="stat-num" data-count="${+s.value || 0}" data-suffix="${esc(s.suffix)}">0</span>
        <span class="stat-label">${esc(s.label)}</span>
      </div>`
    )
    .join("");

  // crew cards
  $("#member-count").textContent = members.length;
  $("#crew-grid").innerHTML = members
    .map(
      (m) => `
      <article class="card reveal" data-accent="${esc(m.accent)}">
        <div class="card-glow"></div>
        <div class="card-head">
          <div class="avatar"><span>${esc(m.initials)}</span></div>
          <div>
            <h3 class="card-name">${esc(m.name)}</h3>
            <p class="card-handle">${esc(m.handle)}</p>
          </div>
        </div>
        <p class="card-role"><span class="dim">role:</span> ${esc(m.role)}</p>
        <p class="card-bio">${fmt(m.bio)}</p>
        <ul class="skills">${m.skills.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
        <div class="card-links">
          <a href="${esc(safeUrl(m.website?.url))}" target="_blank" rel="noopener" aria-label="${esc(m.name)}'s website">web</a>
          <a href="${esc(safeUrl(m.github?.url))}" target="_blank" rel="noopener" aria-label="${esc(m.name)}'s GitHub">github</a>
          <a href="mailto:${esc(m.email)}" aria-label="Email ${esc(m.name)}">email</a>
        </div>
      </article>`
    )
    .join("");

  // achievement filters: "all" + every type that appears in the data
  const types = ["all", ...new Set(achievements.map((a) => a.type))];
  $("#filters").innerHTML = types
    .map(
      (t, i) =>
        `<button class="filter${i === 0 ? " active" : ""}" data-filter="${esc(t)}" aria-pressed="${i === 0}">${esc(t)}</button>`
    )
    .join("");

  // achievement timeline
  $("#timeline").innerHTML = achievements
    .map(
      (a) => `
      <li class="entry reveal" data-type="${esc(a.type)}">
        <span class="entry-date">${esc(a.date)}</span>
        <div class="entry-body">
          <span class="badge ${esc(a.type)}">${esc(a.type.toUpperCase())}</span>
          <h3>${esc(a.title)}${a.place ? ` <span class="place ${esc(a.highlight || "")}">${esc(a.place)}</span>` : ""}</h3>
          <p>${fmt(a.description)}</p>
        </div>
      </li>`
    )
    .join("");

  // connect table
  $("#links-table").insertAdjacentHTML(
    "beforeend",
    members
      .map(
        (m, i) => `
      <div class="lt-row" data-accent="${esc(m.accent)}">
        <div class="lt-identity"><span class="lt-index">${String(i + 1).padStart(2, "0")}</span><strong class="op">${esc(m.name)}</strong></div>
        <div class="lt-links">
          <a href="${esc(safeUrl(m.website?.url))}" target="_blank" rel="noopener"><span>web</span>${esc(m.website?.label)}</a>
          <a href="${esc(safeUrl(m.github?.url))}" target="_blank" rel="noopener"><span>github</span>${esc(m.github?.label)}</a>
          <a href="mailto:${esc(m.email)}"><span>email</span>${esc(m.email)}</a>
        </div>
      </div>`
      )
      .join("")
  );

  // footer
  $("#footer-name").textContent = team.name;
  $("#footer-text").textContent = team.footer;
  $("#year").textContent = new Date().getFullYear();
}

/* =========================================================
   INTERACTIONS
   ========================================================= */

/* ---------- boot sequence ---------- */
function boot(teamName) {
  const el = $("#boot");
  if (!el) return;
  const log = $("#boot-log");

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
    "[    0.420000] <span class='ok'>[ OK ]</span> all operators online",
    `[    0.500000] generating team name... <span class='big'>${esc(teamName)}</span>`,
    "",
    "access granted_",
  ];

  let i = 0;
  let timer;
  const finish = () => {
    clearTimeout(timer);
    el.classList.add("done");
    try { sessionStorage.setItem("bbt-booted", "1"); } catch (e) {}
    setTimeout(() => el.remove(), 450);
    window.removeEventListener("keydown", finish);
    el.removeEventListener("click", finish);
  };
  const next = () => {
    if (i >= lines.length) { timer = setTimeout(finish, 250); return; }
    log.innerHTML += lines[i++] + "\n";
    timer = setTimeout(next, 80 + Math.random() * 65);
  };
  window.addEventListener("keydown", finish);
  el.addEventListener("click", finish);
  next();
}

/* ---------- code rain background ---------- */
function rain() {
  const canvas = $("#rain");
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
      drops[i] += 0.34;
    }
  };

  if (reduceMotion) { draw(); return; }
  let last = 0;
  const loop = (t) => {
    if (!document.hidden && t - last > 33) { draw(); last = t; }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- typed hero tagline ---------- */
function typed(phrases) {
  const el = $("#typed");
  if (!phrases.length) return;
  if (reduceMotion) { el.textContent = phrases[phrases.length - 1]; return; }

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
}

/* ---------- reveal on scroll + stat counters ---------- */
function reveal() {
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
}

/* ---------- nav: mobile toggle + active section ---------- */
function nav() {
  const toggle = $(".nav-toggle");
  const links = $(".nav-links");
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
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });

  const map = new Map([...links.querySelectorAll("a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      map.forEach((a) => a.classList.remove("active"));
      map.get(e.target.id)?.classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, id) => io.observe(document.getElementById(id)));
}

/* ---------- crew cards: 3D tilt + cursor glow ---------- */
function tilt() {
  if (reduceMotion || window.matchMedia("(hover: none)").matches) return;
  document.querySelectorAll(".card").forEach((card) => {
    let frame = 0;
    let x = 0.5;
    let y = 0.5;
    let rect;
    card.addEventListener("mouseenter", () => { rect = card.getBoundingClientRect(); });
    card.addEventListener("mousemove", (e) => {
      if (!rect) return;
      x = (e.clientX - rect.left) / rect.width;
      y = (e.clientY - rect.top) / rect.height;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg) translateY(-4px)`;
        frame = 0;
      });
    });
    card.addEventListener("mouseleave", () => {
      cancelAnimationFrame(frame);
      frame = 0;
      rect = null;
      card.style.transform = "";
    });
  });
}

/* ---------- achievement filters ---------- */
function filters() {
  const buttons = document.querySelectorAll(".filter");
  const entries = document.querySelectorAll(".entry");
  const label = $("#filter-label");
  buttons.forEach((btn) =>
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      buttons.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", b === btn);
      });
      label.textContent = f;
      entries.forEach((en) => {
        const show = f === "all" || en.dataset.type === f;
        en.classList.toggle("hidden", !show);
        if (show) en.classList.add("visible");
      });
    })
  );
}

/* ---------- interactive shell ---------- */
function shell(data) {
  const out = $("#shell-out");
  const form = $("#shell-form");
  const input = $("#shell-cmd");
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

  const { members, team } = data;
  const nameW = Math.max(...members.map((m) => m.name.length)) + 2;
  const handleW = Math.max(...members.map((m) => m.handle.length)) + 2;

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
      members
        .map(
          (m) =>
            `<span class="${ACCENT_CLASS[m.accent] || "neon-c"}">${esc(m.name.padEnd(nameW))}</span>${esc(m.handle.padEnd(handleW))}${esc(m.role)}`
        )
        .join("\n"),
    contact: () => members.map((m) => esc(m.email)).join("\n"),
    origin: () => team.origin.map(fmt).join("\n"),
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

  document.querySelectorAll("[data-command]").forEach((button) =>
    button.addEventListener("click", () => {
      input.value = button.dataset.command;
      form.requestSubmit();
    })
  );

  $(".shell").addEventListener("click", () => input.focus());
}

/* =========================================================
   BOOTSTRAP
   ========================================================= */
function showLoadError(err) {
  $("#boot")?.remove();
  const box = $("#load-error");
  box.hidden = false;
  box.innerHTML =
    location.protocol === "file:"
      ? `<strong>Couldn't load data.json.</strong> Browsers block reading files when a page is opened directly from disk.
         Run a local server in this folder instead, e.g. <code>python -m http.server</code> then open
         <code>http://localhost:8000</code> (or use VS Code's Live Server extension).`
      : `<strong>Couldn't load data.json:</strong> ${esc(err.message)}. Check the file exists and is valid JSON.`;
  console.error(err);
}

(async function main() {
  rain();
  nav();

  let data;
  try {
    const res = await fetch("data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
    render(data);
  } catch (err) {
    showLoadError(err);
    return;
  }

  boot(data.team.name);
  typed(data.team.taglines);
  reveal();
  tilt();
  filters();
  shell(data);
})();

console.log(
  "%cBUZZ BOIL TAPS",
  "font: 700 32px monospace; color: #00f0ff; text-shadow: 0 0 10px #00f0ff;"
);
console.log("%cpoking around the console? you'd fit right in. hint: the shell at #connect has more commands than it admits.", "color:#ff2bd6");
