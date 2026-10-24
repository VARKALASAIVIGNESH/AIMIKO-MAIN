import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import {
  PhoneCall,
  Phone,
  PhoneOutgoing,
  MessageSquare,
  FileText,
  Layers,
  Search,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Calendar,
  Code2,
  Mail,
  Play,
  RotateCcw,
  BarChart3,
  TrendingUp,
  Volume2,
  Mic,
  MicOff,
  Copy,
  Check,
  Upload,
  Globe,
  ChevronRight,
  Download,
  Building2,
  Briefcase,
  Users,
  Target,
  FileSpreadsheet,
  AlertTriangle,
  Smartphone,
  Send,
  Database,
  ArrowRight,
  CreditCard,
  Lock,
  Key,
  Terminal,
  Sliders,
  X,
  ExternalLink,
  Clock,
  Activity,
  CheckCircle,
  Server,
  Workflow,
  HelpCircle,
  BookOpen
} from "lucide-react";

// ── THE TOP 25 HIGHEST-DEMAND EVERYDAY AI SERVICES WITH SINGLE-AGENT PRICING ──
export interface AIService {
  id: number;
  name: string;
  category: "voice" | "sales" | "marketing" | "operations" | "finance" | "industry";
  categoryLabel: string;
  description: string;
  deliveryTime: string;
  badge?: string;
  popular?: boolean;
  monthlyPrice: number; // Single Agent Monthly Price in INR
  unitQuota: string;
  setupTime: string;
  integrationType: string;
  features: string[];
}

export const TOP_25_SERVICES: AIService[] = [
  // 1. Voice, Phone & Chat
  {
    id: 1,
    name: "AI Voice Receptionist",
    category: "voice",
    categoryLabel: "Voice and Phone",
    description: "Answers incoming business phone calls 24/7, resolves customer queries, and books appointments directly into your calendar.",
    deliveryTime: "Instant Real-Time",
    popular: true,
    badge: "Flagship",
    monthlyPrice: 1499,
    unitQuota: "500 Inbound Minutes / month",
    setupTime: "60 Seconds",
    integrationType: "VoIP SIP Trunk and Virtual Phone Number",
    features: ["24/7 Call Answering", "Calendar Auto-Booking", "SMS and WhatsApp Confirmation", "Custom Voice Scripting"]
  },
  {
    id: 2,
    name: "AI Outbound Calling Agent",
    category: "voice",
    categoryLabel: "Voice and Phone",
    description: "Autonomous voice agent for customer lead follow-ups, payment reminders, and customer verification calls.",
    deliveryTime: "Under 2 sec connect",
    popular: true,
    monthlyPrice: 1899,
    unitQuota: "1,000 Outbound Connects / month",
    setupTime: "3 Minutes",
    integrationType: "REST API and Telephony Gateway",
    features: ["Dynamic Script Branching", "Sentiment Classification", "CRM Call Log Sync", "Automated Retry Logic"]
  },
  {
    id: 3,
    name: "AI Omnichannel Support Inbox",
    category: "voice",
    categoryLabel: "Voice and Phone",
    description: "Unified live chat, email, and social inbox answering 80% of customer questions automatically with human handoff.",
    deliveryTime: "Instant 24/7",
    badge: "Zero Wait",
    monthlyPrice: 1299,
    unitQuota: "5,000 Resolved Tickets / month",
    setupTime: "2 Minutes",
    integrationType: "Web Widget and REST Webhook",
    features: ["Live Chat and Email Sync", "Automated FAQ Resolution", "Smart Agent Handoff", "CSAT Rating Analytics"]
  },
  {
    id: 4,
    name: "AI WhatsApp Business Assistant",
    category: "voice",
    categoryLabel: "Voice and Phone",
    description: "Enterprise WhatsApp bot handling catalog queries, cart recovery notifications, and customer support tickets.",
    deliveryTime: "Real-time API",
    popular: true,
    monthlyPrice: 1499,
    unitQuota: "Unlimited WhatsApp Messages",
    setupTime: "Instant QR Link",
    integrationType: "WhatsApp Cloud API",
    features: ["Interactive Catalog Cards", "Payment Link Dispatch", "Abandoned Cart Recovery", "Automated Order Tracking"]
  },
  {
    id: 5,
    name: "AI Appointment and Meeting Scheduler",
    category: "voice",
    categoryLabel: "Voice and Phone",
    description: "Conversational schedule coordinator that checks Google and Outlook calendars and books confirmed client slots.",
    deliveryTime: "Instant Sync",
    monthlyPrice: 799,
    unitQuota: "Unlimited Bookings / month",
    setupTime: "1 Minute",
    integrationType: "Google and Outlook Calendar Sync",
    features: ["Conflict-Free Slot Picker", "Custom Booking Links", "Automated Reminders", "Timezone Normalization"]
  },
  {
    id: 6,
    name: "AI Website Assistant and Knowledge Bot",
    category: "voice",
    categoryLabel: "Voice and Phone",
    description: "Embeddable website widget answering customer questions accurately using your uploaded company documentation.",
    deliveryTime: "1-Click Embed",
    monthlyPrice: 999,
    unitQuota: "10,000 Visitor Queries / month",
    setupTime: "1-Click Script",
    integrationType: "JavaScript Embed Tag",
    features: ["100% Grounded Answers", "Custom Brand Colors", "Lead Capture Form", "Source Citation Links"]
  },

  // 2. Sales & Lead Generation
  {
    id: 7,
    name: "AI B2B Lead Generation Engine",
    category: "sales",
    categoryLabel: "Sales and Leads",
    description: "Discovers verified business leads, verified decision-maker emails, and direct phone numbers in your target industry.",
    deliveryTime: "Batch CSV / CRM",
    popular: true,
    monthlyPrice: 1699,
    unitQuota: "2,500 Verified Decision-Maker Contacts / month",
    setupTime: "Instant Query",
    integrationType: "CSV Export and CRM Webhook",
    features: ["98.7% Email Deliverability", "Direct Phone Numbers", "Industry and Geo Filters", "CRM Auto-Sync"]
  },
  {
    id: 8,
    name: "AI Cold Email Outreach Writer",
    category: "sales",
    categoryLabel: "Sales and Leads",
    description: "Generates high-converting 5-stage personalized cold outreach sequences with high deliverability scoring.",
    deliveryTime: "Instant Drafter",
    monthlyPrice: 899,
    unitQuota: "Unlimited Email Sequences / month",
    setupTime: "Instant",
    integrationType: "Native Sequence Exporter",
    features: ["Spam-Filter Pre-Check", "Personalized Icebreakers", "Multi-Stage Follow-Ups", "A/B Subject Testing"]
  },
  {
    id: 9,
    name: "AI Sales Pipeline and CRM Manager",
    category: "sales",
    categoryLabel: "Sales and Leads",
    description: "Visual deal tracker that auto-logs emails, tracks pipeline stages, and prompts high-priority follow-ups.",
    deliveryTime: "Live Sync",
    monthlyPrice: 1199,
    unitQuota: "Unlimited Deals and Contacts",
    setupTime: "2 Minutes",
    integrationType: "REST API and Cloud Database",
    features: ["Visual Kanban Pipeline", "Automated Stage Advancement", "Revenue Forecasting", "Email Thread Tracking"]
  },
  {
    id: 10,
    name: "AI Client Proposal and SOW Generator",
    category: "sales",
    categoryLabel: "Sales and Leads",
    description: "Creates branded client proposals, deliverables tables, and scope-of-work agreements in seconds.",
    deliveryTime: "Instant PDF",
    monthlyPrice: 799,
    unitQuota: "Unlimited Proposals / month",
    setupTime: "Instant",
    integrationType: "PDF Exporter and Web Link",
    features: ["Standard Legal Clauses", "Milestone Payment Tables", "Custom Logo Branding", "E-Signature Ready"]
  },
  {
    id: 11,
    name: "AI Automated Lead Qualification",
    category: "sales",
    categoryLabel: "Sales and Leads",
    description: "Scores inbound website leads on budget, authority, and timeline before assigning to your sales team.",
    deliveryTime: "Real-time Score",
    monthlyPrice: 899,
    unitQuota: "5,000 Inbound Submissions / month",
    setupTime: "Webhook Setup",
    integrationType: "Web Form Webhook",
    features: ["Budget Authority Need Scoring", "Instant Routing Logic", "Sales Alert Dispatch", "Spam Submission Filter"]
  },

  // 3. Marketing & Content
  {
    id: 12,
    name: "AI Social Media Auto-Poster",
    category: "marketing",
    categoryLabel: "Marketing and Media",
    description: "Writes and auto-schedules viral posts across LinkedIn, X (Twitter), and Instagram simultaneously.",
    deliveryTime: "Multi-Platform",
    popular: true,
    badge: "Growth Pick",
    monthlyPrice: 999,
    unitQuota: "300 Scheduled Posts / month",
    setupTime: "OAuth Connect",
    integrationType: "Direct Social OAuth",
    features: ["Cross-Platform Formatting", "Optimal Time Recommender", "Hashtag Optimizer", "Analytics Dashboard"]
  },
  {
    id: 13,
    name: "AI Instant Website Builder",
    category: "marketing",
    categoryLabel: "Marketing and Media",
    description: "Generates complete high-converting landing pages with hero copy, services, and lead forms from 1 prompt.",
    deliveryTime: "Instant Preview",
    popular: true,
    badge: "Flagship",
    monthlyPrice: 1199,
    unitQuota: "Unlimited Hosted Landing Pages",
    setupTime: "Instant Deployment",
    integrationType: "Custom Domain and HTML Export",
    features: ["Responsive Mobile Layout", "Built-In Lead Capture", "SEO Meta Tags Included", "Clean Tailwind/CSS Output"]
  },
  {
    id: 14,
    name: "AI High-CTR Ad Copy Generator",
    category: "marketing",
    categoryLabel: "Marketing and Media",
    description: "Drafts high-converting headlines and copy for Google, Meta, and LinkedIn Ads with A/B variations.",
    deliveryTime: "3 Variations",
    badge: "Flagship",
    monthlyPrice: 799,
    unitQuota: "Unlimited Ad Campaigns",
    setupTime: "Instant",
    integrationType: "Ad Manager Direct Export",
    features: ["Meta and Google Ad Formats", "Predicted CTR Scores", "Character Limit Enforcer", "A/B Testing Variants"]
  },
  {
    id: 15,
    name: "AI SEO Content and Keyword Crawler",
    category: "marketing",
    categoryLabel: "Marketing and Media",
    description: "Researches ranking competitor keywords and writes comprehensive, rankable SEO articles.",
    deliveryTime: "Full Brief and Article",
    monthlyPrice: 1299,
    unitQuota: "50 In-Depth SEO Articles / month",
    setupTime: "Instant Query",
    integrationType: "CMS API (WordPress/Ghost/Custom)",
    features: ["Keyword Difficulty Metric", "Competitor Gap Analysis", "Structured Schema Markup", "Plagiarism Pre-Check"]
  },
  {
    id: 16,
    name: "AI Review and Reputation Manager",
    category: "marketing",
    categoryLabel: "Marketing and Media",
    description: "Monitors Google and customer reviews and drafts professional, empathetic responses.",
    deliveryTime: "Instant Draft",
    monthlyPrice: 799,
    unitQuota: "1,000 Reviews Monitored / month",
    setupTime: "Google Profile Link",
    integrationType: "Google Business API",
    features: ["Negative Review Mitigation", "1-Click Response Publish", "Sentiment Tracking", "Escalation Alerts"]
  },

  // 4. Documents & OCR
  {
    id: 17,
    name: "AI Document and Receipt OCR Extractor",
    category: "operations",
    categoryLabel: "Documents and OCR",
    description: "Scans physical bills, contracts, and IDs and extracts structured, editable text and numbers.",
    deliveryTime: "Under 3 seconds",
    popular: true,
    monthlyPrice: 999,
    unitQuota: "2,500 Scanned Pages / month",
    setupTime: "API Endpoint",
    integrationType: "REST OCR Endpoint",
    features: ["99.8% Precision Extraction", "PDF and Image Support", "JSON / CSV Output", "ERP Pre-Formatting"]
  },
  {
    id: 18,
    name: "AI Invoice and Tax Parser",
    category: "operations",
    categoryLabel: "Documents and OCR",
    description: "Parses vendor invoices, line items, GST numbers, and tax totals into clean accounting spreadsheets.",
    deliveryTime: "99.8% Precision",
    popular: true,
    badge: "Flagship",
    monthlyPrice: 1199,
    unitQuota: "1,500 Invoices / month",
    setupTime: "API and Webhook",
    integrationType: "Tally / Zoho / Excel Connector",
    features: ["GSTIN Verification", "Line-Item Mathematical Check", "CGST/SGST/IGST Breakdown", "One-Click Excel Download"]
  },
  {
    id: 19,
    name: "AI Audio Transcriber and Minutes Writer",
    category: "operations",
    categoryLabel: "Documents and OCR",
    description: "Listens to meetings or call recordings, generates clean transcripts, and summarizes action items.",
    deliveryTime: "Sub-Second Neural",
    monthlyPrice: 899,
    unitQuota: "50 Hours Audio / month",
    setupTime: "Direct Upload",
    integrationType: "Audio Stream and File API",
    features: ["Speaker Diarization", "Action Item Extractor", "Executive Summary", "Noise Cancellation"]
  },
  {
    id: 20,
    name: "AI Multi-App Workflow Automator",
    category: "operations",
    categoryLabel: "Documents and OCR",
    description: "Visual node-based pipeline connecting your email, CRM, spreadsheets, and forms with zero coding.",
    deliveryTime: "200+ Integrations",
    monthlyPrice: 1499,
    unitQuota: "250,000 Automated Task Runs / month",
    setupTime: "Visual Canvas",
    integrationType: "Webhooks and REST Connectors",
    features: ["Visual Flow Builder", "Conditional Logic Branches", "Error Retry Safeguards", "200+ Native Connectors"]
  },

  // 5. Finance & HR
  {
    id: 21,
    name: "AI Private Company Knowledge Base (RAG)",
    category: "finance",
    categoryLabel: "Finance and HR",
    description: "Answers staff questions directly from your internal company SOPs, employee handbooks, and PDFs.",
    deliveryTime: "Zero Hallucination",
    monthlyPrice: 1799,
    unitQuota: "Unlimited Staff Queries",
    setupTime: "Upload Documents",
    integrationType: "Slack / Teams / Web Bot",
    features: ["Strict Document Grounding", "Page Citation Footnotes", "Role-Based Access Control", "End-to-End Encryption"]
  },
  {
    id: 22,
    name: "AI Candidate Resume Matcher (ATS)",
    category: "finance",
    categoryLabel: "Finance and HR",
    description: "Screens and ranks candidate resumes against your job descriptions to identify the top 5% candidates.",
    deliveryTime: "Instant Ranking",
    popular: true,
    monthlyPrice: 1499,
    unitQuota: "1,000 Resumes Processed / month",
    setupTime: "Instant Upload",
    integrationType: "ATS Webhook and Portal",
    features: ["Percentage Fit Scoring", "Skill Gap Highlighting", "Interview Questions Suggestion", "Unbiased Evaluation"]
  },
  {
    id: 23,
    name: "AI Contract and Legal Agreement Auditor",
    category: "finance",
    categoryLabel: "Finance and HR",
    description: "Flags non-standard indemnity clauses, termination penalties, and liability risks in vendor NDAs.",
    deliveryTime: "Redline Audit",
    monthlyPrice: 1899,
    unitQuota: "100 Full Contract Audits / month",
    setupTime: "PDF / Docx Upload",
    integrationType: "Document Upload API",
    features: ["Liability Risk Detection", "Clause Redline Suggestions", "Standard NDA Benchmark", "Executive Summary"]
  },
  {
    id: 24,
    name: "AI Plain-English Data Analyst (Text-to-SQL)",
    category: "finance",
    categoryLabel: "Finance and HR",
    description: "Ask questions about your business in plain English and get instant SQL results and visual charts.",
    deliveryTime: "Instant Query",
    monthlyPrice: 1699,
    unitQuota: "Unlimited Database Queries",
    setupTime: "Read-Only DB URI",
    integrationType: "PostgreSQL / MySQL / Snowflake",
    features: ["Natural Language to SQL", "Read-Only Security Sandbox", "Automatic Chart Generation", "Export to CSV"]
  },

  // 6. Executive & Concierge
  {
    id: 25,
    name: "AI Executive Chief of Staff",
    category: "industry",
    categoryLabel: "Executive and Concierge",
    description: "Your daily business assistant: triages incoming emails, filters calendar conflicts, and drafts priority digests.",
    deliveryTime: "24/7 Standby",
    badge: "VIP Agent",
    popular: true,
    monthlyPrice: 2499,
    unitQuota: "24/7 Dedicated Executive Assistant",
    setupTime: "Inbox and Calendar Auth",
    integrationType: "Executive Email and Calendar Suite",
    features: ["Morning Priority Digest", "Calendar Conflict Resolution", "Executive Draft Responses", "Urgent Alert Escalation"]
  }
];

