import { useCallback, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

type EventType = "page_view" | "course_view" | "cta_click" | "enquiry_start" | "pathway_selected" | "enquiry_field" | "enquiry_step" | "enquiry_submit";
type Source = "direct" | "organic" | "social" | "referral" | "campaign" | "other";

function visitorKey() {
  const storageKey = "phoennixai-visitor";
  const existing = sessionStorage.getItem(storageKey);
  if (existing) return existing;
  const key = crypto.randomUUID(); sessionStorage.setItem(storageKey, key); return key;
}

function trafficSource(): Source {
  const params = new URLSearchParams(window.location.search);
  if (params.get("utm_source")) return "campaign";
  const referrer = document.referrer.toLowerCase();
  if (!referrer) return "direct";
  if (/(google|bing|duckduckgo|yahoo)/.test(referrer)) return "organic";
  if (/(instagram|linkedin|facebook|twitter|x\.com|tiktok|youtube)/.test(referrer)) return "social";
  try { return new URL(referrer).hostname === window.location.hostname ? "direct" : "referral"; } catch { return "other"; }
}

export function useAcademyAnalytics() {
  const tracker = trpc.academy.trackAnalyticsEvent.useMutation();
  const mutateRef = useRef(tracker.mutate); useEffect(() => { mutateRef.current = tracker.mutate; }, [tracker.mutate]);
  const track = useCallback((eventType: EventType, values: { path?: string; pathway?: string; detail?: string } = {}) => {
    mutateRef.current({ eventType, path: values.path ?? window.location.pathname, visitorKey: visitorKey(), source: trafficSource(), pathway: values.pathway, detail: values.detail });
  }, []);
  return { track };
}
