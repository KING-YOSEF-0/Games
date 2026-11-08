"use strict";
const DEV = "KING_YOSEF_";
const COLORS = ["#ff7eb6", "#6ec6ff", "#7be0b3", "#ffd166", "#a98bff"];
const $ = (s) => document.querySelector(s);

/* id, name, emoji, description */
const GAMES = [
  ["rps", "Rock Paper Scissors", "✊", "Beat the computer in a quick duel"],
  ["ttt", "Tic Tac Toe", "❌", "Get three in a row"],
  ["c4", "Connect Four", "🔴", "Drop discs and connect four"],
  ["nim", "Nim", "🪨", "Take the last stone"],
  ["gomoku", "Gomoku", "⚫", "Five in a row wins"],
  ["reversi", "Reversi", "⚪", "Flip your opponent's discs"],
  ["checkers", "Checkers", "🏁", "Jump and capture"],
  ["dots", "Dots and Boxes", "🔲", "Close the most boxes"],
  ["battleship", "Battleship", "🚢", "Sink the hidden fleet"],
  ["mines", "Minesweeper", "💣", "Clear the field safely"],
  ["g2048", "2048", "🔢", "Merge tiles to reach 2048"],
  ["sudoku", "Sudoku", "🧩", "Fill the grid with logic"],
  ["mastermind", "Mastermind", "🎯", "Crack the colour code"],
  ["wordle", "Wordle", "🔤", "Guess the secret word"],
  ["sokoban", "Sokoban", "📦", "Push boxes to targets"],
  ["blackjack", "Blackjack", "🃏", "Beat the dealer to 21"],
  ["poker", "Poker", "♠️", "Build the best hand"],
  ["war", "War", "⚔️", "Highest card wins"],
  ["hilo", "Higher / Lower", "↕️", "Guess the next card"],
  ["puzzle15", "15-Puzzle", "🔟", "Slide tiles in order"],
  ["lights", "Lights Out", "💡", "Turn every light off"],
  ["hanoi", "Tower of Hanoi", "🗼", "Move the tower"],
  ["peg", "Peg Solitaire", "📍", "Jump pegs until one remains"],
  ["memory", "Memory Match", "🧠", "Find all matching pairs"],
  ["pong", "Pong", "🏓", "Classic paddle battle"],
  ["snake", "Snake", "🐍", "Eat, grow, survive"],
  ["tron", "Tron", "🏍️", "Trap your rival"],
  ["aim", "Aim Trainer", "🎯", "Hit targets fast"],
  ["minichess", "Mini Chess", "♟️", "Chess on a small board"],
  ["wordchain", "Word Chain", "🔗", "Chain words by last letter"],
];

let cleanups = [];
const onCleanup = (fn) => cleanups.push(fn);

/* ---------- Home page ---------- */
function renderGrid(filter = "") {
  const grid = $("#grid");
  const q = filter.trim().toLowerCase();
  const list = GAMES.filter((g) => g[1].toLowerCase().includes(q));
  grid.innerHTML = "";
  list.forEach((g, i) => {
    const ready = !!IMPL[g[0]];
    const b = document.createElement("button");
    b.className = "card";
    b.style.setProperty("--c", COLORS[i % COLORS.length]);
    b.innerHTML = `<span class="ico">${g[2]}</span><h3>${g[1]}</h3><p>${g[3]}</p>
      <span class="badge ${ready ? "" : "soon"}">${ready ? "Play now" : "Coming soon"}</span>
      <span class="by">Developer: ${DEV}</span>`;
    b.addEventListener("click", () => openGame(g));
    b.addEventListener("pointermove", (e) => tilt(b, e));
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
    grid.appendChild(b);
  });
  const done = GAMES.filter((g) => IMPL[g[0]]).length;
  $("#count").textContent = `${list.length} games shown · ${done} playable now · developer ${DEV}`;
}

function tilt(el, e) {
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", x * 100 + "%");
  el.style.setProperty("--my", y * 100 + "%");
  el.style.transform = `perspective(600px) rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 12}deg) translateY(-4px)`;
}

function openGame(g) {
  const stage = $("#stage"), box = $("#box");
  closeGame(true);
  $("#gtitle").textContent = `${g[2]} ${g[1]}`;
  stage.hidden = false;
  document.body.style.overflow = "hidden";
  setStatus("");
  if (IMPL[g[0]]) IMPL[g[0]](box);
  else box.innerHTML = `<p style="text-align:center">🚧 <b>${g[1]}</b> is coming soon!<br>Developer: ${DEV}</p>`;
}
function closeGame(keepOpen) {
  cleanups.forEach((f) => f());
  cleanups = [];
  $("#box").innerHTML = "";
  if (!keepOpen) { $("#stage").hidden = true; document.body.style.overflow = ""; }
}
const setStatus = (t) => ($("#status").textContent = t);

/* ---------- Background bubbles + mouse interaction ---------- */
function initBubbles() {
  const cv = $("#bubbles"), ctx = cv.getContext("2d");
  let W, H, mouse = { x: -999, y: -999 };
  const bubbles = [];
  const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  resize(); addEventListener("resize", resize);
  const n = innerWidth < 600 ? 22 : 45;
  for (let i = 0; i < n; i++)
    bubbles.push({ x: Math.random() * W, y: Math.random() * H, r: 10 + Math.random() * 38,
      vx: 0, vy: -(0.2 + Math.random() * 0.6), c: COLORS[i % COLORS.length], p: Math.random() * 6 });
  const move = (e) => { const t = e.touches ? e.touches[0] : e; mouse.x = t.clientX; mouse.y = t.clientY; };
  addEventListener("pointermove", move);
  addEventListener("touchmove", move, { passive: true });
  (function loop(t) {
    ctx.clearRect(0, 0, W, H);
    bubbles.forEach((b) => {
      const dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 140) { b.vx += (dx / d) * 0.6; b.vy += (dy / d) * 0.6; }
      b.vx *= 0.94; b.vy = b.vy * 0.97 + -0.02;
      b.x += b.vx + Math.sin(t / 900 + b.p) * 0.4; b.y += b.vy;
      if (b.y < -b.r) { b.y = H + b.r; b.x = Math.random() * W; }
      if (b.x < -b.r) b.x = W + b.r; if (b.x > W + b.r) b.x = -b.r;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7);
      ctx.fillStyle = b.c + "40"; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.18, 0, 7);
      ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill();
    });
    requestAnimationFrame(loop);
  })(0);
}
function initCursor() {
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const grad = (id) => `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="36"><stop offset="0" stop-color="#ff1744"/><stop offset=".2" stop-color="#ff9100"/><stop offset=".4" stop-color="#ffea00"/><stop offset=".6" stop-color="#00e676"/><stop offset=".8" stop-color="#2979ff"/><stop offset="1" stop-color="#d500f9"/></linearGradient></defs>`;
  const shape = (id, s, extra = "") => `${grad(id)}<g fill="#fff" stroke="#fff" stroke-width="5" stroke-linejoin="round">${s}</g><g fill="url(#${id})">${s}</g>${extra}`;
  const arrow = '<path d="M3 2L3 27L9 21L14 32L19 30L14 19L23 19Z"/>';
  const hand = '<rect x="11" y="2" width="8" height="20" rx="4"/><rect x="5" y="15" width="26" height="18" rx="8"/>';
  const k = document.createElement("div"); k.id = "kc";
  k.innerHTML = `<svg class="ar" width="30" height="38" viewBox="0 0 28 36">${shape("rb1", arrow)}</svg><svg class="hd" width="38" height="38" viewBox="0 0 36 36">${shape("rb2", hand, '<path d="M13 22v7M18 22v7M23 22v7" stroke="#fff" stroke-width="2" stroke-linecap="round"/>')}</svg>`;
  document.body.appendChild(k);
  let lastSpark = 0;
  addEventListener("pointermove", (e) => {
    const hand = !!e.target.closest("button,a,input,select,textarea,label,[role=button]"), o = hand ? [15, 2] : [3, 2];
    k.classList.toggle("hand", hand); k.style.opacity = 1;
    k.style.transform = `translate(${e.clientX - o[0]}px,${e.clientY - o[1]}px)`;
    if (fine && e.timeStamp - lastSpark > 45) {
      lastSpark = e.timeStamp; const sp = document.createElement("div"); sp.className = "spark";
      sp.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;background:hsl(${(e.timeStamp / 4) % 360},90%,60%)`;
      document.body.appendChild(sp); setTimeout(() => sp.remove(), 600);
    }
  });
  document.addEventListener("pointerleave", () => (k.style.opacity = 0));
  addEventListener("pointerdown", (e) => {
    const p = document.createElement("div"); p.className = "pop"; const s = 20 + Math.random() * 20;
    p.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - s / 2}px;top:${e.clientY - s / 2}px`;
    document.body.appendChild(p); setTimeout(() => p.remove(), 600);
  });
}

/* ---------- Helpers ---------- */
const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; };
const resetBtn = (box, fn) => { const b = mk("button", "btn", "🔄 New game"); b.onclick = fn; box.appendChild(b); };
const LINES3 = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

