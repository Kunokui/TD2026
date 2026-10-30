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

  const photoCaption = [];

  photos.forEach((src, i) => {
    const r = rand();
    const size = r < 0.08 ? "xl" : r < 0.2 ? "lg" : r < 0.5 ? "md" : "sm";
    const ar = size === "xl" || size === "lg" ? pick(["4 / 3", "1 / 1", "5 / 4"]) : pick(["4 / 5", "3 / 4", "1 / 1", "4 / 5"]);
    const caption = rand() < 0.42 ? pick(window.CAPTIONS) : "";
    photoCaption[i] = caption;

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
    img.src = src; img.alt = caption || "Ảnh kỷ niệm " + (i + 1);
    img.loading = "lazy"; img.decoding = "async";
    btn.append(img, el("span", "cap", caption));
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
    lbImg.alt = photoCaption[lbIndex] || "Ảnh kỷ niệm " + (lbIndex + 1);
    lbCap.textContent = (photoCaption[lbIndex] ? photoCaption[lbIndex] + " · " : "") + (lbIndex + 1) + " / " + photos.length;
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
    b.addEventListener("click", () => playSong(i));
    li.append(b);
    items.append(li);
  });

  function loadSong(i) {
    current = (i + songs.length) % songs.length;
    const s = songs[current];
    audio.src = "audio/" + encodeURIComponent(s.file);
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
  $("plShuffle").addEventListener("click", (e) => { shuffle = !shuffle; e.currentTarget.classList.toggle("on", shuffle); });
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
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
