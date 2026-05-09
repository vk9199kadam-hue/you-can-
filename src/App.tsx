import { useAuth } from "./contexts/AuthContext";
import { IS_AUTH_BYPASS } from "./config/devAuth";
import LoginPage from "./components/LoginPage";
import SuperAdminDashboard from "./components/dashboards/SuperAdminDashboard";
import AcademyHeadDashboard from "./components/dashboards/AcademyHeadDashboard";
import TeacherDashboard from "./components/dashboards/TeacherDashboard";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import AcademySelection from "./components/AcademySelection";
import { BrandMark } from "./ui/layout/AppShell";

function App() {
  const { user, loading } = useAuth();

  if (loading && !IS_AUTH_BYPASS) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex mb-4 animate-pulse">
            <BrandMark />
          </div>
          <p className="text-text-dim text-sm font-medium">Loading...</p>
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
      // If student hasn't joined an academy yet, show selection screen
      if (!user.academyId) {
        return (
          <div className="min-h-screen bg-bg p-6">
            <AcademySelection 
              onComplete={async (academyId, profile) => {
                const { updateUserProfile } = await import("./firebase/firestore");
                await updateUserProfile(user.uid, { ...profile, academyId, status: "active" });
                window.location.reload();
              }} 
            />
          </div>
        );
      }
      return <StudentDashboard />;
    default:
      return <LoginPage />;
  }
}

export default App;