/* ---------- Games ---------- */
const IMPL = {};

IMPL.rps = (box) => {
  const s = { w: 0, l: 0, d: 0 }, E = ["✊", "✋", "✌️"];
  box.innerHTML = `<div class="row">${E.map((e, i) => `<button class="big" data-i="${i}">${e}</button>`).join("")}</div><p id="rr"></p>`;
  setStatus("Pick your move!");
  box.querySelectorAll(".big").forEach((b) => (b.onclick = () => {
    const me = +b.dataset.i, cpu = Math.floor(Math.random() * 3), r = (me - cpu + 3) % 3;
    r === 1 ? s.w++ : r === 2 ? s.l++ : s.d++;
    setStatus(r === 1 ? "You win! 🎉" : r === 2 ? "You lose 😅" : "Draw 🤝");
    $("#rr").textContent = `You ${E[me]} vs ${E[cpu]} CPU · Wins ${s.w} · Losses ${s.l} · Draws ${s.d}`;
  }));
};

IMPL.ttt = (box) => {
  let b, over;
  const win = (p) => LINES3.some((l) => l.every((i) => b[i] === p));
  const cpuMove = () => {
    const free = b.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    for (const p of ["O", "X"]) for (const i of free) { b[i] = p; const w = win(p); b[i] = ""; if (w) return i; }
    return b[4] === "" ? 4 : free[Math.floor(Math.random() * free.length)];
  };
  const draw = () => {
    box.innerHTML = ""; const g = mk("div", "ttt");
    b.forEach((v, i) => { const c = mk("button", "", v); c.disabled = !!v || over; c.onclick = () => play(i); g.appendChild(c); });
    box.appendChild(g); resetBtn(box, start);
  };
  const end = () => {
    if (win("X")) { over = 1; setStatus("You win! 🎉"); }
    else if (win("O")) { over = 1; setStatus("CPU wins 🤖"); }
    else if (b.every(Boolean)) { over = 1; setStatus("Draw 🤝"); }
  };
  const play = (i) => { b[i] = "X"; end(); if (!over) { b[cpuMove()] = "O"; end(); } draw(); };
  function start() { b = Array(9).fill(""); over = 0; setStatus("You are ❌"); draw(); }
  start();
};

IMPL.c4 = (box) => {
  const R = 6, C = 7; let g, over;
  const win = (p) => {
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++)
      for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
        let k = 0; for (; k < 4; k++) { const y = r + dr * k, x = c + dc * k; if (y < 0 || y >= R || x < 0 || x >= C || g[y][x] !== p) break; }
        if (k === 4) return true;
      }
    return false;
  };
  const drop = (c, p) => { for (let r = R - 1; r >= 0; r--) if (!g[r][c]) { g[r][c] = p; return r; } return -1; };
  const undo = (c) => { for (let r = 0; r < R; r++) if (g[r][c]) { g[r][c] = ""; return; } };
  const cpu = () => {
    const cols = [3,2,4,1,5,0,6].filter((c) => !g[0][c]);
    for (const p of ["c", "p"]) for (const c of cols) { drop(c, p); const w = win(p); undo(c); if (w) return c; }
    return cols[Math.floor(Math.random() * Math.min(3, cols.length))];
  };
  const draw = () => {
    box.innerHTML = ""; const el = mk("div", "c4");
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) { const i = mk("i", g[r][c]); i.onclick = () => play(c); el.appendChild(i); }
    box.appendChild(el); resetBtn(box, start);
  };
  const play = (c) => {
    if (over || g[0][c]) return;
    drop(c, "p");
    if (win("p")) { over = 1; setStatus("You win! 🎉"); }
    else { drop(cpu(), "c"); if (win("c")) { over = 1; setStatus("CPU wins 🤖"); } }
    if (!over && g[0].every(Boolean)) { over = 1; setStatus("Draw 🤝"); }
    draw();
  };
  function start() { g = Array.from({ length: R }, () => Array(C).fill("")); over = 0; setStatus("You are pink 🩷"); draw(); }
  start();
};

IMPL.g2048 = (box) => {
  let g, score;
  const add = () => { const e = []; g.forEach((v, i) => !v && e.push(i)); if (e.length) g[e[Math.floor(Math.random() * e.length)]] = Math.random() < 0.9 ? 2 : 4; };
  const slide = (row) => {
    const a = row.filter(Boolean); for (let i = 0; i < a.length - 1; i++) if (a[i] === a[i + 1]) { a[i] *= 2; score += a[i]; a.splice(i + 1, 1); }
    while (a.length < 4) a.push(0); return a;
  };
  const move = (d) => {
    const old = g.join(), n = Array(16).fill(0);
    for (let k = 0; k < 4; k++) {
      const idx = [0,1,2,3].map((j) => (d < 2 ? k * 4 + j : j * 4 + k));
      const line = idx.map((i) => g[i]); if (d % 2) line.reverse();
      const r = slide(line); if (d % 2) r.reverse(); idx.forEach((i, j) => (n[i] = r[j]));
    }
    g = n; if (g.join() !== old) add(); draw();
    if (g.includes(2048)) setStatus("You reached 2048! 🏆");
  };
  const col = (v) => (v ? `hsl(${300 - Math.log2(v) * 22},85%,${85 - Math.log2(v) * 3}%)` : "");
  const draw = () => {
    setStatus(`Score: ${score}`);
    const el = box.querySelector(".g2048");
    el.innerHTML = g.map((v) => `<b style="background:${col(v)}">${v || ""}</b>`).join("");
  };
  const key = (e) => { const m = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 }[e.key]; if (m !== undefined) { e.preventDefault(); move(m); } };
  addEventListener("keydown", key); onCleanup(() => removeEventListener("keydown", key));
  box.innerHTML = `<div class="g2048"></div><p>Arrow keys or swipe</p>`;
  const el = box.querySelector(".g2048"); let sx, sy;
  el.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  el.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 0 : 1) : dy < 0 ? 2 : 3);
  });
  const start = () => { g = Array(16).fill(0); score = 0; add(); add(); draw(); };
  resetBtn(box, start); start();
};

IMPL.memory = (box) => {
  let first = null, lock = false, found = 0, moves = 0;
  const em = ["🍓","🍋","🍇","🐳","🌸","🍪","🦄","⭐"];
  const deck = [...em, ...em].sort(() => Math.random() - 0.5);
  const el = mk("div", "mem");
  deck.forEach((e) => {
    const b = mk("button", "", "❓");
    b.onclick = () => {
      if (lock || b.classList.contains("on") || b.classList.contains("done")) return;
      b.textContent = e; b.classList.add("on");
      if (!first) { first = b; return; }
      moves++; lock = true;
      if (first.textContent === e) {
        [first, b].forEach((x) => { x.classList.remove("on"); x.classList.add("done"); });
        first = null; lock = false; found++;
        setStatus(found === 8 ? `You won in ${moves} moves! 🎉` : `Pairs: ${found}/8 · Moves: ${moves}`);
      } else setTimeout(() => { [first, b].forEach((x) => { x.textContent = "❓"; x.classList.remove("on"); }); first = null; lock = false; }, 700);
    };
    el.appendChild(b);
  });
  setStatus("Find all pairs!"); box.appendChild(el);
  resetBtn(box, () => IMPL.memory(box = (box.innerHTML = "", box)));
};

IMPL.snake = (box) => {
  const N = 20, S = 17;
  const cv = mk("canvas", "snake"); cv.width = cv.height = N * S; box.appendChild(cv);
  const ctx = cv.getContext("2d"); let sn, d, nd, food, score, timer, dead;
  const place = () => { do food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; while (sn.some((s) => s.x === food.x && s.y === food.y)); };
  const start = () => { clearInterval(timer); sn = [{ x: 10, y: 10 }]; d = nd = { x: 1, y: 0 }; score = 0; dead = false; place(); setStatus("Score: 0"); timer = setInterval(tick, 110); };
  const tick = () => {
    d = nd; const h = { x: sn[0].x + d.x, y: sn[0].y + d.y };
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || sn.some((s) => s.x === h.x && s.y === h.y)) { dead = true; clearInterval(timer); setStatus(`Game over! Score: ${score} 💫`); return; }
    sn.unshift(h);
    if (h.x === food.x && h.y === food.y) { score++; setStatus("Score: " + score); place(); } else sn.pop();
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "#ff7eb6"; ctx.beginPath(); ctx.arc(food.x * S + S / 2, food.y * S + S / 2, S / 2 - 2, 0, 7); ctx.fill();
    sn.forEach((s, i) => { ctx.fillStyle = i ? "#7be0b3" : "#3fbf8a"; ctx.beginPath(); ctx.roundRect(s.x * S + 1, s.y * S + 1, S - 2, S - 2, 6); ctx.fill(); });
  };
  const turn = (x, y) => { if (x !== -d.x || y !== -d.y) nd = { x, y }; };
  const key = (e) => { const m = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] }[e.key]; if (m) { e.preventDefault(); turn(...m); } };
  addEventListener("keydown", key); onCleanup(() => { removeEventListener("keydown", key); clearInterval(timer); });
  let sx, sy;
  cv.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? -1 : 1, 0); else turn(0, dy < 0 ? -1 : 1);
  });
  box.appendChild(mk("p", "", "Arrow keys or swipe on the board"));
  resetBtn(box, start); start();
};

