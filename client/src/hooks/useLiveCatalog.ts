import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

const CHANNEL = "phoennixai-academy-catalog";

export function broadcastAcademyRefresh() {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage({ type: "catalog-updated" });
  channel.close();
}

export function useLiveCatalog() {
  const utils = trpc.useUtils();
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = () => {
      void utils.academy.catalog.invalidate();
    };
    return () => channel.close();
  }, [utils]);
}