// ── KID-SIMPLE INTEGRATION BLUEPRINTS FOR ALL 25 SERVICES ──
export interface IntegrationMethod {
  name: string;
  badge: string;
  difficulty: "Beginner (No-Code)" | "Business Tool" | "Developer API";
  summary: string;
  steps: {
    number: number;
    title: string;
    description: string;
    codeOrSnippet?: string;
    buttonLabel?: string;
  }[];
}

export interface AgentIntegrationGuide {
  agentId: number;
  kidExplanation: string;
  methods: IntegrationMethod[];
}

export const AGENT_INTEGRATIONS: Record<number, AgentIntegrationGuide> = {
  1: {
    agentId: 1,
    kidExplanation: "To let this AI answer your phone calls, simply dial a 4-digit code on your phone to forward unanswered calls. That is all. When someone calls you and you are busy, the AI receptionist politely picks up and talks to them.",
    methods: [
      {
        name: "Method 1: Mobile Call Forwarding (Easiest)",
        badge: "Recommended for Everyone",
        difficulty: "Beginner (No-Code)",
        summary: "Forward missed or busy phone calls from your Airtel, Jio, Vi, or landline phone directly to the AI.",
        steps: [
          { number: 1, title: "Open your phone dialer app", description: "On your mobile phone, open the dialer where you make regular calls." },
          { number: 2, title: "Dial the standard forwarding code", description: "Type the code below and press the Call button:", codeOrSnippet: "*67*9104048912300#" },
          { number: 3, title: "Test by calling your number", description: "Call your number from a friend's phone and decline the call. Your AI Receptionist will answer automatically in under 2 rings." }
        ]
      },
      {
        name: "Method 2: Google / Outlook Calendar Connect",
        badge: "Auto-Appointment Booking",
        difficulty: "Business Tool",
        summary: "Let the AI check your free hours and add booked appointments directly to your calendar.",
        steps: [
          { number: 1, title: "Click 'Connect Google Calendar'", description: "Authorize read/write calendar permissions in 1 click." },
          { number: 2, title: "Set your working hours", description: "Choose your open hours (e.g. Monday to Friday, 9:00 AM to 6:00 PM)." },
          { number: 3, title: "Automatic slot confirmation", description: "When callers ask for an appointment, the AI receptionist verifies your open slots and emails both of you an invite." }
        ]
      },
      {
        name: "Method 3: VoIP SIP Trunk (For PBX / Call Centers)",
        badge: "Telephony Engineers",
        difficulty: "Developer API",
        summary: "Route inbound calls from Twilio, Exotel, or FreePBX directly into our WebRTC voice pipeline.",
        steps: [
          { number: 1, title: "Set your SIP Termination URI", description: "Configure your PBX outbound route to point to:", codeOrSnippet: "sip:receptionist@sip.aimiko.works:5060" },
          { number: 2, title: "Authenticate with your API Key", description: "Include your AIMIKO bearer token in the SIP INVITE custom header.", codeOrSnippet: "X-Aimiko-Key: amk_live_voice_7749" },
          { number: 3, title: "Live audio handshake", description: "Streams G.711 / Opus audio with under 280ms neural latency." }
        ]
      }
    ]
  },
  2: {
    agentId: 2,
    kidExplanation: "Give the AI a list of names and phone numbers in an Excel file. The AI calls them one by one, talks to them politely, and writes down their answers in the spreadsheet for you.",
    methods: [
      {
        name: "Method 1: Upload Excel / CSV (No-Code)",
        badge: "Fastest Method",
        difficulty: "Beginner (No-Code)",
        summary: "Upload an Excel sheet with customer numbers. The AI starts calling right away.",
        steps: [
          { number: 1, title: "Prepare your simple Excel sheet", description: "Create 2 columns: Name and Phone Number (with +91 country code)." },
          { number: 2, title: "Drop your file on the dashboard", description: "Upload the sheet. Choose the goal: Payment Reminder or Lead Follow-up." },
          { number: 3, title: "Click Start Calling", description: "The agent dials each contact and saves call notes into a fresh downloaded Excel report." }
        ]
      },
      {
        name: "Method 2: Google Sheets Live Auto-Dialer",
        badge: "Automated Routine",
        difficulty: "Business Tool",
        summary: "Add a row in your Google Sheet; the AI automatically calls that customer within 30 seconds.",
        steps: [
          { number: 1, title: "Connect your Google Sheet", description: "Select your lead sheet from Google Drive." },
          { number: 2, title: "Add customer row", description: "Whenever you type a new phone number into column B, AIMIKO detects it instantly." },
          { number: 3, title: "Automatic call outcome", description: "The AI marks column C as 'Interested', 'Call Later', or 'Payment Confirmed'." }
        ]
      },
      {
        name: "Method 3: REST API Dispatch",
        badge: "Developers",
        difficulty: "Developer API",
        summary: "Trigger outbound autonomous phone calls programmatically from your backend.",
        steps: [
          { number: 1, title: "Send HTTP POST Request", description: "Call our outbound dispatch endpoint:", codeOrSnippet: "curl -X POST https://api.aimiko.works/v1/calls/dispatch \\\n  -H \"Authorization: Bearer YOUR_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"phone\": \"+919876543210\", \"name\": \"Vikram\", \"template\": \"renewal_followup\"}'" },
          { number: 2, title: "Listen for webhook outcome", description: "We send a webhook back to your server with call audio, duration, and sentiment analysis." }
        ]
      }
    ]
  },
  3: {
    agentId: 3,
    kidExplanation: "Paste a small 1-line code on your website. A friendly chat button appears at the bottom right. When visitors ask questions, the AI answers them in 1 second.",
    methods: [
      {
        name: "Method 1: 1-Line Website Embed Tag",
        badge: "Copy and Paste",
        difficulty: "Beginner (No-Code)",
        summary: "Add a floating customer support chat widget to any website, Shopify, or WordPress store.",
        steps: [
          { number: 1, title: "Copy this single line of code", description: "Copy this tag into your clipboard:", codeOrSnippet: "<script src=\"https://cdn.aimiko.works/inbox.js\" data-id=\"amk_inbox_03\"></script>" },
          { number: 2, title: "Paste before </body> in your website", description: "Paste it right before the closing </body> tag in your HTML, Shopify theme.liquid, or WordPress footer." },
          { number: 3, title: "Instant live chat", description: "Refresh your website. The chat bubble appears and starts resolving visitor questions 24/7." }
        ]
      },
      {
        name: "Method 2: Support Email Auto-Forwarding",
        badge: "Email Inbox",
        difficulty: "Business Tool",
        summary: "Forward customer support emails so the AI drafts or sends answers automatically.",
        steps: [
          { number: 1, title: "Open your Gmail or Outlook", description: "Go to Settings -> Forwarding and POP/IMAP." },
          { number: 2, title: "Add forwarding address", description: "Add: support-inbox@yourcompany.aimiko.works" },
          { number: 3, title: "Review or Auto-Send", description: "Customer emails receive instant, helpful resolutions within 2 seconds." }
        ]
      },
      {
        name: "Method 3: Unified Webhook Ingestion",
        badge: "Developers",
        difficulty: "Developer API",
        summary: "Send customer inquiries from any custom portal or mobile app.",
        steps: [
          { number: 1, title: "Send ticket payload", description: "POST ticket data to our unified inbox API:", codeOrSnippet: "curl -X POST https://api.aimiko.works/v1/tickets/create \\\n  -H \"Authorization: Bearer YOUR_API_KEY\" \\\n  -d '{\"userEmail\": \"customer@gmail.com\", \"message\": \"How do I reset my password?\"}'" },
          { number: 2, title: "Instant resolution returned", description: "Returns structured AI resolution and confidence score in JSON." }
        ]
      }
    ]
  },
  4: {
    agentId: 4,
    kidExplanation: "Scan a QR code on your computer screen using your WhatsApp Business phone app. Now, whenever a customer texts your business WhatsApp, the AI answers their questions and shares product links.",
    methods: [
      {
        name: "Method 1: Scan WhatsApp QR Code (1-Tap)",
        badge: "Takes 10 Seconds",
        difficulty: "Beginner (No-Code)",
        summary: "Link your existing business phone number just like using WhatsApp Web.",
        steps: [
          { number: 1, title: "Open WhatsApp Business on your phone", description: "Tap the 3 dots (or Settings on iPhone) and select 'Linked Devices'." },
          { number: 2, title: "Scan the AIMIKO QR code", description: "Tap 'Link a Device' and point your phone camera at your AIMIKO dashboard QR code." },
          { number: 3, title: "Bot is live", description: "Your WhatsApp bot is active. Send it a test text like 'Hello' to see instant automated responses." }
        ]
      },
      {
        name: "Method 2: Official Meta WhatsApp Cloud API",
        badge: "Enterprise Verified",
        difficulty: "Business Tool",
        summary: "Connect your official Meta Green Tick business account for high-volume messaging.",
        steps: [
          { number: 1, title: "Enter your Phone Number ID", description: "Copy your Phone Number ID from Meta Developer Portal." },
          { number: 2, title: "Paste your Access Token", description: "Paste your permanent system user token in AIMIKO settings." },
          { number: 3, title: "Official API active", description: "Send up to 100,000 messages daily with 100% official deliverability." }
        ]
      },
      {
        name: "Method 3: Inbound Message Webhook",
        badge: "Developers",
        difficulty: "Developer API",
        summary: "Receive incoming WhatsApp messages and dispatch custom interactive catalog buttons.",
        steps: [
          { number: 1, title: "Configure Webhook Endpoint", description: "Point your WhatsApp webhook to:", codeOrSnippet: "https://api.aimiko.works/v1/whatsapp/webhook" },
          { number: 2, title: "Verify Webhook Token", description: "Provide the verification secret: amk_wa_secret_2026" }
        ]
      }
    ]
  },
  13: {
    agentId: 13,
    kidExplanation: "Type what your business is about into a simple text box. The AI builds a complete website for you with pictures, services, and a contact form. You can use it right away on your own domain name.",
    methods: [
      {
        name: "Method 1: Instant Free Subdomain (1-Click)",
        badge: "Immediate Live URL",
        difficulty: "Beginner (No-Code)",
        summary: "Get a live website on the internet in 5 seconds with zero hosting setup.",
        steps: [
          { number: 1, title: "Type your business prompt", description: "e.g. 'Dental Clinic in Hyderabad with painless laser treatments and online appointment booking'." },
          { number: 2, title: "Click 'Generate Landing Page'", description: "The AI designs hero images, services cards, and lead capture form." },
          { number: 3, title: "Your site is live", description: "Share your instant link with customers:", codeOrSnippet: "https://yourclinic.aimiko.site" }
        ]
      },
      {
        name: "Method 2: Connect Your Custom Domain (www.yourcompany.com)",
        badge: "Custom Domain",
        difficulty: "Business Tool",
        summary: "Link your own domain name from GoDaddy, Namecheap, or Google Domains with free SSL.",
        steps: [
          { number: 1, title: "Open your GoDaddy or Namecheap DNS settings", description: "Go to Manage DNS for your domain name." },
          { number: 2, title: "Add 1 CNAME Record", description: "Point the host 'www' to:", codeOrSnippet: "sites.aimiko.works" },
          { number: 3, title: "Automatic SSL activation", description: "Your website opens securely on your own domain with the green lock icon in 10 minutes." }
        ]
      },
      {
        name: "Method 3: Download Clean HTML / CSS / React Code",
        badge: "Developers",
        difficulty: "Developer API",
        summary: "Download clean, semantic source code ready to host anywhere or edit in VS Code.",
        steps: [
          { number: 1, title: "Click 'Copy Code' or 'Download ZIP'", description: "Downloads clean React / Tailwind HTML with zero watermarks or bloat." },
          { number: 2, title: "Deploy to Vercel, Netlify or Cloudflare Pages", description: "Drag and drop the folder on Netlify for 100% free hosting." }
        ]
      }
    ]
  },
  18: {
    agentId: 18,
    kidExplanation: "Whenever a supplier sends you a bill or tax invoice, forward it to a dedicated email address or upload it. The AI reads all the product rows, taxes, and prices and puts them into an Excel spreadsheet for your accountant.",
    methods: [
      {
        name: "Method 1: Forward Bills to Dedicated Email (Easiest)",
        badge: "No Software Needed",
        difficulty: "Beginner (No-Code)",
        summary: "Forward supplier PDF bills from your inbox. The spreadsheet updates automatically.",
        steps: [
          { number: 1, title: "Get your business invoice email", description: "Your account receives a dedicated inbox address:", codeOrSnippet: "invoices@yourcompany.aimiko.works" },
          { number: 2, title: "Forward any PDF or photo invoice", description: "Whenever a vendor emails a bill, forward it to that address." },
          { number: 3, title: "Instant extraction", description: "The AI extracts vendor GSTIN, line-item totals, and 18% GST into your live Google Sheet." }
        ]
      },
      {
        name: "Method 2: Tally Prime & Zoho Books Excel Export",
        badge: "Accounting Ready",
        difficulty: "Business Tool",
        summary: "Download pre-formatted accounting spreadsheets matching Indian GST and Tally schema.",
        steps: [
          { number: 1, title: "Click 'Download Excel / CSV'", description: "Exports clean columns: Invoice No, Date, Vendor, GSTIN, HSN Code, Taxable Value, CGST, SGST." },
          { number: 2, title: "Import into Tally Prime or Zoho Books", description: "Select 'Import Vouchers' -> 'Excel'. All 100+ bills are entered without typing a single number." }
        ]
      },
      {
        name: "Method 3: REST OCR API Endpoint",
        badge: "Developers",
        difficulty: "Developer API",
        summary: "Send scanned PDFs directly to our neural OCR endpoint from your ERP software.",
        steps: [
          { number: 1, title: "POST document multipart form", description: "Send invoice to the OCR parser endpoint:", codeOrSnippet: "curl -X POST https://api.aimiko.works/v1/invoices/parse \\\n  -H \"Authorization: Bearer YOUR_API_KEY\" \\\n  -F \"file=@vendor_invoice.pdf\"" },
          { number: 2, title: "Receive structured JSON", description: "Returns verified items array, subtotal, and GST reconciliation mathematical checks." }
        ]
      }
    ]
  }
};

