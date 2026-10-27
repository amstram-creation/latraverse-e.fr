/* La Traverse — Version B : interactions immersives (vanilla JS) */
(() => {
  "use strict";
  const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const souris = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Délai d'apparition des liens du menu
  $$(".nav li").forEach((li, i) => li.style.setProperty("--i", i));

  /* ---------- Chargeur (accueil) : compteur 0 → 100 et arche tracée ---------- */
  const chargeur = $(".chargeur");
  if (chargeur) {
    const nb = $(".chargeur__nb", chargeur);
    const deja = (() => { try { return sessionStorage.getItem("lt-vu"); } catch { return null; } })();
    if (calme || deja) { chargeur.remove(); }
    else {
      try { sessionStorage.setItem("lt-vu", "1"); } catch {}
      const t0 = performance.now(), d = 1800;
      const pas = t => {
        const p = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - p, 3);
        nb.textContent = Math.round(e * 100);
        chargeur.style.setProperty("--p", e.toFixed(3));
        if (p < 1) requestAnimationFrame(pas);
        else { setTimeout(() => chargeur.classList.add("fini"), 200); setTimeout(() => chargeur.remove(), 1400); }
      };
      requestAnimationFrame(pas);
    }
  }

  /* ---------- Le passage : l'arche s'ouvre au défilement ---------- */
  const passage = $(".passage");
  const collant = passage && $(".passage__collant", passage);
  const majPassage = () => {
    if (!passage) return;
    const r = passage.getBoundingClientRect();
    const total = passage.offsetHeight - window.innerHeight;
    const p = calme ? 1 : Math.min(1, Math.max(0, -r.top / total));
    collant.style.setProperty("--p", p.toFixed(4));
  };

  /* ---------- Aperçu d'image qui suit la souris (liste) ---------- */
  const apercu = $(".b-apercu");
  let ax = 0, ay = 0, cx = 0, cy = 0, rot = 0;
  if (apercu && souris && !calme) {
    const img = $("img", apercu);
    $$("[data-apercu]").forEach(a => {
      a.addEventListener("pointerenter", () => { img.src = a.dataset.apercu; apercu.classList.add("on"); });
      a.addEventListener("pointerleave", () => apercu.classList.remove("on"));
    });
  }

  /* ---------- Curseur personnalisé ---------- */
  let curseur = null;
  if (souris && !calme) {
    curseur = document.createElement("div");
    curseur.className = "curseur"; curseur.setAttribute("aria-hidden", "true");
    curseur.innerHTML = "<span></span>";
    document.body.append(curseur);
    document.addEventListener("pointerover", e => {
      const cible = e.target.closest("[data-curseur]");
      const lien = e.target.closest("a, button, summary, label, select");
      curseur.classList.toggle("texte", !!cible);
      curseur.classList.toggle("lien", !cible && !!lien);
      if (cible) curseur.firstChild.textContent = cible.dataset.curseur;
    });
  }
  window.addEventListener("pointermove", e => { cx = e.clientX; cy = e.clientY; }, { passive: true });

  /* ---------- Boucle ---------- */
  let px = 0, py = 0;
  const boucle = () => {
    majPassage();
    if (curseur) { px += (cx - px) * .25; py += (cy - py) * .25; curseur.style.transform = `translate3d(${px}px,${py}px,0)`; }
    if (apercu) {
      const vx = cx - ax; ax += vx * .12; ay += (cy - ay) * .12; rot += (Math.max(-12, Math.min(12, vx * .08)) - rot) * .1;
      apercu.style.left = ax + "px"; apercu.style.top = ay + "px"; apercu.style.setProperty("--r", rot.toFixed(2) + "deg");
    }
    requestAnimationFrame(boucle);
  };
  requestAnimationFrame(boucle);
})();
