import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import AcademyHeader from "@/components/AcademyHeader";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLiveCatalog } from "@/hooks/useLiveCatalog";

export default function CourseCatalog() {
  useLiveCatalog();
  const { data, isLoading } = trpc.academy.catalog.useQuery(undefined, { refetchInterval: 15000 });
  return <div className="min-h-screen"><AcademyHeader /><main><section className="relative overflow-hidden bg-[#07101d] py-18 text-white sm:py-24"><div className="tech-grid absolute inset-0 text-cyan-100/30" /><div className="container relative"><Button asChild variant="link" className="px-0 text-cyan-200"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to brochure</Link></Button><p className="mt-10 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Our programmes</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">A curriculum designed for builders.</h1><p className="mt-5 max-w-2xl text-lg leading-7 text-slate-300">Structured, project-based programmes with flexible monthly access and skills that translate beyond the classroom.</p></div></section><section className="py-16 sm:py-22"><div className="container">{isLoading ? <div className="flex min-h-80 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-cyan-500" /></div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data?.courses.map(course => <CourseCard key={course.id} course={course} />)}</div>}</div></section></main></div>;
}
