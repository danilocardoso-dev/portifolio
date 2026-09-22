const langToggle = document.getElementById("langToggle");
const yearEl = document.getElementById("year");

yearEl.textContent = new Date().getFullYear();

let currentLang = localStorage.getItem("portfolio-lang") || "pt";

function applyLanguage(lang) {
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

  document.querySelectorAll("[data-pt][data-en]").forEach((el) => {
    el.textContent = el.dataset[lang];
  });

  langToggle.textContent = lang === "pt" ? "EN" : "PT";
  currentLang = lang;
  localStorage.setItem("portfolio-lang", lang);
}

langToggle.addEventListener("click", () => {
  applyLanguage(currentLang === "pt" ? "en" : "pt");
});

applyLanguage(currentLang);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
