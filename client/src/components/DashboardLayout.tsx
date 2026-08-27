import { Link } from "wouter";
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
import { useState } from "react";
import { BarChart3, CalendarDays, FileText, GraduationCap, ImagePlus, LayoutDashboard, Loader2, LogOut, Trash2, Upload } from "lucide-react";
import { Button } from "./ui/button";
import AcademyAnalytics from "./AcademyAnalytics";
import AnalyticsReset from "./AnalyticsReset";
import { ADMIN_PUBLIC_HOME_PATH } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { broadcastAcademyRefresh } from "@/hooks/useLiveCatalog";

const PHOENIX_LOGO = "/manus-storage/phoennixai-phoenix-logo_7d43347d.jpg";
const menuItems = [
  { icon: LayoutDashboard, label: "Overview", key: "overview" },
  { icon: BarChart3, label: "Analytics", key: "analytics" },
  { icon: GraduationCap, label: "Course management", key: "courses" },
  { icon: CalendarDays, label: "Luma events", key: "events" },
  { icon: ImagePlus, label: "In Motion archive", key: "archive" },
  { icon: FileText, label: "Site content", key: "content" },
];

export default function DashboardLayout({ children, activeSection = "overview", onSectionChange, onSignOut }: { children: React.ReactNode; activeSection?: string; onSectionChange?: (section: string) => void; onSignOut?: () => void; }) {
  const workspace = activeSection === "analytics" ? <><AcademyAnalytics pathways={["Product Design (UI/UX)", "Software Computing", "Gaming & Graphics Design", "Content Creation & Social Media", "Digital Marketing", "AI Automation", "Multi-Discipline Hybrid Bundle", "Family Bundle", "Rise to Capital", "Work Experience with PhoennixAI Agency", "Agency Apprenticeship"]} /><AnalyticsReset /></> : <>{children}{activeSection === "courses" ? <ProgrammeImageManager /> : null}</>;
  return <SidebarProvider defaultOpen><DashboardLayoutContent activeSection={activeSection} onSectionChange={onSectionChange} onSignOut={onSignOut}>{workspace}</DashboardLayoutContent></SidebarProvider>;
}

function ProgrammeImageManager() {
  const utils = trpc.useUtils();
  const { data } = trpc.academy.catalog.useQuery();
  const [files, setFiles] = useState<Record<number, File | null>>({});
  const refresh = async () => { await utils.academy.catalog.invalidate(); broadcastAcademyRefresh(); };
  const upload = trpc.academy.admin.updateCourseImage.useMutation({ onSuccess: async () => { await refresh(); toast.success("Programme image updated."); }, onError: error => toast.error(error.message) });
  const clear = trpc.academy.admin.clearCourseImage.useMutation({ onSuccess: async () => { await refresh(); toast.success("Programme image reverted to the curated default."); }, onError: error => toast.error(error.message) });
  const handleUpload = async (courseId: number) => {
    const file = files[courseId];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4_500_000) { toast.error("Choose a JPEG, PNG, or WebP image up to 4 MB."); return; }
    const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Image could not be read.")); reader.readAsDataURL(file); });
    upload.mutate({ id: courseId, fileName: file.name, imageBase64: dataUrl.split(",")[1] ?? "", imageMimeType: file.type as "image/jpeg" | "image/png" | "image/webp" });
  };
  const courses = data?.courses ?? [];
  if (!courses.length) return null;
  return <section className="mx-auto mt-8 max-w-6xl rounded-lg border border-[#42B4E7]/24 bg-[#42B4E7]/[0.05] p-6"><div className="flex items-start gap-3"><ImagePlus className="mt-1 h-5 w-5 shrink-0 text-[#1688B8]" /><div><p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#8A8835]">Programme imagery</p><h2 className="mt-2 font-display text-3xl font-bold tracking-wide">Control public programme images.</h2><p className="mt-2 max-w-3xl font-body leading-6 text-muted-foreground">Upload an approved JPEG, PNG, or WebP image for any programme. Revert at any time to restore its curated default visual.</p></div></div><div className="mt-6 grid gap-4 lg:grid-cols-2">{courses.map(course => <article key={course.id} className="rounded-lg border border-[#556970]/18 bg-white p-4 shadow-sm dark:bg-white/[0.045]"><div className="flex gap-4"><div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-[#142833]"><img src={course.imageUrl ?? "/manus-storage/phoennixai-programmes-hero_fa26707c.jpg"} alt="" className="h-full w-full object-cover" /></div><div className="min-w-0"><p className="font-mono text-[9px] uppercase tracking-[.12em] text-[#8A8835]">{course.imageUrl ? "Custom image active" : "Curated default active"}</p><h3 className="mt-2 font-display text-2xl font-bold tracking-wide">{course.title}</h3></div></div><label className="mt-4 block font-body text-sm">Replace image<input aria-label={`Upload image for ${course.title}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setFiles(current => ({ ...current, [course.id]: event.target.files?.[0] ?? null }))} className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#556970] file:px-3 file:py-2 file:font-body file:text-white hover:file:bg-[#3E4F55]" /></label><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" disabled={!files[course.id] || upload.isPending} onClick={() => handleUpload(course.id)} className="bg-[#556970] hover:bg-[#3E4F55]">{upload.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Upload className="mr-1.5 h-3.5 w-3.5" />}Upload override</Button>{course.imageUrl ? <Button size="sm" variant="outline" disabled={clear.isPending} onClick={() => clear.mutate({ id: course.id })}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Use curated default</Button> : null}</div></article>)}</div></section>;
}