// Generic Fallback Blueprint for all other agents (kid-simple, 3 clear ways)
function getAgentIntegrationGuide(service: AIService): AgentIntegrationGuide {
  if (AGENT_INTEGRATIONS[service.id]) {
    return AGENT_INTEGRATIONS[service.id];
  }

  return {
    agentId: service.id,
    kidExplanation: `To use this ${service.name}, choose any of the 3 simple ways below. You can start with 1-click no-code setup without writing a single line of code.`,
    methods: [
      {
        name: "Way 1: 1-Click No-Code Setup (Easiest)",
        badge: "Recommended for Non-Technical Users",
        difficulty: "Beginner (No-Code)",
        summary: `Use the ${service.name} directly inside your browser or mobile phone with zero coding required.`,
        steps: [
          { number: 1, title: "Enter your task parameters", description: `In the input box on your dashboard, type the task you want the ${service.name} to perform.` },
          { number: 2, title: "Click 'Execute Agent Live'", description: "The agent processes your request using pre-configured machine learning pipelines." },
          { number: 3, title: "Copy or Download results", description: "Your structured output is ready in seconds. Click 'Copy Output' or download as Excel / CSV." }
        ]
      },
      {
        name: "Way 2: Connect Existing Business Apps",
        badge: "Standard Business Sync",
        difficulty: "Business Tool",
        summary: `Connect ${service.name} with your daily apps like Google Sheets, WhatsApp, Gmail, or Slack.`,
        steps: [
          { number: 1, title: "Select your preferred application", description: "Choose Google Workspace, Slack, WhatsApp, or Microsoft 365 from your integration settings." },
          { number: 2, title: "Authorize with 1-click login", description: "Grant secure read/write permission to your business account." },
          { number: 3, title: "Automated daily operation", description: `The ${service.name} runs in the background and posts results directly into your workflow.` }
        ]
      },
      {
        name: "Way 3: Developer REST API & Webhook",
        badge: "Developers & Engineers",
        difficulty: "Developer API",
        summary: `Trigger ${service.name} programmatically from your backend, CRM, or mobile application.`,
        steps: [
          { number: 1, title: "Send HTTP Request", description: "Call our authenticated API endpoint with your API key:", codeOrSnippet: `curl -X POST https://api.aimiko.works/v1/agents/${service.id}/execute \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"input": "Sample payload for ${service.name}"}'` },
          { number: 2, title: "Listen for real-time response", description: `Returns HTTP 200 OK with validated output payload in ${service.deliveryTime}.` }
        ]
      }
    ]
  };
}

