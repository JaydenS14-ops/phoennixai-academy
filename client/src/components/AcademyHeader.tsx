import { Link } from "wouter";
import { ArrowUpRight, Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export default function AcademyHeader() {
  const { theme, toggleTheme } = useTheme();
  return <header className="sticky top-0 z-50 border-b border-slate-900/8 bg-background/80 backdrop-blur-xl dark:border-white/10">
    <div className="container flex h-18 items-center justify-between gap-4 py-3">
      <Link href="/" className="group flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-600 text-sm font-black text-slate-950 shadow-lg shadow-blue-500/20 transition-transform duration-200 group-hover:-rotate-6">P</span><span className="leading-none"><strong className="block text-sm tracking-tight">PhoennixAI</strong><span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Academy</span></span></Link>
      <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"><Link href="/" className="hover:text-foreground">Brochure</Link><Link href="/courses" className="hover:text-foreground">Courses</Link><a href="/#mandate" className="hover:text-foreground">Our mandate</a></nav>
      <div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Toggle colour theme" onClick={toggleTheme} className="rounded-xl">{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button><Button asChild className="hidden rounded-xl bg-cyan-400 px-4 font-semibold text-slate-950 hover:bg-cyan-300 sm:inline-flex"><Link href="/apply">Apply now <ArrowUpRight className="ml-1.5 h-4 w-4" /></Link></Button><Button asChild size="icon" variant="ghost" className="md:hidden"><Link href="/courses" aria-label="Browse academy courses"><Menu className="h-5 w-5" /></Link></Button></div>
    </div>
  </header>;
}
