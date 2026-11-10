"use client";
import Link from "next/link";
export default function TrackedLink({
  href,
  children,
  event,
  className,
}: {
  href: string;
  children: React.ReactNode;
  event: "booking_opened" | "contact_opened";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        try {
          if (localStorage.getItem("bm-analytics") === "yes")
            void fetch("/api/telemetry", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: crypto.randomUUID(),
                event,
                consent: true,
              }),
              keepalive: true,
            }).catch(() => {});
        } catch {}
      }}
    >
      {children}
    </Link>
  );
}