/* ---------- Batch 2: cards, puzzle, minesweeper, mastermind ---------- */
const SUITS = ["♠", "♥", "♦", "♣"], RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
const newDeck = () => { const d = []; for (let s = 0; s < 4; s++) for (let r = 0; r < 13; r++) d.push({ r, s }); return d.sort(() => Math.random() - 0.5); };
const cardHTML = (c, hide) => hide ? `<span class="pc back">?</span>` : `<span class="pc ${c.s === 1 || c.s === 2 ? "red" : ""}">${RANKS[c.r]}${SUITS[c.s]}</span>`;
const hiVal = (c) => (c.r === 0 ? 13 : c.r);

IMPL.hilo = (box) => {
  let deck, cur, streak, best = 0;
  const start = () => { deck = newDeck(); cur = deck.pop(); streak = 0; draw("Will the next card be higher or lower?"); };
  const guess = (up) => {
    if (!deck.length) deck = newDeck();
    const nx = deck.pop(), a = hiVal(cur), b = hiVal(nx); let msg;
    if (a === b) msg = "Same value - no change 🤝";
    else if ((b > a) === up) { streak++; best = Math.max(best, streak); msg = "Correct! 🎉"; }
    else { streak = 0; msg = "Wrong 😅 streak reset"; }
    cur = nx; draw(msg);
  };
  const draw = (msg) => {
    setStatus(msg);
    box.innerHTML = `<div class="cardrow">${cardHTML(cur)}</div><p>Streak: <b>${streak}</b> · Best: <b>${best}</b></p>
      <div class="row"><button class="btn" id="hi">⬆ Higher</button><button class="btn" id="lo">⬇ Lower</button></div>`;
    $("#hi").onclick = () => guess(true); $("#lo").onclick = () => guess(false);
    resetBtn(box, start);
  };
  start();
};

IMPL.war = (box) => {
  let deck, i, p, c, last = "";
  const start = () => { deck = newDeck(); i = 0; p = c = 0; last = ""; draw("Draw a card!"); };
  const play = () => {
    const a = deck[i++], b = deck[i++], x = hiVal(a), y = hiVal(b);
    x > y ? p++ : y > x ? c++ : 0;
    last = `<div class="cardrow">${cardHTML(a)}<b>vs</b>${cardHTML(b)}</div>`;
    draw(x > y ? "You win the round! 🎉" : y > x ? "CPU wins the round 🤖" : "Tie - war! ⚔️");
  };
  const draw = (msg) => {
    const done = i >= 52;
    setStatus(done ? (p > c ? "🏆 You win the war!" : c > p ? "CPU wins the war 🤖" : "Draw 🤝") : msg);
    box.innerHTML = `${last}<p>You <b>${p}</b> · CPU <b>${c}</b> · Cards left ${52 - i}</p>`;
    if (!done) { const b = mk("button", "btn", "⚔️ Draw"); b.onclick = play; box.appendChild(b); }
    resetBtn(box, start);
  };
  start();
};

IMPL.blackjack = (box) => {
  let deck, pl, de, over;
  const val = (h) => { let t = h.reduce((s, c) => s + (c.r === 0 ? 11 : Math.min(c.r + 1, 10)), 0), a = h.filter((c) => c.r === 0).length; while (t > 21 && a--) t -= 10; return t; };
  const start = () => { deck = newDeck(); pl = [deck.pop(), deck.pop()]; de = [deck.pop(), deck.pop()]; over = false; if (val(pl) === 21) stand(); else draw("Hit or stand?"); };
  const stand = () => {
    while (val(de) < 17) de.push(deck.pop());
    over = true; const p = val(pl), d = val(de);
    draw(p > 21 ? "Bust! Dealer wins 😅" : d > 21 || p > d ? "You win! 🎉" : p < d ? "Dealer wins 🤖" : "Push 🤝");
  };
  const hit = () => { pl.push(deck.pop()); val(pl) > 21 ? stand() : draw("Hit or stand?"); };
  const draw = (msg) => {
    setStatus(msg);
    box.innerHTML = `<p>Dealer ${over ? "(" + val(de) + ")" : ""}</p><div class="cardrow">${de.map((c, k) => cardHTML(c, !over && k === 1)).join("")}</div>
      <p>You (${val(pl)})</p><div class="cardrow">${pl.map((c) => cardHTML(c)).join("")}</div>`;
    if (!over) {
      const r = mk("div", "row", `<button class="btn" id="h">Hit</button><button class="btn" id="s">Stand</button>`); box.appendChild(r);
      $("#h").onclick = hit; $("#s").onclick = stand;
    }
    resetBtn(box, start);
  };
  start();
};

IMPL.puzzle15 = (box) => {
  let t, moves;
  const sw = (i, j) => ([t[i], t[j]] = [t[j], t[i]]);
  const nbr = (e) => [e - 4, e + 4, e % 4 ? e - 1 : -1, e % 4 < 3 ? e + 1 : -1].filter((k) => k >= 0 && k < 16);
  const start = () => {
    t = [...Array(15).keys()].map((n) => n + 1).concat(0); moves = 0;
    let prev = -1;
    for (let k = 0; k < 300; k++) { const e = t.indexOf(0), o = nbr(e).filter((x) => x !== prev); prev = e; sw(e, o[Math.floor(Math.random() * o.length)]); }
    draw();
  };
  const click = (i) => {
    const e = t.indexOf(0); if (!nbr(e).includes(i)) return;
    sw(e, i); moves++; draw();
  };
  const draw = () => {
    const won = t.every((v, i) => v === (i + 1) % 16);
    setStatus(won ? `Solved in ${moves} moves! 🎉` : `Moves: ${moves}`);
    box.innerHTML = ""; const g = mk("div", "p15");
    t.forEach((v, i) => { const b = mk("button", v ? "" : "empty", v || ""); b.onclick = () => click(i); g.appendChild(b); });
    box.appendChild(g); resetBtn(box, start);
  };
  start();
};

IMPL.mines = (box) => {
  const N = 9, M = 10; let cells, over, started, flagMode;
  const nb = (i) => { const r = Math.floor(i / N), c = i % N, a = []; for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) { const rr = r + y, cc = c + x; if ((x || y) && rr >= 0 && rr < N && cc >= 0 && cc < N) a.push(rr * N + cc); } return a; };
  const start = () => { cells = Array.from({ length: N * N }, () => ({ m: 0, n: 0, o: 0, f: 0 })); over = started = false; flagMode = false; draw("Clear the field!"); };
  const init = (s) => {
    const safe = [s, ...nb(s)];
    [...Array(N * N).keys()].filter((i) => !safe.includes(i)).sort(() => Math.random() - 0.5).slice(0, M).forEach((i) => (cells[i].m = 1));
    cells.forEach((c, i) => (c.n = nb(i).filter((j) => cells[j].m).length)); started = true;
  };
  const open = (i) => {
    if (over || cells[i].o) return;
    if (flagMode) { cells[i].f = !cells[i].f; return draw(); }
    if (cells[i].f) return;
    if (!started) init(i);
    if (cells[i].m) { over = true; cells.forEach((c) => c.m && (c.o = 1)); return draw("💥 Boom! You hit a mine."); }
    const st = [i];
    while (st.length) { const k = st.pop(); if (cells[k].o || cells[k].f) continue; cells[k].o = 1; if (!cells[k].n) st.push(...nb(k)); }
    if (cells.every((c) => c.m || c.o)) { over = true; return draw("🎉 You cleared the field!"); }
    draw();
  };
  const draw = (msg) => {
    setStatus(msg || `Mines left: ${M - cells.filter((c) => c.f).length}`);
    box.innerHTML = ""; const g = mk("div", "mines");
    cells.forEach((c, i) => {
      const b = mk("button", c.o ? "o" : "", c.f && !c.o ? "🚩" : c.o ? (c.m ? "💣" : c.n || "") : "");
      if (c.o && c.n && !c.m) b.dataset.n = c.n;
      b.onclick = () => open(i);
      b.oncontextmenu = (e) => { e.preventDefault(); if (!over && !c.o) { c.f = !c.f; draw(); } };
      g.appendChild(b);
    });
    box.appendChild(g);
    const f = mk("button", "btn", flagMode ? "🚩 Flag mode: ON" : "🚩 Flag mode: OFF"); f.onclick = () => { flagMode = !flagMode; draw(); }; box.appendChild(f);
    box.appendChild(mk("p", "", "Tip: right-click (or Flag mode on phones) to place flags"));
    resetBtn(box, start);
  };
  start();
};

