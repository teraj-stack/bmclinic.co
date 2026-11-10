"use client";
import { useEffect } from "react";
export default function WebVitals() {
  useEffect(() => {
    let active = true,
      started = false;
    function consented() {
      try {
        return localStorage.getItem("bm-analytics") === "yes";
      } catch {
        return false;
      }
    }
    function setup() {
      if (!active || started || !consented()) return;
      started = true;
      void import("web-vitals")
        .then(({ onLCP, onINP, onCLS }) => {
          if (!active) return;
          const report = (metric: {
            name: string;
            value: number;
            id: string;
          }) => {
            if (!active || !consented()) return;
            void fetch("/api/telemetry", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: metric.id,
                event: "web_vital",
                consent: true,
                metric: metric.name,
                value: metric.value,
              }),
              keepalive: true,
            }).catch(() => {});
          };
          onLCP(report);
          onINP(report);
          onCLS(report);
        })
        .catch(() => {});
    }
    setup();
    window.addEventListener("bm-consent", setup);
    return () => {
      active = false;
      window.removeEventListener("bm-consent", setup);
    };
  }, []);
  return null;
}