// Presets & simulation payloads for all services
interface ServiceConfig {
  inputLabel: string;
  defaultInput: string;
  resultTitle: string;
  resultData: Record<string, any>;
  badges: string[];
}

const SERVICE_PRESETS: Record<number, ServiceConfig> = {
  2: {
    inputLabel: "Lead Name and Contact Number:",
    defaultInput: "Vikram Malhotra - +91 98765 43210 (Target: Payment Follow-up & Renewal)",
    resultTitle: "Autonomous Outbound Call Simulation Completed",
    resultData: {
      status: "Call Answered (Duration: 1m 42s)",
      sentiment: "Positive / Cooperative",
      transcriptSnippet: "AIMIKO: 'Good afternoon Vikram, calling from AIMIKO Enterprise regarding your annual SaaS renewal.' -> Vikram: 'Yes, please share the invoice link on WhatsApp.'",
      outcome: "Invoice payment link dispatched via WhatsApp. Follow-up scheduled for 5:00 PM IST."
    },
    badges: ["Telephony Connected", "VoIP Gateway Live", "Sentiment: 92% Positive"]
  },
  3: {
    inputLabel: "Customer Support Inquiry:",
    defaultInput: "Does AIMIKO Works integrate with my existing PostgreSQL database and custom billing system?",
    resultTitle: "Omnichannel Resolution Generated",
    resultData: {
      responseTime: "0.8 seconds (Sub-Second SLA)",
      confidence: "99.4% Verified Match",
      resolution: "Yes. AIMIKO Works provides native REST APIs, webhook subscribers, and SQL connectors to link your PostgreSQL database securely with row-level encryption.",
      status: "Ticket Auto-Resolved - No Human Agent Escalation Needed"
    },
    badges: ["Omnichannel Synced", "Zero Wait Time", "High Confidence"]
  },
  4: {
    inputLabel: "Customer WhatsApp Message:",
    defaultInput: "Hi, I want to book 20 executive airport rides for our leadership summit tomorrow.",
    resultTitle: "WhatsApp Business Flow Executed",
    resultData: {
      recipient: "+91 98480 11223 (Verified Business Account)",
      botAction: "Catalog lookup and Fleet reservation initiated",
      responseMessage: "Hello. We have reserved 20 Premium EV Sedans for your summit. Tap below to confirm passenger pickup roster and invoice.",
      linkGenerated: "https://works.aimiko.in/w/trip-hyd-908"
    },
    badges: ["WhatsApp Cloud API", "Instant Delivery", "Webhook OK"]
  },
  5: {
    inputLabel: "Meeting Participants and Desired Window:",
    defaultInput: "Pooja Hegde (pooja@techscale.io) and Rahul Verma - 45-min Product Architecture Review next week",
    resultTitle: "Calendar Coordination Complete",
    resultData: {
      checkedCalendars: "Google Workspace and Microsoft 365 (Both Checked)",
      selectedSlot: "Tuesday, Oct 20 at 3:30 PM - 4:15 PM IST",
      status: "Calendar invites generated and synced to both inboxes with video link."
    },
    badges: ["0 Conflicts Found", "Native Calendar Sync", "Automated Invite Sent"]
  },
  6: {
    inputLabel: "Website Visitor Query on Knowledge Base:",
    defaultInput: "What are the data privacy standards and SLA response times for AIMIKO Works?",
    resultTitle: "Grounded Knowledge Retrieval",
    resultData: {
      citationSource: "AIMIKO_Security_Whitepaper_v2.pdf (Section 4.1)",
      answer: "AIMIKO Works complies with ISO 27001 and SOC-2 standards. Enterprise accounts benefit from 99.9% uptime SLA with under 5 minute urgent response times.",
      hallucinationRisk: "0.0% (Grounded directly against company documents)"
    },
    badges: ["100% Grounded", "Zero Hallucination", "Instant Widget Response"]
  },
  7: {
    inputLabel: "Target Industry, Geography and Role:",
    defaultInput: "Fintech Founders and CTOs in Hyderabad, Bengaluru and Mumbai",
    resultTitle: "Verified B2B Leads Discovered",
    resultData: {
      leadsFound: 184,
      sampleLead1: "Anand Rathi - VP Technology, Crest Fintech - anand@crestfintech.in - Verified",
      sampleLead2: "Sneha Nair - Head of Engineering, PaySphere - sneha@paysphere.io - Verified",
      sampleLead3: "Karan Johar - Co-Founder & CTO, WealthZen - karan@wealthzen.ai - Verified",
      exportReady: "CSV Ready (184 Validated Contacts)"
    },
    badges: ["Email Deliverability: 98.7%", "Direct Phone Verified", "Compliant"]
  },
  8: {
    inputLabel: "Prospect Name, Company and Value Offer:",
    defaultInput: "Kavita Rao, Head of Operations at QuickLogistics. Offer: Automated Document OCR & Dispatch Routing",
    resultTitle: "5-Stage Cold Outreach Sequence Generated",
    resultData: {
      subjectLine: "QuickLogistics dispatch bottleneck (quick idea for Kavita)",
      stage1Email: "Hi Kavita, noticed QuickLogistics expanded across Telangana last quarter. Most logistics teams lose 20+ hours weekly on manual manifest entry. AIMIKO extracts 100-page manifests in 3 seconds. Would 10 minutes next Tuesday be worth exploring?",
      followupStrategy: "Stage 2: Case study. Stage 3: Break-even calculation. Stage 4: Pilot offer.",
      spamScore: "0.2 / 10 (High Inbox Deliverability)"
    },
    badges: ["Personalized Hook", "Spam Filter Safe", "3 Variations"]
  },
  9: {
    inputLabel: "Deal Information or Sales Update:",
    defaultInput: "Apollo Health Clinics enterprise rollout: INR 24,00,000 ARR - Legal review in progress",
    resultTitle: "CRM Pipeline Updated",
    resultData: {
      dealStage: "Contract Review (Probability: 85%)",
      nextBestAction: "Prompt legal counsel regarding mutual indemnity amendment (Section 7.2)",
      revenueWeighted: "INR 20,40,000 Weighted ARR",
      alertDispatched: "Alert sent to VP Sales and Account Executive"
    },
    badges: ["Stage Auto-Advanced", "Deal Score: 85%", "Revenue Synced"]
  },
  10: {
    inputLabel: "Client Name, Deliverables and Budget:",
    defaultInput: "TechVision Solutions - Custom AI Voice Receptionist + WhatsApp CRM Integration - Budget: INR 3,50,000",
    resultTitle: "Branded Client Proposal and SOW Drafted",
    resultData: {
      scopeOverview: "Phase 1: Architecture & Voice Prompting. Phase 2: CRM Webhook Testing. Phase 3: Live Pilot.",
      paymentTerms: "50% Advance on signing, 30% on UAT milestone, 20% on final handover.",
      sowStatus: "Ready for Client E-Signature (PDF Generated)"
    },
    badges: ["Standard Legal Clauses", "Milestones Defined", "PDF Download Ready"]
  },
  11: {
    inputLabel: "Inbound Prospect Questionnaire Answers:",
    defaultInput: "Budget: INR 5,00,000+ - Authority: Founder / CEO - Urgency: Within 14 days - Current Team: 45 employees",
    resultTitle: "Automated Lead Scoring",
    resultData: {
      qualificationScore: "96 / 100 (High Priority / Hot Lead)",
      budgetFit: "Tier 1 Enterprise Match",
      routingAction: "Directly assigned to Senior Enterprise Specialist",
      instantNotification: "Alert dispatched to Sales Director"
    },
    badges: ["Score: 96/100", "Tier 1 Lead", "Routed to VIP Team"]
  },
  12: {
    inputLabel: "Announcement / Campaign Topic:",
    defaultInput: "Launching AIMIKO Works: 25 everyday AI micro-services for Indian businesses with zero code",
    resultTitle: "Multi-Platform Campaign Drafts",
    resultData: {
      linkedInPost: "Stop juggling 12 different AI subscriptions that do not speak to each other. Today, we are unveiling AIMIKO Works - an on-demand fleet of 25 enterprise-ready AI services running directly in your browser. From autonomous phone receptionists to automated GST tax parsers.",
      twitterPost: "Indian businesses spend 18 hours weekly on repetitive operations. AIMIKO Works fixes this with 25 plug-and-play AI micro-services. No setup. No bloat. Full autonomy. Try it live at aimiko.works",
      bestPostingTime: "Tomorrow at 09:30 AM IST (Peak Engagement Window)"
    },
    badges: ["Tailored for LinkedIn and X", "Hashtag Optimized", "Auto-Schedule Ready"]
  },
  15: {
    inputLabel: "Target Keyword and Competitor URL:",
    defaultInput: "AI Voice Receptionist for dental clinics in India - Competitor: voicebot-example.com",
    resultTitle: "SEO Strategy and Article Outline Ready",
    resultData: {
      searchVolume: "4,200 monthly searches (High Intent)",
      keywordDifficulty: "28 / 100 (Low-Hanging Fruit / Fast Ranking)",
      recommendedTitle: "How Indian Dental Clinics Use AI Voice Receptionists to Never Miss a Patient Call",
      outlineHighlights: "H2: The Cost of Missed Patient Calls - H2: Multi-Lingual Hindi, Telugu, English Support - H2: Direct Calendar Booking Setup"
    },
    badges: ["Difficulty: Low (28/100)", "High Commercial Intent", "SERP Positioned"]
  },
  16: {
    inputLabel: "Customer Review Text and Rating:",
    defaultInput: "3 Stars: 'Great product and voice quality, but the initial onboarding took 2 days instead of 2 hours.'",
    resultTitle: "Empathetic Public Reputation Response",
    resultData: {
      draftedResponse: "Hello. Thank you for your honest feedback. We are thrilled you love the voice clarity, but we sincerely apologize for the initial onboarding delay. We have upgraded our instant setup engine to guarantee under 10-minute activations. Please contact support@aimiko.works so we can credit a free month to your account.",
      toneAnalysis: "Professional, Empathetic, Solution-Oriented",
      status: "Ready for 1-Click Publishing to Google Business"
    },
    badges: ["Empathy Calibrated", "Retention Boosted", "Instant 1-Click Publish"]
  },
  17: {
    inputLabel: "Scanned Bill / Receipt Metadata:",
    defaultInput: "Fuel and Highway Toll Receipt - HPCL Retail Outlet Madhapur, Hyderabad - INR 3,850 Total",
    resultTitle: "Structured Receipt Extraction Complete",
    resultData: {
      merchant: "Hindustan Petroleum Corporation Ltd (Madhapur Pump)",
      dateAndTime: "15 Oct 2026, 14:22 IST",
      amount: "INR 3,850.00 (Fuel: 35.8 Litres Power Petrol)",
      taxNumber: "GSTIN: 36AAACH1118A1ZT",
      expenseCategory: "Corporate Travel and Fleet Logistics"
    },
    badges: ["99.8% Precision", "Receipt Validated", "Ready for ERP"]
  },
  19: {
    inputLabel: "Audio Recording File or Meeting Audio Title:",
    defaultInput: "Executive Strategy Sync (Audio Duration: 24 mins - Recorded Oct 15, 2026)",
    resultTitle: "Audio Transcription and Executive Minutes Summary",
    resultData: {
      transcriptLength: "3,480 words transcribed with 99.4% speech clarity",
      keyDecisions: "1. Approved Q4 rollout of 25 AI micro-services. 2. Allocated capital for Hyderabad EV Mobility fleet expansion.",
      assignedActionItems: "Rahul: Finalize API endpoints by Friday. Ananya: Review healthcare clinic voice scripts by Monday."
    },
    badges: ["Sub-Second Neural Engine", "Zero Background Noise", "Action Items Mapped"]
  },
  20: {
    inputLabel: "Trigger Event and Automated Action Flow:",
    defaultInput: "When new lead submits contact form -> Extract intent with AI -> Send notification -> Create CRM record",
    resultTitle: "Multi-App Workflow Executed",
    resultData: {
      pipelineStatus: "Pipeline Active (4 Nodes Connected)",
      step1: "Form submission captured (Name, Phone, Requirements)",
      step2: "AIMIKO AI parsed requirement into 'High Value Enterprise Inquiry'",
      step3: "Dispatched instant push alert to Operations Team channel",
      step4: "New lead record committed to AIMIKO CRM with 'Urgent' tag"
    },
    badges: ["4/4 Nodes Passed", "Execution Time: 340ms", "Zero Code Required"]
  },
  21: {
    inputLabel: "Employee Question to Company Knowledge Base:",
    defaultInput: "What is the policy regarding remote equipment allowance and travel reimbursements?",
    resultTitle: "Internal SOP Grounded Answer",
    resultData: {
      policySource: "AIMIKO_People_Handbook_2026.pdf (Section 6.4, Page 22)",
      answer: "Employees are eligible for a one-time remote workstation allowance of up to INR 35,000 upon joining. Travel expenses for company summits are 100% reimbursed against verified GST receipts within 7 business days.",
      auditTrail: "Verified against latest HR document updated on Sep 30, 2026"
    },
    badges: ["Zero Hallucination", "Source Cited (Page 22)", "Strict Privacy RAG"]
  },
  22: {
    inputLabel: "Job Description and Candidate Resume:",
    defaultInput: "Role: Senior Fullstack and AI Engineer - Candidate: Karthik V. (6 years experience, React, Python, WebRTC, PyTorch)",
    resultTitle: "ATS Candidate Resume Match Score",
    resultData: {
      matchScore: "94% (Exceptional Fit)",
      coreStrengths: "Demonstrated real-time voice architecture experience, high-performance TypeScript UI development, hands-on FastAPI microservices.",
      areasToProbe: "Verify experience handling high-concurrency WebRTC sessions under load.",
      interviewVerdict: "Recommended for Round 1 Technical Screening"
    },
    badges: ["Match: 94%", "Technical Screening Pass", "Instant ATS Analysis"]
  },
  23: {
    inputLabel: "Contract or NDA Document Text:",
    defaultInput: "Vendor Master Services Agreement (Clauses 8.1 to 14.3 regarding Liability and Termination)",
    resultTitle: "Contract Redline and Risk Audit",
    resultData: {
      riskLevel: "High Risk (2 Ambiguous Clauses Flagged)",
      flaggedClause1: "Clause 8.1 specifies 'unlimited unilateral liability' for minor service disruptions. Recommended: Cap liability at 12 months fee paid.",
      flaggedClause2: "Clause 11.3 requires 90-day prior written notice for convenience termination. Recommended: Negotiate down to standard 30 days.",
      safeClauses: "IP Ownership (Clause 12) and Confidentiality (Clause 9) are fully balanced."
    },
    badges: ["2 High Risks Flagged", "Redline Suggestions Ready", "Client Protected"]
  },
  24: {
    inputLabel: "Ask a Business Question in Plain English:",
    defaultInput: "Show total revenue and top 3 selling services in Hyderabad over the past 30 days",
    resultTitle: "Text-to-SQL Executed with Live Chart Data",
    resultData: {
      generatedSQL: "SELECT service_name, COUNT(*) as bookings, SUM(amount) as revenue FROM agency_transactions WHERE city = 'Hyderabad' AND created_at >= NOW() - INTERVAL '30 days' GROUP BY service_name ORDER BY revenue DESC LIMIT 3;",
      resultTable: "1. AI Voice Receptionist: INR 8,42,000 (148 units) | 2. AI Website Builder: INR 4,15,000 (83 units) | 3. AI Invoice OCR: INR 3,10,000 (62 units)",
      totalRevenue: "INR 15,67,000 Generated (Up +24% MoM)"
    },
    badges: ["Valid SQL Generated", "Executed in 18ms", "100% Accurate"]
  },
  25: {
    inputLabel: "Executive Context and Morning Preferences:",
    defaultInput: "Executive: Founder and Managing Director - Calendar: 6 meetings scheduled today - Inboxes: 42 unread emails",
    resultTitle: "Morning Executive Briefing and Triage",
    resultData: {
      urgentDigest: "3 emails require immediate signature: 1. Office Lease Renewal, 2. Enterprise NDA with Apollo, 3. Bank wire authorization.",
      calendarConflictResolved: "Detected overlap at 3:00 PM between Investor Sync and Tech Review. Rescheduled Tech Review to 4:30 PM with attendee consent.",
      dailyPriorityTask: "Finalize presentation for Hyderabad AI Summit at 5:30 PM."
    },
    badges: ["Morning Brief Ready", "1 Conflict Fixed", "VIP Chief of Staff"]
  }
};

