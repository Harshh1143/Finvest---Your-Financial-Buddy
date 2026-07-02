import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { LoansPage } from "./pages/LoansPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Toaster } from "sonner";
function App() {
    return (<>
      <Toaster position="top-right" theme="dark" richColors closeButton/>
      <BrowserRouter>
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
        </Routes>
      </BrowserRouter>
    </>);
}
export default App;
