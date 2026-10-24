import MainNavbar from "@/components/MainNavbar";
import { Link } from "react-router-dom";
import { FileCheck2, ArrowLeft, Scale, AlertTriangle, ShieldAlert, Cpu, CreditCard, Award } from "lucide-react";

export default function Terms() {
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
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Master Service Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            AIMIKO Terms of Service
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: October 2026 | Enterprise &amp; Consumer Terms
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-purple-600" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing, registering an account, or interacting with any services provided by the AIMIKO Platform (including AIMIKO Buddy, AIMIKO Works, AIMIKO Pulse, AIMIKO Commerce, AIMIKO Mobility, AIMIKO Learn, and MIKO Master Agent), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access the services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-600" /> 2. Nature of Generative AI Output &amp; Disclaimers
            </h2>
            <p>
              AIMIKO incorporates state-of-the-art multi-agent intelligence models. You acknowledge and understand:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Probabilistic Computation:</strong> AI responses, generated code blueprints, lesson plans, business forecasts, and resume feedback are generated probabilistically. Users should verify critical outputs before production execution.</li>
              <li><strong>Non-Professional Advice:</strong> AIMIKO does not provide certified legal, medical, accounting, or licensed financial advisory services. All outputs serve educational and intelligence-augmentation purposes.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" /> 3. Intellectual Property &amp; Content Ownership
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li><strong>Your Content:</strong> You retain full intellectual property ownership of all input prompts, custom code, business plans, scripts, and original artifacts generated through your account on AIMIKO.</li>
              <li><strong>Platform Rights:</strong> All core proprietary algorithms, interface designs, agent frameworks, and brand assets remain the exclusive intellectual property of AIMIKO.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-600" /> 4. Prohibited Uses &amp; Safety Policy
            </h2>
            <p>Users agree never to employ AIMIKO services to:</p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
              <li>Generate malicious code, exploit vectors, phishing campaigns, or weaponized surveillance materials.</li>
              <li>Harass, threaten, defame, or infringe on the privacy or intellectual property rights of any party.</li>
              <li>Attempt to reverse-engineer, decompile, scrape, or perform denial-of-service attacks against platform endpoints.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-purple-600" /> 5. Billing, Subscriptions &amp; Cancellations
            </h2>
            <p>
              Subscription charges for premium tiers (Pro, Campus Enterprise) are billed on a recurring monthly or annual basis via authenticated payment gateways. You may cancel your subscription at any time through your Profile Billing Portal. Cancellation takes effect at the conclusion of your current paid billing period.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-purple-600" /> 6. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted under governing law, AIMIKO and its affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from platform downtime, loss of data, or reliance on AI-generated materials.
            </p>
          </section>

          <section className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">7. Governing Law &amp; Legal Notices</h2>
            <p>
              These terms are governed by the laws of India and applicable international digital commerce frameworks. For formal legal notices or enterprise Master Service Agreements (MSAs), reach out to{" "}
              <a href="mailto:legal@aimiko.ai" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                legal@aimiko.ai
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
