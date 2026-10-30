(() => {
  const $ = (id) => document.getElementById(id);
  const photos = window.PHOTOS, songs = window.SONGS, quotes = window.QUOTES;

  // Ngẫu nhiên có hạt giống để bố cục album luôn giống nhau mỗi lần mở
  let seed = 2011;
  const rand = () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const tilt = (max) => ((rand() * 2 - 1) * max).toFixed(1) + "deg";

  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  /* ---------------- Album ---------------- */
  const grid = $("albumGrid");
  const tapeColors = ["rgba(246,201,207,.9)", "rgba(201,220,188,.9)", "rgba(248,227,161,.9)", "rgba(214,196,230,.85)"];
  const noteColors = ["var(--butter)", "var(--pink)", "var(--sage)", "#f3e1cf"];

  // Câu nói hiện trên giấy note, và câu nói giấu trong phong bì mini
  const visibleQuotes = [2, 7, 1, 11, 3, 8, 6, 10];
  const hiddenQuotes = [0, 4, 5, 9];
  const extras = [];
  {
    let v = 0, h = 0, w = 0;
    const order = ["note", "flower", "note", "env", "note", "camera", "note", "env", "flower",
                   "note", "env", "note", "flower", "note", "camera", "env", "note", "flower"];
    for (const type of order) {
      if (type === "note") extras.push({ type, q: visibleQuotes[v++] });
      else if (type === "env") extras.push({ type, q: hiddenQuotes[h++] });
      else if (type === "flower") extras.push({ type, w: w++ });
      else extras.push({ type });
    }
  }
  const insertAfter = new Map();
  extras.forEach((x, k) => insertAfter.set(Math.floor(((k + 1) * photos.length) / (extras.length + 1)), x));

  // Ảnh có gắn nốt nhạc -> bài hát tương ứng
  const songOfPhoto = new Map();
  songs.forEach((_, s) => songOfPhoto.set(2 + s * 6, s));

  photos.forEach((src, i) => {
    const r = rand();
    const size = r < 0.08 ? "xl" : r < 0.2 ? "lg" : r < 0.5 ? "md" : "sm";
    const ar = size === "xl" || size === "lg" ? pick(["4 / 3", "1 / 1", "5 / 4"]) : pick(["4 / 5", "3 / 4", "1 / 1", "4 / 5"]);

    const item = el("div", "item " + size);
    item.style.setProperty("--r", tilt(4));
    if (rand() < 0.75) {
      const tape = el("span", "washi");
      tape.style.setProperty("--tc", pick(tapeColors));
      tape.style.setProperty("--tr", tilt(8));
      item.append(tape);
    }
    const btn = el("button", "polaroid");
    btn.setAttribute("aria-label", "Xem ảnh " + (i + 1));
    btn.style.setProperty("--ar", ar);
    const img = el("img");
    img.src = src; img.alt = "Ảnh kỷ niệm " + (i + 1);
    img.loading = "lazy"; img.decoding = "async";
    btn.append(img);
    btn.addEventListener("click", () => openLightbox(i));
    item.append(btn);

    if (songOfPhoto.has(i)) {
      const s = songOfPhoto.get(i);
      const nb = el("button", "note-btn", "🎵");
      nb.dataset.song = s;
      nb.title = "Phát: " + songs[s].title;
      nb.setAttribute("aria-label", nb.title);
      nb.addEventListener("click", (e) => { e.stopPropagation(); playSong(s); });
      item.append(nb);
    }
    grid.append(item);

    const x = insertAfter.get(i + 1);
    if (x) grid.append(buildExtra(x));
  });

  function buildExtra(x) {
    if (x.type === "note") {
      const text = quotes[x.q];
      const item = el("div", "item " + (text.length > 180 ? "md" : "sm"));
      item.style.setProperty("--r", tilt(5));
      const btn = el("button", "quote-note" + (rand() < 0.35 ? " lined" : ""));
      btn.style.setProperty("--nc", pick(noteColors));
      btn.append(el("span", "pin", "📌"));
      const t = el("span", "q-text"); t.textContent = text;
      btn.append(t, el("span", "q-more", text.length > 160 ? "nhấn để đọc tiếp →" : "nhấn để mở ✿"));
      btn.addEventListener("click", () => openQuote(x.q));
      item.append(btn);
      return item;
    }
    const item = el("div", "item deco");
    item.style.setProperty("--r", tilt(8));
    const conf = {
      flower: ["🌷", "một lời chúc", () => openWish(x.w)],
      env: ["💌", "mở thư", () => openQuote(x.q)],
      camera: ["📷", "ảnh bất ngờ", () => openLightbox(Math.floor(Math.random() * photos.length))],
    }[x.type];
    const btn = el("button", "deco-btn", `${conf[0]}<small>${conf[1]}</small>`);
    btn.style.animationDelay = (-rand() * 3).toFixed(2) + "s";
    btn.addEventListener("click", conf[2]);
    item.append(btn);
    return item;
  }

  // Hiện dần khi cuộn tới
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  grid.querySelectorAll(".item").forEach((n) => io.observe(n));

  /* ---------------- Con đường & xe máy ---------------- */
  // Đường uốn lượn qua các khe giữa những hàng ảnh, xe máy chạy theo khi cuộn trang
  const SVGNS = "http://www.w3.org/2000/svg";
  const road = document.createElementNS(SVGNS, "svg");
  road.classList.add("road");
  road.setAttribute("aria-hidden", "true");
  road.innerHTML = '<path class="road-edge"/><path class="road-base"/><path class="road-line"/>';
  const roadPaths = [...road.children];
  const bike = el("div", "bike", `
    <svg viewBox="0 0 64 50" width="80" height="62.5">
      <circle class="puff" cx="7" cy="37" r="3" fill="#e6dccf"/>
      <g class="ride">
        <path d="M22 22 L25 13 L33 13 L36 22 Z" fill="#f8e3a1"/>
        <path d="M32 15 L44 12" stroke="#f3d1bb" stroke-width="3" stroke-linecap="round"/>
        <circle cx="29" cy="8" r="5.5" fill="#fbe1cf"/>
        <path d="M23 8 a6 6 0 0 1 12 0 Z" fill="#8fae84"/>
        <circle cx="31.6" cy="8.8" r=".9" fill="#4f3a2b"/>
        <circle cx="33" cy="10.8" r="1.1" fill="#f6c9cf"/>
        <rect x="16" y="20" width="19" height="4.5" rx="2.2" fill="#7a5a43"/>
        <path d="M10 36 C8 28 12 24 20 24 L34 24 C37 24 38 28 38 32 L42 32 L46 14 L49 14 L47 34 C46 37 43 38 40 38 L14 38 C12 38 10 37 10 36 Z" fill="#f6c9cf" stroke="#e79aa6" stroke-width="1.5"/>
        <path d="M42 12 L51 11" stroke="#7a5a43" stroke-width="3" stroke-linecap="round"/>
        <rect x="48" y="15" width="9" height="7" rx="1.5" fill="#f8e3a1" stroke="#d9b76a"/>
        <circle cx="50.5" cy="14" r="2.2" fill="#e79aa6"/><circle cx="54.5" cy="13.2" r="2.2" fill="#f6c9cf"/>
        <path d="M43 38 A8 8 0 0 1 57 36" fill="none" stroke="#e79aa6" stroke-width="3" stroke-linecap="round"/>
      </g>
      <g class="wheel"><circle cx="16" cy="41" r="7" fill="#4f3a2b"/><circle cx="16" cy="41" r="3" fill="#fbf5ea"/><rect x="15.2" y="35" width="1.6" height="4" fill="#fbf5ea"/></g>
      <g class="wheel"><circle cx="50" cy="41" r="7" fill="#4f3a2b"/><circle cx="50" cy="41" r="3" fill="#fbf5ea"/><rect x="49.2" y="35" width="1.6" height="4" fill="#fbf5ea"/></g>
    </svg>`);
  bike.setAttribute("aria-hidden", "true");
  const home = el("span", "road-sign", "🏠"), school = el("span", "road-sign", "🏫");
  grid.prepend(road);
  grid.append(home, school, bike);

  let roadLen = 0, stopY = [], stopLen = [], bikePos = 0, bikeTarget = 0, bikeRaf = 0;
  function buildRoad() {
    const W = grid.clientWidth;
    // Gom các ảnh thành từng hàng theo chiều dọc
    const bands = [];
    [...grid.querySelectorAll(".item")]
      .map((n) => [n.offsetTop, n.offsetTop + n.offsetHeight])
      .sort((a, b) => a[0] - b[0])
      .forEach(([t, b]) => {
        const last = bands[bands.length - 1];
        if (last && t < last[1]) last[1] = Math.max(last[1], b); else bands.push([t, b]);
      });
    if (!bands.length) return;
    const ys = [bands[0][0] - 26];
    for (let k = 1; k < bands.length; k++) ys.push((bands[k - 1][1] + bands[k][0]) / 2);
    ys.push(bands[bands.length - 1][1] + 34);

    // Đường rắn lượn: trái → phải, quay đầu, phải → trái…
    // Khúc cua nằm gọn trong khung để xe không bị cắt ở mép màn hình
    const inset = 40, bend = 32;
    let d = `M ${inset} ${ys[0]}`, xEnd = inset;
    const prefixes = [d];
    ys.forEach((y, k) => {
      xEnd = k % 2 === 0 ? W - inset : inset;
      d += ` L ${xEnd} ${y}`;
      if (k < ys.length - 1) {
        const cx = k % 2 === 0 ? xEnd + bend : xEnd - bend;
        d += ` C ${cx} ${y}, ${cx} ${ys[k + 1]}, ${xEnd} ${ys[k + 1]}`;
        prefixes.push(d);
      }
    });
    road.setAttribute("width", W);
    road.setAttribute("height", grid.clientHeight);
    roadPaths.forEach((p) => p.setAttribute("d", d));
    roadLen = roadPaths[0].getTotalLength();

    const tmp = document.createElementNS(SVGNS, "path");
    road.append(tmp);
    stopLen = prefixes.map((p) => { tmp.setAttribute("d", p); return tmp.getTotalLength(); });
    tmp.remove();
    stopY = ys.slice();
    stopLen.push(roadLen);
    stopY.push(ys[ys.length - 1] + 260);

    Object.assign(home.style, { left: inset - 20 + "px", top: ys[0] + "px" });
    Object.assign(school.style, { left: xEnd + "px", top: ys[ys.length - 1] + "px" });
  }

  function placeBike(len) {
    const path = roadPaths[0];
    const p = path.getPointAtLength(len);
    const a = path.getPointAtLength(Math.max(len - 3, 0)), b = path.getPointAtLength(Math.min(len + 3, roadLen));
    let ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI, flip = 1;
    if (b.x - a.x < 0) { ang -= 180; flip = -1; }
    if (ang > 180) ang -= 360; else if (ang < -180) ang += 360;
    ang = Math.max(-30, Math.min(30, ang)); // ở khúc cua xe vẫn đứng gần thẳng cho xinh
    bike.style.transform = `translate(${p.x - 41}px, ${p.y - 50}px) rotate(${ang}deg) scaleX(${flip})`;
  }
  function bikeTick() {
    const diff = bikeTarget - bikePos;
    bikePos += Math.abs(diff) < 0.5 || reduceMotion ? diff : diff * 0.12;
    placeBike(bikePos);
    const moving = Math.abs(diff) > 1;
    bike.classList.toggle("moving", moving);
    bikeRaf = moving ? requestAnimationFrame(bikeTick) : 0;
  }
  function updateBike() {
    if (!roadLen) return;
    const y = window.innerHeight * 0.55 - grid.getBoundingClientRect().top;
    let k = 0;
    while (k < stopY.length - 1 && y >= stopY[k + 1]) k++;
    const f = Math.min(Math.max((y - stopY[k]) / (stopY[k + 1] - stopY[k]), 0), 1);
    bikeTarget = y <= stopY[0] ? 0 : k >= stopY.length - 1 ? roadLen : stopLen[k] + f * (stopLen[k + 1] - stopLen[k]);
    if (!bikeRaf) bikeRaf = requestAnimationFrame(bikeTick);
  }
  buildRoad();
  updateBike();
  new ResizeObserver(() => { buildRoad(); updateBike(); }).observe(grid);
  window.addEventListener("scroll", updateBike, { passive: true });
  window.addEventListener("resize", updateBike);

  /* ---------------- Lá thư ---------------- */
  $("letterGreeting").textContent = window.LETTER.greeting;
  window.LETTER.paragraphs.forEach((p) => { const n = el("p"); n.textContent = p; $("letterBody").append(n); });
  $("letterSign").textContent = window.LETTER.signature;

  /* ---------------- Modal ---------------- */
  const modal = $("modal"), modalCard = $("modalCard"), modalContent = $("modalContent");
  function openModal(nodes, cls) {
    modalCard.className = "modal-card " + (cls || "");
    modalContent.replaceChildren(...nodes);
    modal.hidden = false;
    modalCard.scrollTop = 0;
    $("modalClose").focus();
  }
  const closeModal = () => { modal.hidden = true; };
  $("modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  function openQuote(q) {
    const label = el("p", "m-label", "Cô từng viết…");
    const text = el("p", "m-quote"); text.textContent = quotes[q];
    const ref = el("p", "m-reflect"); ref.textContent = window.REFLECTIONS[q % window.REFLECTIONS.length];
    openModal([label, text, ref], "note");
  }
  function openWish(w) {
    const t = el("p", "m-wish"); t.textContent = window.WISHES[w % window.WISHES.length];
    openModal([el("p", "m-big", "🌷"), t]);
  }

  /* ---------------- Lightbox ---------------- */
  const lb = $("lightbox"), lbImg = $("lbImg"), lbCap = $("lbCap");
  let lbIndex = 0;
  function showPhoto(i) {
    lbIndex = (i + photos.length) % photos.length;
    lbImg.src = photos[lbIndex];
    lbImg.alt = "Ảnh kỷ niệm " + (lbIndex + 1);
    lbCap.textContent = (lbIndex + 1) + " / " + photos.length;
  }
  function openLightbox(i) { showPhoto(i); lb.hidden = false; $("lbClose").focus(); }
  const closeLightbox = () => { lb.hidden = true; };
  $("lbClose").addEventListener("click", closeLightbox);
  $("lbPrev").addEventListener("click", () => showPhoto(lbIndex - 1));
  $("lbNext").addEventListener("click", () => showPhoto(lbIndex + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  document.addEventListener("keydown", (e) => {
    if (!lb.hidden) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
      if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
    } else if (!modal.hidden && e.key === "Escape") closeModal();
  });

  /* ---------------- Máy nghe nhạc ---------------- */
  const audio = $("audio"), player = $("player");
  let current = -1, shuffle = false, repeat = "all"; // all | one | off
  audio.volume = +$("plVol").value;

  const items = $("plItems");
  songs.forEach((s, i) => {
    const li = el("li");
    const b = el("button");
    b.append(document.createTextNode(s.title), el("small", null, ""));
    b.lastChild.textContent = s.artist || "♪";
    b.dataset.song = i;
    b.addEventListener("click", () => playSong(i));
    li.append(b);
    items.append(li);
  });

  // Tải sẵn bài hát vào bộ nhớ để lúc đổi bài là phát ngay, không phải chờ tải
  const songUrl = (i) => "audio/" + encodeURIComponent(songs[i].file);
  const pending = new Map(), ready = new Map(); // chỉ số bài -> đang tải / blob URL
  const MAX_READY = 4;
  function prefetch(i) {
    i = (i + songs.length) % songs.length;
    if (pending.has(i) || ready.has(i)) return;
    pending.set(i, fetch(songUrl(i))
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((b) => {
        ready.set(i, URL.createObjectURL(b));
        // Giữ tối đa vài bài trong bộ nhớ, bỏ bài cũ nhất (trừ bài đang phát)
        for (const [k, u] of ready) {
          if (ready.size <= MAX_READY) break;
          if (k !== current) { URL.revokeObjectURL(u); ready.delete(k); }
        }
      })
      .catch(() => {})
      .finally(() => pending.delete(i)));
  }
  let upNext = 0;
  function pickUpNext() {
    if (shuffle && songs.length > 1) {
      do { upNext = Math.floor(Math.random() * songs.length); } while (upNext === current);
    } else upNext = (current + 1) % songs.length;
  }

  function loadSong(i) {
    current = (i + songs.length) % songs.length;
    const s = songs[current];
    const cached = ready.get(current);
    if (cached) { ready.delete(current); ready.set(current, cached); } // đánh dấu vừa dùng
    audio.src = cached || songUrl(current);
    pickUpNext();
    $("plTitle").textContent = s.title;
    $("plArtist").textContent = s.artist || "♪";
    const titleBox = $("plTitle").parentElement;
    titleBox.classList.remove("scroll");
    requestAnimationFrame(() => titleBox.classList.toggle("scroll", $("plTitle").scrollWidth > titleBox.clientWidth));
    [...items.children].forEach((li, k) => li.classList.toggle("current", k === current));
    document.querySelectorAll(".note-btn").forEach((n) => n.classList.toggle("playing", +n.dataset.song === current));
  }
  function playSong(i) {
    loadSong(i);
    audio.play().catch(() => {});
  }
  function nextIndex(step) {
    if (step > 0) return upNext;
    if (shuffle && songs.length > 1) {
      let n; do { n = Math.floor(Math.random() * songs.length); } while (n === current);
      return n;
    }
    return current + step;
  }
  $("plPlay").addEventListener("click", () => {
    if (current < 0) return playSong(0);
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  });
  $("plNext").addEventListener("click", () => playSong(nextIndex(1)));
  $("plPrev").addEventListener("click", () => {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    playSong(nextIndex(-1));
  });
  $("plShuffle").addEventListener("click", (e) => {
    shuffle = !shuffle;
    e.currentTarget.classList.toggle("on", shuffle);
    pickUpNext();
    if (current >= 0 && audio.readyState >= 4) prefetch(upNext);
  });

  // Bài đang phát đã tải đủ thì tải sẵn bài kế tiếp; rê chuột vào bài nào thì tải sẵn bài đó
  audio.addEventListener("canplaythrough", () => prefetch(upNext));
  let hoverTimer = 0;
  document.addEventListener("pointerover", (e) => {
    const b = e.target.closest("[data-song]");
    clearTimeout(hoverTimer);
    if (b) hoverTimer = setTimeout(() => prefetch(+b.dataset.song), 200);
  });
  prefetch(0); // bài đầu tiên phát ngay khi mở phong bì
  const repeatBtn = $("plRepeat");
  const paintRepeat = () => {
    repeatBtn.classList.toggle("on", repeat !== "off");
    if (repeat === "one") repeatBtn.dataset.one = ""; else delete repeatBtn.dataset.one;
    repeatBtn.title = { all: "Lặp lại cả playlist", one: "Lặp lại 1 bài", off: "Không lặp lại" }[repeat];
  };
  repeatBtn.addEventListener("click", () => {
    repeat = { all: "one", one: "off", off: "all" }[repeat];
    paintRepeat();
  });
  paintRepeat();
  $("plVol").addEventListener("input", (e) => { audio.volume = +e.target.value; });
  $("plListBtn").addEventListener("click", (e) => {
    const list = $("plList");
    list.hidden = !list.hidden;
    e.currentTarget.classList.toggle("on", !list.hidden);
  });
  $("plToggle").addEventListener("click", (e) => {
    const mini = player.classList.toggle("mini");
    e.currentTarget.textContent = mini ? "+" : "–";
  });
  player.querySelector(".pl-body").addEventListener("click", () => {
    if (player.classList.contains("mini")) { player.classList.remove("mini"); $("plToggle").textContent = "–"; }
  });

  audio.addEventListener("play", () => { player.classList.add("playing"); $("plPlay").textContent = "❚❚"; });
  audio.addEventListener("pause", () => { player.classList.remove("playing"); $("plPlay").textContent = "▶"; });
  audio.addEventListener("timeupdate", () => {
    $("plBar").style.width = audio.duration ? (audio.currentTime / audio.duration) * 100 + "%" : "0";
  });
  audio.addEventListener("ended", () => {
    if (repeat === "one") { audio.currentTime = 0; audio.play(); return; }
    if (!shuffle && repeat === "off" && current === songs.length - 1) return;
    playSong(nextIndex(1));
  });
  document.querySelector(".pl-progress").addEventListener("click", (e) => {
    if (!audio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  /* ---------------- Mở món quà ---------------- */
  const envelope = $("envelope");
  envelope.addEventListener("click", () => {
    if (envelope.classList.contains("open")) return;
    envelope.classList.add("open");
    playSong(0);
    setTimeout(() => {
      $("intro").classList.add("gone");
      document.body.classList.remove("locked");
      window.scrollTo(0, 0);
    }, 3000);
  });

  /* ---------------- Hoa bay ở lời kết ---------------- */
  const petals = $("petals");
  const petalChars = ["🌸", "🌷", "💗", "✿", "🤍"];
  let petalTimer = null;
  function spawnPetal() {
    const p = el("span", "petal", petalChars[Math.floor(Math.random() * petalChars.length)]);
    p.style.left = Math.random() * 100 + "%";
    p.style.fontSize = 14 + Math.random() * 16 + "px";
    p.style.setProperty("--dx", (Math.random() * 160 - 80).toFixed(0) + "px");
    p.style.setProperty("--rot", (Math.random() * 720 - 360).toFixed(0) + "deg");
    p.style.animationDuration = 6 + Math.random() * 5 + "s";
    p.addEventListener("animationend", () => p.remove());
    petals.append(p);
  }
  if (!reduceMotion) {
    new IntersectionObserver(([e]) => {
      clearInterval(petalTimer);
      if (e.isIntersecting) petalTimer = setInterval(spawnPetal, 450);
    }).observe($("ending"));
  }
})();
