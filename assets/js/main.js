/* ==========================================================================
   Cloudimo — interacciones y animaciones
   Sin dependencias. Todo degrada con gracia si algo no está disponible.
   ========================================================================== */
(() => {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lang = document.documentElement.lang.startsWith("en") ? "en" : "es";
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* --- Año actual en el pie ---------------------------------------------- */
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* --- Cabecera fija ------------------------------------------------------ */
  const header = $(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Menú móvil --------------------------------------------------------- */
  const toggle = $(".nav-toggle");
  const nav = $(".nav");
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  /* --- Revelado al entrar en pantalla ------------------------------------- */
  const revealables = $$(".reveal, .step");
  if (revealables.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      revealables.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
      );
      revealables.forEach((el) => io.observe(el));

      // Red de seguridad: si por lo que sea el observador no llegó a disparar,
      // no dejamos contenido visible en pantalla con opacidad 0.
      window.addEventListener("load", () => {
        setTimeout(() => {
          revealables.forEach((el) => {
            if (el.classList.contains("in")) return;
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
          });
        }, 900);
      });
    }
  }

  /* --- Enlace de navegación activo ---------------------------------------- */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__link[href^='#']");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) =>
            a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* --- Resplandor de tarjetas siguiendo al puntero ------------------------ */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* --- Línea de progreso del proceso -------------------------------------- */
  const processEl = $(".process");
  const processLine = $(".process__line");
  if (processEl && processLine && !reduced) {
    const update = () => {
      const r = processEl.getBoundingClientRect();
      const anchor = window.innerHeight * 0.62;
      const pct = ((anchor - r.top) / r.height) * 100;
      processLine.style.setProperty("--fill", `${Math.min(100, Math.max(0, pct))}%`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* --- Marquesina infinita: duplicamos el contenido ----------------------- */
  const track = $(".marquee__track");
  if (track && !reduced) {
    track.append(...Array.from(track.children).map((n) => {
      const clone = n.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      return clone;
    }));
  }

  /* --- Volver arriba ------------------------------------------------------ */
  const toTop = $(".to-top");
  if (toTop) {
    const check = () => toTop.classList.toggle("is-visible", window.scrollY > 700);
    check();
    window.addEventListener("scroll", check, { passive: true });
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }

  /* --- Consola del hero: escritura secuencial ----------------------------- */
  const consoleBody = $(".console__body");
  const linesTpl = $("#console-lines");
  if (consoleBody && linesTpl) {
    const lines = $$("[data-type]", linesTpl.content).map((el) => ({
      type: el.dataset.type,
      text: el.textContent.trim(),
    }));

    const render = (line, text) => {
      const row = document.createElement("div");
      row.className = "console__line";
      const prefix = document.createElement("span");
      prefix.className = line.type === "ok" ? "ok" : line.type === "dim" ? "dim" : "pf";
      prefix.textContent = line.type === "ok" ? "✓" : line.type === "dim" ? " " : "›";
      const body = document.createElement("span");
      if (line.type === "dim") body.className = "dim";
      body.textContent = text;
      row.append(prefix, body);
      consoleBody.append(row);
      return body;
    };

    if (reduced) {
      lines.forEach((line) => render(line, line.text));
    } else {
      const caret = document.createElement("span");
      caret.className = "caret";
      let i = 0;

      const typeLine = () => {
        if (i >= lines.length) {
          consoleBody.append(caret);
          return;
        }
        const line = lines[i++];
        const body = render(line, "");
        body.after(caret);
        let c = 0;
        const tick = () => {
          body.textContent = line.text.slice(0, ++c);
          if (c < line.text.length) {
            setTimeout(tick, 16 + Math.random() * 22);
          } else {
            setTimeout(typeLine, line.type === "ok" ? 180 : 380);
          }
        };
        tick();
      };

      // Arranca cuando el hero es visible, para no animar a ciegas.
      // El temporizador es la red de seguridad si el observador no dispara.
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        setTimeout(typeLine, 500);
      };
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries, obs) => {
          if (entries[0].isIntersecting) { obs.disconnect(); start(); }
        }, { threshold: 0.25 });
        io.observe(consoleBody);
        setTimeout(start, 2500);
      } else {
        start();
      }
    }
  }

  /* --- Fondo animado del hero: red de nodos ------------------------------- */
  const canvas = $(".hero__canvas");
  if (canvas && !reduced && canvas.getContext) {
    const ctx = canvas.getContext("2d", { alpha: true });
    const pointer = { x: -9999, y: -9999 };
    let nodes = [];
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true;

    const LINK_DIST = 132;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      // Si el elemento aún no tiene tamaño (carrera de layout, pestaña oculta…),
      // no construimos: el ResizeObserver nos volverá a llamar cuando lo tenga.
      if (rect.width < 1 || rect.height < 1) return false;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(96, Math.max(28, Math.round((w * h) / 15500)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        r: Math.random() * 1.5 + 0.9,
        // Unos pocos nodos "activos" laten con el acento de marca.
        hot: Math.random() < 0.18,
        phase: Math.random() * Math.PI * 2,
      }));

      return true;
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // Rebote en los bordes
        if (n.x < 0 || n.x > w) { n.vx *= -1; n.x = Math.min(Math.max(n.x, 0), w); }
        if (n.y < 0 || n.y > h) { n.vy *= -1; n.y = Math.min(Math.max(n.y, 0), h); }

        // Ligera atracción hacia el puntero
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000 && d2 > 1) {
          const f = 0.00022;
          n.vx += dx * f;
          n.vy += dy * f;
        }

        // Freno para que no se disparen
        n.vx = Math.min(Math.max(n.vx, -0.62), 0.62);
        n.vy = Math.min(Math.max(n.vy, -0.62), 0.62);
      }

      // Enlaces
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DIST) continue;
          const alpha = (1 - dist / LINK_DIST) * 0.34;
          ctx.strokeStyle = `rgba(55, 138, 221, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Nodos
      for (const n of nodes) {
        const pulse = n.hot ? 0.55 + Math.sin(t / 620 + n.phase) * 0.45 : 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (n.hot ? 1.35 : 1), 0, Math.PI * 2);
        ctx.fillStyle = n.hot
          ? `rgba(111, 176, 239, ${0.35 + pulse * 0.5})`
          : "rgba(180, 212, 245, 0.45)";
        ctx.fill();

        if (n.hot) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 5.5 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(55, 138, 221, ${0.05 * pulse})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const startLoop = () => {
      if (!raf && visible && nodes.length && !document.hidden) {
        raf = requestAnimationFrame(draw);
      }
    };
    const stopLoop = () => { cancelAnimationFrame(raf); raf = 0; };

    const rebuild = () => { if (build()) startLoop(); };

    rebuild();

    // ResizeObserver además de window.resize: el primero también se dispara
    // cuando el canvas pasa de tamaño cero a tamaño real (así nunca se queda
    // en blanco), el segundo cubre navegadores donde el primero no llegue.
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 180);
    };
    if ("ResizeObserver" in window) new ResizeObserver(onResize).observe(canvas);
    window.addEventListener("resize", onResize);

    window.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    }, { passive: true });

    window.addEventListener("pointerleave", () => { pointer.x = pointer.y = -9999; });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopLoop(); else rebuild();
    });

    // No malgastar CPU cuando el hero no está en pantalla.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) startLoop(); else stopLoop();
      }, { threshold: 0 }).observe(canvas);
    }
  }

  /* --- Formulario de contacto (Formspree, sin recargar la página) --------- */
  const form = $("#contact-form");
  if (form) {
    const status = $(".form__status", form);
    const submitBtn = $("button[type=submit]", form);
    const labelIdle = submitBtn ? submitBtn.textContent.trim() : "";

    const T = {
      es: {
        busy: "Enviando…",
        ok: "Mensaje enviado. Te respondo en menos de 24 h laborables.",
        err: "No se ha podido enviar. Escríbeme a cloudimo.ia@gmail.com y lo vemos.",
        sending: "Enviando…",
      },
      en: {
        busy: "Sending…",
        ok: "Message sent. I'll get back to you within one business day.",
        err: "Couldn't send it. Email me at cloudimo.ia@gmail.com instead.",
        sending: "Sending…",
      },
    }[lang];

    form.addEventListener("submit", async (e) => {
      // Sin endpoint configurado dejamos que el navegador haga el envío normal.
      const action = form.getAttribute("action") || "";
      if (!action || action.includes("TU_ID_DE_FORMSPREE")) return;

      e.preventDefault();

      // Trampa antispam: si está relleno, es un bot.
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      status.dataset.state = "busy";
      status.textContent = T.busy;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = T.sending; }

      try {
        const res = await fetch(action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        status.dataset.state = "ok";
        status.textContent = T.ok;
      } catch {
        status.dataset.state = "err";
        status.textContent = T.err;
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = labelIdle; }
      }
    });
  }
})();
