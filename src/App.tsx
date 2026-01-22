import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TelegramAuthProvider } from "./contexts/TelegramAuthContext";
import { useAuthStore } from "./store/authStore";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { GroupModalProvider } from "@/providers/GroupModalProvider";

// Layouts
import DashboardLayout from "./components/layouts/DashboardLayout";

// Auth pages
import RoleSelection from "./pages/auth/RoleSelection";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import Calendar from "./pages/teacher/Calendar";
import TeacherGroups from "./pages/teacher/TeacherGroups";
import TeacherAnswers from "./pages/teacher/TeacherAnswers";
import TeacherTasks from "./pages/teacher/TeacherTasks";
import AddTask from "./pages/teacher/AddTask";
import GroupDetails from "./pages/teacher/GroupDetails";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentTasks from "./pages/student/StudentTasks";
import StudentGroups from "./pages/student/StudentGroups";
import StudentGroupTasks from "./pages/student/StudentGroupTasks";
import StudentCalendar from "./pages/student/StudentCalendar";
import StudentGrades from "./pages/student/StudentGrades";

// Shared pages
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({
  children,
  allowedRoles = [],
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, role, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/role-selection" />;
  }

  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to={role === "teacher" ? "/teacher-dashboard" : "/student-dashboard"}
      />
    );
  }

  return <>{children}</>;
};

const App = () => (
  <ThemeProvider>
    <GroupModalProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <TelegramAuthProvider>
              <Toaster />
              <Sonner />

              <Routes>
                {/* Root - Redirect to role selection */}
                <Route path="/" element={<Navigate to="/role-selection" replace />} />
                
                {/* Role Selection (Telegram Auth Entry Point) */}
                <Route path="/role-selection" element={<RoleSelection />} />

                {/* Teacher Dashboard Routes */}
                <Route
                  path="/teacher-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["teacher"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<TeacherDashboard />} />
                  <Route path="groups" element={<TeacherGroups />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="answers" element={<TeacherAnswers />} />
                  <Route path="tasks" element={<TeacherTasks />} />
                  <Route path="tasks/add" element={<AddTask />} />
                  <Route path="groups/:groupId" element={<GroupDetails />} />
                </Route>

              
                <Route
                  path="/student-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StudentDashboard />} />
                  <Route path="tasks" element={<StudentTasks />} />
                  <Route path="groups" element={<StudentGroups />} />
                  <Route path="calendar" element={<StudentCalendar />} />
                  <Route path="grades" element={<StudentGrades />} />
                  <Route
                    path="groups/:groupId"
                    element={<StudentGroupTasks />}
                  />
                </Route>

                {/* Shared Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Profile />} />
                </Route>

                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </TelegramAuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GroupModalProvider>
  </ThemeProvider>
);

export default App;