IMPL.mastermind = (box) => {
  const COL = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣"], MAX = 10; let code, hist, cur, over;
  const start = () => { code = [0, 0, 0, 0].map(() => Math.floor(Math.random() * 6)); hist = []; cur = []; over = false; draw("Crack the 4-colour code!"); };
  const check = () => {
    if (cur.length < 4 || over) return;
    const black = cur.filter((v, i) => v === code[i]).length;
    const total = COL.reduce((s, _, k) => s + Math.min(cur.filter((v) => v === k).length, code.filter((v) => v === k).length), 0);
    hist.push({ g: cur, b: black, w: total - black }); cur = [];
    if (black === 4) { over = true; return draw(`🎉 Cracked in ${hist.length} tries!`); }
    if (hist.length >= MAX) { over = true; return draw("Out of tries! Code: " + code.map((k) => COL[k]).join("")); }
    draw(`Tries left: ${MAX - hist.length}`);
  };
  const draw = (msg) => {
    setStatus(msg);
    box.innerHTML = `<div class="mm">${hist.map((h) => `<div>${h.g.map((k) => COL[k]).join("")} <small>● ${h.b} ○ ${h.w}</small></div>`).join("")}</div>
      <div class="cardrow">${[0, 1, 2, 3].map((i) => `<span class="pc">${cur[i] !== undefined ? COL[cur[i]] : "·"}</span>`).join("")}</div>
      <div class="row">${COL.map((c, k) => `<button class="big sm" data-k="${k}">${c}</button>`).join("")}</div>
      <div class="row"><button class="btn" id="del">⌫ Undo</button><button class="btn" id="ok">✔ Check</button></div>
      <p><small>● right colour &amp; place · ○ right colour, wrong place</small></p>`;
    box.querySelectorAll(".big").forEach((b) => (b.onclick = () => { if (cur.length < 4 && !over) { cur.push(+b.dataset.k); draw(msg); } }));
    $("#del").onclick = () => { cur.pop(); draw(msg); }; $("#ok").onclick = check;
    resetBtn(box, start);
  };
  start();
};

/* ---------- Batch 3: board games, puzzles, poker ---------- */
const rnd = (n) => Math.floor(Math.random() * n), pick = (a) => a[rnd(a.length)], shuf = (a) => a.sort(() => Math.random() - 0.5);
const bd = (n, fn, cls = "") => { const g = mk("div", "bd " + cls); g.style.gridTemplateColumns = `repeat(${n},1fr)`; for (let i = 0; i < n * n; i++) { const o = fn(i), b = mk("button", o.c || "", o.t || ""); if (o.f) b.onclick = o.f; g.appendChild(b); } return g; };
const keyHandler = (fn) => { addEventListener("keydown", fn); onCleanup(() => removeEventListener("keydown", fn)); };

IMPL.nim = (box) => {
  let p, over;
  const start = () => { p = [3, 5, 7]; over = false; draw("Tap a stone to take it and every stone to its right. Take the LAST stone to win!"); };
  const done = () => p.every((x) => !x);
  const take = (i, k) => {
    if (over) return; p[i] = k;
    if (done()) { over = true; return draw("You took the last stone - you win! 🎉"); }
    const x = p.reduce((a, b) => a ^ b);
    if (x) { const j = p.findIndex((v) => (v ^ x) < v); p[j] ^= x; } else p[p.indexOf(Math.max(...p))]--;
    if (done()) { over = true; return draw("CPU took the last stone 🤖"); }
    draw("Your turn");
  };
  const draw = (m) => {
    setStatus(m); box.innerHTML = "";
    p.forEach((n, i) => { const r = mk("div", "row"); for (let k = 0; k < n; k++) { const b = mk("button", "big sm", "🪨"); b.onclick = () => take(i, k); r.appendChild(b); } if (!n) r.appendChild(mk("span", "", "—")); box.appendChild(r); });
    resetBtn(box, start);
  };
  start();
};

IMPL.gomoku = (box) => {
  const N = 13, D = [[0,1],[1,0],[1,1],[1,-1]]; let b, over;
  const run = (i, d, s) => { let n = 0, r = (i / N) | 0, c = i % N; for (;;) { r += d[0]; c += d[1]; if (r < 0 || c < 0 || r >= N || c >= N || b[r * N + c] !== s) return n; n++; } };
  const len = (i, d, s) => 1 + run(i, d, s) + run(i, [-d[0], -d[1]], s);
  const win = (i, s) => D.some((d) => len(i, d, s) >= 5);
  const score = (i, s) => D.reduce((t, d) => t + [0, 1, 10, 100, 1000, 1e5][Math.min(5, len(i, d, s))], 0);
  const cpu = () => { let best = -1, bi = []; b.forEach((v, i) => { if (v) return; const s = score(i, 2) * 1.1 + score(i, 1); if (s > best) { best = s; bi = [i]; } else if (s === best) bi.push(i); }); return pick(bi); };
  const start = () => { b = Array(N * N).fill(0); over = false; draw("You are ⚫ - get 5 in a row"); };
  const play = (i) => {
    if (over || b[i]) return; b[i] = 1;
    if (win(i, 1)) { over = true; return draw("You win! 🎉"); }
    const j = cpu(); b[j] = 2;
    if (win(j, 2)) { over = true; return draw("CPU wins 🤖"); }
    draw("Your turn");
  };
  const draw = (m) => { setStatus(m); box.innerHTML = ""; box.appendChild(bd(N, (i) => ({ t: ["", "⚫", "⚪"][b[i]], c: "gm", f: () => play(i) }), "sm")); resetBtn(box, start); };
  start();
};

IMPL.reversi = (box) => {
  const D = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]; let b;
  const inb = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const flips = (i, p) => {
    if (b[i]) return []; const out = [];
    D.forEach(([dr, dc]) => { let r = (i >> 3) + dr, c = (i & 7) + dc; const line = []; while (inb(r, c) && b[r * 8 + c] === -p) { line.push(r * 8 + c); r += dr; c += dc; } if (line.length && inb(r, c) && b[r * 8 + c] === p) out.push(...line); });
    return out;
  };
  const moves = (p) => b.map((_, i) => i).filter((i) => flips(i, p).length);
  const put = (i, p) => { flips(i, p).forEach((k) => (b[k] = p)); b[i] = p; };
  const cpu = () => { const m = moves(-1); if (!m.length) return; const sc = (i) => flips(i, -1).length + ([0, 7, 56, 63].includes(i) ? 10 : 0); put(m.sort((a, c) => sc(c) - sc(a))[0], -1); };
  const start = () => { b = Array(64).fill(0); b[27] = b[36] = -1; b[28] = b[35] = 1; draw(); };
  const click = (i) => { if (!flips(i, 1).length) return; put(i, 1); do cpu(); while (!moves(1).length && moves(-1).length); draw(); };
  const draw = () => {
    const bl = b.filter((v) => v === 1).length, wh = b.filter((v) => v === -1).length, mv = moves(1);
    setStatus(!mv.length && !moves(-1).length ? (bl > wh ? `You win ${bl}-${wh}! 🎉` : bl < wh ? `CPU wins ${wh}-${bl} 🤖` : "Draw 🤝") : `⚫ You ${bl}  ·  ⚪ CPU ${wh}`);
    box.innerHTML = ""; box.appendChild(bd(8, (i) => ({ t: b[i] === 1 ? "⚫" : b[i] === -1 ? "⚪" : mv.includes(i) ? "·" : "", c: "rv", f: () => click(i) }), "sm")); resetBtn(box, start);
  };
  start();
};

