const sceneIds = ["cover", "menu", "story", "story-ch02", "story-ch03", "story-ch04", "map"];
const dots = Array.from(document.querySelectorAll("[data-dot]"));
const jumpButtons = Array.from(document.querySelectorAll("[data-jump]"));
const loading = document.querySelector("[data-loading]");
const soundButton = document.querySelector("[data-sound]");

const jumpToScene = (sceneId) => {
  const scene = document.getElementById(sceneId);
  if (!scene) return;
  scene.scrollIntoView({ behavior: "smooth", block: "start" });
};

const setActiveScene = (sceneId) => {
  dots.forEach((dot) => {
    dot.classList.toggle("is-active", dot.dataset.dot === sceneId);
  });
  const scene = document.getElementById(sceneId);
  if (scene && !scene.classList.contains("is-entered")) {
    scene.classList.add("is-entered");
    if (sceneId !== "cover") {
      const panel = scene.querySelector(".story-panel");
      if (panel) {
        window.setTimeout(() => panel.classList.add("is-visible"), 200);
      }
    }
  }
};

jumpButtons.forEach((button) => {
  button.addEventListener("click", () => jumpToScene(button.dataset.jump));
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.dataset.scene) {
      setActiveScene(visible.target.dataset.scene);
    }
  },
  {
    root: null,
    threshold: [0.35, 0.55, 0.75],
  },
);

sceneIds.forEach((sceneId) => {
  const scene = document.getElementById(sceneId);
  if (scene) observer.observe(scene);
});

const pressStart = document.querySelector("[data-press-start]");
const coverPanel = document.querySelector(".cover-panel");
let started = false;

const startExperience = () => {
  if (started) return;
  started = true;
  pressStart?.remove();
  coverPanel?.classList.add("is-visible");
  bgm.play().then(() => {
    soundButton?.setAttribute("aria-pressed", "true");
  }).catch(() => {});
};

window.addEventListener("load", () => {
  window.setTimeout(() => loading?.classList.add("is-hidden"), 420);
});

document.addEventListener("click", startExperience, { once: true });
document.addEventListener("keydown", startExperience, { once: true });

document.querySelectorAll("[data-panel-close]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const panel = btn.closest(".cover-panel, .story-panel");
    panel?.classList.remove("is-visible");
    const reopen = panel?.previousElementSibling;
    if (reopen?.classList.contains("panel-reopen")) {
      reopen.classList.add("is-visible");
    }
  });
});

document.querySelectorAll("[data-panel-reopen]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    btn.classList.remove("is-visible");
    const panel = btn.nextElementSibling;
    panel?.classList.add("is-visible");
  });
});

const bgm = new Audio("Assets/last dance.m4a");
bgm.loop = true;

const stopSound = () => {
  bgm.pause();
  soundButton?.setAttribute("aria-pressed", "false");
};

soundButton?.addEventListener("click", () => {
  if (!bgm.paused) {
    stopSound();
    return;
  }
  bgm.play();
  soundButton.setAttribute("aria-pressed", "true");
});

document.querySelectorAll("[data-story-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const extra = btn.closest(".story-panel").querySelector("[data-story-extra]");
    const isOpen = extra.classList.toggle("is-open");
    btn.textContent = isOpen ? "▲ 收起" : "▼ 查看真实影像";
  });
});

const lightboxModal = document.querySelector("[data-lightbox-modal]");
const lightboxImg = lightboxModal?.querySelector("img");

document.querySelectorAll("[data-lightbox-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!lightboxModal || !lightboxImg) return;
    lightboxImg.src = btn.dataset.lightboxOpen;
    lightboxImg.alt = btn.querySelector("img")?.alt || "";
    lightboxModal.classList.add("is-open");
  });
});

lightboxModal?.addEventListener("click", () => {
  lightboxModal.classList.remove("is-open");
});

document.querySelector("[data-save-date]")?.addEventListener("click", () => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Quest//CN",
    "BEGIN:VEVENT",
    "DTSTART:20260524T040000Z",
    "DTEND:20260524T100000Z",
    "SUMMARY:婚礼大冒险 💒",
    "DESCRIPTION:我们的冒险在这里继续，期待与你一起庆祝！",
    "LOCATION:禧满鸿福酒店，四川省广安市邻水县",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:明天就是婚礼啦！",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wedding-quest.ics";
  a.click();
  URL.revokeObjectURL(url);
});

window.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "PageDown", "Enter", " "].includes(event.key)) return;

  const current = dots.findIndex((dot) => dot.classList.contains("is-active"));
  const next = Math.min(current + 1, sceneIds.length - 1);
  if (next !== current) {
    event.preventDefault();
    jumpToScene(sceneIds[next]);
  }
});
