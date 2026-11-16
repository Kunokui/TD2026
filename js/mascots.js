// Cua và voi – hai bạn nhỏ cô thích, vẽ bằng SVG để luôn sắc nét.
// Mỗi phần tử có data-mascot="crab" | "elephant" sẽ được điền hình vào.
(() => {
  const CRAB = `
<svg viewBox="0 0 140 110" aria-hidden="true">
  <g class="m-legs" stroke="#e07f72" stroke-width="5" stroke-linecap="round" fill="none">
    <path d="M42 70 L24 76 L18 90"/><path d="M44 78 L30 88 L28 100"/><path d="M50 84 L42 96 L44 106"/>
    <path d="M98 70 L116 76 L122 90"/><path d="M96 78 L110 88 L112 100"/><path d="M90 84 L98 96 L96 106"/>
  </g>
  <g class="m-claw m-claw-l">
    <path d="M44 58 L28 30" stroke="#e07f72" stroke-width="6" stroke-linecap="round"/>
    <path d="M28 30 L25.6 16.2 A14 14 0 1 0 38.7 21 Z" fill="#f4a08f" stroke="#e07f72" stroke-width="3" stroke-linejoin="round"/>
  </g>
  <g class="m-claw m-claw-r">
    <path d="M96 58 L112 30" stroke="#e07f72" stroke-width="6" stroke-linecap="round"/>
    <path d="M112 30 L114.4 16.2 A14 14 0 1 1 101.3 21 Z" fill="#f4a08f" stroke="#e07f72" stroke-width="3" stroke-linejoin="round"/>
  </g>
  <path d="M60 50 L57 34 M80 50 L83 34" stroke="#e07f72" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="70" cy="68" rx="36" ry="25" fill="#f4a08f" stroke="#e07f72" stroke-width="3"/>
  <ellipse cx="58" cy="56" rx="10" ry="4" fill="#fbd3cb" transform="rotate(-18 58 56)"/>
  <g class="m-eyes">
    <circle cx="56" cy="30" r="8" fill="#fff" stroke="#e07f72" stroke-width="2.5"/>
    <circle cx="84" cy="30" r="8" fill="#fff" stroke="#e07f72" stroke-width="2.5"/>
    <circle cx="57" cy="31" r="4" fill="#4f3a2b"/><circle cx="85" cy="31" r="4" fill="#4f3a2b"/>
    <circle cx="58.5" cy="29.5" r="1.4" fill="#fff"/><circle cx="86.5" cy="29.5" r="1.4" fill="#fff"/>
  </g>
  <ellipse cx="52" cy="72" rx="6" ry="3.5" fill="#ec8a8a" opacity=".6"/>
  <ellipse cx="88" cy="72" rx="6" ry="3.5" fill="#ec8a8a" opacity=".6"/>
  <path d="M63 70 q7 7 14 0" stroke="#4f3a2b" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`;

  const ELEPHANT = `
<svg viewBox="0 0 160 150" aria-hidden="true">
  <g class="m-ear m-ear-l">
    <path d="M52 40 C26 22 0 38 4 66 C8 92 34 100 50 86 Z" fill="#c3cad9" stroke="#9fa9bd" stroke-width="3" stroke-linejoin="round"/>
    <path d="M48 48 C30 36 14 46 16 66 C18 82 34 88 46 80 Z" fill="#f6c9cf"/>
  </g>
  <g class="m-ear m-ear-r">
    <path d="M108 40 C134 22 160 38 156 66 C152 92 126 100 110 86 Z" fill="#c3cad9" stroke="#9fa9bd" stroke-width="3" stroke-linejoin="round"/>
    <path d="M112 48 C130 36 146 46 144 66 C142 82 126 88 114 80 Z" fill="#f6c9cf"/>
  </g>
  <ellipse cx="80" cy="118" rx="34" ry="24" fill="#c3cad9" stroke="#9fa9bd" stroke-width="3"/>
  <rect x="52" y="122" width="22" height="22" rx="10" fill="#c3cad9" stroke="#9fa9bd" stroke-width="3"/>
  <rect x="86" y="122" width="22" height="22" rx="10" fill="#c3cad9" stroke="#9fa9bd" stroke-width="3"/>
  <g fill="#eef0f5"><circle cx="58" cy="139" r="2.5"/><circle cx="63" cy="140" r="2.5"/><circle cx="68" cy="139" r="2.5"/>
    <circle cx="92" cy="139" r="2.5"/><circle cx="97" cy="140" r="2.5"/><circle cx="102" cy="139" r="2.5"/></g>
  <circle cx="80" cy="62" r="38" fill="#c3cad9" stroke="#9fa9bd" stroke-width="3"/>
  <path d="M74 25 q-2 -10 6 -10 q-2 6 4 9" stroke="#9fa9bd" stroke-width="3" fill="none" stroke-linecap="round"/>
  <g transform="translate(106 32) rotate(18)">
    <g fill="#fffdf7" stroke="#e79aa6" stroke-width="1.8">
      <circle cx="0" cy="-7" r="6"/><circle cx="7" cy="-2" r="6"/><circle cx="-7" cy="-2" r="6"/>
      <circle cx="4.5" cy="6" r="6"/><circle cx="-4.5" cy="6" r="6"/>
    </g>
    <circle r="4" fill="#f8e3a1" stroke="#e1c472" stroke-width="1.5"/>
  </g>
  <g class="m-eyes">
    <ellipse cx="64" cy="56" rx="5" ry="6.5" fill="#4f3a2b"/><ellipse cx="96" cy="56" rx="5" ry="6.5" fill="#4f3a2b"/>
    <circle cx="66" cy="53.5" r="1.8" fill="#fff"/><circle cx="98" cy="53.5" r="1.8" fill="#fff"/>
  </g>
  <ellipse cx="54" cy="72" rx="7" ry="4" fill="#ec8a8a" opacity=".55"/>
  <ellipse cx="106" cy="72" rx="7" ry="4" fill="#ec8a8a" opacity=".55"/>
  <path d="M64 80 q4 4 8 1 M88 81 q4 3 8 -1" stroke="#4f3a2b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <g class="m-trunk">
    <path d="M80 66 C80 84 78 98 88 104 C96 108 104 100 100 94" stroke="#9fa9bd" stroke-width="17" fill="none" stroke-linecap="round"/>
    <path d="M80 66 C80 84 78 98 88 104 C96 108 104 100 100 94" stroke="#c3cad9" stroke-width="11" fill="none" stroke-linecap="round"/>
    <path d="M75 82 h9 M75 89 h8" stroke="#9fa9bd" stroke-width="2" stroke-linecap="round"/>
  </g>
  <path d="M100 116 c-4 -6 -12 -1 0 8 c12 -9 4 -14 0 -8Z" fill="#e79aa6"/>
</svg>`;

  const art = { crab: CRAB, elephant: ELEPHANT };
  const hearts = ["💗", "🤍", "♡", "💕"];

  document.querySelectorAll("[data-mascot]").forEach((m) => {
    m.insertAdjacentHTML("beforeend", art[m.dataset.mascot] || "");
    m.setAttribute("role", "img");
    m.setAttribute("aria-label", m.dataset.mascot === "crab" ? "Bạn cua nhỏ" : "Bạn voi nhỏ");
    // Chạm vào thì nhảy lên và thả tim.
    m.addEventListener("click", () => {
      m.classList.remove("boop"); void m.offsetWidth; m.classList.add("boop");
      for (let i = 0; i < 3; i++) {
        const h = document.createElement("span");
        h.className = "m-heart";
        h.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        h.style.setProperty("--dx", `${(i - 1) * 22 + (Math.random() * 10 - 5)}px`);
        h.style.animationDelay = `${i * 90}ms`;
        m.append(h);
        h.addEventListener("animationend", () => h.remove());
      }
    });
  });
})();
