import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export type CatalogCourse = { id: number; title: string; description: string; duration: string; pricePence: number; paymentLink: string | null; featured: number };
export const formatPrice = (pricePence: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(pricePence / 100);

export default function CourseCard({ course }: { course: CatalogCourse }) {
  const featured = Boolean(course.featured);
  return <article className={`relative flex h-full flex-col overflow-hidden rounded-lg border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${featured ? "border-[#ABA944]/55 bg-[#3E4F55] text-[#F7F6F2] shadow-lg shadow-[#3E4F55]/15" : "border-[#556970]/15 bg-white text-[#1F2426] dark:bg-white/[0.04] dark:text-[#F7F6F2]"}`}>
    <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[#ABA944]/10" />
    {featured && <div className="relative mb-6 flex w-fit items-center gap-1.5 rounded-full bg-[#ABA944] px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-[#1F2426]"><Sparkles className="h-3 w-3" /> Household value</div>}
    <div className="relative mb-6"><p className={`font-mono text-[9px] uppercase tracking-[0.14em] ${featured ? "text-[#C9C877]" : "text-[#6B7477]"}`}>{course.duration}</p><h3 className="mt-3 font-display text-3xl font-bold leading-none tracking-wide">{course.title}</h3><p className={`mt-4 font-body text-[15px] leading-6 ${featured ? "text-[#EFF0EA]" : "text-[#6B7477]"}`}>{course.description}</p></div>
    <div className="relative mt-auto"><div className="flex items-end gap-2"><span className="font-display text-4xl font-bold">{formatPrice(course.pricePence)}</span><span className={`mb-1.5 font-mono text-[10px] ${featured ? "text-[#C9C877]" : "text-[#6B7477]"}`}>PER MONTH</span></div><div className="mt-6 flex flex-wrap gap-2"><Button asChild className={featured ? "rounded-md bg-[#ABA944] text-[#1F2426] hover:bg-[#C9C877]" : "rounded-md bg-[#556970] text-white hover:bg-[#3E4F55]"}><Link href="/apply">Enquire <ArrowUpRight className="ml-1.5 h-4 w-4" /></Link></Button>{course.paymentLink ? <Button asChild variant="outline" className={featured ? "border-white/30 text-white hover:bg-white/10 hover:text-white" : "border-[#556970]/35 text-[#556970] hover:bg-[#EFF0EA]"}><a href={course.paymentLink} target="_blank" rel="noreferrer">Payment link <CheckCircle2 className="ml-1.5 h-4 w-4" /></a></Button> : null}</div></div>
  </article>;
}
