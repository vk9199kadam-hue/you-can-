import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import SuperAdminDashboard from "./components/dashboards/SuperAdminDashboard";
import AcademyHeadDashboard from "./components/dashboards/AcademyHeadDashboard";
import TeacherDashboard from "./components/dashboards/TeacherDashboard";
import StudentDashboard from "./components/dashboards/StudentDashboard";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1E40AF] inline-flex items-center justify-center font-extrabold text-xl text-white mb-4 animate-pulse">
            Y
          </div>
          <p className="text-[#6B7280] text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  switch (user.role) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "academy_head":
      return <AcademyHeadDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      return <LoginPage />;
  }
}

export default App;
