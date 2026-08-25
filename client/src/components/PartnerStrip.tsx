import { Link } from "wouter";
import PhoenixFlame from "@/components/PhoenixFlame";

const partners = [
  { name: "Rise to Capital", note: "Partner programme", featured: true },
  { name: "PhoennixAI Agency", note: "Technology & automation", featured: false },
  { name: "Partner space", note: "Future collaborator", featured: false },
  { name: "Partner space", note: "Future collaborator", featured: false },
];

function PartnerMark({ name, note, featured }: (typeof partners)[number]) {
  return <div className={`partner-mark flex min-w-[220px] items-center gap-3 border px-5 py-4 ${featured ? "border-[#42B4E7]/45 bg-[#142833] text-white" : "border-[#556970]/18 bg-white text-[#1F2426] dark:bg-[#172231] dark:text-[#F7F6F2]"}`}><div className={`grid h-9 w-9 place-items-center rounded-full ${featured ? "border border-[#42B4E7]/50 bg-[#42B4E7]/14 font-display text-base font-bold tracking-tight text-[#A8E6FF]" : "bg-[#ABA944]/12 text-[#8A8835]"}`}>{featured ? <span aria-label="Rise to Capital mark">R|C</span> : <PhoenixFlame className="h-5 w-5" />}</div><div><p className="font-display text-xl font-bold tracking-wide">{name}</p><p className={`mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] ${featured ? "text-[#C5F0FF]" : "text-[#526269] dark:text-[#B3B9BA]"}`}>{note}</p></div></div>;
}

export default function PartnerStrip() {
  const rail = [...partners, ...partners];
  return <section className="overflow-hidden border-y border-[#556970]/15 bg-[#EFF0EA] py-7 dark:bg-white/[0.035]"><div className="container mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8A8835]">Our partners and collaborators</p><p className="mt-1 font-body text-sm text-[#526269] dark:text-[#B3B9BA]">A growing ecosystem for builders, founders, and future-focused teams.</p></div><Link href="/rise-to-capital" className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#1688B8] transition-colors hover:text-[#3E4F55]">Discover Rise to Capital</Link></div><div className="partner-marquee" aria-label="PhoennixAI partner showcase"><div className="partner-rail">{rail.map((partner, index) => <PartnerMark key={`${partner.name}-${index}`} {...partner} />)}</div></div></section>;
}
