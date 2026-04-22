"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const TopLoaderContext = createContext(null);

function clampProgress(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function TopLoaderProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgressState] = useState(0);
  const [tone, setTone] = useState("default");
  const hideTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!visible || progress >= 92) {
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
  }, [progress, visible]);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const start = (initialProgress = 8) => {
    clearHideTimer();
    setTone("default");
    setVisible(true);
    setProgressState(clampProgress(Math.max(initialProgress, 4)));
  };

  const setProgress = (nextProgress) => {
    clearHideTimer();
    setTone("default");
    setVisible(true);
    setProgressState((current) => Math.max(current, clampProgress(nextProgress)));
  };

  const finish = (nextTone = "default") => {
    clearHideTimer();
    setTone(nextTone);
    setVisible(true);
    setProgressState(100);

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setTone("default");
      setProgressState(0);
      hideTimerRef.current = null;
    }, 320);
  };

  const fail = () => finish("error");

  return (
    <TopLoaderContext.Provider value={{ start, setProgress, finish, fail }}>
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