IMPL.checkers = (box) => {
  let b, sel, chain, over;
  const R = (i) => i >> 3, C = (i) => i & 7, inb = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const dirs = (p) => (Math.abs(p) === 2 ? [[-1,-1],[-1,1],[1,-1],[1,1]] : p > 0 ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]]);
  const mvs = (i) => { const p = b[i], out = []; dirs(p).forEach(([dr, dc]) => { const r = R(i) + dr, c = C(i) + dc; if (!inb(r, c)) return; const m = r * 8 + c; if (!b[m]) out.push({ to: m }); else if (b[m] * p < 0 && inb(r + dr, c + dc) && !b[(r + dr) * 8 + c + dc]) out.push({ to: (r + dr) * 8 + c + dc, cap: m }); }); return out; };
  const legal = (s) => { const all = []; b.forEach((v, i) => v * s > 0 && mvs(i).forEach((m) => all.push({ from: i, ...m }))); const j = all.filter((m) => m.cap != null); return j.length ? j : all; };
  const apply = (m) => {
    const p = b[m.from]; b[m.from] = 0; b[m.to] = p; if (m.cap != null) b[m.cap] = 0; let king = false;
    if (p === 1 && R(m.to) === 0) { b[m.to] = 2; king = true; } if (p === -1 && R(m.to) === 7) { b[m.to] = -2; king = true; }
    return m.cap != null && !king && mvs(m.to).some((x) => x.cap != null) ? m.to : -1;
  };
  const cpuTurn = () => {
    const ms = legal(-1); if (!ms.length) { over = true; return; }
    let m = pick(ms), ch = apply(m);
    while (ch >= 0) { m = { from: ch, ...pick(mvs(ch).filter((x) => x.cap != null)) }; ch = apply(m); }
    if (!legal(1).length) over = true;
  };
  const start = () => { b = Array(64).fill(0); for (let i = 0; i < 64; i++) if ((R(i) + C(i)) % 2) { if (R(i) < 3) b[i] = -1; if (R(i) > 4) b[i] = 1; } sel = -1; chain = -1; over = false; draw("You are 🔴 - captures are mandatory"); };
  const click = (i) => {
    if (over) return; const L = legal(1).filter((m) => chain < 0 || m.from === chain);
    if (b[i] > 0 && chain < 0 && L.some((m) => m.from === i)) { sel = i; return draw(); }
    const m = L.find((x) => x.from === sel && x.to === i); if (!m) return;
    const ch = apply(m);
    if (ch >= 0) { chain = sel = ch; return draw("Keep jumping!"); }
    chain = sel = -1; cpuTurn(); draw();
  };
  const draw = (msg) => {
    const rd = b.filter((v) => v > 0).length, yl = b.filter((v) => v < 0).length;
    setStatus(over ? (rd ? "You win! 🎉" : yl && !legal(1).length ? "CPU wins 🤖" : rd > yl ? "You win! 🎉" : "CPU wins 🤖") : msg || `🔴 ${rd} · 🟡 ${yl}`);
    const L = legal(1).filter((m) => chain < 0 || m.from === chain); box.innerHTML = "";
    box.appendChild(bd(8, (i) => { const dk = (R(i) + C(i)) % 2 === 1; return { t: { 1: "🔴", 2: "🟣", "-1": "🟡", "-2": "🟠" }[b[i]] || "", c: (dk ? "dk" : "lt") + (sel === i ? " sel" : "") + (!over && sel >= 0 && L.some((m) => m.from === sel && m.to === i) ? " hint" : ""), f: dk ? () => click(i) : null }; }, "sm ck"));
    box.appendChild(mk("p", "", "<small>Purple/orange = kings</small>")); resetBtn(box, start);
  };
  start();
};

IMPL.dots = (box) => {
  const G = 9; let g, sc, turn;
  const R = (i) => (i / G) | 0, C = (i) => i % G, isBox = (i) => R(i) % 2 && C(i) % 2, isLine = (i) => (R(i) + C(i)) % 2 === 1;
  const adj = (i) => [i - G, i + G, i - 1, i + 1].filter((j) => j >= 0 && j < 81 && isBox(j) && Math.abs(R(j) - R(i)) + Math.abs(C(j) - C(i)) === 1);
  const sides = (j) => [j - G, j + G, j - 1, j + 1].filter((s) => g[s]).length;
  const claim = (i, who) => { g[i] = who; let n = 0; adj(i).forEach((j) => { if (!g[j] && sides(j) === 4) { g[j] = who; sc[who]++; n++; } }); return n; };
  const cpu = () => {
    while (turn === 2 && sc[1] + sc[2] < 16) {
      const free = g.map((_, i) => i).filter((i) => isLine(i) && !g[i]);
      const take = free.filter((l) => adj(l).some((j) => sides(j) === 3)), safe = free.filter((l) => adj(l).every((j) => sides(j) < 2));
      if (!claim(pick(take.length ? take : safe.length ? safe : free), 2)) turn = 1;
    }
  };
  const start = () => { g = Array(81).fill(0); sc = [0, 0, 0]; turn = 1; draw(); };
  const click = (i) => { if (turn !== 1 || g[i] || sc[1] + sc[2] >= 16) return; if (!claim(i, 1)) { turn = 2; cpu(); } draw(); };
  const draw = () => {
    const end = sc[1] + sc[2] >= 16;
    setStatus(end ? (sc[1] > sc[2] ? `You win ${sc[1]}-${sc[2]}! 🎉` : sc[1] < sc[2] ? `CPU wins ${sc[2]}-${sc[1]} 🤖` : "Draw 🤝") : `You ${sc[1]} · CPU ${sc[2]} - complete boxes for extra turns`);
    box.innerHTML = ""; const el = mk("div", "dots"); el.style.gridTemplateColumns = el.style.gridTemplateRows = "repeat(4,14px 1fr) 14px";
    for (let i = 0; i < 81; i++) { const d = mk(isLine(i) ? "button" : "div", isBox(i) ? "bx o" + g[i] : isLine(i) ? "ln o" + g[i] + (R(i) % 2 ? " v" : " h") : "dot", isBox(i) && g[i] ? (g[i] === 1 ? "🩷" : "🤖") : ""); if (isLine(i)) d.onclick = () => click(i); el.appendChild(d); }
    box.appendChild(el); resetBtn(box, start);
  };
  start();
};

IMPL.battleship = (box) => {
  const N = 8, SHIPS = [4, 3, 3, 2]; let pb, cb, ps, cs, queue, over;
  const place = () => { const b = Array(N * N).fill(0); SHIPS.forEach((L) => { for (;;) { const h = rnd(2), r = rnd(h ? N : N - L + 1), c = rnd(h ? N - L + 1 : N), cells = [...Array(L).keys()].map((k) => (h ? r * N + c + k : (r + k) * N + c)); if (cells.every((i) => !b[i])) { cells.forEach((i) => (b[i] = 1)); break; } } }); return b; };
  const lost = (b, s) => b.every((v, i) => !v || s[i] === 2);
  const start = () => { pb = place(); cb = place(); ps = Array(64).fill(0); cs = Array(64).fill(0); queue = []; over = false; draw("Fire at the enemy waters!"); };
  const fire = (i) => {
    if (over || ps[i]) return; ps[i] = cb[i] ? 2 : 1;
    if (lost(cb, ps)) { over = true; return draw("You sank the whole fleet! 🎉"); }
    let j; while (queue.length) { j = queue.pop(); if (!cs[j]) break; j = -1; }
    if (j == null || j < 0) { const f = cs.map((_, k) => k).filter((k) => !cs[k] && ((k >> 3) + (k & 7)) % 2 === 0); j = pick(f.length ? f : cs.map((_, k) => k).filter((k) => !cs[k])); }
    cs[j] = pb[j] ? 2 : 1;
    if (pb[j]) [j - 8, j + 8, (j & 7) > 0 ? j - 1 : -1, (j & 7) < 7 ? j + 1 : -1].filter((k) => k >= 0 && k < 64 && !cs[k]).forEach((k) => queue.push(k));
    if (lost(pb, cs)) { over = true; return draw("CPU sank your fleet 🤖"); }
    draw(pb[j] ? "CPU hit your ship! 💥" : "CPU missed 🌊");
  };
  const draw = (m) => {
    setStatus(m); box.innerHTML = "<b>Enemy waters</b>";
    box.appendChild(bd(N, (i) => ({ t: ["", "🌊", "💥"][ps[i]], c: "bt", f: () => fire(i) }), "sm"));
    box.appendChild(mk("b", "", "Your fleet"));
    box.appendChild(bd(N, (i) => ({ t: cs[i] === 2 ? "💥" : cs[i] === 1 ? "🌊" : pb[i] ? "🚢" : "", c: "bt mine" }), "sm"));
    resetBtn(box, start);
  };
  start();
};

IMPL.sudoku = (box) => {
  let g, fixed, sel;
  const ok = (a, i, v) => { const r = (i / 9) | 0, c = i % 9; for (let k = 0; k < 9; k++) { if (a[r * 9 + k] === v && r * 9 + k !== i) return false; if (a[k * 9 + c] === v && k * 9 + c !== i) return false; const rr = 3 * ((r / 3) | 0) + ((k / 3) | 0), cc = 3 * ((c / 3) | 0) + (k % 3); if (a[rr * 9 + cc] === v && rr * 9 + cc !== i) return false; } return true; };
  const solve = (a) => { const i = a.indexOf(0); if (i < 0) return true; for (const v of shuf([1,2,3,4,5,6,7,8,9])) if (ok(a, i, v)) { a[i] = v; if (solve(a)) return true; a[i] = 0; } return false; };
  const start = () => { g = Array(81).fill(0); solve(g); shuf([...Array(81).keys()]).slice(0, 42).forEach((i) => (g[i] = 0)); fixed = g.map((v) => !!v); sel = -1; draw(); };
  const set = (v) => { if (sel < 0 || fixed[sel]) return; g[sel] = v; draw(); };
  const draw = () => {
    const bad = g.map((v, i) => v && !ok(g, i, v)), won = g.every(Boolean) && !bad.some(Boolean);
    setStatus(won ? "Solved! 🎉" : "Pick a cell, then a number");
    box.innerHTML = ""; box.appendChild(bd(9, (i) => ({ t: g[i] || "", c: "sd" + (fixed[i] ? " fx" : "") + (bad[i] ? " bad" : "") + (sel === i ? " sel" : "") + (i % 9 === 2 || i % 9 === 5 ? " rb" : "") + ((i / 9 | 0) === 2 || (i / 9 | 0) === 5 ? " bb" : ""), f: () => { sel = i; draw(); } }), "sm"));
    const pad = mk("div", "row"); for (let v = 1; v <= 9; v++) { const b = mk("button", "big sm", v); b.onclick = () => set(v); pad.appendChild(b); }
    const e = mk("button", "big sm", "⌫"); e.onclick = () => set(0); pad.appendChild(e); box.appendChild(pad); resetBtn(box, start);
  };
  keyHandler((e) => { if (e.key >= "1" && e.key <= "9") set(+e.key); else if (e.key === "Backspace" || e.key === "Delete") set(0); });
  start();
};

