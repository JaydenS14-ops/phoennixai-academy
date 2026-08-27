import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { BarChart3, CalendarDays, FileText, GraduationCap, ImagePlus, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import AcademyAnalytics from "./AcademyAnalytics";

const PHOENIX_LOGO = "/manus-storage/phoennixai-phoenix-logo_7d43347d.jpg";
const menuItems = [
  { icon: BarChart3, label: "Overview", key: "overview" },
  { icon: BarChart3, label: "Analytics", key: "analytics" },
  { icon: GraduationCap, label: "Course management", key: "courses" },
  { icon: CalendarDays, label: "Luma events", key: "events" },
  { icon: ImagePlus, label: "In Motion archive", key: "archive" },
  { icon: FileText, label: "Site content", key: "content" },
];

export default function DashboardLayout({ children, activeSection = "overview", onSectionChange, onSignOut }: { children: React.ReactNode; activeSection?: string; onSectionChange?: (section: string) => void; onSignOut?: () => void; }) {
  return <SidebarProvider defaultOpen><DashboardLayoutContent activeSection={activeSection} onSectionChange={onSectionChange} onSignOut={onSignOut}>{activeSection === "analytics" ? <AcademyAnalytics pathways={["Product Design (UI/UX)", "Software Computing", "Gaming & Graphics Design", "Content Creation & Social Media", "Digital Marketing", "AI Automation", "Multi-Discipline Hybrid Bundle", "Family Bundle", "Rise to Capital", "Work Experience with PhoennixAI Agency", "Agency Apprenticeship"]} /> : children}</DashboardLayoutContent></SidebarProvider>;
}

function DashboardLayoutContent({ children, activeSection, onSectionChange, onSignOut }: { children: React.ReactNode; activeSection: string; onSectionChange?: (section: string) => void; onSignOut?: () => void; }) {
  return <><Sidebar className="!border-r !border-[#42B4E7]/18 !bg-[#0D1520] !text-[#F7F6F2] [&_[data-sidebar=sidebar]]:!bg-[#0D1520] [&_[data-sidebar=sidebar]]:!text-[#F7F6F2]"><SidebarHeader className="border-b border-white/12 px-4 py-5"><div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#42B4E7]/70 bg-[#0D1520] shadow-[0_0_0_3px_rgba(66,180,231,.08)]"><img src={PHOENIX_LOGO} alt="PhoennixAI phoenix" className="h-full w-full scale-[1.35] object-cover object-[50%_28%]" /></span><div className="min-w-0 leading-tight"><p className="font-display text-2xl font-bold tracking-wide text-[#F7F6F2]">Phoenn<span className="text-[#42B4E7]">ix</span>AI</p><p className="mt-1 font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-[#D1E8EF]">Admin centre</p></div></div></SidebarHeader><SidebarContent className="px-3 py-5"><p className="px-2 pb-3 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A8E6FF]">Management</p><SidebarMenu>{menuItems.map(item => <SidebarMenuItem key={item.key}><SidebarMenuButton isActive={activeSection === item.key} onClick={() => onSectionChange?.(item.key)} className="h-12 !text-[#DDEFF4] hover:!bg-[#42B4E7]/16 hover:!text-white data-[active=true]:!bg-[#42B4E7]/22 data-[active=true]:!text-[#C5F0FF] [&_svg]:!text-[#A8E6FF]"><item.icon className="h-4 w-4" /><span className="font-body text-[15px] font-medium">{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="border-t border-white/12 p-3"><Button variant="ghost" onClick={onSignOut} className="w-full justify-start !text-[#DDEFF4] hover:!bg-[#42B4E7]/16 hover:!text-white"><LogOut className="mr-2 h-4 w-4 text-[#A8E6FF]" />Sign out securely</Button></SidebarFooter></Sidebar><SidebarInset className="bg-[#F7F6F2] dark:bg-[#0D1520]"><div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#556970]/15 bg-[#F7F6F2]/92 px-4 backdrop-blur dark:border-white/8 dark:bg-[#0D1520]/92 lg:hidden"><SidebarTrigger className="rounded-md border border-[#556970]/25 bg-white text-[#0D1520] dark:border-white/10 dark:bg-white/5 dark:text-white" /><span className="font-display text-xl font-bold">Admin centre</span></div><main className="min-h-screen p-4 sm:p-7 lg:p-9">{children}</main></SidebarInset></>;
}
