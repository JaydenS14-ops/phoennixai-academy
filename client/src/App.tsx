import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CourseCatalog from "./pages/CourseCatalog";
import Intake from "./pages/Intake";
import Admin from "./pages/Admin";
import RiseToCapital from "./pages/RiseToCapital";
import Curriculum from "./pages/Curriculum";
import InMotion from "./pages/InMotion";
import { trpc } from "./lib/trpc";
import { useAcademyAnalytics } from "./hooks/useAcademyAnalytics";
import { useLocation } from "wouter";

function PublicRouteTracker() {
  const [location] = useLocation();
  const pageView = trpc.academy.trackPageView.useMutation();
  const { track } = useAcademyAnalytics();
  useEffect(() => {
    if (location === "/admin") return;
    const key = "phoennixai-visitor"; const visitorKey = sessionStorage.getItem(key) ?? crypto.randomUUID(); sessionStorage.setItem(key, visitorKey);
    pageView.mutate({ path: location, visitorKey });
    track("page_view", { path: location });
  }, [location]);
  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <><PublicRouteTracker /><Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/courses"} component={CourseCatalog} />
      <Route path={"/apply"} component={Intake} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/rise-to-capital"} component={RiseToCapital} />
      <Route path={"/curriculum"} component={Curriculum} />
      <Route path={"/in-motion"} component={InMotion} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch></>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
