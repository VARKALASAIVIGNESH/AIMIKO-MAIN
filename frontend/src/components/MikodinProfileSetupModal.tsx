import { useState, useEffect } from "react";
import { useAimiko } from "@/context/AimikoContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  User,
  Briefcase,
  Building2,
  MapPin,
  FileText,
  Tag,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

interface MikodinProfileSetupModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
}

export default function MikodinProfileSetupModal({
  isOpen,
  onSuccess,
  onClose,
}: MikodinProfileSetupModalProps) {
  const { toast } = useToast();
  const { userName, role, setUserName } = useAimiko();

  const [fullName, setFullName] = useState(userName || "");
  const [headline, setHeadline] = useState("");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-load existing details from localStorage or user session
  useEffect(() => {
    if (isOpen) {
      try {
        const storedUser = localStorage.getItem("aimiko_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.full_name) setFullName(parsed.full_name);
          if (parsed.headline) setHeadline(parsed.headline);
          if (parsed.school_or_company) setOrganization(parsed.school_or_company);
          if (parsed.location) setLocation(parsed.location);
          if (parsed.bio) setBio(parsed.bio);
          if (parsed.skills) setSkills(parsed.skills);
          if (parsed.mikodin_terms_accepted) setTermsAccepted(true);
        }
      } catch (e) {
        console.warn("Parse user for mikodin", e);
      }

      const localHeadline = localStorage.getItem("aimiko_mikodin_headline");
      if (localHeadline) setHeadline(localHeadline);
      const localOrg = localStorage.getItem("aimiko_student_school");
      if (localOrg && !organization) setOrganization(localOrg);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !headline.trim()) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter your Full Name and Professional Headline.",
        variant: "destructive",
      });
      return;
    }

    if (!termsAccepted) {
      toast({
        title: "Terms Agreement Required",
        description: "You must accept the MIKODIN Community Guidelines & Terms to enter.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("aimiko_token");
      if (token) {
        const res = await fetch("http://127.0.0.1:8000/api/v1/auth/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: fullName.trim(),
            headline: headline.trim(),
            school_or_company: organization.trim(),
            location: location.trim(),
            bio: bio.trim(),
            skills: skills.trim(),
            mikodin_terms_accepted: true,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            localStorage.setItem("aimiko_user", JSON.stringify(data.user));
          }
        }
      }

      // Local persistence
      setUserName(fullName.trim());
      localStorage.setItem("aimiko_mikodin_headline", headline.trim());
      localStorage.setItem("aimiko_mikodin_profile_completed", "true");
      if (organization.trim()) localStorage.setItem("aimiko_student_school", organization.trim());
      if (skills.trim()) localStorage.setItem("aimiko_student_subjects", skills.trim());

      toast({
        title: "MIKODIN Profile Created!",
        description: "Welcome to MIKODIN. Your professional peer profile is now live.",
      });

      onSuccess();
    } catch (err: any) {
      toast({
        title: "Profile Save Error",
        description: err.message || "Could not complete MIKODIN setup. Please retry.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 shadow-2xl">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white font-black text-[11px] tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>MIKODIN Professional Network</span>
            </div>
            <DialogTitle className="text-xl font-black text-white">
              Set Up Your MIKODIN Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-purple-100 max-w-md">
              Connect with fellow builders, showcase verified milestones, and share autonomous AI agents.
            </DialogDescription>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Full Name & Headline */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-purple-600" /> Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5 text-purple-600" /> Professional / Academic Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Student & AI Builder | High School Class of '26 | Python & Math"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-purple-600" /> School or Organization
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-purple-600" /> Location / Region
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-purple-600" /> Key Skills & Domains
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Python, Calculus, Agent Prompting, Robotics, Research"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-purple-600" /> About You / Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief description of what you're studying, building, or passionate about..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* MIKODIN Community Guidelines & Terms Box */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-purple-950 dark:text-purple-200 text-[11px]">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <span>MIKODIN Community Guidelines & Code of Conduct</span>
            </div>
            <div className="max-h-24 overflow-y-auto text-[10.5px] text-slate-600 dark:text-slate-300 space-y-1 pr-2 leading-relaxed">
              <p>• <strong>1. Authentic Representation:</strong> Provide accurate academic and professional details.</p>
              <p>• <strong>2. Zero Harassment & Spam:</strong> Respectful, constructive interactions only. Zero spam or commercial solicitations.</p>
              <p>• <strong>3. Responsible AI Sharing:</strong> Workflows and prompts must not contain malicious code, exploits, or private personal data.</p>
              <p>• <strong>4. Intellectual Property:</strong> You own your original creations, code snippets, and posts.</p>
            </div>

            <label className="flex items-start gap-2 pt-1 cursor-pointer select-none border-t border-purple-200/60 dark:border-purple-800/40">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
              />
              <span className="text-[11px] text-slate-800 dark:text-slate-200 font-semibold leading-snug">
                I agree to the MIKODIN Community Guidelines & Terms of Service.
              </span>
            </label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !termsAccepted || !fullName.trim() || !headline.trim()}
            className={`w-full h-11 rounded-xl font-bold text-xs shadow-md transition-all ${
              !termsAccepted || !fullName.trim() || !headline.trim()
                ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20 cursor-pointer"
            }`}
          >
            {isSubmitting ? "Saving Profile..." : "Complete Profile & Enter MIKODIN"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
