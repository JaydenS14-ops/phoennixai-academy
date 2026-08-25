import { ArrowUpRight, Menu, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export default function AcademyHeader() {
  const { theme, toggleTheme } = useTheme();
  return <header className="sticky top-0 z-40 border-b border-[#556970]/15 bg-[#F7F6F2]/92 backdrop-blur-xl dark:border-white/10 dark:bg-[#0D1520]/92">
    <div className="container flex h-16 items-center justify-between gap-4">
      <Link href="/" className="group flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border border-[#ABA944]/55 bg-[#0D1520] font-display text-xl font-bold text-[#C9C877] shadow-sm transition-transform duration-200 group-hover:scale-105">P</span><span className="leading-none"><strong className="font-display text-xl font-bold tracking-wide text-[#1F2426] dark:text-[#F7F6F2]">Phoenn<span className="text-[#8A8835]">ix</span>AI</strong><span className="mt-0.5 block font-mono text-[8px] font-medium uppercase tracking-[0.13em] text-[#6B7477]">Business & Technology Centre</span></span></Link>
      <nav className="hidden items-center gap-7 font-mono text-[10px] uppercase tracking-[0.12em] text-[#556970] md:flex"><Link href="/" className="transition-colors hover:text-[#8A8835]">Home</Link><Link href="/courses" className="transition-colors hover:text-[#8A8835]">Programmes</Link><a href="/#events" className="transition-colors hover:text-[#8A8835]">Events</a><a href="/#mandate" className="transition-colors hover:text-[#8A8835]">Our mandate</a></nav>
      <div className="flex items-center gap-1.5"><Button variant="ghost" size="icon" aria-label="Toggle colour theme" onClick={toggleTheme} className="h-9 w-9 rounded-full text-[#556970] hover:bg-[#EFF0EA] hover:text-[#3E4F55] dark:text-[#F7F6F2]">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button><Button asChild className="hidden rounded-md bg-[#556970] px-4 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-white hover:bg-[#3E4F55] sm:inline-flex"><Link href="/apply">Begin enquiry <ArrowUpRight className="ml-2 h-3.5 w-3.5" /></Link></Button><Button asChild size="icon" variant="ghost" className="md:hidden"><Link href="/courses" aria-label="Browse programmes"><Menu className="h-5 w-5" /></Link></Button></div>
    </div>
  </header>;
}
