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
import { BarChart3, CalendarDays, FileText, GraduationCap, LogOut } from "lucide-react";
import { Button } from "./ui/button";

const menuItems = [
  { icon: BarChart3, label: "Overview", key: "overview" },
  { icon: GraduationCap, label: "Course management", key: "courses" },
  { icon: CalendarDays, label: "Luma events", key: "events" },
  { icon: FileText, label: "Site content", key: "content" },
];

export default function DashboardLayout({ children, activeSection = "overview", onSectionChange, onSignOut }: { children: React.ReactNode; activeSection?: string; onSectionChange?: (section: string) => void; onSignOut?: () => void; }) {
  return <SidebarProvider defaultOpen><DashboardLayoutContent activeSection={activeSection} onSectionChange={onSectionChange} onSignOut={onSignOut}>{children}</DashboardLayoutContent></SidebarProvider>;
}

function DashboardLayoutContent({ children, activeSection, onSectionChange, onSignOut }: { children: React.ReactNode; activeSection: string; onSectionChange?: (section: string) => void; onSignOut?: () => void; }) {
  return <><Sidebar className="border-r border-white/10 bg-[#0D1520] text-[#F7F6F2]"><SidebarHeader className="px-4 py-5"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full border border-[#ABA944]/50 bg-[#0D1520] font-display text-2xl font-bold text-[#C9C877]">P</div><div className="leading-tight"><p className="font-display text-xl font-bold tracking-wide">Phoenn<span className="text-[#ABA944]">ix</span>AI</p><p className="font-mono text-[8px] uppercase tracking-[0.13em] text-white/45">Admin centre</p></div></div></SidebarHeader><SidebarContent className="px-3 pt-4"><p className="px-2 pb-2 font-mono text-[8px] uppercase tracking-[0.16em] text-white/35">Management</p><SidebarMenu>{menuItems.map(item => <SidebarMenuItem key={item.key}><SidebarMenuButton isActive={activeSection === item.key} onClick={() => onSectionChange?.(item.key)} className="h-11 font-body text-[#EFF0EA] hover:bg-white/8 hover:text-white data-[active=true]:bg-[#ABA944]/15 data-[active=true]:text-[#C9C877]"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="p-3"><Button variant="ghost" onClick={onSignOut} className="w-full justify-start font-body text-[#EFF0EA] hover:bg-white/8 hover:text-white"><LogOut className="mr-2 h-4 w-4" />Sign out</Button></SidebarFooter></Sidebar><SidebarInset className="bg-[#F7F6F2] dark:bg-[#0D1520]"><div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#556970]/15 bg-[#F7F6F2]/92 px-4 backdrop-blur dark:border-white/8 dark:bg-[#0D1520]/92 lg:hidden"><SidebarTrigger className="rounded-md border border-[#556970]/20 bg-white dark:border-white/10 dark:bg-white/5" /><span className="font-display text-xl font-bold">Admin centre</span></div><main className="min-h-screen p-4 sm:p-7 lg:p-9">{children}</main></SidebarInset></>;
}