const WORDS = "apple brave crane dream eagle flame grape house ivory jolly lemon magic night ocean piano queen river smile tiger uncle vivid water zebra bread candy dance earth fresh ghost heart juice knife light mouse noble olive pearl quiet robot sugar toast unity video wheel youth plant cloud beach chair flute giant happy".split(" ");
IMPL.wordle = (box) => {
  let ans, gs, cur, over, ks; const rk = { x: 0, y: 1, g: 2 };
  const score = (g) => { const r = Array(5).fill("x"), left = {}; [...ans].forEach((ch, i) => { if (g[i] === ch) r[i] = "g"; else left[ch] = (left[ch] || 0) + 1; }); [...g].forEach((ch, i) => { if (r[i] !== "g" && left[ch] > 0) { r[i] = "y"; left[ch]--; } }); return r; };
  const start = () => { ans = pick(WORDS); gs = []; cur = ""; over = false; ks = {}; draw("Guess the 5-letter word in 6 tries"); };
  const submit = () => {
    if (cur.length < 5 || over) return; const r = score(cur); gs.push({ w: cur, r });
    [...cur].forEach((ch, i) => { if (!(ch in ks) || rk[r[i]] > rk[ks[ch]]) ks[ch] = r[i]; });
    let m = "Keep going!"; if (cur === ans) { over = true; m = "🎉 You got it!"; } else if (gs.length === 6) { over = true; m = "The word was " + ans.toUpperCase(); }
    cur = ""; draw(m);
  };
  const type = (k) => { if (over) return; if (k === "Enter" || k === "⏎") return submit(); if (k === "Backspace" || k === "⌫") cur = cur.slice(0, -1); else if (/^[a-z]$/.test(k) && cur.length < 5) cur += k; draw("Guess the 5-letter word in 6 tries"); };
  const draw = (m) => {
    setStatus(m); let h = '<div class="wd">';
    for (let r = 0; r < 6; r++) for (let c = 0; c < 5; c++) { const q = gs[r]; h += `<i class="${q ? q.r[c] : ""}">${q ? q.w[c] : r === gs.length ? cur[c] || "" : ""}</i>`; }
    h += "</div>"; box.innerHTML = h;
    ["qwertyuiop", "asdfghjkl", "⏎zxcvbnm⌫"].forEach((row) => { const d = mk("div", "row"); [...row].forEach((ch) => { const b = mk("button", "key " + (ks[ch] || ""), ch.toUpperCase()); b.onclick = () => type(ch); d.appendChild(b); }); box.appendChild(d); });
    resetBtn(box, start);
  };
  keyHandler((e) => type(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  start();
};

const LEVELS = [["######", "#    #", "# $. #", "# @  #", "######"], ["#######", "#.  $ #", "#  #  #", "# $ . #", "#  @  #", "#######"], ["#######", "#  .  #", "# $@$ #", "#  .  #", "#######"]];
IMPL.sokoban = (box) => {
  let lv = 0, w, t, bx, pl, mv;
  const load = () => { const m = LEVELS[lv]; w = m.map((r) => [...r].map((c) => c === "#")); t = m.map((r) => [...r].map((c) => c === ".")); bx = new Set(); m.forEach((r, y) => [...r].forEach((c, x) => { if (c === "$") bx.add(y * 10 + x); if (c === "@") pl = [y, x]; })); mv = 0; draw(); };
  const won = () => [...bx].every((k) => t[(k / 10) | 0][k % 10]);
  const move = (dy, dx) => {
    if (won()) return; const ny = pl[0] + dy, nx = pl[1] + dx; if (w[ny][nx]) return; const k = ny * 10 + nx;
    if (bx.has(k)) { const by = ny + dy, bxx = nx + dx; if (w[by][bxx] || bx.has(by * 10 + bxx)) return; bx.delete(k); bx.add(by * 10 + bxx); }
    pl = [ny, nx]; mv++; draw();
  };
  const draw = () => {
    setStatus(won() ? `Level ${lv + 1} solved in ${mv} moves! 🎉` : `Level ${lv + 1}/${LEVELS.length} · Moves ${mv}`);
    const m = LEVELS[lv]; box.innerHTML = ""; const el = mk("div", "sk"); el.style.gridTemplateColumns = `repeat(${m[0].length},1fr)`; el.style.width = m[0].length * 46 + "px";
    m.forEach((r, y) => [...r].forEach((_, x) => { const k = y * 10 + x; el.appendChild(mk("div", "c" + (w[y][x] ? " wl" : t[y][x] ? " tg" : ""), pl[0] === y && pl[1] === x ? "🧍" : bx.has(k) ? (t[y][x] ? "✅" : "📦") : t[y][x] ? "🎯" : "")); }));
    box.appendChild(el);
    const pad = mk("div", "row"); [["◀", 0, -1], ["▲", -1, 0], ["▼", 1, 0], ["▶", 0, 1]].forEach(([s, dy, dx]) => { const b = mk("button", "big sm", s); b.onclick = () => move(dy, dx); pad.appendChild(b); }); box.appendChild(pad);
    if (won() && lv < LEVELS.length - 1) { const n = mk("button", "btn", "Next level ➡"); n.onclick = () => { lv++; load(); }; box.appendChild(n); }
    resetBtn(box, load);
  };
  keyHandler((e) => { const d = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key]; if (d) { e.preventDefault(); move(...d); } });
  load();
};

IMPL.poker = (box) => {
  let bank = 100, deck, hand = [], hold = [], stage = 0, res = "";
  const evalH = (h) => {
    const rs = h.map((c) => c.r).sort((a, b) => a - b), fl = h.every((c) => c.s === h[0].s), cnt = {}; rs.forEach((r) => (cnt[r] = (cnt[r] || 0) + 1));
    const cv = Object.values(cnt).sort((a, b) => b - a).join(""), royal = rs.join() === "0,9,10,11,12", st = (new Set(rs).size === 5 && rs[4] - rs[0] === 4) || royal;
    if (st && fl) return royal ? ["Royal Flush", 250] : ["Straight Flush", 50];
    if (cv === "41") return ["Four of a Kind", 25]; if (cv === "32") return ["Full House", 9]; if (fl) return ["Flush", 6]; if (st) return ["Straight", 4];
    if (cv === "311") return ["Three of a Kind", 3]; if (cv === "221") return ["Two Pair", 2];
    const pr = +Object.keys(cnt).find((k) => cnt[k] === 2); if (cv === "2111" && (pr === 0 || pr >= 10)) return ["Jacks or Better", 1];
    return ["No win", 0];
  };
  const deal = () => { if (bank < 10) bank = 100; bank -= 10; deck = newDeck(); hand = [0, 1, 2, 3, 4].map(() => deck.pop()); hold = [0, 0, 0, 0, 0]; stage = 1; res = ""; draw("Tap cards to HOLD, then press Draw"); };
  const drawCards = () => { hand = hand.map((c, i) => (hold[i] ? c : deck.pop())); const [n, m] = evalH(hand); bank += m * 10; stage = 2; draw(m ? `${n}! You win ${m * 10} chips 🎉` : "No win this time 😅"); };
  const draw = (msg) => {
    setStatus(msg || "Bet is 10 chips per hand. Press Deal!"); box.innerHTML = `<p>💰 Chips: <b>${bank}</b></p>`;
    const row = mk("div", "cardrow"); hand.forEach((c, i) => { const d = mk("div", "hc"); d.innerHTML = cardHTML(c) + `<small>${hold[i] ? "HOLD" : ""}</small>`; d.onclick = () => { if (stage === 1) { hold[i] ^= 1; draw(msg); } }; row.appendChild(d); }); box.appendChild(row);
    const b = mk("button", "btn", stage === 1 ? "Draw" : "Deal (10 chips)"); b.onclick = stage === 1 ? drawCards : deal; box.appendChild(b);
    box.appendChild(mk("p", "", "<small>Pays: Jacks+ 1x · 2 Pair 2x · Trips 3x · Straight 4x · Flush 6x · Full House 9x · Quads 25x · Str. Flush 50x · Royal 250x</small>"));
  };
  draw();
};

/* ---------- Batch 4: final 8 games ---------- */
IMPL.lights = (box) => {
  const N = 5; let g, moves;
  const tog = (i) => { const r = (i / N) | 0, c = i % N; [[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a, d]) => { const rr = r + a, cc = c + d; if (rr >= 0 && rr < N && cc >= 0 && cc < N) g[rr * N + cc] ^= 1; }); };
  const start = () => { g = Array(25).fill(0); for (let k = 0; k < 12; k++) tog(rnd(25)); if (!g.some(Boolean)) tog(12); moves = 0; draw(); };
  const draw = () => {
    const won = !g.some(Boolean); setStatus(won ? `All lights off in ${moves} moves! 🎉` : `Moves: ${moves} · Turn every light off`);
    box.innerHTML = ""; box.appendChild(bd(N, (i) => ({ t: g[i] ? "💡" : "", c: "lo" + (g[i] ? " on" : ""), f: () => { if (!won) { tog(i); moves++; draw(); } } }), "sm")); resetBtn(box, start);
  };
  start();
};

