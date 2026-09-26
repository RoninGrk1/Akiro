"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

type Feature = {
  id: string;
  name: string;
  status: "Available" | "Needs configuration";
};

/** Compact status chips from /api/config/status — real data only. */
export function StatusChips() {
  const [features, setFeatures] = useState<Feature[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/config/status")
      .then((r) => r.json())
      .then((d: { features?: Feature[] }) => {
        if (!cancelled) setFeatures(d.features ?? []);
      })
      .catch(() => {
        if (!cancelled) setFeatures([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (features === null) {
    return (
      <div className="flex flex-wrap gap-2" aria-busy="true" aria-label="Loading status">
        <Skeleton height={24} width={96} rounded="full" />
        <Skeleton height={24} width={112} rounded="full" />
        <Skeleton height={24} width={88} rounded="full" />
        <Skeleton height={24} width={100} rounded="full" />
      </div>
    );
  }

  if (features.length === 0) return null;

  // Show a scannable subset: key local + cloud features
  const priority = [
    "workspace",
    "terminal",
    "solc",
    "ai",
    "github",
    "ipfs",
    "vercel",
  ];
  const ordered = [
    ...priority
      .map((id) => features.find((f) => f.id === id))
      .filter(Boolean) as Feature[],
  ];

  return (
    <div className="flex flex-wrap gap-2" aria-label="Feature status">
      {ordered.map((f) => (
        <Badge
          key={f.id}
          variant={f.status === "Available" ? "available" : "configured"}
        >
          {f.name.split(" ")[0]}
          {" · "}
          {f.status === "Available" ? "Ready" : "Needs config"}
        </Badge>
      ))}
    </div>
  );
}
