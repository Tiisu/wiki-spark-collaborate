import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleBasedRouter } from "@/components/auth/RoleBasedRouter";
import { AdminProtectedRoute, InstructorProtectedRoute, StudentProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StudentDashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import WikipediaEditorPage from "./pages/WikipediaEditorPage";
import CourseViewer from "./pages/CourseViewer";
import VideoTutorials from "./pages/VideoTutorials";
import QuizDemo from "./pages/QuizDemo";
import CourseBrowser from "./pages/CourseBrowser";
import QuizPage from "./pages/QuizPage";
import Achievements from "./pages/Achievements";
import Certificates from "./pages/Certificates";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              {/* Role-based dashboard routing */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <RoleBasedRouter />
                  </ProtectedRoute>
                }
              />

              {/* Student Dashboard */}
              <Route
                path="/student"
                element={
                  <StudentProtectedRoute>
                    <StudentDashboard />
                  </StudentProtectedRoute>
                }
              />

              {/* Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />

              {/* Instructor Dashboard */}
              <Route
                path="/instructor"
                element={
                  <InstructorProtectedRoute>
                    <InstructorDashboard />
                  </InstructorProtectedRoute>
                }
              />
              <Route
                path="/editor/:mode/:articleTitle?"
                element={
                  <ProtectedRoute>
                    <WikipediaEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editor/:mode/:articleTitle/lesson/:lessonId"
                element={
                  <ProtectedRoute>
                    <WikipediaEditorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course/:courseId"
                element={
                  <ProtectedRoute>
                    <CourseViewer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <CourseBrowser />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tutorials"
                element={
                  <ProtectedRoute>
                    <VideoTutorials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz-demo"
                element={
                  <ProtectedRoute>
                    <QuizDemo />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quiz/:quizId"
                element={
                  <ProtectedRoute>
                    <QuizPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/achievements"
                element={
                  <ProtectedRoute>
                    <Achievements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/certificates"
                element={
                  <ProtectedRoute>
                    <Certificates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/certificates/course/:courseId"
                element={
                  <ProtectedRoute>
                    <Certificates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/verify/:verificationCode"
                element={<Certificates />}
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
