import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CourseCatalog from "./pages/CourseCatalog";
import Intake from "./pages/Intake";
import AdminAccessGate from "./components/AdminAccessGate";
import AdminLogin from "./pages/AdminLogin";
import RiseToCapital from "./pages/RiseToCapital";
import Curriculum from "./pages/Curriculum";
import InMotion from "./pages/InMotion";
import Booking from "./pages/Booking";
import { trpc } from "./lib/trpc";
import { useAcademyAnalytics } from "./hooks/useAcademyAnalytics";
import AcademyFooter from "./components/AcademyFooter";
import CommunityHighlights from "./components/CommunityHighlights";
import { ADMIN_LOGIN_PATH } from "./lib/adminNavigation";
import { isAdminShortcut } from "./lib/adminShortcut";

function AdminShortcut() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isAdminShortcut(event)) return;
      event.preventDefault();
      setLocation(ADMIN_LOGIN_PATH);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setLocation]);
  return null;
}

function PublicRouteTracker() {
  const [location] = useLocation();
  const pageView = trpc.academy.trackPageView.useMutation();
  const { track } = useAcademyAnalytics();
  useEffect(() => {
    if (location.startsWith("/admin")) return;
    const key = "phoennixai-visitor";
    const visitorKey = sessionStorage.getItem(key) ?? crypto.randomUUID();
    sessionStorage.setItem(key, visitorKey);
    pageView.mutate({ path: location, visitorKey });
    track("page_view", { path: location });
  }, [location]);
  return null;
}

function HomeWithCommunityHighlights() {
  const { data } = trpc.academy.catalog.useQuery(undefined, { refetchInterval: 15000 });
  return <><Home /><CommunityHighlights testimonials={data?.testimonials ?? []} /></>;
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");
  return <><AdminShortcut /><PublicRouteTracker /><div className={isAdminRoute ? undefined : "academy-public-shell"}><Switch>
    <Route path="/" component={HomeWithCommunityHighlights} />
    <Route path="/courses" component={CourseCatalog} />
    <Route path="/apply" component={Intake} />
    <Route path="/book" component={Booking} />
    <Route path="/admin/login" component={AdminLogin} />
    <Route path="/admin" component={AdminAccessGate} />
    <Route path="/rise-to-capital" component={RiseToCapital} />
    <Route path="/curriculum" component={Curriculum} />
    <Route path="/in-motion" component={InMotion} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch></div>{isAdminRoute ? null : <AcademyFooter />}</>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light" switchable><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
