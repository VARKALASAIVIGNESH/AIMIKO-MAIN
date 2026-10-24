import MainNavbar from "@/components/MainNavbar";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, EyeOff, FileText, ArrowLeft, Database, UserCheck, AlertCircle } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <MainNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to AIMIKO Home
        </Link>

        {/* Header */}
        <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Enterprise Privacy Framework</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            AIMIKO Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">
            Effective Date: October 2026 | Governing Global AIMIKO Intelligence Ecosystem
          </p>
        </div>

        {/* Executive Commitment Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 border border-purple-200/80 dark:border-purple-800/60 space-y-3">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
            <EyeOff className="h-4 w-4" />
            <span>Zero Public Model Training Guarantee</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            AIMIKO treats all user inputs, companion dialogs, uploaded documents, research inquiries, and workspace data as strictly confidential. Your private data is <strong>never used to train foundational public LLM models</strong> without explicit, enterprise-level opt-in consent.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-600" /> 1. Information We Collect
            </h2>
            <p>We collect information strictly necessary to provide intelligent, role-adapted services across AIMIKO products:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Account Credentials:</strong> Full name, verified email address, Google OAuth profile identifier, avatar image.</li>
              <li><strong>Workspace Context:</strong> Selected role tag (Student, Creator, Developer, Job Seeker, Founder, Educator), age bracket (Kids, Teens, College, Adults, Seniors), learning paths, and project blueprints.</li>
              <li><strong>Operational Telemetry:</strong> Anonymized usage events, latency metrics, IP address, and browser session diagnostics to defend platform infrastructure against unauthorized abuse.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-600" /> 2. Data Protection &amp; Encryption Standards
            </h2>
            <p>
              AIMIKO incorporates bank-grade safeguards:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>In-Transit:</strong> All data exchanged between your browser, our application servers, and AI execution clusters is encrypted via TLS 1.3 / HTTPS.</li>
              <li><strong>At-Rest:</strong> Database storage volumes and uploaded documents are encrypted using AES-256 standard encryption.</li>
              <li><strong>Authentication Isolation:</strong> Session tokens utilize signed JSON Web Tokens (JWT) with HTTP-only security flags.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" /> 3. Third-Party AI Subprocessors
            </h2>
            <p>
              To execute deep generative queries and high-speed inferences, AIMIKO securely interfaces with vetted API subprocessors under strict enterprise data protection agreements:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Inference Engines:</strong> Google Gemini API, Groq LPU Inferences, Ollama Local Clusters.</li>
              <li><strong>Identity &amp; Cloud Infrastructure:</strong> Google Cloud Platform (GCP) Identity Services, Supabase PostgreSQL, AWS.</li>
              <li><strong>Payment Processors:</strong> Razorpay and Stripe (PCI-DSS Level 1 Compliant). We never store raw credit card numbers.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-600" /> 4. Your Rights &amp; Data Control (GDPR / DPDP)
            </h2>
            <p>
              You maintain total ownership of your personal information. Under global privacy statutes, you hold the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Export Your Data:</strong> Download conversation histories, saved notes, and project deliverables.</li>
              <li><strong>Right to Erasure (Be Forgotten):</strong> Request permanent deletion of your profile, account records, and stored workspace files.</li>
              <li><strong>Revoke Permissions:</strong> Disconnect Google OAuth tokens directly through your Google Account security dashboard at any time.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-purple-600" /> 5. Protection of Learners &amp; Minors
            </h2>
            <p>
              AIMIKO features specialized safety controls for minors (Kids and Teens brackets). In these modes, the AI model enforces strict ethical filtering, blocks inappropriate topics, and complies with applicable parental oversight standards (COPPA / FERPA alignment).
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">6. Contact Data Privacy Officer</h2>
            <p>
              For privacy inquiries, audit records, or deletion requests, contact our security council at{" "}
              <a href="mailto:privacy@aimiko.ai" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                privacy@aimiko.ai
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