function DashboardLayoutContent({ children, activeSection, onSectionChange, onSignOut }: { children: React.ReactNode; activeSection: string; onSectionChange?: (section: string) => void; onSignOut?: () => void; }) {
  const status = trpc.admin.status.useQuery();
  const latestSignIn = status.data?.latestSignIn ? new Date(status.data.latestSignIn) : null;
  return <><Sidebar className="!border-r !border-[#42B4E7]/18 !bg-[#0D1520] !text-[#F7F6F2] [&_[data-sidebar=sidebar]]:!bg-[#0D1520] [&_[data-sidebar=sidebar]]:!text-[#F7F6F2]"><SidebarHeader className="border-b border-white/12 px-4 py-5"><Link href={ADMIN_PUBLIC_HOME_PATH} aria-label="Return to PhoennixAI Academy homepage" className="group flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42B4E7]/70"><span className="grid h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#42B4E7]/70 bg-[#0D1520] shadow-[0_0_0_3px_rgba(66,180,231,.08)] transition-transform duration-200 group-hover:scale-105"><img src={PHOENIX_LOGO} alt="PhoennixAI phoenix" className="h-full w-full scale-[1.35] object-cover object-[50%_28%]" /></span><span className="min-w-0 leading-tight"><span className="block font-display text-2xl font-bold tracking-wide text-[#F7F6F2]">Phoenn<span className="text-[#42B4E7]">ix</span>AI</span><span className="mt-1 block font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-[#D1E8EF]">Admin centre</span></span></Link></SidebarHeader><SidebarContent className="px-3 py-5"><p className="px-2 pb-3 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A8E6FF]">Management</p><SidebarMenu>{menuItems.map(item => <SidebarMenuItem key={item.key}><SidebarMenuButton isActive={activeSection === item.key} onClick={() => onSectionChange?.(item.key)} className="h-12 !text-[#DDEFF4] hover:!bg-[#42B4E7]/16 hover:!text-white data-[active=true]:!bg-[#42B4E7]/22 data-[active=true]:!text-[#C5F0FF] [&_svg]:!text-[#A8E6FF]"><item.icon className="h-4 w-4" /><span className="font-body text-[15px] font-medium">{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarContent><SidebarFooter className="border-t border-white/12 p-3"><div className="mb-3 rounded-md border border-white/10 bg-white/[0.04] p-3"><p className="font-mono text-[8px] uppercase tracking-[.12em] text-[#A8E6FF]">Last secure sign-in</p><time dateTime={latestSignIn?.toISOString()} className="mt-1 block font-body text-xs leading-5 text-[#DDEFF4]">{latestSignIn ? latestSignIn.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Recorded after your next sign-in"}</time></div><Button variant="ghost" onClick={onSignOut} className="w-full justify-start !text-[#DDEFF4] hover:!bg-[#42B4E7]/16 hover:!text-white"><LogOut className="mr-2 h-4 w-4 text-[#A8E6FF]" />Sign out securely</Button></SidebarFooter></Sidebar><SidebarInset className="bg-[#F7F6F2] dark:bg-[#0D1520]"><div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#556970]/15 bg-[#F7F6F2]/92 px-4 backdrop-blur dark:border-white/8 dark:bg-[#0D1520]/92 lg:hidden"><SidebarTrigger className="rounded-md border border-[#556970]/25 bg-white text-[#0D1520] dark:border-white/10 dark:bg-white/5 dark:text-white" /><span className="font-display text-xl font-bold">Admin centre</span></div><main className="min-h-screen p-4 sm:p-7 lg:p-9">{children}</main></SidebarInset></>;
}