export default function Agency() {
  // Navigation View modes: "catalog" or "prototype"
  const [viewMode, setViewMode] = useState<"catalog" | "prototype">("catalog");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Sub-tab inside Agent Workspace: "prototype" or "integration"
  const [agentWorkspaceTab, setAgentWorkspaceTab] = useState<"prototype" | "integration">("prototype");

  // Selected Integration Method inside Integration Guide (0 = Method 1, 1 = Method 2, 2 = Method 3)
  const [selectedMethodIndex, setSelectedMethodIndex] = useState<number>(0);
  const [isPingingConnection, setIsPingingConnection] = useState<boolean>(false);
  const [pingSuccess, setPingSuccess] = useState<boolean>(false);

  // Currently active service in prototype view
  const [activeServiceId, setActiveServiceId] = useState<number>(1);

  // Global Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── INTEGRATION & PAYMENT MODAL STATE ──
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [businessName, setBusinessName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState("");

  // ── STUDIO 1: VOICE RECEPTIONIST STATE ──
  const [callActive, setCallActive] = useState(false);
  const [callStep, setCallStep] = useState<number>(0);
  const [isMuted, setIsMuted] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // ── STUDIO 2 (13): INSTANT WEBSITE BUILDER STATE ──
  const [sitePrompt, setSitePrompt] = useState("Modern Dental & Orthodontic Clinic in Hyderabad with online booking");
  const [isGeneratingSite, setIsGeneratingSite] = useState(false);
  const [generatedSiteData, setGeneratedSiteData] = useState<null | {
    title: string;
    tagline: string;
    services: string[];
    doctorName: string;
  }>({
    title: "Apex Dental & Smile Studio",
    tagline: "World-class pain-free dental care & smile makeovers in Hitec City, Hyderabad.",
    services: ["Root Canal Treatment", "Invisalign Clear Aligners", "Laser Teeth Whitening", "Pediatric Dentistry"],
    doctorName: "Dr. Ananya Rao, MDS (Gold Medalist)",
  });
  const [copiedCode, setCopiedCode] = useState(false);

  // ── STUDIO 3 (14): AD COPY GENERATOR STATE ──
  const [adProduct, setAdProduct] = useState("AIMIKO Mobility - Daily Commute Automation");
  const [adAudience, setAdAudience] = useState("Tech professionals in Cyberabad / Hitec City");
  const [adPlatform, setAdPlatform] = useState<"google" | "meta" | "linkedin">("meta");
  const [generatedAds, setGeneratedAds] = useState([
    {
      headline: "Skip the Morning Hyderabad Traffic Surge",
      copy: "Tired of hunting autos in Madhapur? AIMIKO AutoCommute coordinates your ride, books your Metro QR pass, and drops you at Cyber Towers on time every workday.",
      cta: "Automate My Commute (Save INR 3,300/mo)",
      ctrScore: "8.9% High CTR",
    },
    {
      headline: "Doorstep to Office Desk on Autopilot",
      copy: "Configure your morning commute once. Wake up to your verified ride waiting outside and your Metro pass ready on your screen.",
      cta: "Claim 5-Day Free Commute Pass",
      ctrScore: "7.6% High CTR",
    },
    {
      headline: "Zero Peak Pricing. 100% Guaranteed Rides.",
      copy: "Connect first-mile auto with Metro without switching apps. Seamless daily travel for Hyderabad hustlers.",
      cta: "Explore Route & Calculate Savings",
      ctrScore: "8.2% High CTR",
    },
  ]);
  const [copiedAdIndex, setCopiedAdIndex] = useState<number | null>(null);

  // ── STUDIO 4 (18): INVOICE OCR STATE ──
  const [isScanningInvoice, setIsScanningInvoice] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<null | {
    vendor: string;
    gstin: string;
    invoiceNo: string;
    date: string;
    items: { desc: string; qty: number; rate: number; amount: number }[];
    subtotal: number;
    gstTax: number;
    total: number;
  }>({
    vendor: "Cyber Towers Tech Infrastructures Pvt Ltd",
    gstin: "36AABCU9812K1Z4",
    invoiceNo: "INV-HYD-2026-9481",
    date: "15 Oct 2026",
    items: [
      { desc: "High-Speed Dedicated Fiber Bandwidth (1 Gbps)", qty: 1, rate: 8500, amount: 8500 },
      { desc: "Cloud Server Rack Colocation (Tier 4 Data Center)", qty: 1, rate: 4000, amount: 4000 },
      { desc: "Static IP Pool Allocation (/29 Subnet)", qty: 1, rate: 1500, amount: 1500 },
    ],
    subtotal: 14000,
    gstTax: 2520, // 18% GST
    total: 16520,
  });

  // ── DYNAMIC ENGINE STATE FOR ALL OTHER SERVICES ──
  const [dynamicInput, setDynamicInput] = useState<string>("");
  const [isRunningDynamic, setIsRunningDynamic] = useState<boolean>(false);
  const [dynamicOutput, setDynamicOutput] = useState<any>(null);

  // Active Service Object & Integration Guide
  const currentService = useMemo(() => {
    return TOP_25_SERVICES.find((s) => s.id === activeServiceId) || TOP_25_SERVICES[0];
  }, [activeServiceId]);

  const currentPreset = SERVICE_PRESETS[activeServiceId];
  const currentGuide = useMemo(() => {
    return getAgentIntegrationGuide(currentService);
  }, [currentService]);

  // Filtered Services for Catalog
  const filteredServices = useMemo(() => {
    return TOP_25_SERVICES.filter((svc) => {
      const matchesCategory = selectedCategory === "all" || svc.category === selectedCategory;
      const matchesSearch =
        svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Open Prototype for a selected service
  const handleOpenPrototype = (serviceId: number) => {
    setActiveServiceId(serviceId);
    setDynamicOutput(null);
    setDynamicInput("");
    setSelectedMethodIndex(0);
    setPingSuccess(false);
    setViewMode("prototype");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Test Ping Simulation
  const handleTestPing = () => {
    setIsPingingConnection(true);
    setTimeout(() => {
      setIsPingingConnection(false);
      setPingSuccess(true);
      showToast("Integration Test Connection Verified: 200 OK (Latency: 42ms)");
    }, 1000);
  };

  // Voice Call handlers
  const handleStartCall = () => {
    setCallActive(true);
    setCallStep(1);
    setBookingConfirmed(false);
  };

  const handleNextDialogue = () => {
    if (callStep < 3) {
      setCallStep((prev) => prev + 1);
    } else {
      setBookingConfirmed(true);
      setCallActive(false);
      setCallStep(0);
      showToast("Appointment confirmed and synced to calendar");
    }
  };

  const handleEndCall = () => {
    setCallActive(false);
    setCallStep(0);
  };

  // Website Generator handler
  const handleGenerateSite = () => {
    setIsGeneratingSite(true);
    setTimeout(() => {
      setIsGeneratingSite(false);
      setGeneratedSiteData({
        title: "Apex Smile & Dental Clinic",
        tagline: "Advanced Painless Dentistry & Smile Design in Hyderabad.",
        services: ["Invisalign Clear Aligners", "Laser Teeth Whitening", "Root Canal Therapy", "Dental Implants"],
        doctorName: "Dr. Ananya Rao, MDS",
      });
      showToast("Landing page generated with modern layout and copy");
    }, 1100);
  };

  // Ad Copy handler
  const handleGenerateAds = () => {
    setGeneratedAds([
      {
        headline: `Transform How You Manage ${adProduct.split("-")[0].trim()}`,
        copy: `Engineered specifically for ${adAudience}. Save 15+ hours weekly with native AI automation.`,
        cta: "Start 14-Day Risk-Free Trial",
        ctrScore: "9.2% Top Performer",
      },
      {
        headline: "Stop Wasting Time on Manual Repetitive Tasks",
        copy: `Empower your team with autonomous AI workflows. No complex training required.`,
        cta: "See Interactive Demo",
        ctrScore: "8.4% High CTR",
      },
      {
        headline: "The Modern Alternative Built for Scale",
        copy: `Replace fragmented tools with one unified, reliable intelligent engine.`,
        cta: "Get Instant Access",
        ctrScore: "7.9% High CTR",
      },
    ]);
    showToast("3 A/B test variations generated");
  };

  // Dynamic Runner for other services
  const handleRunDynamicService = () => {
    setIsRunningDynamic(true);
    setTimeout(() => {
      setIsRunningDynamic(false);
      setDynamicOutput(currentPreset?.resultData || {
        status: "Completed successfully",
        details: "Service processed input and produced validated output.",
        timestamp: new Date().toLocaleTimeString()
      });
      showToast(`${currentService.name} executed successfully`);
    }, 900);
  };

  // Checkout Execution
  const handleStartProvisioning = () => {
    setIsProvisioning(true);
    setTimeout(() => {
      setIsProvisioning(false);
      setProvisionSuccess(true);
      setGeneratedApiKey(`amk_live_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`);
      showToast(`${currentService.name} activated for your business!`);
    }, 1400);
  };

  const calculatedPrice = billingCycle === "annual"
    ? Math.round(currentService.monthlyPrice * 0.8)
    : currentService.monthlyPrice;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-violet-100 selection:text-violet-900">
      <MainNavbar />

      {/* Floating In-App Toast */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-slate-950 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── TOP HEADER / BREADCRUMB ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-3 border border-slate-200">
                <Layers className="w-4 h-4 text-violet-600" />
                <span>AIMIKO Works</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>25 Standalone AI Agents</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950">
                Enterprise AI Workforce.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 mt-2 max-w-2xl font-normal leading-relaxed">
                Test any agent live in your browser, then follow crystal-clear 1-2-3 steps to integrate it into your business. Pay only for the agent you use.
              </p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                id="btn-nav-catalog"
                onClick={() => setViewMode("catalog")}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  viewMode === "catalog"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <Layers className="w-4 h-4 text-violet-600" />
                <span>All 25 Agents</span>
              </button>

              <button
                id="btn-nav-prototype"
                onClick={() => setViewMode("prototype")}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  viewMode === "prototype"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Live Prototype & Integration</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase">
                  Active
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── VIEW 1: CATALOG OF ALL 25 INDIVIDUAL AGENTS ─────────── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {viewMode === "catalog" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Search Bar & Clean Category Filter Pills */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by role or capability (e.g. Receptionist, WhatsApp, Website, Invoice, Meeting, Ads, Resume)..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>

              <div className="text-sm font-semibold text-slate-600 px-2 whitespace-nowrap">
                Showing {filteredServices.length} of 25 Available Agents
              </div>
            </div>

            {/* Category Filter Pills (0 Emojis, Clean Lucide SVG Icons) */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 text-sm font-bold">
              {[
                { id: "all", label: "All 25 Agents", icon: Layers },
                { id: "voice", label: "Voice and Phone (6)", icon: PhoneCall },
                { id: "sales", label: "Sales and Leads (5)", icon: TrendingUp },
                { id: "marketing", label: "Marketing and Media (5)", icon: Sparkles },
                { id: "operations", label: "Documents and OCR (4)", icon: FileText },
                { id: "finance", label: "Finance and HR (4)", icon: Briefcase },
                { id: "industry", label: "Executive and Concierge (1)", icon: ShieldCheck },
              ].map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                      selectedCategory === cat.id
                        ? "bg-slate-950 text-white shadow-sm font-extrabold"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid of the 25 Everyday AI Services with Individual Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-3xl p-7 border border-slate-200 hover:border-violet-400 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg">
                      Agent #{svc.id.toString().padStart(2, "0")} · {svc.categoryLabel}
                    </span>
                    {svc.badge && (
                      <span className="text-xs font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                        {svc.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-slate-950 text-xl mb-2.5 group-hover:text-violet-600 transition-colors">
                    {svc.name}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                    {svc.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 mb-6">
                    {svc.features.slice(0, 2).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 space-y-4">
                  {/* Single Agent Pricing Block */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-950">
                        INR {svc.monthlyPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-slate-500"> / month</span>
                    </div>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      {svc.deliveryTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`btn-test-integrate-${svc.id}`}
                      onClick={() => handleOpenPrototype(svc.id)}
                      className="py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Test & Integrate</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveServiceId(svc.id);
                        setIsCheckoutOpen(true);
                      }}
                      className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Buy Single License</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── VIEW 2: LIVE PROTOTYPE + STEP-BY-STEP INTEGRATION GUIDE ─ */}
      {/* ─────────────────────────────────────────────────────────── */}
      {viewMode === "prototype" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Agent Selector Header with Quick Switcher */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-violet-700 uppercase tracking-wider bg-violet-50 px-2.5 py-0.5 rounded-md">
                    Live Agent Sandbox & Guide
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Agent #{currentService.id.toString().padStart(2, "0")} · {currentService.categoryLabel}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {currentService.name}
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  {currentService.description}
                </p>
              </div>

              {/* Service Switcher Dropdown */}
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Switch Agent:</span>
                <select
                  value={activeServiceId}
                  onChange={(e) => handleOpenPrototype(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500 shadow-2xs"
                >
                  {TOP_25_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      #{s.id.toString().padStart(2, "0")} - {s.name} (INR {s.monthlyPrice.toLocaleString()}/mo)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Flagship Shortcuts (0 Emojis) */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="text-slate-500 font-semibold mr-1">Quick Showcase:</span>
              {[
                { id: 1, label: "Voice Receptionist (#01)" },
                { id: 13, label: "Instant Website Builder (#13)" },
                { id: 14, label: "Ad Copy Generator (#14)" },
                { id: 18, label: "Invoice OCR Parser (#18)" },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => handleOpenPrototype(pill.id)}
                  className={`px-3.5 py-2 rounded-xl transition-all ${
                    activeServiceId === pill.id
                      ? "bg-violet-600 text-white font-extrabold shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-Tabs: Toggle Between "Working Prototype" and "Integration Guide (Kid-Simple)" */}
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <button
              id="btn-tab-prototype"
              onClick={() => setAgentWorkspaceTab("prototype")}
              className={`px-5 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
                agentWorkspaceTab === "prototype"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>1. Live Working Prototype</span>
            </button>

            <button
              id="btn-tab-integration"
              onClick={() => setAgentWorkspaceTab("integration")}
              className={`px-5 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
                agentWorkspaceTab === "integration"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Workflow className="w-4 h-4 text-emerald-500" />
              <span>2. How to Integrate (Step-by-Step Guide)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black uppercase">
                3 Methods
              </span>
            </button>
          </div>

          {/* Main 2-Column Split: Active Sub-Tab (70%) + Integrate Sidebar (30%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT COLUMN (8 COLS) ── */}
            <div className="lg:col-span-8 space-y-6">
              {/* ── SUB-TAB 1: LIVE PROTOTYPE ── */}
              {agentWorkspaceTab === "prototype" && (
                <>
                  {/* 1. Bespoke Prototype: Voice Receptionist (#1) */}
                  {activeServiceId === 1 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-sm font-bold text-slate-900">Virtual Line Live: +91 (040) 4891-2300</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">Latency: 280ms</span>
                      </div>

                      {/* Simulated Phone Card */}
                      <div className="bg-gradient-to-b from-slate-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-inner">
                        <div className="w-16 h-16 rounded-full bg-violet-600/30 border border-violet-500/50 flex items-center justify-center mx-auto text-violet-300">
                          <PhoneCall className={`w-8 h-8 ${callActive ? "animate-bounce" : ""}`} />
                        </div>

                        <div>
                          <h4 className="font-extrabold text-lg text-white">AIMIKO Voice Receptionist</h4>
                          <p className="text-sm text-slate-400 mt-1">
                            {callActive ? "Call in progress - 00:24" : "Ready for incoming business callers"}
                          </p>
                        </div>

                        {/* Audio Waveform Animation */}
                        {callActive ? (
                          <div className="flex items-center justify-center gap-1.5 h-12">
                            {[16, 32, 44, 24, 40, 18, 36, 28, 42, 20].map((h, i) => (
                              <div
                                key={i}
                                style={{ height: `${h}px` }}
                                className="w-1.5 bg-violet-400 rounded-full animate-pulse"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400 py-2">
                            Click "Simulate Incoming Call" to test caller dialogue
                          </div>
                        )}

                        {/* Call Controls */}
                        <div className="flex items-center justify-center gap-4 pt-2">
                          {!callActive ? (
                            <button
                              onClick={handleStartCall}
                              className="py-3 px-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95"
                            >
                              <PhoneCall className="w-4 h-4 fill-slate-950" />
                              <span>Simulate Incoming Call</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                  isMuted ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-white hover:bg-slate-700"
                                }`}
                              >
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                              </button>

                              <button
                                onClick={handleNextDialogue}
                                className="py-3 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
                              >
                                <span>{callStep < 3 ? "Next Customer Reply" : "Confirm Booking & End"}</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>

                              <button
                                onClick={handleEndCall}
                                className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all shadow-md"
                              >
                                <PhoneCall className="w-5 h-5 rotate-135" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Booking Confirmation Box */}
                      {bookingConfirmed && (
                        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-sm text-emerald-950">
                          <div className="font-extrabold flex items-center gap-2 text-emerald-900 text-base">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Appointment Booked Automatically!
                          </div>
                          <p className="text-emerald-800">
                            Customer: <strong>Rahul Sharma</strong> - Tomorrow at <strong>3:00 PM IST</strong>
                          </p>
                          <p className="text-xs text-emerald-700">Calendar invite and SMS confirmation dispatched.</p>
                        </div>
                      )}

                      {/* Transcript Dialog Stream */}
                      <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-sm">
                        <div className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                          Live Call Transcript & Intent Stream:
                        </div>

                        {callStep === 0 && !bookingConfirmed && (
                          <div className="text-center text-slate-500 py-10">
                            Awaiting incoming call. Click "Simulate Incoming Call" above.
                          </div>
                        )}

                        {callStep >= 1 && (
                          <div className="space-y-1 text-left animate-fade-in">
                            <span className="text-xs uppercase font-extrabold text-violet-700 block">AI Receptionist</span>
                            <div className="p-3.5 rounded-2xl bg-violet-600 text-white font-medium inline-block max-w-lg shadow-xs">
                              "Hello! Thank you for calling Apex Dental Studio. I am your automated receptionist. How may I assist you today?"
                            </div>
                          </div>
                        )}

                        {callStep >= 1 && (
                          <div className="space-y-1 text-right animate-fade-in">
                            <span className="text-xs uppercase font-extrabold text-slate-700 block">Caller (Rahul Sharma)</span>
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 font-medium inline-block max-w-lg text-left shadow-xs">
                              "Hi! I'd like to book an appointment for tomorrow afternoon around 3 PM for a dental checkup."
                            </div>
                          </div>
                        )}

                        {callStep >= 2 && (
                          <div className="space-y-1 text-left animate-fade-in">
                            <span className="text-xs uppercase font-extrabold text-violet-700 block">AI Receptionist</span>
                            <div className="p-3.5 rounded-2xl bg-violet-600 text-white font-medium inline-block max-w-lg shadow-xs">
                              "I have checked our schedule. Dr. Ananya Rao is available tomorrow at 3:00 PM IST. Shall I book that slot under your name?"
                            </div>
                          </div>
                        )}

                        {callStep >= 3 && (
                          <div className="space-y-1 text-right animate-fade-in">
                            <span className="text-xs uppercase font-extrabold text-slate-700 block">Caller (Rahul Sharma)</span>
                            <div className="p-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 font-medium inline-block max-w-lg text-left shadow-xs">
                              "Yes, please confirm it. My phone number is 98480-23145."
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. Bespoke Prototype: Website Builder (#13) */}
                  {activeServiceId === 13 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div>
                        <label className="text-sm font-bold text-slate-900 block mb-2">
                          Describe the Landing Page or Website for your business:
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={sitePrompt}
                            onChange={(e) => setSitePrompt(e.target.value)}
                            placeholder="e.g. Modern Dental Clinic in Hyderabad with online booking"
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                          />
                          <button
                            onClick={handleGenerateSite}
                            disabled={isGeneratingSite}
                            className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>{isGeneratingSite ? "Building Website..." : "Generate Landing Page"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Rendered Live Website Frame */}
                      {generatedSiteData && (
                        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
                          <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            </div>
                            <span className="font-mono text-xs bg-white px-4 py-1 rounded-md border border-slate-200 text-slate-700">
                              https://preview.aimiko.works/sites/apex-dental
                            </span>
                            <button
                              onClick={() => {
                                setCopiedCode(true);
                                showToast("Landing page HTML copied to clipboard!");
                                setTimeout(() => setCopiedCode(false), 2000);
                              }}
                              className="text-violet-700 hover:underline font-bold text-xs flex items-center gap-1.5"
                            >
                              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              <span>{copiedCode ? "Copied HTML!" : "Copy Code"}</span>
                            </button>
                          </div>

                          <div className="p-8 sm:p-10 space-y-8 bg-gradient-to-b from-white to-slate-50">
                            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                              <div className="font-black text-xl text-slate-950 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-black text-sm">
                                  A
                                </span>
                                <span>{generatedSiteData.title}</span>
                              </div>
                              <button className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold">
                                Book Appointment
                              </button>
                            </div>

                            <div className="max-w-2xl space-y-4">
                              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase">
                                Hitec City, Hyderabad
                              </span>
                              <h3 className="text-3xl font-black text-slate-950 leading-tight">
                                {generatedSiteData.tagline}
                              </h3>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                Led by {generatedSiteData.doctorName}. Equipped with digital 3D CBCT imaging and laser dentistry.
                              </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                              {generatedSiteData.services.map((svc, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                                  <CheckCircle2 className="w-5 h-5 text-violet-600 mb-2" />
                                  <div className="font-bold text-xs text-slate-900">{svc}</div>
                                  <span className="text-xs text-slate-500 block mt-1">From INR 1,499</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Bespoke Prototype: Ad Copy Generator (#14) */}
                  {activeServiceId === 14 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Product Name:</label>
                          <input
                            type="text"
                            value={adProduct}
                            onChange={(e) => setAdProduct(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1.5">Target Audience:</label>
                          <input
                            type="text"
                            value={adAudience}
                            onChange={(e) => setAdAudience(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-2">
                          {(["meta", "google", "linkedin"] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => setAdPlatform(p)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                                adPlatform === p ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handleGenerateAds}
                          className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-sm"
                        >
                          Generate 3 A/B Variants
                        </button>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        {generatedAds.map((ad, idx) => (
                          <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-violet-700 uppercase">Variant {idx + 1}</span>
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                                {ad.ctrScore}
                              </span>
                            </div>
                            <h5 className="font-bold text-base text-slate-950">{ad.headline}</h5>
                            <p className="text-sm text-slate-600">{ad.copy}</p>
                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-200">
                                CTA: {ad.cta}
                              </span>
                              <button
                                onClick={() => {
                                  setCopiedAdIndex(idx);
                                  showToast(`Ad Variant ${idx + 1} copied!`);
                                  setTimeout(() => setCopiedAdIndex(null), 2000);
                                }}
                                className="text-xs font-bold text-violet-700 flex items-center gap-1"
                              >
                                {copiedAdIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedAdIndex === idx ? "Copied" : "Copy Ad"}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Bespoke Prototype: Invoice OCR Parser (#18) */}
                  {activeServiceId === 18 && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="p-8 border-2 border-dashed border-violet-200 bg-violet-50/40 rounded-2xl text-center space-y-3">
                        <Upload className="w-10 h-10 text-violet-600 mx-auto" />
                        <div>
                          <h4 className="font-bold text-base text-slate-900">Upload Vendor Bill or Tax Invoice</h4>
                          <p className="text-xs text-slate-500 mt-1">Extracts line-items, GSTIN, and tax reconciliation</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsScanningInvoice(true);
                            setTimeout(() => {
                              setIsScanningInvoice(false);
                              showToast("Invoice processed and line-items parsed!");
                            }, 900);
                          }}
                          className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-sm transition-all"
                        >
                          {isScanningInvoice ? "Parsing Line Items..." : "Load Sample Tax Invoice"}
                        </button>
                      </div>

                      {invoiceResult && (
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md uppercase">
                                Extraction Complete
                              </span>
                              <h4 className="font-extrabold text-slate-900 text-lg mt-1">{invoiceResult.vendor}</h4>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-slate-500 font-semibold block">Invoice No:</span>
                              <span className="font-mono font-bold text-sm text-slate-900">{invoiceResult.invoiceNo}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                              <span className="text-slate-500 font-bold block mb-0.5">GSTIN NUMBER</span>
                              <span className="font-mono font-bold text-sm text-slate-900">{invoiceResult.gstin}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-500 font-bold block mb-0.5">INVOICE DATE</span>
                              <span className="font-bold text-sm text-slate-900">{invoiceResult.date}</span>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                                <tr>
                                  <th className="py-2.5 px-3">Description</th>
                                  <th className="py-2.5 px-3 text-center">Qty</th>
                                  <th className="py-2.5 px-3 text-right">Rate</th>
                                  <th className="py-2.5 px-3 text-right">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-800">
                                {invoiceResult.items.map((item, idx) => (
                                  <tr key={idx}>
                                    <td className="py-2.5 px-3 font-semibold">{item.desc}</td>
                                    <td className="py-2.5 px-3 text-center">{item.qty}</td>
                                    <td className="py-2.5 px-3 text-right font-mono">INR {item.rate.toLocaleString()}</td>
                                    <td className="py-2.5 px-3 text-right font-mono font-bold">INR {item.amount.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
                            <button
                              onClick={() => showToast("Exported structured invoice data to CSV / Excel!")}
                              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download Excel / CSV</span>
                            </button>
                            <div className="text-right">
                              <div className="text-sm font-extrabold text-slate-900">Total: INR {invoiceResult.total.toLocaleString()}</div>
                              <div className="text-xs text-slate-500">Includes 18% GST (INR {invoiceResult.gstTax.toLocaleString()})</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. Generic Dedicated Prototype for all other 21 agents */}
                  {![1, 13, 14, 18].includes(activeServiceId) && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900 block">
                          {currentPreset?.inputLabel || "Agent Input Parameters / Payload:"}
                        </label>
                        <textarea
                          rows={4}
                          value={dynamicInput || currentPreset?.defaultInput || "Default input parameters for this agent"}
                          onChange={(e) => setDynamicInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-semibold text-slate-500">
                          Speed SLA: <strong className="text-emerald-700">{currentService.deliveryTime}</strong>
                        </span>

                        <button
                          onClick={handleRunDynamicService}
                          disabled={isRunningDynamic}
                          className="px-7 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>{isRunningDynamic ? "Running Agent..." : "Execute Agent Live"}</span>
                        </button>
                      </div>

                      {/* Output Panel */}
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{currentPreset?.resultTitle || "Agent Telemetry Output"}</span>
                          </div>
                          <button
                            onClick={() => showToast("Output data copied to clipboard!")}
                            className="text-xs font-bold text-slate-600 hover:text-slate-950 flex items-center gap-1"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Output</span>
                          </button>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-sm">
                          {Object.entries(dynamicOutput || currentPreset?.resultData || {}).map(([k, v], i) => (
                            <div key={i} className="pb-3 border-b border-slate-200/70 last:border-0 last:pb-0">
                              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                                {k.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <div className="text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">
                                {typeof v === "object" ? JSON.stringify(v, null, 2) : String(v)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── SUB-TAB 2: KID-SIMPLE STEP-BY-STEP INTEGRATION GUIDE ── */}
              {agentWorkspaceTab === "integration" && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
                  {/* Kid-Simple Plain English Header */}
                  <div className="p-6 rounded-2xl bg-violet-50/70 border border-violet-100 space-y-2">
                    <div className="flex items-center gap-2 text-violet-900 font-extrabold text-sm uppercase tracking-wider">
                      <HelpCircle className="w-4 h-4 text-violet-700" />
                      <span>Kid-Simple Plain English Explanation</span>
                    </div>
                    <p className="text-base text-slate-800 leading-relaxed font-medium">
                      {currentGuide.kidExplanation}
                    </p>
                  </div>

                  {/* 3 Integration Method Tabs */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-slate-950">
                        Choose How You Want to Connect It:
                      </h4>
                      <span className="text-xs font-bold text-slate-500">
                        Select a method below to see exact steps
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {currentGuide.methods.map((method, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedMethodIndex(idx);
                            setPingSuccess(false);
                          }}
                          className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                            selectedMethodIndex === idx
                              ? "bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-violet-500/30"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block mb-2 ${
                              selectedMethodIndex === idx
                                ? "bg-violet-600 text-white"
                                : "bg-slate-200 text-slate-800"
                            }`}>
                              {method.difficulty}
                            </span>
                            <div className="font-extrabold text-sm leading-snug">
                              {method.name.split(":")[0]}
                            </div>
                            <div className={`text-xs mt-1 leading-snug ${
                              selectedMethodIndex === idx ? "text-slate-300" : "text-slate-500"
                            }`}>
                              {method.badge}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step-by-Step Card for Selected Method */}
                  {currentGuide.methods[selectedMethodIndex] && (
                    <div className="space-y-6 pt-2">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-xs font-bold text-violet-700 uppercase tracking-wider block">
                          Step-by-Step Instructions
                        </span>
                        <h5 className="text-xl font-black text-slate-950 mt-1">
                          {currentGuide.methods[selectedMethodIndex].name}
                        </h5>
                        <p className="text-sm text-slate-600 mt-1">
                          {currentGuide.methods[selectedMethodIndex].summary}
                        </p>
                      </div>

                      {/* Numbered Steps List */}
                      <div className="space-y-5">
                        {currentGuide.methods[selectedMethodIndex].steps.map((step) => (
                          <div
                            key={step.number}
                            className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 transition-all hover:border-violet-300"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-xl bg-violet-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                                {step.number}
                              </div>
                              <div className="flex-1 space-y-1">
                                <h6 className="font-bold text-base text-slate-950">
                                  {step.title}
                                </h6>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                            </div>

                            {/* Code Snippet Box (if applicable) */}
                            {step.codeOrSnippet && (
                              <div className="mt-2 ml-12 bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto relative group">
                                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400 font-sans font-semibold">
                                  <span>Snippet:</span>
                                  <button
                                    onClick={() => {
                                      showToast("Copied to clipboard!");
                                    }}
                                    className="text-violet-400 hover:text-white flex items-center gap-1"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Snippet</span>
                                  </button>
                                </div>
                                <pre className="whitespace-pre-wrap">{step.codeOrSnippet}</pre>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Live Integration Test / Ping Checker */}
                      <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-violet-600" />
                            <span>Verify Your Connection Status</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Send a simulated verification ping to check if this agent is ready to communicate.
                          </p>
                        </div>

                        <button
                          id="btn-ping-test"
                          onClick={handleTestPing}
                          disabled={isPingingConnection}
                          className="px-6 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>{isPingingConnection ? "Testing Ping..." : "Send Test Ping"}</span>
                        </button>
                      </div>

                      {pingSuccess && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3 animate-fade-in">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <strong>Connection Verified (Status 200 OK)</strong> - Latency 42ms. Agent is fully operational and ready to accept live business traffic.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT COLUMN: INTEGRATE TO BUSINESS PANEL (4 COLS) ── */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border-2 border-violet-600 shadow-xl space-y-6 sticky top-24">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-violet-700 bg-violet-50 px-3 py-1 rounded-full">
                  Single Agent License
                </span>
                <h3 className="font-black text-2xl text-slate-950 mt-3">
                  Integrate to Your Business
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Deploy #{currentService.id.toString().padStart(2, "0")} {currentService.name} into your tech stack.
                </p>
              </div>

              {/* Price Callout */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-3xl font-black text-slate-950">
                  INR {currentService.monthlyPrice.toLocaleString()}
                  <span className="text-xs font-medium text-slate-500"> / month</span>
                </div>
                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>14-Day Free Trial · Cancel Anytime</span>
                </div>
              </div>

              {/* What is Included */}
              <div className="space-y-3 text-xs text-slate-700">
                <div className="font-bold text-slate-900 uppercase tracking-wider">What is Included:</div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>{currentService.unitQuota}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Setup Time: <strong>{currentService.setupTime}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Method: <strong>{currentService.integrationType}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>99.9% Uptime Enterprise SLA Guarantee</span>
                </div>
              </div>

              {/* Big CTA Button */}
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-violet-200 flex items-center justify-center gap-2 active:scale-98"
              >
                <Building2 className="w-4 h-4" />
                <span>Integrate with My Business</span>
              </button>

              <div className="text-center text-[11px] text-slate-500">
                Zero setup fees. Immediate API key generation.
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── SINGLE AGENT CHECKOUT & INTEGRATION MODAL ───────────── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setProvisionSuccess(false);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!provisionSuccess ? (
              <>
                <div>
                  <span className="text-xs font-bold text-violet-700 uppercase tracking-wider bg-violet-50 px-2.5 py-1 rounded-md">
                    Instant Business Deployment
                  </span>
                  <h3 className="text-2xl font-black text-slate-950 mt-2">
                    Activate {currentService.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Deploy this standalone agent into your company workflows in under 60 seconds.
                  </p>
                </div>

                {/* Billing Frequency Selector */}
                <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`py-2.5 rounded-xl transition-all ${
                      billingCycle === "monthly" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    Monthly (INR {currentService.monthlyPrice.toLocaleString()}/mo)
                  </button>
                  <button
                    onClick={() => setBillingCycle("annual")}
                    className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      billingCycle === "annual" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
                    }`}
                  >
                    <span>Annual (Save 20%)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold">
                      -20%
                    </span>
                  </button>
                </div>

                {/* Business Info Inputs */}
                <div className="space-y-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1.5">Business or Company Name:</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apex Health Clinic / Delta Logistics Pvt Ltd"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5">Work Email (for API Keys & Invoices):</label>
                    <input
                      type="email"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      placeholder="founder@company.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5">Payment Method:</label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                      <button
                        onClick={() => setPaymentMethod("upi")}
                        className={`py-2.5 rounded-xl border transition-all ${
                          paymentMethod === "upi"
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        UPI (GPay/PhonePe)
                      </button>
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`py-2.5 rounded-xl border transition-all ${
                          paymentMethod === "card"
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        Credit / Debit Card
                      </button>
                      <button
                        onClick={() => setPaymentMethod("netbanking")}
                        className={`py-2.5 rounded-xl border transition-all ${
                          paymentMethod === "netbanking"
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                      >
                        NetBanking
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total & Action */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Due Today (14 Days Free):</span>
                    <span className="text-xl font-black text-slate-950">
                      INR 0.00
                      <span className="text-xs font-normal text-slate-500"> (then INR {calculatedPrice.toLocaleString()}/mo)</span>
                    </span>
                  </div>

                  <button
                    onClick={handleStartProvisioning}
                    disabled={isProvisioning}
                    className="px-6 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isProvisioning ? "Provisioning..." : "Activate Agent Now"}</span>
                  </button>
                </div>
              </>
            ) : (
              /* Success & Provisioned Credentials View */
              <div className="space-y-6 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-2xl font-black text-slate-950">
                    Agent Provisioned Successfully!
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {currentService.name} is now live and linked to {businessName || "your business"}.
                  </p>
                </div>

                {/* Generated API Credentials Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Your Production API Key:
                    </span>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900">
                      <span>{generatedApiKey}</span>
                      <button
                        onClick={() => {
                          showToast("API Key copied to clipboard!");
                        }}
                        className="text-violet-700 hover:underline flex items-center gap-1 font-sans text-xs font-bold"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Dedicated Webhook Endpoint:
                    </span>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 truncate">
                      https://api.aimiko.works/v1/agents/{currentService.id}/events
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm transition-all shadow-md"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="mt-20 bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-600">
          <div>
            <strong>AIMIKO Works</strong> · Standalone Enterprise AI Micro-Services (25 Available)
          </div>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-950 transition-colors">About Us</Link>
            <Link to="/pricing" className="hover:text-slate-950 transition-colors">Pricing</Link>
            <Link to="/aimigo" className="hover:text-slate-950 transition-colors">Aimiko Mobility</Link>
            <Link to="/commerce" className="hover:text-slate-950 transition-colors">Aimiko Commerce</Link>
            <Link to="/learn" className="hover:text-slate-950 transition-colors">Aimiko Learn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
