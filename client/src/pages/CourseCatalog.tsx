import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import AcademyHeader from "@/components/AcademyHeader";
import CourseCard from "@/components/CourseCard";
import PhoenixFlame from "@/components/PhoenixFlame";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLiveCatalog } from "@/hooks/useLiveCatalog";
import { courseMatchesFocus, type ProgrammeFocus } from "@/lib/programmePresentation";

const programmesHeroImage = "/manus-storage/phoennixai-programmes-hero_fa26707c.jpg";
const focusOptions: { value: ProgrammeFocus; label: string; detail: string }[] = [
  { value: "all", label: "All programmes", detail: "Every pathway" },
  { value: "business", label: "Business", detail: "Communication, growth, and interdisciplinary capability" },
  { value: "technology", label: "Technology", detail: "Design, software, AI, and creative technology" },
];

export default function CourseCatalog() {
  useLiveCatalog();
  const { data, isLoading } = trpc.academy.catalog.useQuery(undefined, { refetchInterval: 15000 });
  const [focus, setFocus] = useState<ProgrammeFocus>("all");
  const visibleCourses = useMemo(() => (data?.courses ?? []).filter(course => courseMatchesFocus(course, focus)), [data?.courses, focus]);

  return <div className="academy-public-shell min-h-screen bg-[#F7F6F2] text-[#1F2426] dark:bg-[#0D1520] dark:text-[#F7F6F2]"><AcademyHeader /><main><section className="relative overflow-hidden bg-[#0D1520] py-18 text-white sm:py-24"><div aria-hidden="true" className="academy-hero-image absolute inset-0 bg-cover bg-[70%_center]" style={{ backgroundImage: `url(${programmesHeroImage})` }} /><div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,18,29,.91)_0%,rgba(8,18,29,.74)_46%,rgba(8,18,29,.36)_100%)]" /><div className="phoenix-grid absolute inset-0 opacity-75" /><div className="absolute -right-12 top-10 h-64 w-64 rounded-full border border-[#42B4E7]/35" /><div className="container relative"><Button asChild variant="link" className="px-0 font-mono text-[10px] uppercase tracking-[0.1em] text-[#C5F0FF] hover:text-white"><Link href="/">Back to home</Link></Button><div className="mt-10 flex items-center gap-3"><PhoenixFlame className="h-8 w-8 text-[#42B4E7]" /><p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#C5F0FF]">Academy programmes</p></div><h1 className="mt-4 max-w-3xl font-display text-6xl font-bold leading-[.86] tracking-wide sm:text-8xl">A curriculum designed for builders.</h1><p className="mt-6 max-w-2xl font-body text-xl leading-8 text-[#EFF0EA]">Structured, project-led programmes with flexible monthly access and skills that translate beyond the classroom.</p></div></section><section className="py-16 sm:py-22"><div className="container"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8A8835]"><span className="flex items-center gap-3"><PhoenixFlame className="h-5 w-5 text-[#42B4E7]" />Programmes and pricing</span></div><div role="group" aria-label="Programme focus" className="flex flex-wrap gap-2">{focusOptions.map(option => <button key={option.value} type="button" aria-pressed={focus === option.value} onClick={() => setFocus(option.value)} className={`rounded-full border px-3 py-2 font-mono text-[9px] uppercase tracking-[.1em] transition ${focus === option.value ? "border-[#1688B8] bg-[#1688B8] text-white shadow-[0_0_18px_rgba(66,180,231,.22)]" : "border-[#556970]/30 bg-white text-[#425156] hover:border-[#42B4E7]/65 hover:text-[#1688B8] dark:bg-[#172231] dark:text-[#D0DEE1]"}`}>{option.label}</button>)}</div></div><p className="mb-8 max-w-2xl font-body text-sm leading-6 text-[#526269] dark:text-[#B3B9BA]">{focusOptions.find(option => option.value === focus)?.detail}</p>{isLoading ? <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#8A8835]" /></div> : visibleCourses.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleCourses.map(course => <CourseCard key={course.id} course={course} />)}</div> : <div className="rounded-lg border border-dashed border-[#556970]/35 p-10 text-center"><p className="font-display text-3xl font-bold">No programmes in this focus yet.</p><Button type="button" variant="outline" onClick={() => setFocus("all")} className="mt-5">View all programmes</Button></div>}</div></section></main></div>;
}
