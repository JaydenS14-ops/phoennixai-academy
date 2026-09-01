import { useEffect, useState } from "react";
import { CalendarClock, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "wouter";
import AcademyHeader from "@/components/AcademyHeader";
import { Button } from "@/components/ui/button";
import { ACADEMY_BOOKING_PATH, CAL_BOOKING_EMBED_URL, CAL_BOOKING_URL } from "@/lib/appConfig";

export default function Booking() {
  const [loading, setLoading] = useState(true);
  const [takingLonger, setTakingLonger] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setTakingLonger(true), 7000);
    return () => window.clearTimeout(timeout);
  }, []);

  return <div className="min-h-screen"><AcademyHeader /><main className="py-10 sm:py-16 text-[#F7F6F2]"><div className="container max-w-6xl"><div className="max-w-2xl"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#C9C877]">Book a conversation</p><h1 className="mt-3 font-display text-5xl font-bold tracking-wide text-[#F7F6F2] sm:text-6xl">Choose a time that works for you.</h1><p className="mt-4 font-body leading-7 text-[#D0DEE1]">Reserve a 30-minute conversation with the Academy team. Your enquiry is already saved when you arrive here from the pathway form.</p></div><section className="relative mt-8 min-h-[720px] overflow-hidden rounded-3xl border border-[#42B4E7]/35 bg-[#172231] shadow-xl shadow-[#1F2426]/8" aria-busy={loading} aria-label="Cal.com booking calendar">{loading ? <div className="absolute inset-0 z-10 grid place-items-center bg-[#172231] px-6 text-center text-[#F7F6F2]"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#42B4E7]/12 text-[#42B4E7]"><Loader2 className="h-7 w-7 animate-spin" /></div><p role="status" className="mt-5 font-display text-3xl font-bold tracking-wide">Preparing the booking calendar.</p><p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-[#D0DEE1]">Please wait a moment while the secure scheduling page loads.</p>{takingLonger ? <a href={CAL_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 font-body text-sm font-semibold text-[#42B4E7] underline-offset-4 hover:text-[#C9C877] hover:underline">Open Cal.com in a new tab <ExternalLink className="h-4 w-4" /></a> : null}</div></div> : null}<iframe title="PhoennixAI Academy booking calendar" src={CAL_BOOKING_EMBED_URL} onLoad={() => setLoading(false)} className={`h-[720px] w-full border-0 transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`} allow="fullscreen" /></section><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Button asChild variant="outline" className="w-fit border-[#91A8AF]/60 bg-white/[0.08] text-[#F7F6F2] hover:bg-white/[0.16] hover:text-white"><Link href="/apply">Return to enquiry</Link></Button><a href={CAL_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 font-body text-sm font-semibold text-[#42B4E7] underline-offset-4 hover:text-[#C9C877] hover:underline">Open booking in a new tab <ExternalLink className="h-4 w-4" /></a></div><p className="mt-5 flex items-center gap-2 font-body text-sm text-[#D0DEE1]"><CalendarClock className="h-4 w-4 text-[#42B4E7]" />If no time is convenient, submit your enquiry and the Academy team can discuss alternatives.</p></div></main></div>;
}
