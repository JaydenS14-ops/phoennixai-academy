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
import { BarChart3, FileText, GraduationCap, LogOut } from "lucide-react";
import { Button } from "./ui/button";

const menuItems = [
  { icon: BarChart3, label: "Overview", key: "overview" },
  { icon: GraduationCap, label: "Course management", key: "courses" },
  { icon: FileText, label: "Site content", key: "content" },
];

export default function DashboardLayout({
  children,
  activeSection = "overview",
  onSectionChange,
  onSignOut,
}: {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  onSignOut?: () => void;
}) {
  return (
    <SidebarProvider defaultOpen>
      <DashboardLayoutContent activeSection={activeSection} onSectionChange={onSectionChange} onSignOut={onSignOut}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange?: (section: string) => void;
  onSignOut?: () => void;
};

function DashboardLayoutContent({
  children,
  activeSection,
  onSectionChange,
  onSignOut,
}: DashboardLayoutContentProps) {
  return (
    <>
      <Sidebar className="border-r border-white/10 bg-[#090d1b] text-white">
        <SidebarHeader className="px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-600 font-black text-slate-950">P</div>
            <div className="leading-tight"><p className="text-sm font-bold">PhoennixAI</p><p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Admin centre</p></div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 pt-4">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Management</p>
          <SidebarMenu>
            {menuItems.map(item => <SidebarMenuItem key={item.key}><SidebarMenuButton isActive={activeSection === item.key} onClick={() => onSectionChange?.(item.key)} className="h-11 text-slate-300 hover:bg-white/8 hover:text-white data-[active=true]:bg-cyan-400/12 data-[active=true]:text-cyan-200"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-3"><Button variant="ghost" onClick={onSignOut} className="w-full justify-start text-slate-300 hover:bg-white/8 hover:text-white"><LogOut className="mr-2 h-4 w-4" />Sign out</Button></SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-[#f5f7fb] dark:bg-[#0a0f1e]">
        <div className="sticky top-0 z-30 flex h-13 items-center gap-3 border-b border-slate-200/70 bg-[#f5f7fb]/90 px-4 backdrop-blur dark:border-white/8 dark:bg-[#0a0f1e]/90 lg:hidden">
          <SidebarTrigger className="rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5" />
          <span className="text-sm font-semibold">Admin centre</span>
        </div>
        <main className="min-h-screen p-4 sm:p-7 lg:p-9">{children}</main>
      </SidebarInset>
    </>
  );
}
