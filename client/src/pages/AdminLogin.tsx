import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_RETURN_LABEL, ADMIN_PUBLIC_HOME_PATH } from "@/lib/adminNavigation";
import { trpc } from "@/lib/trpc";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const status = trpc.admin.status.useQuery();
  const catalog = trpc.academy.catalog.useQuery();
  const supportEmail = catalog.data?.content.footer_email ?? "info@phoennixai.com";
  const login = trpc.admin.login.useMutation({
    onSuccess: async () => {
      await status.refetch();
      toast.success("Admin session started.");
      setLocation(ADMIN_HOME_PATH);
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (status.data?.authenticated) setLocation(ADMIN_HOME_PATH);
  }, [setLocation, status.data?.authenticated]);

  return <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0D1520] px-4 text-white">
    <div className="brand-grid absolute inset-0 opacity-40" />
    <div aria-hidden="true" className="absolute h-80 w-80 rounded-full bg-[#ABA944]/15 blur-[100px]" />
    <form onSubmit={event => { event.preventDefault(); login.mutate({ username, password }); }} className="relative w-full max-w-md rounded-lg border border-white/12 bg-white/6 p-7 shadow-2xl backdrop-blur-xl sm:p-9">
      <div className="grid h-12 w-12 place-items-center rounded-md bg-[#ABA944] text-[#1F2426]"><KeyRound className="h-6 w-6" /></div>
      <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.16em] text-[#C9C877]">Restricted area</p>
      <h1 className="mt-3 font-display text-5xl font-bold leading-none tracking-wide">Admin Management Centre</h1>
      <p className="mt-4 font-body leading-7 text-[#EFF0EA]">Use your private administrator credentials to manage programmes, events, archive moments, public copy, and enquiries.</p>
      <div className="mt-7 space-y-4">
        <div><Label htmlFor="adminUsername" className="font-body text-[#EFF0EA]">Username</Label><Input id="adminUsername" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} className="mt-2 border-white/15 bg-white/8 text-white" /></div>
        <div><Label htmlFor="adminPassword" className="font-body text-[#EFF0EA]">Password</Label><div className="relative mt-2"><Input id="adminPassword" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="border-white/15 bg-white/8 pr-12 text-white" /><button type="button" onClick={() => setShowPassword(current => !current)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-[#C5F0FF] hover:text-[#C9C877]">{showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}</button></div></div>
      </div>
      <Button type="submit" disabled={login.isPending} className="mt-7 w-full rounded-md bg-[#ABA944] font-mono text-[10px] uppercase tracking-[0.1em] text-[#1F2426] hover:bg-[#C9C877]">{login.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in securely"}</Button>
      <Link href={ADMIN_PUBLIC_HOME_PATH} className="mt-5 block text-center font-body text-sm text-[#C5F0FF] transition-colors hover:text-[#C9C877] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42B4E7]/70">← {ADMIN_LOGIN_RETURN_LABEL}</Link>
      <a href={`mailto:${supportEmail}?subject=Admin%20access%20support`} className="mt-3 block text-center font-body text-xs text-[#D0DEE1] transition-colors hover:text-[#C9C877] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#42B4E7]/70">Need help signing in? Contact support</a>
    </form>
  </div>;
}
