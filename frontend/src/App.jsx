import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "sonner";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

// Lazy loaded page components
const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage").then((m) => ({ default: m.PortfolioPage })));
const LoansPage = lazy(() => import("./pages/LoansPage").then((m) => ({ default: m.LoansPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));

function App() {
    return (<>
      <Toaster position="top-right" theme="dark" richColors closeButton/>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<HomePage />}/>
              <Route path="/dashboard" element={<ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>}/>
              <Route path="/portfolio" element={<ProtectedRoute>
                    <PortfolioPage />
                  </ProtectedRoute>}/>
              <Route path="/loans" element={<ProtectedRoute>
                    <LoansPage />
                  </ProtectedRoute>}/>
              <Route path="/profile" element={<ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>}/>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </>);
}
export default App;

