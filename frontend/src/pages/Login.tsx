import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAimiko } from "@/context/AimikoContext";
import { Button } from "@/components/ui/button";
import MainNavbar from "@/components/MainNavbar";
import {
  ArrowRight,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("redirect") || searchParams.get("returnTo") || "/age-select";
  const { setUserName, setRole } = useAimiko();
  const { toast } = useToast();

  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email / Password Form Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (authMode === "signup" && !fullName.trim()) return;

    // RULE 1: Must accept Terms & Privacy before creating an account
    if (authMode === "signup" && !termsAccepted) {
      toast({
        title: "Terms & Privacy Agreement Required",
        description: "Please check the box to agree to AIMIKO's Terms of Service and Privacy Policy before creating your account.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = authMode === "signup" ? "/api/v1/auth/register" : "/api/v1/auth/login";
      const payload =
        authMode === "signup"
          ? {
              email: email.trim().toLowerCase(),
              password,
              full_name: fullName.trim(),
              role: "student",
              terms_accepted: termsAccepted
            }
          : { email: email.trim().toLowerCase(), password };

      let res: Response;
      try {
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch {
        res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        setUserName(data.user.full_name || email.split("@")[0]);
        if (authMode === "signin") {
          setRole(data.user.role as any);
        } else {
          setRole(null);
        }
        if (data.token) {
          localStorage.setItem("aimiko_token", data.token);
          localStorage.setItem("aimiko_user", JSON.stringify(data.user));
        }

        toast({
          title: authMode === "signup" ? "Account Created Successfully" : "Signed In Successfully",
          description: `Welcome, ${data.user.full_name || email}!`
        });
        navigate(returnTo);
      } else {
        const errData = await res.json().catch(() => null);
        if (authMode === "signin") {
          toast({
            title: "Sign In Blocked",
            description: errData?.detail || "No account found with this email. Please create an account first.",
            variant: "destructive"
          });
          setAuthMode("signup");
          return;
        }

        toast({
          title: "Registration Error",
          description: errData?.detail || "Unable to complete registration. Please try again.",
          variant: "destructive"
        });
      }
    } catch {
      if (authMode === "signin") {
        toast({
          title: "Account Required",
          description: "No account found with this email. Please create an account first.",
          variant: "destructive"
        });
        setAuthMode("signup");
        return;
      }

      toast({
        title: "Registration Notice",
        description: "Please check your network connection and retry.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Authenticate Google OAuth Token
  const processGoogleOAuthToken = async (accessToken: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch real user profile directly from Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!userInfoRes.ok) {
        throw new Error("Unable to fetch user profile from Google");
      }

      const googleProfile = await userInfoRes.json();
      const googleEmail = googleProfile.email;
      const googleName = googleProfile.name || googleEmail.split("@")[0];
      const googleSub = googleProfile.sub;
      const googlePicture = googleProfile.picture;

      // 2. Synchronize with AIMIKO Backend
      try {
        const backendRes = await fetch("http://127.0.0.1:8000/api/v1/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            google_id: googleSub,
            email: googleEmail,
            full_name: googleName,
            avatar_url: googlePicture || "",
            role: "student",
            mode: authMode,
            terms_accepted: termsAccepted
          })
        });

        if (backendRes.ok) {
          const data = await backendRes.json();
          setUserName(data.user.full_name);
          if (authMode === "signin") {
            setRole(data.user.role as any);
          } else {
            setRole(null);
          }
          if (data.token) {
            localStorage.setItem("aimiko_token", data.token);
            localStorage.setItem("aimiko_user", JSON.stringify(data.user));
          }

          toast({
            title: authMode === "signup" ? "Account Created with Google" : "Signed In with Google",
            description: `Welcome, ${data.user.full_name || googleEmail}!`
          });
          navigate(returnTo);
          return;
        } else {
          const errData = await backendRes.json().catch(() => null);
          const detail = errData?.detail;

          // RULE 2: If signin mode and no account exists in DB, BLOCK signin and switch to signup
          if (backendRes.status === 404 && authMode === "signin") {
            toast({
              title: "No Account Found",
              description: detail || `No AIMIKO account found for ${googleEmail}. Please create an account first.`,
              variant: "destructive"
            });
            setAuthMode("signup");
            setIsLoading(false);
            return;
          }

          // RULE 1: If signup mode and terms not accepted, block
          if (authMode === "signup" && !termsAccepted) {
            toast({
              title: "Terms & Privacy Agreement Required",
              description: "You must check the agreement box before creating an account.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }

          toast({
            title: "Authentication Blocked",
            description: detail || "Unable to complete Google authentication.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      } catch (syncErr: any) {
        console.error("Backend auth sync error:", syncErr);
        toast({
          title: "Connection Error",
          description: "Could not reach the AIMIKO authentication server. Please check your connection and retry.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
    } catch (err: any) {
      toast({
        title: "Google Authentication Failed",
        description: err.message || "Failed to complete Google OAuth",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Launch Google OAuth 2.0 Popup
  const launchGoogleOAuthPopup = (clientIdToUse: string) => {
    if (!window.google?.accounts?.oauth2) {
      toast({
        title: "Google SDK Loading",
        description: "Google Identity Services is initializing. Please retry in 1 second.",
        variant: "destructive"
      });
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientIdToUse,
        scope: "openid email profile",
        callback: (response: any) => {
          if (response.error) {
            toast({
              title: "Google OAuth Canceled or Failed",
              description: response.error_description || response.error,
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
          if (response.access_token) {
            processGoogleOAuthToken(response.access_token);
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (err: any) {
      toast({
        title: "Invalid Google Client ID",
        description: err.message || "Please check your Google OAuth credentials.",
        variant: "destructive"
      });
    }
  };

  // 1-Click Continue with Google OAuth 2.0
  const handleGoogleAuth = () => {
    // RULE 1: If signing up, must check terms box first!
    if (authMode === "signup" && !termsAccepted) {
      toast({
        title: "Terms & Privacy Agreement Required",
        description: "Please check the box below to agree to AIMIKO's Terms of Service and Privacy Policy before creating your account with Google.",
        variant: "destructive"
      });
      return;
    }

    const configuredClientId = (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "964507826893-cfpjsj4hvkvfsmhc2v0e2mk86gj7gvki.apps.googleusercontent.com"
    ).trim();

    launchGoogleOAuthPopup(configuredClientId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 relative">
      <MainNavbar />

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 relative z-10">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/5 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
              {authMode === "signup" ? "Create your AIMIKO account" : "Sign in to AIMIKO"}
            </h1>
            <p className="text-xs text-slate-500">
              Access your personal AI companion, workforce agents, and study workspaces.
            </p>
          </div>

          {/* Mode Switcher Tabs: Create Account First */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signin")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                authMode === "signin"
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Mandatory Terms & Privacy Agreement (Sign Up Only) */}
          {authMode === "signup" && (
            <div
              onClick={() => setTermsAccepted(!termsAccepted)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                termsAccepted
                  ? "bg-purple-50/70 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800"
                  : "bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/50 shadow-xs"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="terms-accepted-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                />
                <div className="space-y-1">
                  <span className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                    I agree to AIMIKO&apos;s{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-purple-700 dark:text-purple-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      Terms of Service
                      <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-purple-700 dark:text-purple-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      Privacy Policy
                      <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                    </Link>
                    .
                  </span>
                  <p
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      termsAccepted
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {termsAccepted ? (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> Agreement accepted. Ready to create account.
                      </>
                    ) : (
                      "Required: You must accept before creating an account."
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Official Google Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full h-11 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
          >
            {/* Standard Official Google Multi-Color G Icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {isLoading
                ? "Connecting to Google..."
                : authMode === "signup"
                ? "Create Account with Google"
                : "Sign In with Google"}
            </span>
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
            {authMode === "signup" && (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com or .edu"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {authMode === "signup" && !termsAccepted && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center font-medium">
                Please check the agreement box above to enable account creation.
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading || (authMode === "signup" && !termsAccepted)}
              className={`w-full h-11 rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all ${
                authMode === "signup" && !termsAccepted
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20"
              }`}
            >
              {isLoading
                ? "Connecting..."
                : authMode === "signin"
                ? "Sign in to AIMIKO"
                : "Create Account & Get Started"}
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
