"use client";

import { useEffect } from "react";

export default function CinematicMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    document.body.classList.add("motion-ready");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    const observeRevealNodes = (nodes) => {
      nodes.forEach((node) => {
        if (!(node instanceof HTMLElement) || node.dataset.revealBound === "1") return;
        node.dataset.revealBound = "1";
        revealObserver.observe(node);
      });
    };

    observeRevealNodes(document.querySelectorAll("[data-reveal]"));

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        observeRevealNodes(record.target.querySelectorAll?.("[data-reveal]") || []);
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-reveal]")) {
            observeRevealNodes([node]);
          }
          observeRevealNodes(node.querySelectorAll("[data-reveal]"));
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const parallaxNodes = Array.from(document.querySelectorAll("[data-parallax]"));
    let frameId = null;

    const updateParallax = () => {
      frameId = null;
      const viewport = window.innerHeight || 1;
      parallaxNodes.forEach((node) => {
        const depth = Number(node.getAttribute("data-parallax-depth") || 18);
        const rect = node.getBoundingClientRect();
        const centerDelta = rect.top + rect.height / 2 - viewport / 2;
        const clamped = Math.max(-1, Math.min(1, centerDelta / (viewport / 2)));
        node.style.setProperty("--parallax-shift", `${clamped * depth * -1}px`);
      });
    };

    const onScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      revealObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      document.body.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
