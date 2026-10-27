/* La Traverse — interactions
   Vanilla JS, sans dépendance. Tout est désactivé proprement
   si l'utilisateur demande un mouvement réduit. */
(() => {
  "use strict";
  const doc = document.documentElement;
  const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Arrivée sur la page ---------- */
  const voile = $(".voile");
  const pret = () => requestAnimationFrame(() => doc.classList.add("est-pret"));
  if (document.readyState === "complete") pret(); else window.addEventListener("load", pret);
  setTimeout(pret, 2200); // filet de sécurité
  window.addEventListener("pageshow", e => { if (e.persisted && voile) { voile.classList.remove("arrive"); pret(); } });

  /* ---------- Transition entre pages ---------- */
  if (voile && !calme) {
    document.addEventListener("click", e => {
      const a = e.target.closest("a");
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname || /\.(pdf|jpg|png|zip)$/i.test(url.pathname) || a.hasAttribute("download")) return;
      e.preventDefault();
      voile.classList.remove("arrive");
      voile.classList.add("part");
      void voile.offsetWidth;
      voile.classList.remove("part");
      voile.classList.add("arrive");
      setTimeout(() => { location.href = url.href; }, 650);
    });
  }

  /* ---------- En-tête & menu ---------- */
  const entete = $(".entete");
  const burger = $(".burger");
  let dernierY = 0;
  const majEntete = y => {
    entete.classList.toggle("est-defile", y > 40);
    entete.classList.toggle("est-cache", y > 500 && y > dernierY && !document.body.classList.contains("menu-ouvert"));
    dernierY = y;
  };
  if (burger) {
    const basculer = ouvrir => {
      document.body.classList.toggle("menu-ouvert", ouvrir);
      burger.setAttribute("aria-expanded", String(ouvrir));
      burger.setAttribute("aria-label", ouvrir ? "Fermer le menu" : "Ouvrir le menu");
    };
    burger.addEventListener("click", () => basculer(!document.body.classList.contains("menu-ouvert")));
    document.addEventListener("keydown", e => { if (e.key === "Escape") basculer(false); });
  }

  /* ---------- Découpage des titres en mots ---------- */
  $$("[data-split]").forEach(el => {
    let i = 0;
    const traiter = noeud => {
      [...noeud.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(" "); return; }
            const m = document.createElement("span"); m.className = "mot";
            const s = document.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
            m.append(s); frag.append(m);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") traiter(n);
      });
    };
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    traiter(el);
    $$(".mot", el).forEach(m => m.setAttribute("aria-hidden", "true"));
  });

  /* ---------- Mots qui s'éclairent au défilement ---------- */
  const eclaires = $$("[data-eclaire]").map(el => {
    const mots = [];
    const traiter = (noeud, fort) => {
      [...noeud.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const s = document.createElement("span"); s.className = "m" + (fort ? " fort" : ""); s.textContent = part;
            mots.push(s); frag.append(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) traiter(n, fort || n.tagName === "STRONG");
      });
    };
    traiter(el, false);
    return { el, mots };
  });

  /* ---------- Apparitions ---------- */
  const io = new IntersectionObserver(entrees => {
    entrees.forEach(e => { if (e.isIntersecting) { e.target.classList.add("est-vu"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -12% 0px", threshold: .08 });
  $$("[data-reveal], [data-split]").forEach(el => io.observe(el));

  /* ---------- Le sentier ---------- */
  const main = $("main");
  let sentier = null;
  const NS = "http://www.w3.org/2000/svg";
  const construireSentier = () => {
    if (!main || main.dataset.sentier === "non") return;
    const W = main.clientWidth, H = main.scrollHeight;
    if (!sentier) {
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "sentier"); svg.setAttribute("aria-hidden", "true");
      svg.innerHTML = '<path class="sentier__fond"/><path class="sentier__trace"/><circle class="sentier__halo" r="9"/><circle class="sentier__pas" r="5"/>';
      main.prepend(svg);
      sentier = { svg, fond: svg.children[0], trace: svg.children[1], halo: svg.children[2], pas: svg.children[3] };
    }
    sentier.svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    sentier.svg.style.height = H + "px";
    // un tracé sinueux qui longe les marges, avec une légère irrégularité
    const pas = Math.max(620, window.innerHeight * .9);
    const gauche = W < 700 ? W * .04 : W * .035, droite = W < 700 ? W * .96 : W * .965;
    let d = `M ${W * .52} 0`, x = W * .52, y = 0, cote = 1;
    while (y < H) {
      const ny = Math.min(H, y + pas);
      const nx = cote ? droite : gauche;
      d += ` C ${x} ${y + pas * .55}, ${nx} ${ny - pas * .6}, ${nx} ${ny}`;
      x = nx; y = ny; cote = 1 - cote;
    }
    sentier.fond.setAttribute("d", d);
    sentier.trace.setAttribute("d", d);
    const L = sentier.trace.getTotalLength();
    sentier.L = L;
    sentier.trace.style.strokeDasharray = `${L} ${L}`;
    // table longueur → hauteur pour placer le marcheur
    sentier.table = [];
    for (let i = 0; i <= 300; i++) {
      const l = L * i / 300; sentier.table.push([l, sentier.trace.getPointAtLength(l).y]);
    }
  };
  const longueurPourY = cible => {
    const t = sentier.table;
    if (cible <= t[0][1]) return 0;
    for (let i = 1; i < t.length; i++) {
      if (t[i][1] >= cible) {
        const [l0, y0] = t[i - 1], [l1, y1] = t[i];
        return l0 + (l1 - l0) * ((cible - y0) / ((y1 - y0) || 1));
      }
    }
    return sentier.L;
  };
  const majSentier = y => {
    if (!sentier) return;
    const debut = main.getBoundingClientRect().top + y;
    const cible = y + window.innerHeight * .62 - debut;
    const l = calme ? sentier.L : longueurPourY(cible);
    sentier.trace.style.strokeDashoffset = String(sentier.L - l);
    const p = sentier.trace.getPointAtLength(l);
    sentier.pas.setAttribute("cx", p.x); sentier.pas.setAttribute("cy", p.y);
    sentier.halo.setAttribute("cx", p.x); sentier.halo.setAttribute("cy", p.y);
  };

  /* ---------- Défilement horizontal (étapes) ---------- */
  const horizons = $$(".horizon").map(sec => ({ sec, piste: $(".horizon__piste", sec), barre: $(".horizon__barre", sec) }));
  const regleHorizons = () => {
    horizons.forEach(h => {
      const vertical = calme || window.innerWidth < 860;
      h.sec.classList.toggle("horizon--vertical", vertical);
      h.vertical = vertical;
      if (vertical) { h.sec.style.height = ""; return; }
      h.distance = h.piste.scrollWidth - window.innerWidth;
      h.sec.style.height = (window.innerHeight + h.distance) + "px";
    });
  };
  const majHorizons = () => {
    horizons.forEach(h => {
      if (h.vertical) return;
      const r = h.sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (h.sec.offsetHeight - window.innerHeight)));
      h.piste.style.transform = `translate3d(${-p * h.distance}px,0,0)`;
      if (h.barre) h.barre.style.setProperty("--p", p.toFixed(4));
    });
  };

  /* ---------- Parallaxe douce ---------- */
  const parallaxes = calme ? [] : $$("[data-vitesse]");
  const majParallaxes = () => {
    const vh = window.innerHeight;
    parallaxes.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const centre = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(0, ${(-centre * parseFloat(el.dataset.vitesse)).toFixed(1)}px, 0)`;
    });
  };

  const majEclaires = () => {
    const vh = window.innerHeight;
    eclaires.forEach(({ el, mots }) => {
      const r = el.getBoundingClientRect();
      const p = calme ? 1 : Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
      const n = Math.round(p * mots.length);
      mots.forEach((m, i) => m.classList.toggle("on", i < n));
    });
  };

  /* ---------- Boucle unique ---------- */
  let attente = false;
  const image = () => {
    attente = false;
    const y = window.scrollY;
    majEntete(y); majSentier(y); majHorizons(); majParallaxes(); majEclaires();
  };
  const demander = () => { if (!attente) { attente = true; requestAnimationFrame(image); } };
  window.addEventListener("scroll", demander, { passive: true });

  let minuteur;
  const mise = () => { regleHorizons(); construireSentier(); image(); };
  window.addEventListener("resize", () => { clearTimeout(minuteur); minuteur = setTimeout(mise, 180); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(mise);
  window.addEventListener("load", mise);
  if ("ResizeObserver" in window && main) {
    let h0 = 0;
    new ResizeObserver(() => { const h = main.scrollHeight; if (Math.abs(h - h0) > 40) { h0 = h; clearTimeout(minuteur); minuteur = setTimeout(mise, 180); } }).observe(main);
  }
  mise();

  /* ---------- Retour du formulaire ---------- */
  const etat = new URLSearchParams(location.search).get("envoi");
  if (etat) {
    const el = $(`[data-etat="${etat === "ok" ? "ok" : "err"}"]`);
    if (el) { el.hidden = false; el.scrollIntoView({ block: "center" }); }
  }

  /* ---------- Année ---------- */
  $$("[data-annee]").forEach(el => { el.textContent = new Date().getFullYear(); });
})();

/* ---------- V5 : micro-interactions ---------- */
(() => {
  "use strict";
  const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const souris = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $$ = (s) => [...document.querySelectorAll(s)];

  // Boutons aimantés : le bouton suit légèrement la souris
  if (souris && !calme) {
    $$("[data-aimant]").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .22, y = (e.clientY - r.top - r.height / 2) * .32;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  // Offres phares : le fond s'ouvre depuis le point d'entrée de la souris
  $$(".phares a").forEach(a => a.addEventListener("pointerenter", e => {
    const r = a.getBoundingClientRect();
    a.style.setProperty("--mx", (e.clientX - r.left) + "px");
    a.style.setProperty("--my", (e.clientY - r.top) + "px");
  }));

  // Compteurs
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const fin = +e.target.dataset.compteur, t0 = performance.now(), d = calme ? 1 : 1600;
    const pas = t => { const p = Math.min(1, (t - t0) / d); e.target.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(pas); };
    requestAnimationFrame(pas);
  }), { threshold: .6 });
  $$("[data-compteur]").forEach(el => { el.textContent = "0"; io.observe(el); });

  // Bande de texte : avance en continu et accélère avec le défilement
  const bandes = $$("[data-bande]");
  if (bandes.length && !calme) {
    let x = 0, vitesse = 0, dernierY = window.scrollY;
    const boucle = () => {
      const y = window.scrollY; vitesse += (Math.abs(y - dernierY) * .25 - vitesse) * .1; dernierY = y;
      x -= .5 + vitesse;
      bandes.forEach(b => { const moitie = b.scrollWidth / 2; if (-x > moitie) x += moitie; b.style.transform = `translate3d(${x}px,0,0)`; });
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  }

  // Halo de curseur sur les grandes cartes (« Entrer »)
  const cibles = $$("[data-curseur]");
  if (souris && !calme && cibles.length) {
    const halo = document.createElement("div"); halo.className = "halo-curseur"; halo.setAttribute("aria-hidden", "true");
    document.body.append(halo);
    let hx = 0, hy = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", e => { cx = e.clientX; cy = e.clientY; }, { passive: true });
    const suivre = () => { hx += (cx - hx) * .18; hy += (cy - hy) * .18; halo.style.left = hx + "px"; halo.style.top = hy + "px"; requestAnimationFrame(suivre); };
    requestAnimationFrame(suivre);
    cibles.forEach(c => {
      c.addEventListener("pointerenter", () => { halo.textContent = c.dataset.curseur; halo.classList.add("on"); });
      c.addEventListener("pointerleave", () => halo.classList.remove("on"));
    });
  }
})();