IMPL.hanoi = (box) => {
  let n = 4, pegs, sel, moves;
  const start = () => { pegs = [[...Array(n).keys()].map((k) => n - k), [], []]; sel = -1; moves = 0; draw(); };
  const click = (p) => {
    if (pegs[2].length === n) return;
    if (sel < 0) { if (pegs[p].length) sel = p; }
    else { const s = pegs[sel], d = pegs[p]; if (sel !== p && (!d.length || d[d.length - 1] > s[s.length - 1])) { d.push(s.pop()); moves++; } sel = -1; }
    draw();
  };
  const draw = () => {
    const won = pegs[2].length === n; setStatus(won ? `Solved in ${moves} moves (best ${2 ** n - 1})! 🎉` : `Moves: ${moves} · Best possible: ${2 ** n - 1} · Move the tower to the 3rd peg`);
    box.innerHTML = `<div class="row">${[3, 4, 5, 6].map((k) => `<button class="btn" data-n="${k}">${k} disks</button>`).join("")}</div>`;
    box.querySelectorAll("[data-n]").forEach((b) => (b.onclick = () => { n = +b.dataset.n; start(); }));
    const t = mk("div", "tower");
    pegs.forEach((p, i) => { const c = mk("div", "peg" + (sel === i ? " sel" : "")); [...p].reverse().forEach((d) => { const e = mk("i"); e.style.width = 24 + d * 12 + "%"; e.style.background = COLORS[d % 5]; c.appendChild(e); }); c.onclick = () => click(i); t.appendChild(c); });
    box.appendChild(t); resetBtn(box, start);
  };
  start();
};

IMPL.peg = (box) => {
  let p, sel;
  const valid = (r, c) => !((r < 2 || r > 4) && (c < 2 || c > 4));
  const start = () => { p = Array.from({ length: 49 }, (_, i) => (valid((i / 7) | 0, i % 7) ? 1 : -1)); p[24] = 0; sel = -1; draw(); };
  const mid = (a, b) => { const r1 = (a / 7) | 0, c1 = a % 7, r2 = (b / 7) | 0, c2 = b % 7; return (Math.abs(r1 - r2) === 2 && c1 === c2) || (Math.abs(c1 - c2) === 2 && r1 === r2) ? ((r1 + r2) / 2) * 7 + (c1 + c2) / 2 : -1; };
  const moves = () => { for (let a = 0; a < 49; a++) if (p[a] === 1) for (const d of [[0, 2], [0, -2], [2, 0], [-2, 0]]) { const r = ((a / 7) | 0) + d[0], c = (a % 7) + d[1]; if (r >= 0 && r < 7 && c >= 0 && c < 7 && p[r * 7 + c] === 0 && p[mid(a, r * 7 + c)] === 1) return true; } return false; };
  const click = (i) => {
    if (p[i] === 1) sel = i;
    else if (p[i] === 0 && sel >= 0) { const m = mid(sel, i); if (m >= 0 && p[m] === 1) { p[sel] = 0; p[m] = 0; p[i] = 1; sel = -1; } }
    draw();
  };
  const draw = () => {
    const left = p.filter((v) => v === 1).length, mv = moves();
    setStatus(left === 1 ? "Perfect - one peg left! 🏆" : !mv ? `No moves left - ${left} pegs remain 😅` : `Pegs left: ${left} · Jump a peg over another into a hole`);
    box.innerHTML = ""; box.appendChild(bd(7, (i) => ({ t: p[i] === 1 ? "🔵" : p[i] === 0 ? "◦" : "", c: p[i] < 0 ? "inv" : "pg" + (sel === i ? " sel" : ""), f: p[i] < 0 ? null : () => click(i) }), "sm")); resetBtn(box, start);
  };
  start();
};

IMPL.pong = (box) => {
  const W = 400, H = 260, PH = 56, cv = mk("canvas", "snake"); cv.width = W; cv.height = H; box.appendChild(cv);
  const ctx = cv.getContext("2d"); let py = H / 2 - PH / 2, cy = py, bx = W / 2, by = H / 2, vx = 0, vy = 0, ps = 0, cs = 0, run = false, raf;
  const serve = (d) => { bx = W / 2; by = H / 2; vx = 4.5 * d; vy = Math.random() * 4 - 2; };
  const move = (e) => { const r = cv.getBoundingClientRect(), t = e.touches ? e.touches[0] : e; py = Math.max(0, Math.min(H - PH, ((t.clientY - r.top) * H) / r.height - PH / 2)); };
  cv.addEventListener("pointermove", move); cv.addEventListener("touchmove", (e) => { e.preventDefault(); move(e); }, { passive: false });
  keyHandler((e) => { if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); py = Math.max(0, Math.min(H - PH, py + (e.key === "ArrowUp" ? -26 : 26))); } });
  const step = () => {
    if (run) {
      cy += Math.max(-3.4, Math.min(3.4, by - PH / 2 - cy)); cy = Math.max(0, Math.min(H - PH, cy)); bx += vx; by += vy;
      if (by < 6 || by > H - 6) vy *= -1;
      if (vx < 0 && bx < 24 && bx > 10 && by > py && by < py + PH) { vx = Math.min(9, Math.abs(vx) * 1.06); vy += (by - (py + PH / 2)) * 0.12; }
      if (vx > 0 && bx > W - 24 && bx < W - 10 && by > cy && by < cy + PH) { vx = -Math.min(9, Math.abs(vx) * 1.06); vy += (by - (cy + PH / 2)) * 0.12; }
      if (bx < 0) { cs++; serve(1); } if (bx > W) { ps++; serve(-1); }
      if (ps >= 5 || cs >= 5) { run = false; setStatus(ps >= 5 ? `You win ${ps}-${cs}! 🎉` : `CPU wins ${cs}-${ps} 🤖`); } else setStatus(`You ${ps} - ${cs} CPU · first to 5`);
    }
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#e8dcff"; for (let y = 0; y < H; y += 20) ctx.fillRect(W / 2 - 2, y, 4, 10);
    ctx.fillStyle = "#ff7eb6"; ctx.beginPath(); ctx.roundRect(8, py, 8, PH, 4); ctx.fill();
    ctx.fillStyle = "#6ec6ff"; ctx.beginPath(); ctx.roundRect(W - 16, cy, 8, PH, 4); ctx.fill();
    ctx.fillStyle = "#ffb703"; ctx.beginPath(); ctx.arc(bx, by, 7, 0, 7); ctx.fill();
    raf = requestAnimationFrame(step);
  };
  const start = () => { ps = cs = 0; serve(Math.random() < 0.5 ? 1 : -1); run = true; };
  onCleanup(() => cancelAnimationFrame(raf)); setStatus("Press Start · move mouse/finger or ↑ ↓ keys");
  const b = mk("button", "btn", "▶ Start / Restart"); b.onclick = start; box.appendChild(b); step();
};

IMPL.tron = (box) => {
  const N = 30, S = 11, cv = mk("canvas", "snake"); cv.width = cv.height = N * S; box.appendChild(cv);
  const ctx = cv.getContext("2d"); let occ, p, c, timer, nd;
  const free = (x, y) => x >= 0 && y >= 0 && x < N && y < N && !occ[y * N + x];
  const runLen = (x, y, dx, dy) => { let n = 0; while (n < 12 && free(x + dx * (n + 1), y + dy * (n + 1))) n++; return n; };
  const mark = (o, col) => { ctx.fillStyle = col; ctx.fillRect(o.x * S, o.y * S, S, S); };
  const start = () => {
    clearInterval(timer); occ = Array(N * N).fill(0); p = { x: 5, y: 15, dx: 1, dy: 0 }; c = { x: 24, y: 15, dx: -1, dy: 0 }; nd = null; occ[15 * N + 5] = occ[15 * N + 24] = 1;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); mark(p, "#6ec6ff"); mark(c, "#ff7eb6"); setStatus("Trap the pink bike! Arrow keys or swipe"); timer = setInterval(tick, 95);
  };
  const tick = () => {
    if (nd && (nd[0] !== -p.dx || nd[1] !== -p.dy)) { p.dx = nd[0]; p.dy = nd[1]; }
    let best = [c.dx, c.dy], bn = -1; [[c.dx, c.dy], [c.dy, -c.dx], [-c.dy, c.dx]].forEach(([dx, dy], k) => { const n = runLen(c.x, c.y, dx, dy) + (k === 0 ? 0.5 : Math.random() * 0.4); if (n > bn) { bn = n; best = [dx, dy]; } });
    c.dx = best[0]; c.dy = best[1]; p.x += p.dx; p.y += p.dy; c.x += c.dx; c.y += c.dy;
    const head = p.x === c.x && p.y === c.y, pd = !free(p.x, p.y) || head, cd = !free(c.x, c.y) || head;
    if (pd || cd) { clearInterval(timer); setStatus(pd && cd ? "Crash - draw 🤝" : pd ? "You crashed 😅 CPU wins" : "CPU crashed - you win! 🎉"); return; }
    occ[p.y * N + p.x] = occ[c.y * N + c.x] = 1; mark(p, "#6ec6ff"); mark(c, "#ff7eb6");
  };
  keyHandler((e) => { const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (d) { e.preventDefault(); nd = d; } });
  let sx, sy; cv.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  cv.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; nd = Math.abs(dx) > Math.abs(dy) ? [dx < 0 ? -1 : 1, 0] : [0, dy < 0 ? -1 : 1]; });
  onCleanup(() => clearInterval(timer)); resetBtn(box, start); start();
};

