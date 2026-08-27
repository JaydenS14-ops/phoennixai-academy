import { useState } from "react";
import { RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

const RESET_PHRASE = "RESET ANALYTICS";

export default function AnalyticsReset() {
  const [confirmation, setConfirmation] = useState(""); const utils = trpc.useUtils(); const reset = trpc.academy.admin.resetAnalytics.useMutation({ onSuccess: async () => { setConfirmation(""); await Promise.all([utils.academy.admin.analytics.invalidate(), utils.academy.admin.overview.invalidate()]); } }); const ready = confirmation === RESET_PHRASE;
  return <section className="rounded-lg border border-[#BC3F3F]/35 bg-[#BC3F3F]/[0.055] p-5 dark:bg-[#BC3F3F]/10"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div className="max-w-2xl"><div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-[#BC3F3F] dark:text-[#FF9D9D]" /><p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#BC3F3F] dark:text-[#FFB4B4]">Telemetry reset</p></div><h3 className="mt-3 font-display text-3xl font-bold tracking-wide">Start Analytics afresh.</h3><p className="mt-2 font-body text-sm leading-6 text-muted-foreground">This permanently removes anonymous page-view and Analytics event records only. Student enquiries, courses, events, archive items, and site content are not changed.</p></div><div className="w-full max-w-md"><label htmlFor="analytics-reset-confirmation" className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">Type {RESET_PHRASE} to enable</label><div className="mt-2 flex gap-2"><Input id="analytics-reset-confirmation" value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder={RESET_PHRASE} className="border-[#BC3F3F]/30 bg-white dark:bg-[#172231]" /><Button type="button" variant="destructive" disabled={!ready || reset.isPending} onClick={() => reset.mutate({ confirmation: RESET_PHRASE })} className="shrink-0"><RotateCcw className="mr-1.5 h-4 w-4" />{reset.isPending ? "Resetting" : "Reset"}</Button></div>{reset.isError ? <p role="alert" className="mt-2 font-body text-sm text-[#BC3F3F] dark:text-[#FFB4B4]">Analytics could not be reset. Please try again.</p> : null}</div></div></section>;
}
