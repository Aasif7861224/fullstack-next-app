"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const TopLoaderContext = createContext(null);
const CLOUDINARY_API_HOSTS = new Set(["api.cloudinary.com", "api-eu.cloudinary.com", "api-ap.cloudinary.com"]);
const REQUEST_START_PROGRESS = 14;
const NAVIGATION_START_PROGRESS = 10;

function clampProgress(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function getCurrentRouteSignature() {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.pathname}${window.location.search}`;
}

function getRequestUrl(input) {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  if (typeof Request !== "undefined" && input instanceof Request) return input.url;
  return "";
}

function shouldTrackRequest(rawUrl) {
  if (!rawUrl || typeof window === "undefined") return false;

  try {
    const url = new URL(rawUrl, window.location.origin);
    if (url.origin === window.location.origin) {
      return url.pathname.startsWith("/api/");
    }

    return CLOUDINARY_API_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function shouldStartNavigation(event) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }

  const anchor = target.closest("a[href]");
  if (!anchor || anchor.hasAttribute("download")) {
    return false;
  }

  const targetAttr = anchor.getAttribute("target");
  if (targetAttr && targetAttr !== "_self") {
    return false;
  }

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) {
    return false;
  }

  try {
    const url = new URL(anchor.href, window.location.href);
    return (
      url.origin === window.location.origin &&
      !(url.pathname === window.location.pathname && url.search === window.location.search)
    );
  } catch {
    return false;
  }
}

export function TopLoaderProvider({ children }) {
  const [routeSignature, setRouteSignature] = useState("");
  const [visible, setVisible] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [tone, setTone] = useState("default");
  const [activeCount, setActiveCount] = useState(0);
  const hideTimerRef = useRef(null);
  const operationsRef = useRef(new Map());
  const sawErrorRef = useRef(false);
  const manualTokenRef = useRef(null);
  const navigationTokenRef = useRef(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const finalizeLoader = useCallback((nextTone = "default") => {
    clearHideTimer();
    setTone(nextTone);
    setVisible(true);
    setProgressState(100);

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setTone("default");
      setProgressState(0);
      hideTimerRef.current = null;
    }, 260);
  }, [clearHideTimer]);

  const beginOperation = useCallback((kind, initialProgress = 8) => {
    clearHideTimer();

    if (operationsRef.current.size === 0) {
      sawErrorRef.current = false;
    }

    const token = Symbol(kind);
    operationsRef.current.set(token, kind);
    setActiveCount(operationsRef.current.size);
    setTone("default");
    setVisible(true);
    setProgressState((current) => {
      const seed = clampProgress(Math.max(initialProgress, 4));
      if (current >= 100) {
        return seed;
      }

      return current > 0 ? Math.max(current, seed) : seed;
    });

    return token;
  }, [clearHideTimer]);

  const resolveOperation = useCallback((token, { failed = false } = {}) => {
    if (!token || !operationsRef.current.has(token)) {
      return;
    }

    operationsRef.current.delete(token);
    if (failed) {
      sawErrorRef.current = true;
    }

    const remaining = operationsRef.current.size;
    setActiveCount(remaining);

    if (remaining === 0) {
      const nextTone = sawErrorRef.current ? "error" : "default";
      sawErrorRef.current = false;
      finalizeLoader(nextTone);
    }
  }, [finalizeLoader]);

  const beginNavigation = useCallback(() => {
    if (navigationTokenRef.current) {
      return;
    }

    navigationTokenRef.current = beginOperation("navigation", NAVIGATION_START_PROGRESS);
  }, [beginOperation]);

  const start = (initialProgress = 8) => {
    if (!manualTokenRef.current) {
      manualTokenRef.current = beginOperation("manual", initialProgress);
      return;
    }

    setProgressState((current) => Math.max(current, clampProgress(initialProgress)));
  };

  const setProgress = (nextProgress) => {
    clearHideTimer();
    setTone("default");
    setVisible(true);
    setProgressState((current) => Math.max(current, clampProgress(nextProgress)));
  };

  const finish = (nextTone = "default") => {
    if (nextTone === "error") {
      sawErrorRef.current = true;
    }

    if (!manualTokenRef.current) {
      if (operationsRef.current.size === 0) {
        finalizeLoader(nextTone);
      }
      return;
    }

    const token = manualTokenRef.current;
    manualTokenRef.current = null;
    resolveOperation(token, { failed: nextTone === "error" });
  };

  const fail = () => finish("error");

  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  useEffect(() => {
    const updateRouteSignature = () => {
      setRouteSignature(getCurrentRouteSignature());
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(...args) {
      const result = originalPushState.apply(this, args);
      window.dispatchEvent(new Event("urban-keys:location-change"));
      return result;
    };

    window.history.replaceState = function replaceState(...args) {
      const result = originalReplaceState.apply(this, args);
      window.dispatchEvent(new Event("urban-keys:location-change"));
      return result;
    };

    updateRouteSignature();
    window.addEventListener("popstate", updateRouteSignature);
    window.addEventListener("urban-keys:location-change", updateRouteSignature);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", updateRouteSignature);
      window.removeEventListener("urban-keys:location-change", updateRouteSignature);
    };
  }, []);

  useEffect(() => {
    if (!visible || activeCount === 0 || progress >= 92) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setProgressState((current) => {
        if (current >= 92) {
          return current;
        }
        return Math.min(92, current + Math.max(1, (100 - current) * 0.08));
      });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [activeCount, progress, visible]);

  useEffect(() => {
    if (!navigationTokenRef.current) {
      return;
    }

    const token = navigationTokenRef.current;
    navigationTokenRef.current = null;
    resolveOperation(token);
  }, [resolveOperation, routeSignature]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (shouldStartNavigation(event)) {
        beginNavigation();
      }
    };

    const handlePopState = () => {
      beginNavigation();
    };

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [beginNavigation]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args) => {
      const url = getRequestUrl(args[0]);

      if (!shouldTrackRequest(url)) {
        return originalFetch(...args);
      }

      const token = beginOperation("request", REQUEST_START_PROGRESS);

      try {
        const response = await originalFetch(...args);
        resolveOperation(token, { failed: !response.ok });
        return response;
      } catch (error) {
        resolveOperation(token, { failed: true });
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [beginOperation, resolveOperation]);

  useEffect(() => {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function open(method, url, ...rest) {
      this.__urbanKeysTrackedUrl = typeof url === "string" ? url : url?.toString?.() || "";
      return originalOpen.call(this, method, url, ...rest);
    };

    XMLHttpRequest.prototype.send = function send(body) {
      const shouldTrack = shouldTrackRequest(this.__urbanKeysTrackedUrl);

      if (!shouldTrack) {
        return originalSend.call(this, body);
      }

      const token = beginOperation("request", REQUEST_START_PROGRESS);
      let completed = false;

      const complete = (failed) => {
        if (completed) return;
        completed = true;
        resolveOperation(token, { failed });
      };

      this.addEventListener("loadend", () => complete(this.status >= 400), { once: true });
      this.addEventListener("error", () => complete(true), { once: true });
      this.addEventListener("abort", () => complete(true), { once: true });
      this.addEventListener("timeout", () => complete(true), { once: true });

      return originalSend.call(this, body);
    };

    return () => {
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
    };
  }, [beginOperation, resolveOperation]);

  return (
    <TopLoaderContext.Provider value={{ beginNavigation, start, setProgress, finish, fail }}>
      <div className={`top-loader-shell ${visible ? "visible" : ""}`} aria-hidden="true">
        <div className={`top-loader-bar ${tone}`} style={{ width: `${progress}%` }} />
      </div>
      {children}
    </TopLoaderContext.Provider>
  );
}

export function useTopLoader() {
  const value = useContext(TopLoaderContext);

  if (!value) {
    throw new Error("useTopLoader must be used within TopLoaderProvider");
  }

  return value;
}