IMPL.aim = (box) => {
  let score = 0, miss = 0, left = 0, tm, lastT = 0, rts = [], run = false;
  const arena = mk("div", "arena"), tg = mk("button", "target", "🎯"); arena.appendChild(tg); box.appendChild(arena);
  const place = () => { tg.style.left = 8 + Math.random() * 84 + "%"; tg.style.top = 8 + Math.random() * 84 + "%"; lastT = performance.now(); };
  const info = () => setStatus(`⏱ ${left}s · Hits ${score} · Misses ${miss}`);
  const stop = () => { clearInterval(tm); run = false; tg.style.display = "none"; const avg = rts.length ? Math.round(rts.reduce((a, b) => a + b) / rts.length) : 0; setStatus(`Time! Hits ${score} · Accuracy ${score + miss ? Math.round((100 * score) / (score + miss)) : 0}% · Avg ${avg} ms`); };
  const start = () => { clearInterval(tm); score = miss = 0; rts = []; left = 30; run = true; tg.style.display = "block"; place(); info(); tm = setInterval(() => { left--; left <= 0 ? stop() : info(); }, 1000); };
  tg.onclick = (e) => { e.stopPropagation(); if (!run) return; score++; rts.push(performance.now() - lastT); place(); info(); };
  arena.onclick = () => { if (run) { miss++; info(); } };
  onCleanup(() => clearInterval(tm)); tg.style.display = "none"; setStatus("Press Start - hit every target for 30 seconds");
  const b = mk("button", "btn", "▶ Start"); b.onclick = start; box.appendChild(b);
};

IMPL.minichess = (box) => {
  const N = 5, V = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 1000 }, G = { P: "♙", N: "♘", B: "♗", R: "♖", Q: "♕", K: "♔", p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };
  let b, sel, over;
  const isW = (c) => c === c.toUpperCase();
  const gen = (bd0, w) => {
    const m = [];
    bd0.forEach((c, i) => {
      if (!c || isW(c) !== w) return; const r = (i / N) | 0, cc = i % N, t = c.toLowerCase();
      const add = (rr, c2, mode) => { if (rr < 0 || rr >= N || c2 < 0 || c2 >= N) return false; const j = rr * N + c2, o = bd0[j]; if (!o) { if (mode !== 2) m.push({ f: i, t: j }); return true; } if (mode !== 1 && isW(o) !== w) m.push({ f: i, t: j }); return false; };
      if (t === "p") { const d = w ? -1 : 1; add(r + d, cc, 1); add(r + d, cc - 1, 2); add(r + d, cc + 1, 2); }
      else if (t === "n") [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([a, d]) => add(r + a, cc + d, 0));
      else { const ds = []; if (t !== "b") ds.push([0,1],[0,-1],[1,0],[-1,0]); if (t !== "r") ds.push([1,1],[1,-1],[-1,1],[-1,-1]); ds.forEach(([a, d]) => { let y = r + a, x = cc + d; if (t === "k") { add(y, x, 0); return; } while (add(y, x, 0)) { y += a; x += d; } }); }
    });
    return m;
  };
  const apply = (bd0, m) => { const n = bd0.slice(); let pc = n[m.f]; n[m.f] = ""; if (pc === "P" && m.t < N) pc = "Q"; if (pc === "p" && m.t >= N * (N - 1)) pc = "q"; n[m.t] = pc; return n; };
  const ev = (bd0) => bd0.reduce((s, c) => s + (c ? (isW(c) ? 1 : -1) * V[c.toLowerCase()] : 0), 0);
  const cpu = () => {
    let best = Infinity, pool = [];
    gen(b, false).forEach((m) => { const nb = apply(b, m), rep = gen(nb, true); const v = (rep.length ? Math.max(...rep.map((r) => ev(apply(nb, r)))) : ev(nb)) + Math.random() * 0.3; if (v < best) { best = v; pool = [m]; } });
    if (pool.length) b = apply(b, pool[0]);
  };
  const start = () => { b = "rnbqkppppp     PPPPPRNBQK".split("").map((c) => (c === " " ? "" : c)); sel = -1; over = false; draw("You are ♙ white"); };
  const click = (i) => {
    if (over) return; const L = gen(b, true);
    if (b[i] && isW(b[i]) && L.some((m) => m.f === i)) { sel = i; return draw(); }
    const m = L.find((x) => x.f === sel && x.t === i); if (!m) return;
    b = apply(b, m); sel = -1;
    if (!b.includes("k")) { over = true; return draw("You captured the king - you win! 🎉"); }
    cpu(); if (!b.includes("K")) { over = true; return draw("CPU captured your king 🤖"); }
    draw("Your move");
  };
  const draw = (msg) => {
    setStatus(msg); const L = over ? [] : gen(b, true); box.innerHTML = "";
    box.appendChild(bd(N, (i) => ({ t: G[b[i]] || "", c: (((i / N | 0) + i % N) % 2 ? "dk" : "lt") + (sel === i ? " sel" : L.some((m) => m.f === sel && m.t === i) ? " hint" : ""), f: () => click(i) }), "sm mc"));
    box.appendChild(mk("p", "", "<small>5×5 chess · win by capturing the king (check rules are not enforced) · pawns promote to queens</small>")); resetBtn(box, start);
  };
  start();
};

const CHAIN = "apple ant arrow anchor banana bridge bread brown candle cat cloud castle dance dragon dream desert eagle earth engine elephant flower forest friend fire garden giant grape green house horse honey hammer island ice insect igloo jungle jacket jelly juice king kite kitchen knight lemon lion lamp ladder mountain moon music monkey night nest noodle needle ocean orange otter owl paper piano panda pencil queen quilt quiet river rabbit rocket road sun star snow snake table tiger tree turtle umbrella uncle unicorn violin village valley volcano water wolf window whale yellow yarn yogurt zebra zipper zoo box fox xylophone".split(" ");
IMPL.wordchain = (box) => {
  let used, need, hist, over;
  const start = () => { const w = pick(CHAIN); used = new Set([w]); hist = [w]; need = w.slice(-1); over = false; draw(`Type a word starting with "${need.toUpperCase()}"`); };
  const submit = () => {
    if (over) return; const inp = box.querySelector("input"), w = inp.value.trim().toLowerCase();
    if (!/^[a-z]{3,}$/.test(w)) return setStatus("Use letters only, at least 3 letters");
    if (w[0] !== need) return setStatus(`Your word must start with "${need.toUpperCase()}"`);
    if (used.has(w)) return setStatus("That word was already used!");
    used.add(w); hist.push(w); const o = CHAIN.filter((x) => x[0] === w.slice(-1) && !used.has(x));
    if (!o.length) { over = true; return draw(`CPU is stuck - you win! Chain length: ${hist.length} 🎉`); }
    const r = pick(o); used.add(r); hist.push(r); need = r.slice(-1); draw(`Now type a word starting with "${need.toUpperCase()}"`);
  };
  const draw = (m) => {
    setStatus(m); box.innerHTML = `<div class="mm">${hist.map((w, i) => `<div>${i % 2 ? "🧑" : "🤖"} ${w}</div>`).join("")}</div>`;
    if (!over) { const r = mk("div", "row", `<input class="wc" maxlength="20" placeholder="your word" autocomplete="off"><button class="btn">Send</button>`); box.appendChild(r); const inp = r.querySelector("input"); r.querySelector("button").onclick = submit; inp.onkeydown = (e) => e.key === "Enter" && submit(); inp.focus(); }
    resetBtn(box, start); const h = box.querySelector(".mm"); h.scrollTop = h.scrollHeight;
  };
  start();
};

/* ---------- Boot ---------- */
$("#back").onclick = () => closeGame(false);
addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#stage").hidden) closeGame(false); });
$("#search").addEventListener("input", (e) => renderGrid(e.target.value));
renderGrid(); initBubbles(); initCursor();