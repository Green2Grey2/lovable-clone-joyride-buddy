
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { UserStatsProvider } from "@/contexts/UserStatsContext";
import { UserPreferencesProvider } from "@/hooks/useUserPreferences";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UserActivityTracker } from "@/components/UserActivityTracker";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingState } from "@/components/ui/loading-state";

// Eager load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

// Lazy load secondary pages
const Profile = lazy(() => import("./pages/Profile"));
const Activity = lazy(() => import("./pages/Activity"));
const ActiveActivity = lazy(() => import("./pages/ActiveActivity"));
const Awards = lazy(() => import("./pages/Awards"));
const Admin = lazy(() => import("./pages/Admin"));
const Manager = lazy(() => import("./pages/Manager"));
const Media = lazy(() => import("./pages/Media"));
const Editorial = lazy(() => import("./pages/Editorial"));
const SocialAdmin = lazy(() => import("./pages/SocialAdmin"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <UserPreferencesProvider>
              <UserActivityTracker />
              <UserStatsProvider>
                <AppProvider>
                <ErrorBoundary>
                  {/* Skip link for accessibility */}
                  <a 
                    href="#main-content" 
                    className="skip-link"
                    onClick={(e) => {
                      e.preventDefault();
                      const main = document.getElementById('main-content');
                      if (main) {
                        main.focus();
                        main.scrollIntoView();
                      }
                    }}
                  >
                    Skip to main content
                  </a>
                  <Toaster />
                  <BrowserRouter>
                    <Suspense fallback={<LoadingState />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/activity"
                          element={
                            <ProtectedRoute>
                              <Activity />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/active-activity"
                          element={
                            <ProtectedRoute>
                              <ActiveActivity />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/awards"
                          element={
                            <ProtectedRoute>
                              <Awards />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute>
                              <Admin />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/manager"
                          element={
                            <ProtectedRoute>
                              <Manager />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/media"
                          element={
                            <ProtectedRoute>
                              <Media />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/editorial"
                          element={
                            <ProtectedRoute>
                              <Editorial />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/social-admin"
                          element={
                            <ProtectedRoute>
                              <SocialAdmin />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/analytics"
                          element={
                            <ProtectedRoute>
                              <Analytics />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </BrowserRouter>
                </ErrorBoundary>
                </AppProvider>
              </UserStatsProvider>
            </UserPreferencesProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('Critical error in App component:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Application Error</h1>
          <p className="text-gray-600">Please check the browser console for details</p>
        </div>
      </div>
    );
  }
};

export default App;
