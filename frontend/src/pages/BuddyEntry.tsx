import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAimiko } from "@/context/AimikoContext";
import { AimikoAvatar } from "@/components/AimikoAvatar";

export default function BuddyEntry() {
  const navigate = useNavigate();
  const { role, ageGroup, resetAllData } = useAimiko();

  useEffect(() => {
    const token = localStorage.getItem("aimiko_token");

    if (!token) {
      // Unauthenticated visitor -> must create account or log in
      navigate("/login?redirect=/age-select", { replace: true });
      return;
    }

    // Validate token against backend to ensure user exists in DB
    fetch("/api/v1/auth/me", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Session expired or user deleted");
        }
        return res.json();
      })
      .then((user) => {
        if (!user || !user.email) {
          throw new Error("Invalid user");
        }
        // Valid user in DB -> check onboarding steps
        if (!ageGroup) {
          navigate("/age-select", { replace: true });
        } else if (!role) {
          navigate("/role-select", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      })
      .catch(() => {
        // Token was deleted from DB -> clean sweep and force sign up / log in
        localStorage.removeItem("aimiko_token");
        localStorage.removeItem("aimiko_user");
        resetAllData();
        navigate("/login?redirect=/age-select", { replace: true });
      });
  }, [navigate, role, ageGroup, resetAllData]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
      <AimikoAvatar size="lg" animate />
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground">Opening AIMIKO Buddy...</p>
        <p className="text-xs text-muted-foreground">Preparing your personalized companion workspace</p>
      </div>
    </div>
  );
}
