import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import Admin from "@/pages/Admin";
import { trpc } from "@/lib/trpc";
import { ADMIN_LOGIN_PATH } from "@/lib/adminNavigation";

export default function AdminAccessGate() {
  const [, setLocation] = useLocation();
  const status = trpc.admin.status.useQuery();

  useEffect(() => {
    if (!status.isLoading && !status.data?.authenticated) setLocation(ADMIN_LOGIN_PATH);
  }, [setLocation, status.data?.authenticated, status.isLoading]);

  if (!status.data?.authenticated) return <div className="grid min-h-screen place-items-center bg-[#0D1520]"><Loader2 className="h-7 w-7 animate-spin text-[#C9C877]" /></div>;
  return <Admin />;
}
