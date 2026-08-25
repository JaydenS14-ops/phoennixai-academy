import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import AcademyHeader from "@/components/AcademyHeader";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLiveCatalog } from "@/hooks/useLiveCatalog";

export default function CourseCatalog() {
  useLiveCatalog();
  const { data, isLoading } = trpc.academy.catalog.useQuery(undefined, { refetchInterval: 15000 });
  return <div className="min-h-screen bg-[#F7F6F2] text-[#1F2426] dark:bg-[#0D1520] dark:text-[#F7F6F2]"><AcademyHeader /><main><section className="relative overflow-hidden bg-[#3E4F55] py-18 text-white sm:py-24"><div className="brand-grid absolute inset-0 opacity-50" /><div className="absolute -right-12 top-10 h-64 w-64 rounded-full border border-[#C9C877]/25" /><div className="container relative"><Button asChild variant="link" className="px-0 font-mono text-[10px] uppercase tracking-[0.1em] text-[#C9C877] hover:text-white"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to home</Link></Button><p className="mt-10 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#C9C877]">Business & Technology Centre</p><h1 className="mt-4 max-w-3xl font-display text-6xl font-bold leading-[.86] tracking-wide sm:text-8xl">A curriculum designed for builders.</h1><p className="mt-6 max-w-2xl font-body text-xl leading-8 text-[#EFF0EA]">Structured, project-led programmes with flexible monthly access and skills that translate beyond the classroom.</p></div></section><section className="py-16 sm:py-22"><div className="container"><div className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8A8835]"><Sparkles className="h-4 w-4" />Programmes and pricing</div>{isLoading ? <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#8A8835]" /></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data?.courses.map(course => <CourseCard key={course.id} course={course} />)}</div>}</div></section></main></div>;
}
