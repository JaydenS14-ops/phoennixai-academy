import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export type CatalogCourse = { id: number; title: string; description: string; duration: string; pricePence: number; paymentLink: string | null; featured: number };

export const formatPrice = (pricePence: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(pricePence / 100);

export default function CourseCard({ course }: { course: CatalogCourse }) {
  const featured = Boolean(course.featured);
  return <article className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition-transform duration-200 hover:-translate-y-1 ${featured ? "border-cyan-300/50 bg-gradient-to-b from-cyan-400/15 to-blue-600/10 shadow-xl shadow-cyan-500/10" : "border-border bg-card/80"}`}>
    {featured && <div className="mb-5 flex w-fit items-center gap-1.5 rounded-full bg-cyan-300 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-950"><Sparkles className="h-3 w-3" /> Featured family value</div>}
    <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{course.duration}</p><h3 className="mt-3 text-xl font-semibold tracking-tight text-balance">{course.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{course.description}</p></div>
    <div className="mt-auto"><div className="flex items-end gap-2"><span className="text-3xl font-bold tracking-tight">{formatPrice(course.pricePence)}</span><span className="mb-1 text-sm text-muted-foreground">/month</span></div><div className="mt-5 flex flex-wrap gap-2"><Button asChild className={featured ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200" : ""}><Link href="/apply">Enquire now <ArrowUpRight className="ml-1.5 h-4 w-4" /></Link></Button>{course.paymentLink ? <Button asChild variant="outline"><a href={course.paymentLink} target="_blank" rel="noreferrer">Payment link <CheckCircle2 className="ml-1.5 h-4 w-4" /></a></Button> : null}</div></div>
  </article>;
}
