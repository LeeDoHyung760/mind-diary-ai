import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layouts/AppShell";
import LoginPage from "./pages/LoginPage";
import CounselingPage from "./pages/CounselingPage";
import GamePage from "./pages/GamePage";
import OnboardingPage from "./pages/OnboardingPage";
import SocialCallbackPage from "./pages/SocialCallbackPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/auth/:provider/callback" element={<SocialCallbackPage />} />
      <Route element={<AppShell />}>
        <Route path="/counseling" element={<CounselingPage />} />
        <Route path="/analysis" element={<GamePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/game" element={<Navigate to="/analysis" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
