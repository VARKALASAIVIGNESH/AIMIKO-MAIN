import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import {
  Store,
  Sparkles,
  ArrowRight,
  Bot,
  Send,
  X,
  CheckCircle2,
  Activity,
  BarChart3,
  ShoppingBag,
  Zap,
  Shield,
  Globe,
  Package,
  Bell,
  Tag,
  Star,
  ExternalLink,
  Plus,
  Settings,
  ChevronRight,
  Copy,
  Check,
  Code2,
  Plug,
  LayoutDashboard,
  Users,
  ArrowUpRight,
  Clock,
  RefreshCw,
  AlertCircle,
  Search,
  User,
  ShoppingCart,
  Percent,
  Eye,
  Lock,
  Layers,
  HelpCircle,
  Radio,
  FileText,
  CreditCard,
  Receipt,
  TrendingUp,
  Download,
  Trash2,
  Filter,
  CheckSquare,
  Smartphone,
  BookOpen,
  Calendar,
  AlertTriangle,
  Sliders,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ─── Interfaces & Models ───────────────────────────────────────────────────
export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  stockCount: number;
  url: string;
  image: string;
  description: string;
  specs: Record<string, string>;
}

export interface StoreCoupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minSpend?: number;
  description: string;
  active: boolean;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  eventType: "catalog_sync" | "webhook_received" | "price_update" | "widget_handshake" | "subscription_update";
  status: "success" | "warning" | "error";
  message: string;
  skuCount?: number;
}

export interface ConnectedStore {
  id: string;
  name: string;
  platform: "Shopify" | "WooCommerce" | "Custom Store" | "Product Feed";
  domain: string;
  status: "active" | "syncing" | "pending_install" | "disconnected";
  productsCount: number;
  merchantId: string;
  apiKey: string;
  webhookSecret: string;
  connectedAt: string;
  lastSyncedAt: string;
  catalog: CatalogProduct[];
  coupons: StoreCoupon[];
  syncLogs: SyncLogEntry[];
}

export type PlanId = "starter" | "growth" | "business";

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  badge: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  features: string[];
  limits: {
    maxStores: number;
    maxConversations: number;
    maxCatalogSkus: number;
    hasPriceAlerts: boolean;
    hasAdvancedAnalytics: boolean;
    hasWebhooks: boolean;
    hasPrioritySupport: boolean;
  };
  ctaText: string;
  popular?: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  planName: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "refunded";
  pdfUrl: string;
}

export interface WidgetCustomization {
  brandColor: string;
  assistantName: string;
  tone: "Helpful & Warm" | "Direct & Concise" | "Premium Advisor";
  position: "bottom-right" | "bottom-left";
  welcomeMessage: string;
  enableComparisons: boolean;
  enableCoupons: boolean;
  enableStockAlerts: boolean;
  strictCatalogOnly: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: CatalogProduct[];
  comparison?: {
    itemA: CatalogProduct;
    itemB: CatalogProduct;
    verdict: string;
  };
  couponOffer?: StoreCoupon;
  timestamp: string;
}

// ─── SaaS Subscription Plans Configuration ─────────────────────────────────
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    badge: "14-Day Free Trial",
    priceMonthly: 0,
    priceAnnual: 0,
    description: "For merchants testing Aimiko AI shopping assistance on a single storefront.",
    features: [
      "1 connected store (Shopify or WooCommerce)",
      "Basic AI shopping assistant widget",
      "Up to 500 AI conversations / month",
      "Standard product search & recommendations",
      "Basic usage analytics"
    ],
    limits: {
      maxStores: 1,
      maxConversations: 500,
      maxCatalogSkus: 250,
      hasPriceAlerts: false,
      hasAdvancedAnalytics: false,
      hasWebhooks: false,
      hasPrioritySupport: false
    },
    ctaText: "Start 14-Day Free Trial"
  },
  {
    id: "growth",
    name: "Growth",
    badge: "Most Popular",
    priceMonthly: 2999,
    priceAnnual: 2399,
    popular: true,
    description: "For growing online businesses that want to lift conversion rates and basket sizes.",
    features: [
      "Up to 3 connected stores",
      "5,000 AI conversations / month",
      "Multi-attribute product comparison engine",
      "Automated deal & offer discovery",
      "Proactive shopping events & price drop alerts",
      "Advanced conversion telemetry & export",
      "Standard email & chat support"
    ],
    limits: {
      maxStores: 3,
      maxConversations: 5000,
      maxCatalogSkus: 2500,
      hasPriceAlerts: true,
      hasAdvancedAnalytics: true,
      hasWebhooks: true,
      hasPrioritySupport: false
    },
    ctaText: "Subscribe to Growth"
  },
  {
    id: "business",
    name: "Business",
    badge: "Scale & Enterprise",
    priceMonthly: 8999,
    priceAnnual: 7199,
    description: "For high-volume retailers and multi-brand merchants needing tailored integrations.",
    features: [
      "Up to 10 connected stores & headless apps",
      "50,000 AI conversations / month",
      "Custom Assistant LLM fine-tuning & brand voice",
      "High-throughput REST API & Webhook dispatch",
      "Dedicated merchant success manager",
      "99.99% Edge SLA & priority queue",
      "SOC2 Type II & GDPR compliance pack"
    ],
    limits: {
      maxStores: 10,
      maxConversations: 50000,
      maxCatalogSkus: 20000,
      hasPriceAlerts: true,
      hasAdvancedAnalytics: true,
      hasWebhooks: true,
      hasPrioritySupport: true
    },
    ctaText: "Choose Business"
  }
];

// ─── Fictional NovaMart Demo Catalog ───────────────────────────────────────
const NOVAMART_DEMO_PRODUCTS: CatalogProduct[] = [
  {
    id: "nova-1",
    name: "Sony WH-1000XM5 Wireless Headphones",
    sku: "SNY-WH1000XM5-BLK",
    category: "Audio",
    price: 24999,
    originalPrice: 31999,
    inStock: true,
    stockCount: 28,
    url: "https://novamart.store/products/sony-wh1000xm5",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    description: "Industry-leading dual processor active noise cancelling, 30-hour battery life, 8 mics, crystal clear hands-free calling.",
    specs: {
      "Battery Life": "30 Hours (ANC On)",
      "ANC Level": "Flagship V1 + QN1 Processor",
      "Driver": "30mm Carbon Fiber",
      "Connectivity": "Bluetooth 5.2 / LDAC"
    }
  },
  {
    id: "nova-2",
    name: "boAt Rockerz 450 Pro On-Ear",
    sku: "BAT-RCK450P-BLU",
    category: "Audio",
    price: 1799,
    originalPrice: 2990,
    inStock: true,
    stockCount: 84,
    url: "https://novamart.store/products/boat-rockerz-450-pro",
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&auto=format&fit=crop&q=80",
    description: "70 hours total playback, 40mm dynamic drivers, ASAP fast charging support (10 mins = 10 hrs).",
    specs: {
      "Battery Life": "70 Hours Playback",
      "ANC Level": "Passive Noise Isolation",
      "Driver": "40mm Dynamic Drivers",
      "Connectivity": "Bluetooth 5.0 / AUX"
    }
  },
  {
    id: "nova-3",
    name: "JBL Tune 770NC Adaptive ANC",
    sku: "JBL-T770NC-BLK",
    category: "Audio",
    price: 4499,
    originalPrice: 6999,
    inStock: true,
    stockCount: 42,
    url: "https://novamart.store/products/jbl-tune-770nc",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80",
    description: "Adaptive Noise Cancelling with Smart Ambient, Bluetooth 5.3 with LE Audio, speed charge, multi-point connection.",
    specs: {
      "Battery Life": "44 Hours (ANC On)",
      "ANC Level": "Adaptive Ambient Sound",
      "Driver": "40mm PureBass",
      "Connectivity": "Bluetooth 5.3 LE"
    }
  },
  {
    id: "nova-4",
    name: "Apple AirPods Pro (2nd Gen, USB-C)",
    sku: "APL-APP2-USBC",
    category: "Audio",
    price: 24900,
    originalPrice: 26900,
    inStock: true,
    stockCount: 15,
    url: "https://novamart.store/products/airpods-pro-2",
    image: "https://images.unsplash.com/photo-1588423771073-b8903febb85b?w=500&auto=format&fit=crop&q=80",
    description: "Pro-level Active Noise Cancellation, Adaptive Audio, Transparency mode, Personalized Spatial Audio with dynamic head tracking.",
    specs: {
      "Battery Life": "6h (30h with MagSafe Case)",
      "ANC Level": "H2 Computational ANC",
      "Driver": "Custom High-Excursion Apple",
      "Connectivity": "Bluetooth 5.3 / USB-C"
    }
  }
];

const NOVAMART_DEMO_COUPONS: StoreCoupon[] = [
  {
    id: "coup-1",
    code: "NOVATECH10",
    discountType: "percentage",
    discountValue: 10,
    minSpend: 3000,
    description: "10% instant discount on audio orders above ₹3,000",
    active: true
  },
  {
    id: "coup-2",
    code: "FREESHIP",
    discountType: "fixed",
    discountValue: 150,
    minSpend: 999,
    description: "Free express shipping on all domestic orders",
    active: true
  }
];

// ─── Main Move Component ────────────────────────────────────────────────────
export default function Move() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // View state: Public Marketing & Pricing Landing vs Merchant Dashboard
  const [currentView, setCurrentView] = useState<"landing" | "dashboard">("landing");

  // Billing Cycle Toggle (Monthly vs Annual)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  // Merchant Subscription & Billing State
  const [activePlanId, setActivePlanId] = useState<PlanId>("starter");
  const [subscriptionStatus, setSubscriptionStatus] = useState<"trial" | "active" | "past_due" | "cancelled">("trial");
  const [trialDaysLeft, setTrialDaysLeft] = useState(14);
  const [renewalDate, setRenewalDate] = useState("Nov 15, 2026");
  const [conversationsUsed, setConversationsUsed] = useState(184);

  // Invoices History
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "INV-2026-001",
      date: "Oct 15, 2026",
      planName: "Starter Trial",
      amount: 0,
      currency: "INR",
      status: "paid",
      pdfUrl: "#"
    }
  ]);

  // Payment Method on File
  const [paymentMethod, setPaymentMethod] = useState<{
    brand: string;
    last4: string;
    expMonth: string;
    expYear: string;
  }>({
    brand: "Visa",
    last4: "4242",
    expMonth: "12",
    expYear: "28"
  });

  // Dashboard Sub-Tabs
  const [activeDashboardTab, setActiveDashboardTab] = useState<
    "overview" | "billing" | "catalog" | "assistant" | "widget" | "developers"
  >("overview");

  // Connected Stores State (Multi-tenant ready; starts with 0 connected stores for honest onboarding)
  const [stores, setStores] = useState<ConnectedStore[]>([]);
  const activeStore = stores[0] || null;

  // Active Plan Object
  const currentPlan = useMemo(
    () => SUBSCRIPTION_PLANS.find((p) => p.id === activePlanId) || SUBSCRIPTION_PLANS[0],
    [activePlanId]
  );

  // Widget Customization & Rules State
  const [widgetSettings, setWidgetSettings] = useState<WidgetCustomization>({
    brandColor: "#7c3aed",
    assistantName: "Aimiko Shopping Concierge",
    tone: "Helpful & Warm",
    position: "bottom-right",
    welcomeMessage: "Hi there! I can help you search our catalog, compare products, or find active store discounts.",
    enableComparisons: true,
    enableCoupons: true,
    enableStockAlerts: true,
    strictCatalogOnly: true
  });

  // Setup Checklist Progress
  const [setupSteps, setSetupSteps] = useState({
    accountReady: true,
    planSelected: true,
    storeConnected: false,
    catalogSynced: false,
    assistantConfigured: false,
    widgetVerified: false
  });

  // Checkout / Plan Selection Modal State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]);
  const [cardNumberInput, setCardNumberInput] = useState("•••• •••• •••• 4242");
  const [cardExpiryInput, setCardExpiryInput] = useState("12/28");
  const [cardCvcInput, setCardCvcInput] = useState("123");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Connect Store Wizard Modal State
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"Shopify" | "WooCommerce" | "Custom Store" | "Product Feed">("Shopify");
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreDomain, setNewStoreDomain] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // CSV Catalog Ingestion State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // New Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponDesc, setNewCouponDesc] = useState("");

  // Live Handshake Tester State
  const [isTestingHandshake, setIsTestingHandshake] = useState(false);
  const [handshakeResult, setHandshakeResult] = useState<"idle" | "success" | "error">("idle");
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // ─── Interactive NovaMart Demo State ──────────────────────────────────────
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoInput, setDemoInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // In-dashboard Interactive Assistant Tester State
  const [testerInput, setTesterInput] = useState("");
  const [isTesterTyping, setIsTesterTyping] = useState(false);
  const [testerMessages, setTesterMessages] = useState<ChatMessage[]>([
    {
      id: "t-init",
      role: "assistant",
      content: "Hello! I am your store's live shopping assistant. Ask me anything about our products, specs, or deals.",
      timestamp: "Just now"
    }
  ]);

  const [demoMessages, setDemoMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Welcome to NovaMart Tech! I'm the Aimiko shopping copilot. I can search our catalog, compare audio specs, or check for any active discount codes. What are you shopping for today?",
      timestamp: "Just now"
    }
  ]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [demoMessages, testerMessages, isTyping, isTesterTyping]);

  // ─── AI Engine: Deterministic Catalog & Intent Resolution ─────────────────
  const processShoppingQuery = useCallback(
    (query: string, catalog: CatalogProduct[], coupons: StoreCoupon[]): {
      replyText: string;
      products?: CatalogProduct[];
      comparison?: { itemA: CatalogProduct; itemB: CatalogProduct; verdict: string };
      couponOffer?: StoreCoupon;
    } => {
      const q = query.toLowerCase().trim();

      // 1. Coupon & Offer Intent
      if (q.includes("coupon") || q.includes("discount") || q.includes("deal") || q.includes("offer") || q.includes("promo")) {
        const activeC = coupons.find((c) => c.active);
        if (activeC) {
          return {
            replyText: `Here is a verified deal currently active on this store:\n\n🎟️ Code: "${activeC.code}"\n${activeC.description}\n\nYou can apply this during checkout.`,
            couponOffer: activeC
          };
        }
        return {
          replyText: "Currently, all items are listed at standard store prices. No active promotional codes were found in the merchant's verified offer catalog."
        };
      }

      // 2. Comparison Intent
      if (q.includes("compare") || q.includes("vs") || q.includes("difference") || (q.includes("better") && catalog.length >= 2)) {
        if (catalog.length >= 2) {
          const itemA = catalog[0];
          const itemB = catalog[1];
          return {
            replyText: `Here is a side-by-side comparison between ${itemA.name} and ${itemB.name}:\n\n• Price: ₹${itemA.price.toLocaleString()} vs ₹${itemB.price.toLocaleString()}\n• Battery: ${itemA.specs["Battery Life"] || "Standard"} vs ${itemB.specs["Battery Life"] || "Standard"}\n• Noise Isolation: ${itemA.specs["ANC Level"] || "Standard"} vs ${itemB.specs["ANC Level"] || "Standard"}\n\nBoth products are in stock with verified merchant return policies.`,
            products: [itemA, itemB],
            comparison: {
              itemA,
              itemB,
              verdict: `${itemA.name} is recommended for top audio performance; ${itemB.name} is the value pick.`
            }
          };
        }
      }

      // 3. Price / Budget Intent (e.g., under 5000, cheap, budget)
      const budgetMatch = q.match(/\d+/);
      const budget = budgetMatch ? parseInt(budgetMatch[0], 10) : null;

      let filtered = catalog;
      if (budget && (q.includes("under") || q.includes("below") || q.includes("less") || budget > 500)) {
        const targetBudget = budget < 100 ? budget * 1000 : budget;
        filtered = catalog.filter((p) => p.price <= targetBudget);
      } else if (q.includes("cheap") || q.includes("budget") || q.includes("affordable")) {
        filtered = [...catalog].sort((a, b) => a.price - b.price);
      } else {
        // Keyword search in name or description
        const words = q.split(" ").filter((w) => w.length > 2);
        if (words.length > 0) {
          const matches = catalog.filter((p) =>
            words.some(
              (w) =>
                p.name.toLowerCase().includes(w) ||
                p.category.toLowerCase().includes(w) ||
                p.description.toLowerCase().includes(w)
            )
          );
          if (matches.length > 0) filtered = matches;
        }
      }

      if (filtered.length > 0) {
        return {
          replyText: `I found ${filtered.length} relevant product${filtered.length > 1 ? "s" : ""} in the catalog matching your inquiry:`,
          products: filtered.slice(0, 3)
        };
      }

      return {
        replyText: `I searched the store catalog but couldn't find an exact match for "${query}". You can ask about our available categories or browse items under specific price points.`
      };
    },
    []
  );

  // Send message in Public NovaMart Demo
  const handleSendDemoMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || demoInput).trim();
      if (!text) return;

      setDemoMessages((prev) => [
        ...prev,
        { id: "u-" + Date.now(), role: "user", content: text, timestamp: "Just now" }
      ]);
      setDemoInput("");
      setIsTyping(true);

      await new Promise((r) => setTimeout(r, 650));

      const response = processShoppingQuery(text, NOVAMART_DEMO_PRODUCTS, NOVAMART_DEMO_COUPONS);

      setDemoMessages((prev) => [
        ...prev,
        {
          id: "a-" + Date.now(),
          role: "assistant",
          content: response.replyText,
          products: response.products,
          comparison: response.comparison,
          couponOffer: response.couponOffer,
          timestamp: "Just now"
        }
      ]);
      setIsTyping(false);
    },
    [demoInput, processShoppingQuery]
  );

  // Send message in Merchant Dashboard Live Tester
  const handleSendTesterMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || testerInput).trim();
      if (!text) return;

      const currentCatalog = activeStore ? activeStore.catalog : NOVAMART_DEMO_PRODUCTS;
      const currentCoupons = activeStore ? activeStore.coupons : NOVAMART_DEMO_COUPONS;

      setTesterMessages((prev) => [
        ...prev,
        { id: "tu-" + Date.now(), role: "user", content: text, timestamp: "Just now" }
      ]);
      setTesterInput("");
      setIsTesterTyping(true);

      // Increment conversations usage meter
      setConversationsUsed((prev) => prev + 1);

      await new Promise((r) => setTimeout(r, 500));

      const response = processShoppingQuery(text, currentCatalog, currentCoupons);

      setTesterMessages((prev) => [
        ...prev,
        {
          id: "ta-" + Date.now(),
          role: "assistant",
          content: response.replyText,
          products: response.products,
          comparison: response.comparison,
          couponOffer: response.couponOffer,
          timestamp: "Just now"
        }
      ]);
      setIsTesterTyping(false);
    },
    [testerInput, activeStore, processShoppingQuery]
  );

  // Open Checkout Modal for a selected plan
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedCheckoutPlan(plan);
    setIsCheckoutModalOpen(true);
  };

  // Complete Payment & Subscription Activation
  const handleProcessSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsCheckoutModalOpen(false);
      setActivePlanId(selectedCheckoutPlan.id);
      setSubscriptionStatus(selectedCheckoutPlan.id === "starter" ? "trial" : "active");

      // Generate invoice
      const invoiceAmount =
        selectedCheckoutPlan.id === "starter"
          ? 0
          : billingCycle === "monthly"
          ? selectedCheckoutPlan.priceMonthly
          : selectedCheckoutPlan.priceAnnual * 12;

      const newInvoice: Invoice = {
        id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        date: "Oct 15, 2026",
        planName: `${selectedCheckoutPlan.name} (${billingCycle})`,
        amount: invoiceAmount,
        currency: "INR",
        status: "paid",
        pdfUrl: "#"
      };

      setInvoices((prev) => [newInvoice, ...prev]);

      toast({
        title: "🎉 Subscription Activated!",
        description: `You are now on the ${selectedCheckoutPlan.name} plan. All feature limits have been updated.`
      });

      setCurrentView("dashboard");
      setActiveDashboardTab("billing");
    }, 1200);
  };

  // Connect Store Form Submit Handler
  const handleConnectStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    // Check store limit based on plan
    if (stores.length >= currentPlan.limits.maxStores) {
      toast({
        title: "Store Limit Reached",
        description: `Your ${currentPlan.name} plan allows up to ${currentPlan.limits.maxStores} connected store(s). Please upgrade to add more.`,
        variant: "destructive"
      });
      setIsConnectModalOpen(false);
      handleSelectPlan(SUBSCRIPTION_PLANS[1]);
      return;
    }

    setIsConnecting(true);

    setTimeout(() => {
      const generatedMerchantId = `mrch_${Math.random().toString(36).substring(2, 9)}_${newStoreName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      const generatedApiKey = `aimiko_pk_live_${Math.random().toString(36).substring(2, 16)}`;
      const generatedWebhookSecret = `whsec_${Math.random().toString(36).substring(2, 20)}`;

      // Initial catalog: Sample products if Shopify, else ready for CSV
      const initialCatalog = selectedPlatform === "Shopify" ? [...NOVAMART_DEMO_PRODUCTS] : [];

      const newStore: ConnectedStore = {
        id: "store-" + Date.now(),
        name: newStoreName.trim(),
        platform: selectedPlatform,
        domain: newStoreDomain.trim() || `${newStoreName.toLowerCase().replace(/\s+/g, "")}.com`,
        status: "active",
        productsCount: initialCatalog.length,
        merchantId: generatedMerchantId,
        apiKey: generatedApiKey,
        webhookSecret: generatedWebhookSecret,
        connectedAt: "Today",
        lastSyncedAt: "Just now",
        catalog: initialCatalog,
        coupons: [...NOVAMART_DEMO_COUPONS],
        syncLogs: [
          {
            id: "log-1",
            timestamp: "Just now",
            eventType: "catalog_sync",
            status: "success",
            message: `Authorized ${selectedPlatform} integration. Read-only permissions validated.`,
            skuCount: initialCatalog.length
          }
        ]
      };

      setStores([newStore]);
      setSetupSteps((prev) => ({
        ...prev,
        storeConnected: true,
        catalogSynced: initialCatalog.length > 0
      }));

      setIsConnecting(false);
      setIsConnectModalOpen(false);
      setNewStoreName("");
      setNewStoreDomain("");
      setCurrentView("dashboard");
      setActiveDashboardTab("overview");

      toast({
        title: "⚡ Store Connected Successfully",
        description: `Linked ${newStore.name} via ${newStore.platform}. Ready to configure and embed.`
      });
    }, 900);
  };

  // CSV Catalog Ingestion Handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim().length > 0);

      const parsedProducts: CatalogProduct[] = [];
      const startIndex = lines[0].toLowerCase().includes("title") || lines[0].toLowerCase().includes("name") ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 2) {
          const name = parts[0] || `Product ${i}`;
          const price = parseFloat(parts[1]) || 999;
          const category = parts[2] || "General";
          const sku = parts[3] || `SKU-${1000 + i}`;
          const description = parts[4] || `${name} in ${category}`;

          parsedProducts.push({
            id: `imp-${Date.now()}-${i}`,
            name,
            sku,
            category,
            price,
            inStock: true,
            stockCount: 50,
            url: activeStore ? `https://${activeStore.domain}/products/${sku.toLowerCase()}` : "#",
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
            description,
            specs: { "Source Feed": "CSV Import", "Stock": "Available" }
          });
        }
      }

      if (parsedProducts.length > 0 && activeStore) {
        setStores((prev) =>
          prev.map((s, idx) =>
            idx === 0
              ? {
                  ...s,
                  catalog: [...parsedProducts, ...s.catalog],
                  productsCount: s.productsCount + parsedProducts.length,
                  lastSyncedAt: "Just now",
                  syncLogs: [
                    {
                      id: "log-" + Date.now(),
                      timestamp: "Just now",
                      eventType: "catalog_sync",
                      status: "success",
                      message: `Imported ${parsedProducts.length} products from CSV feed.`,
                      skuCount: parsedProducts.length
                    },
                    ...s.syncLogs
                  ]
                }
              : s
          )
        );

        setSetupSteps((prev) => ({ ...prev, catalogSynced: true }));

        toast({
          title: "✅ Feed Ingestion Complete",
          description: `Successfully imported ${parsedProducts.length} items into store catalog.`
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Add Coupon Handler
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || !activeStore) return;

    const newCoupon: StoreCoupon = {
      id: "coup-" + Date.now(),
      code: newCouponCode.trim().toUpperCase(),
      discountType: "percentage",
      discountValue: newCouponValue,
      description: newCouponDesc.trim() || `${newCouponValue}% off store items`,
      active: true
    };

    setStores((prev) =>
      prev.map((s, idx) => (idx === 0 ? { ...s, coupons: [newCoupon, ...s.coupons] } : s))
    );

    setIsCouponModalOpen(false);
    setNewCouponCode("");
    setNewCouponDesc("");

    toast({
      title: "🎟️ Coupon Added",
      description: `Active code "${newCoupon.code}" will now be surfaced to relevant shoppers.`
    });
  };

  // Live Handshake Tester
  const handleVerifyHandshake = () => {
    setIsTestingHandshake(true);
    setHandshakeResult("idle");

    setTimeout(() => {
      setIsTestingHandshake(false);
      setHandshakeResult("success");
      setSetupSteps((prev) => ({
        ...prev,
        assistantConfigured: true,
        widgetVerified: true
      }));

      if (activeStore) {
        setStores((prev) =>
          prev.map((s, idx) =>
            idx === 0
              ? {
                  ...s,
                  syncLogs: [
                    {
                      id: "log-" + Date.now(),
                      timestamp: "Just now",
                      eventType: "widget_handshake",
                      status: "success",
                      message: "Live storefront handshake verified: 200 OK ping from store domain."
                    },
                    ...s.syncLogs
                  ]
                }
              : s
          )
        );
      }

      toast({
        title: "✅ Handshake Verified!",
        description: "Aimiko widget is active and responding to customer events."
      });
    }, 1100);
  };

  // Disconnect Store Handler
  const handleDisconnectStore = (storeId: string) => {
    if (window.confirm("Are you sure you want to disconnect this store? This will revoke widget access.")) {
      setStores((prev) => prev.filter((s) => s.id !== storeId));
      setSetupSteps((prev) => ({
        ...prev,
        storeConnected: false,
        catalogSynced: false,
        widgetVerified: false
      }));
      toast({
        title: "Store Disconnected",
        description: "Credentials and catalog cache removed securely."
      });
    }
  };

  // Active Catalog Filtered
  const filteredCatalog = useMemo(() => {
    const list = activeStore ? activeStore.catalog : NOVAMART_DEMO_PRODUCTS;
    return list.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchCat = categoryFilter === "all" || item.category.toLowerCase() === categoryFilter.toLowerCase();
      return matchSearch && matchCat;
    });
  }, [activeStore, catalogSearch, categoryFilter]);

  // Code embed snippet
  const currentMerchantId = activeStore?.merchantId || "aimiko_demo_novamart";
  const embedCodeSnippet = `<!-- AIMIKO Commerce AI Shopping Widget -->
<script
  src="https://cdn.aimiko.ai/v1/commerce.js"
  data-merchant-id="${currentMerchantId}"
  data-position="${widgetSettings.position}"
  data-theme-color="${widgetSettings.brandColor}"
  async
></script>`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-foreground">
      <MainNavbar />

      {/* ── Sub-Navigation / Switcher Bar ── */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-border/80 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView("landing")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentView === "landing"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              Public Platform &amp; Pricing
            </button>
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentView === "dashboard"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Merchant Dashboard</span>
              <span className="px-1.5 py-0.2 bg-purple-500/15 text-purple-700 dark:text-purple-300 rounded text-[10px] font-extrabold uppercase">
                {currentPlan.name}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Subscription Active</span>
            </div>
            <button
              onClick={() => handleSelectPlan(SUBSCRIPTION_PLANS[1])}
              className="font-extrabold text-purple-700 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/25 transition-colors cursor-pointer"
            >
              Current Plan: {currentPlan.name}
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── 1. PUBLIC LANDING PAGE (MARKETING + LIVE DEMO + PRICING) ── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {currentView === "landing" && (
        <div className="space-y-20 pb-24">
          
          {/* ── Hero Section ── */}
          <section className="relative overflow-hidden pt-16 pb-16 px-4 sm:px-6 lg:px-8 border-b border-border/60">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none" />
            
            <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 fill-current" />
                <span>Aimiko Commerce SaaS · Make Your Store AI-Powered</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
                Make Your Store <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">AI-Powered.</span>
              </h1>

              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                Connect your existing e-commerce storefront to Aimiko's universal AI shopping ecosystem. Enable instant conversational product discovery, side-by-side spec comparisons, and personalized deal surface.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => handleSelectPlan(SUBSCRIPTION_PLANS[0])}
                  className="rounded-2xl h-12 px-7 font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 gap-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById("novamart-live-demo");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-2xl h-12 px-7 font-bold text-sm gap-2 border-border/80 hover:bg-secondary/60"
                >
                  <Eye className="h-4 w-4 text-purple-600" />
                  <span>View Demo</span>
                </Button>
              </div>

              <div className="pt-2 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-4">
                <span>✓ 14-day free trial on Starter</span>
                <span>✓ Cancel anytime with 1 click</span>
                <span>✓ Works with Shopify, WooCommerce &amp; Custom APIs</span>
              </div>
            </div>
          </section>

          {/* ── Live NovaMart AI Demo ── */}
          <section id="novamart-live-demo" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-1">
                  Live Merchant Storefront Demo
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                  Experience NovaMart with Aimiko Embedded
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  See how the universal AI shopping assistant helps customers discover products, compare features, and apply deals.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setDemoOpen(true)}
                className="rounded-xl text-xs font-bold h-9 gap-1.5 self-start sm:self-auto border-border/80"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Fullscreen Demo
              </Button>
            </div>

            {/* Embedded Storefront Card */}
            <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xs">
              <div className="bg-secondary/50 border-b border-border/60 px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-mono text-muted-foreground text-[11px] bg-background/60 px-3 py-1 rounded-md border border-border/40 ml-2">
                    https://novamart.store/audio
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Simulated Storefront
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
                {/* Left 2 Cols: NovaMart Products */}
                <div className="lg:col-span-2 p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div>
                      <h3 className="text-lg font-black text-foreground tracking-tight">NovaMart Electronics</h3>
                      <p className="text-xs text-muted-foreground">Your everyday tech, made easier to find.</p>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-lg">
                      Headphones (4 items)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {NOVAMART_DEMO_PRODUCTS.map((prod) => (
                      <div
                        key={prod.id}
                        className="bg-secondary/30 border border-border/60 rounded-2xl p-3.5 space-y-2.5 flex flex-col justify-between hover:border-purple-400/60 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="h-32 w-full rounded-xl overflow-hidden bg-background relative">
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                              Demo product
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                              {prod.category}
                            </span>
                            <h4 className="text-xs font-bold text-foreground line-clamp-1">{prod.name}</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{prod.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-border/40">
                          <div>
                            <span className="text-xs font-black text-foreground">Demo price: ₹{prod.price.toLocaleString()}</span>
                            {prod.originalPrice && (
                              <span className="text-[10px] text-muted-foreground line-through ml-1.5">
                                ₹{prod.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              handleSendDemoMessage(`Compare ${prod.name} with other options`);
                            }}
                            className="rounded-xl h-7 px-2.5 text-[10px] font-bold gap-1"
                          >
                            <Bot className="h-3 w-3 text-purple-600" /> Ask Aimiko
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted-foreground italic text-center pt-1">
                    Simulated products and prices — not live retailer data.
                  </p>
                </div>

                {/* Right 1 Col: AI Assistant Widget */}
                <div className="p-4 sm:p-5 flex flex-col justify-between bg-purple-500/5 h-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">Ask Aimiko</div>
                          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Assistant
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded-md border border-border/40">
                        NovaMart Widget
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-72 overflow-y-auto text-xs pr-1">
                      {demoMessages.map((msg) => (
                        <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`p-3 rounded-2xl max-w-[90%] space-y-2 text-xs leading-relaxed ${
                              msg.role === "user"
                                ? "bg-purple-600 text-white rounded-tr-none font-medium"
                                : "bg-card border border-border/80 text-foreground rounded-tl-none shadow-2xs"
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.content}</p>

                            {msg.products && (
                              <div className="space-y-1.5 pt-1">
                                {msg.products.map((p) => (
                                  <div
                                    key={p.id}
                                    className="bg-secondary/70 border border-border/60 rounded-xl p-2 flex items-center justify-between gap-2 text-[11px]"
                                  >
                                    <div className="truncate">
                                      <div className="font-bold text-foreground truncate">{p.name}</div>
                                      <div className="text-purple-600 dark:text-purple-400 font-bold">
                                        ₹{p.price.toLocaleString()}
                                      </div>
                                    </div>
                                    <span className="text-[9px] bg-background px-1.5 py-0.5 rounded border border-border/40 font-bold shrink-0">
                                      In Stock
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {msg.couponOffer && (
                              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-800 dark:text-emerald-300 space-y-1">
                                <div className="font-mono font-bold text-xs">🏷️ {msg.couponOffer.code}</div>
                                <div className="text-[10px]">{msg.couponOffer.description}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex gap-2">
                          <div className="p-2.5 bg-card border border-border/80 rounded-2xl rounded-tl-none flex gap-1">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {[
                        "Find me the best headphones under ₹5,000",
                        "Compare Sony XM5 vs JBL",
                        "Any active coupons?"
                      ].map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendDemoMessage(prompt)}
                          className="bg-card hover:bg-secondary text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg border border-border/60 transition-colors text-left"
                        >
                          “{prompt}”
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={demoInput}
                        onChange={(e) => setDemoInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendDemoMessage();
                        }}
                        placeholder="Ask Aimiko..."
                        className="flex-1 bg-background border border-border/80 rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <Button
                        size="sm"
                        disabled={!demoInput.trim() || isTyping}
                        onClick={() => handleSendDemoMessage()}
                        className="rounded-xl h-8 px-2.5 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ── 2. SUBSCRIPTION PLANS & PRICING SECTION ── */}
          <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Transparent SaaS Pricing
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-foreground">
                Subscription Plans for Every Store
              </h2>
              <p className="text-xs text-muted-foreground">
                Start with a 14-day free trial on Starter. Upgrade or cancel anytime from your dashboard.
              </p>

              {/* Billing Cycle Switcher */}
              <div className="inline-flex items-center bg-secondary/80 p-1 rounded-2xl border border-border/60 gap-1 mt-2">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    billingCycle === "monthly" ? "bg-white dark:bg-slate-900 text-foreground shadow-2xs" : "text-muted-foreground"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    billingCycle === "annual" ? "bg-white dark:bg-slate-900 text-foreground shadow-2xs" : "text-muted-foreground"
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[9px] font-extrabold uppercase">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnual;
                const isCurrent = activePlanId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`bg-card border rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between transition-all relative ${
                      plan.popular
                        ? "border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30"
                        : "border-border/80 shadow-2xs hover:border-purple-300"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
                        {!plan.popular && (
                          <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px]">
                        {plan.description}
                      </p>

                      <div className="pt-2 border-t border-border/40">
                        {plan.id === "starter" ? (
                          <div>
                            <span className="text-3xl font-black text-foreground">Free</span>
                            <span className="text-xs text-muted-foreground ml-1.5">/ 14 days</span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-3xl font-black text-foreground">₹{price.toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground ml-1.5">/ month</span>
                            {billingCycle === "annual" && (
                              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                                Billed annually (₹{(price * 12).toLocaleString()}/yr)
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Feature Bullet points */}
                      <div className="space-y-2 pt-2 border-t border-border/40">
                        <span className="text-[11px] font-bold text-foreground block">Included in {plan.name}:</span>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrent}
                      className={`w-full rounded-xl text-xs font-bold h-11 ${
                        plan.popular
                          ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20"
                          : "border border-border/80 hover:bg-secondary/70"
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {isCurrent ? "Current Active Plan" : plan.ctaText}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Supported Integrations Section ── */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Universal Connectors
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Supported E-Commerce Platforms
              </h2>
              <p className="text-xs text-muted-foreground">
                Connect your existing website, mobile app, or product catalog feed seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: "Shopify", desc: "Official app & GraphQL Storefront API", status: "Live" },
                { name: "WooCommerce", desc: "Authorized REST API connection", status: "Live" },
                { name: "Product Feeds", desc: "Scheduled CSV & XML feed imports", status: "Live" },
                { name: "Custom Stores", desc: "REST APIs & embeddable JS widget", status: "Live" }
              ].map((plat, idx) => (
                <div key={idx} className="bg-card border border-border/80 rounded-2xl p-4.5 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">{plat.name}</h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                      {plat.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plat.desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── 2. MERCHANT DASHBOARD (SUBSCRIPTION & OPERATIONS WORKSPACE) ── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {currentView === "dashboard" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 border-b border-border/60 pb-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold">
                <Store className="h-3.5 w-3.5 text-purple-600" />
                <span>Merchant Dashboard</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-emerald-600 font-bold capitalize">Plan: {currentPlan.name}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-foreground">
                Aimiko Commerce Console
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage your subscription, connect existing stores, and monitor catalog synchronization.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                size="sm"
                onClick={() => handleSelectPlan(SUBSCRIPTION_PLANS[1])}
                className="rounded-xl text-xs font-bold h-10 px-4 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Zap className="h-4 w-4" /> Change / Upgrade Plan
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsConnectModalOpen(true)}
                className="rounded-xl text-xs font-bold h-10 px-4 gap-1.5"
              >
                <Plus className="h-4 w-4" /> Connect Store
              </Button>
            </div>
          </div>

          {/* Top KPI Cards: Plan, Usage & Renewal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Plan & Status */}
            <div className="bg-card border border-border/80 rounded-2xl p-4.5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Active Subscription</span>
                <CreditCard className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-foreground">{currentPlan.name}</div>
              <span className="text-[10px] text-emerald-600 font-bold block">
                {subscriptionStatus === "trial" ? `${trialDaysLeft} days remaining in trial` : "Active Subscription"}
              </span>
            </div>

            {/* 2. Monthly AI Conversations Usage */}
            <div className="bg-card border border-border/80 rounded-2xl p-4.5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>AI Conversations</span>
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-foreground">
                {conversationsUsed} <span className="text-xs font-normal text-muted-foreground">/ {currentPlan.limits.maxConversations}</span>
              </div>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (conversationsUsed / currentPlan.limits.maxConversations) * 100)}%` }}
                />
              </div>
            </div>

            {/* 3. Connected Stores */}
            <div className="bg-card border border-border/80 rounded-2xl p-4.5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Store Connections</span>
                <Store className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-foreground">
                {stores.length} <span className="text-xs font-normal text-muted-foreground">/ {currentPlan.limits.maxStores}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {stores.length === 0 ? "No active stores connected" : `${activeStore?.name} linked`}
              </span>
            </div>

            {/* 4. Renewal Date */}
            <div className="bg-card border border-border/80 rounded-2xl p-4.5 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Renewal / Expiration</span>
                <Calendar className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-foreground">{renewalDate}</div>
              <span className="text-[10px] text-muted-foreground">
                Auto-renews via {paymentMethod.brand} •••• {paymentMethod.last4}
              </span>
            </div>
          </div>

          {/* ── Dashboard Navigation Tabs ── */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
            {[
              { id: "overview" as const, label: "Stores & Overview", icon: LayoutDashboard },
              { id: "billing" as const, label: "Subscription & Invoices", icon: CreditCard },
              { id: "catalog" as const, label: "Catalog & Sync", icon: Package },
              { id: "assistant" as const, label: "Assistant & Deals", icon: Settings },
              { id: "widget" as const, label: "Widget & Testing", icon: Code2 },
              { id: "developers" as const, label: "API Keys & Webhooks", icon: Key }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDashboardTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeDashboardTab === tab.id
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── SUB-TAB 1: STORES & OVERVIEW ── */}
          {activeDashboardTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Store Card or Empty State */}
                {activeStore ? (
                  <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-border/60 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-bold flex items-center justify-center">
                          {activeStore.platform[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground">{activeStore.name}</h3>
                          <a
                            href={`https://${activeStore.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted-foreground hover:text-purple-600 flex items-center gap-1"
                          >
                            <span>{activeStore.domain}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          Active Store
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnectStore(activeStore.id)}
                          className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-secondary/30 rounded-xl">
                        <span className="text-muted-foreground block text-[10px]">Platform</span>
                        <span className="font-bold text-foreground">{activeStore.platform}</span>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-xl">
                        <span className="text-muted-foreground block text-[10px]">Catalog SKUs</span>
                        <span className="font-bold text-foreground">{activeStore.productsCount} items</span>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-xl">
                        <span className="text-muted-foreground block text-[10px]">Active Coupons</span>
                        <span className="font-bold text-foreground">{activeStore.coupons.length} active</span>
                      </div>
                      <div className="p-3 bg-secondary/30 rounded-xl">
                        <span className="text-muted-foreground block text-[10px]">Sync Status</span>
                        <span className="font-bold text-emerald-600">Synced</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        size="sm"
                        onClick={() => setActiveDashboardTab("widget")}
                        className="rounded-xl text-xs font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white gap-2"
                      >
                        <Code2 className="h-4 w-4" />
                        <span>Install Storefront Widget</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveDashboardTab("catalog")}
                        className="rounded-xl text-xs font-bold h-9"
                      >
                        Manage Catalog
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card border border-border/80 rounded-3xl p-8 text-center space-y-4 shadow-xs">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 mx-auto flex items-center justify-center">
                      <Store className="h-6 w-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="font-bold text-base text-foreground">No Store Connected Yet</h3>
                      <p className="text-xs text-muted-foreground">
                        Connect your Shopify, WooCommerce, or Custom store to synchronize products and activate AI shopping assistance.
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsConnectModalOpen(true)}
                      className="rounded-xl text-xs font-bold h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Connect Your Store
                    </Button>
                  </div>
                )}

                {/* Setup Progress */}
                <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" /> Setup Checklist
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    {[
                      { title: "Select a plan", desc: `Active plan: ${currentPlan.name}`, done: true },
                      { title: "Connect a store", desc: "Link your Shopify, WooCommerce, or feed", done: setupSteps.storeConnected },
                      { title: "Sync product catalog", desc: "Index products into Aimiko", done: setupSteps.catalogSynced },
                      { title: "Configure assistant rules", desc: "Set tone, greetings, and coupons", done: setupSteps.assistantConfigured },
                      { title: "Install and verify widget", desc: "Embed script and verify live handshake", done: setupSteps.widgetVerified }
                    ].map((step, sIdx) => (
                      <div key={sIdx} className="p-3 bg-secondary/30 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step.done ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground border border-border"}`}>
                            {step.done ? <Check className="h-3 w-3" /> : sIdx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">{step.title}</span>
                            <span className="text-[11px] text-muted-foreground block">{step.desc}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold ${step.done ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {step.done ? "Completed" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Plan Summary & Quick Upgrade Card */}
              <div className="space-y-6">
                <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">Current Plan Details</h3>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      {currentPlan.name}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Stores Allowed</span>
                      <span className="font-bold text-foreground">{currentPlan.limits.maxStores} store(s)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Conversations Quota</span>
                      <span className="font-bold text-foreground">{currentPlan.limits.maxConversations} / month</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Max Catalog SKUs</span>
                      <span className="font-bold text-foreground">{currentPlan.limits.maxCatalogSkus} items</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Price Alerts &amp; Deals</span>
                      <span className="font-bold text-foreground">{currentPlan.limits.hasPriceAlerts ? "Enabled" : "Upgrade Required"}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveDashboardTab("billing")}
                    className="w-full rounded-xl text-xs font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Manage Subscription &amp; Billing
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── SUB-TAB 2: SUBSCRIPTION & INVOICES (BILLING DASHBOARD) ── */}
          {activeDashboardTab === "billing" && (
            <div className="space-y-6">
              {/* Active Plan & Switcher Card */}
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
                  <div>
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                      Subscription Management
                    </span>
                    <h3 className="text-xl font-black text-foreground">
                      Current Plan: {currentPlan.name} ({subscriptionStatus === "trial" ? "Trial Period" : "Active Subscription"})
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Next renewal date: {renewalDate} · Billed {billingCycle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSelectPlan(SUBSCRIPTION_PLANS[1])}
                      className="rounded-xl text-xs font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Upgrade Plan
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to cancel your subscription? Your access will expire at the end of the current billing cycle.")) {
                          setSubscriptionStatus("cancelled");
                          toast({ title: "Subscription Cancelled", description: "You will retain access until the end of your billing cycle." });
                        }
                      }}
                      className="rounded-xl text-xs font-bold h-9 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                    >
                      Cancel Subscription
                    </Button>
                  </div>
                </div>

                {/* Plan Comparison Switcher Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        activePlanId === plan.id
                          ? "bg-purple-500/5 border-purple-500 ring-1 ring-purple-500"
                          : "bg-secondary/20 border-border/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{plan.name}</span>
                        {activePlanId === plan.id && (
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-black text-foreground mt-2">
                        {plan.id === "starter" ? "Free" : `₹${plan.priceMonthly.toLocaleString()}`}
                        <span className="text-xs font-normal text-muted-foreground">/mo</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {plan.limits.maxConversations.toLocaleString()} conversations · {plan.limits.maxStores} store(s)
                      </div>
                      <Button
                        size="sm"
                        disabled={activePlanId === plan.id}
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full rounded-xl text-xs font-bold h-8 mt-3"
                        variant={activePlanId === plan.id ? "secondary" : "default"}
                      >
                        {activePlanId === plan.id ? "Active Plan" : `Switch to ${plan.name}`}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods & Invoices Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Method */}
                <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-600" /> Payment Method
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast({ title: "Update Card", description: "Payment gateway modal ready." });
                      }}
                      className="rounded-xl text-xs font-bold h-8"
                    >
                      Update Card
                    </Button>
                  </div>

                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-slate-900 text-white rounded font-mono text-[10px] flex items-center justify-center font-bold">
                        {paymentMethod.brand}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {paymentMethod.brand} ending in •••• {paymentMethod.last4}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Expires {paymentMethod.expMonth}/{paymentMethod.expYear}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Default
                    </span>
                  </div>
                </div>

                {/* Invoices History */}
                <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-purple-600" /> Billing History &amp; Invoices
                  </h3>

                  <div className="space-y-2 text-xs">
                    {invoices.map((inv) => (
                      <div key={inv.id} className="p-3 bg-secondary/30 rounded-xl border border-border/60 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-foreground">{inv.id} — {inv.planName}</div>
                          <div className="text-[10px] text-muted-foreground">{inv.date}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-foreground">₹{inv.amount.toLocaleString()}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SUB-TAB 3: CATALOG & INVENTORY SYNC ── */}
          {activeDashboardTab === "catalog" && (
            <div className="space-y-6">
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600" /> Synchronized Product Catalog
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Products indexed by Aimiko to answer customer inquiries and recommend items.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv,.txt"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl text-xs font-bold h-9 gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" /> Import CSV Feed
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        toast({ title: "Sync Refresh Triggered", description: "Checking for catalog changes." });
                      }}
                      className="rounded-xl text-xs font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Re-sync
                    </Button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="relative w-full sm:w-72">
                    <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search by title, SKU, or category..."
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      className="w-full bg-secondary/40 border border-border/80 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-muted-foreground">Category:</span>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-secondary/40 border border-border/80 rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="audio">Audio</option>
                      <option value="electronics">Electronics</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                {/* Catalog Table */}
                <div className="border border-border/60 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-secondary/60 text-muted-foreground font-semibold border-b border-border/60">
                      <tr>
                        <th className="p-3">Product Name</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Availability</th>
                        <th className="p-3 text-right">Retailer Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredCatalog.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-muted-foreground text-xs">
                            No products found in catalog. Connect your store or import a CSV feed above.
                          </td>
                        </tr>
                      ) : (
                        filteredCatalog.map((prod) => (
                          <tr key={prod.id} className="hover:bg-secondary/30 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2.5">
                                <img src={prod.image} alt={prod.name} className="w-8 h-8 rounded-lg object-cover" />
                                <span className="font-bold text-foreground line-clamp-1">{prod.name}</span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-muted-foreground text-[11px]">{prod.sku}</td>
                            <td className="p-3 text-muted-foreground">{prod.category}</td>
                            <td className="p-3 font-black text-foreground">₹{prod.price.toLocaleString()}</td>
                            <td className="p-3">
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                In Stock ({prod.stockCount})
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <a
                                href={prod.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-600 hover:text-purple-700 font-bold inline-flex items-center gap-1 text-[11px]"
                              >
                                <span>View Page</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── SUB-TAB 4: ASSISTANT RULES & OFFER MANAGER ── */}
          {activeDashboardTab === "assistant" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-600" /> Assistant Persona &amp; Guardrails
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Assistant Display Name</label>
                    <input
                      type="text"
                      value={widgetSettings.assistantName}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, assistantName: e.target.value })}
                      className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Tone of Voice</label>
                    <select
                      value={widgetSettings.tone}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, tone: e.target.value as any })}
                      className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none"
                    >
                      <option value="Helpful & Warm">Helpful &amp; Warm</option>
                      <option value="Direct & Concise">Direct &amp; Concise</option>
                      <option value="Premium Advisor">Premium Advisor</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-muted-foreground block mb-1">Welcome Prompt Message</label>
                    <textarea
                      rows={2}
                      value={widgetSettings.welcomeMessage}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, welcomeMessage: e.target.value })}
                      className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="font-bold text-muted-foreground block">Shopping Engine Features</label>

                    <div className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-xl border border-border/60">
                      <div>
                        <div className="font-bold text-foreground">Cross-Product Attribute Comparisons</div>
                        <div className="text-[10px] text-muted-foreground">Compare items side-by-side upon request.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={widgetSettings.enableComparisons}
                        onChange={(e) => setWidgetSettings({ ...widgetSettings, enableComparisons: e.target.checked })}
                        className="rounded accent-purple-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-xl border border-border/60">
                      <div>
                        <div className="font-bold text-foreground">Store Coupon &amp; Deal Discovery</div>
                        <div className="text-[10px] text-muted-foreground">Surface verified coupons from your active list.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={widgetSettings.enableCoupons}
                        onChange={(e) => setWidgetSettings({ ...widgetSettings, enableCoupons: e.target.checked })}
                        className="rounded accent-purple-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-xl border border-border/60">
                      <div>
                        <div className="font-bold text-foreground">Strict Catalog Guardrails</div>
                        <div className="text-[10px] text-muted-foreground">Do not recommend products or prices outside catalog.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={widgetSettings.strictCatalogOnly}
                        onChange={(e) => setWidgetSettings({ ...widgetSettings, strictCatalogOnly: e.target.checked })}
                        className="rounded accent-purple-600"
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSetupSteps((p) => ({ ...p, assistantConfigured: true }));
                      toast({ title: "Rules Saved", description: "Assistant tone and permissions updated." });
                    }}
                    className="rounded-xl text-xs font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Save Rules &amp; Guardrails
                  </Button>
                </div>
              </div>

              {/* Right Col: Verified Store Deals & Coupons */}
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-600" /> Active Store Coupons &amp; Deals
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCouponModalOpen(true)}
                    className="rounded-xl text-xs font-bold h-8 gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Coupon
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  The assistant will only surface valid deals explicitly added here. No hallucinated discounts.
                </p>

                <div className="space-y-2.5">
                  {(activeStore ? activeStore.coupons : NOVAMART_DEMO_COUPONS).map((coup) => (
                    <div
                      key={coup.id}
                      className="p-3 bg-secondary/30 rounded-xl border border-border/60 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                            {coup.code}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.2 rounded">
                            {coup.discountValue}% OFF
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">{coup.description}</div>
                      </div>

                      <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SUB-TAB 5: WIDGET PREVIEW & INSTALLATION ── */}
          {activeDashboardTab === "widget" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Col: Widget Embed Snippet & Handshake Tester */}
              <div className="space-y-6">
                <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-purple-600" /> 1-Line Embed Script Tag
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Copy and paste this script snippet before the closing <code className="text-purple-600 font-mono">&lt;/head&gt;</code> or <code className="text-purple-600 font-mono">&lt;/body&gt;</code> tag on your store website:
                  </p>

                  <div className="bg-[#0f172a] text-slate-200 rounded-2xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                      <span>HTML Integration</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(embedCodeSnippet).catch(() => {});
                          setCopiedSnippet(true);
                          setTimeout(() => setCopiedSnippet(false), 2000);
                          toast({ title: "Copied Code", description: "Widget script tag copied to clipboard." });
                        }}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        {copiedSnippet ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedSnippet ? "Copied" : "Copy Code"}</span>
                      </button>
                    </div>
                    <pre className="text-emerald-300 whitespace-pre-wrap">{embedCodeSnippet}</pre>
                  </div>

                  {/* Handshake Verification */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30 border border-border/60 p-3.5 rounded-2xl">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Verify Live Store Connection</span>
                      <span className="text-[11px] text-muted-foreground block">
                        Test whether the widget is actively pinging from your store domain.
                      </span>
                    </div>

                    <Button
                      onClick={handleVerifyHandshake}
                      disabled={isTestingHandshake}
                      className="rounded-xl text-xs font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white shrink-0 gap-1.5"
                    >
                      {isTestingHandshake ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      <span>{isTestingHandshake ? "Testing..." : "Verify Live Handshake"}</span>
                    </Button>
                  </div>

                  {handshakeResult === "success" && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>Live handshake verified! Assistant is receiving requests from your storefront.</span>
                    </div>
                  )}
                </div>

                {/* Mobile SDK Guidance */}
                <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-600" /> Mobile Apps &amp; Headless SDKs
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Building a React Native, iOS, or Android mobile app? Use our lightweight mobile SDK with retailer-approved deep-links:
                  </p>
                  <div className="bg-secondary/40 p-3 rounded-xl font-mono text-[11px] text-muted-foreground">
                    npm install @aimiko/commerce-widget
                  </div>
                </div>
              </div>

              {/* Right Col: Live Interactive Assistant Sandbox with Connected Catalog */}
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {widgetSettings.assistantName}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Testing against {activeStore ? activeStore.name : "NovaMart Catalog"}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-secondary px-2 py-0.5 rounded border border-border/60 font-bold text-muted-foreground">
                      Live Test Console
                    </span>
                  </div>

                  {/* Chat messages */}
                  <div className="space-y-2.5 max-h-80 overflow-y-auto text-xs pr-1">
                    {testerMessages.map((msg) => (
                      <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`p-3 rounded-2xl max-w-[90%] space-y-2 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-purple-600 text-white rounded-tr-none font-medium"
                              : "bg-secondary/40 border border-border/60 text-foreground rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>

                          {msg.products && (
                            <div className="space-y-1.5 pt-1">
                              {msg.products.map((p) => (
                                <div
                                  key={p.id}
                                  className="bg-card border border-border/60 rounded-xl p-2 flex items-center justify-between gap-2 text-[11px]"
                                >
                                  <div className="truncate">
                                    <div className="font-bold text-foreground truncate">{p.name}</div>
                                    <div className="text-purple-600 font-bold">₹{p.price.toLocaleString()}</div>
                                  </div>
                                  <a
                                    href={p.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-purple-600 font-bold shrink-0 hover:underline"
                                  >
                                    View
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          {msg.couponOffer && (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-700 dark:text-emerald-300 font-mono text-[11px]">
                              🎟️ {msg.couponOffer.code}: {msg.couponOffer.description}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isTesterTyping && (
                      <div className="flex gap-2">
                        <div className="p-2.5 bg-secondary/40 border border-border/60 rounded-xl inline-flex gap-1">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tester Input */}
                <div className="pt-2 border-t border-border/60 space-y-2">
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {[
                      "Compare two products",
                      "Show items under ₹5,000",
                      "Do we have any coupons?"
                    ].map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendTesterMessage(sug)}
                        className="bg-secondary/40 hover:bg-secondary text-muted-foreground px-2 py-0.5 rounded-lg border border-border/40 text-[10px]"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={testerInput}
                      onChange={(e) => setTesterInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendTesterMessage();
                      }}
                      placeholder="Type a shopper question..."
                      className="flex-1 bg-secondary/30 border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                    />
                    <Button
                      size="sm"
                      disabled={!testerInput.trim() || isTesterTyping}
                      onClick={() => handleSendTesterMessage()}
                      className="rounded-xl h-8.5 px-3 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SUB-TAB 6: DEVELOPERS & API KEYS ── */}
          {activeDashboardTab === "developers" && (
            <div className="space-y-6">
              <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Key className="h-4 w-4 text-purple-600" /> Developer Credentials &amp; API Keys
                </h3>
                <p className="text-xs text-muted-foreground">
                  Use these credentials to authenticate storefront webhook callbacks and REST API endpoints.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Merchant Identifier</span>
                    <div className="font-mono font-bold text-foreground truncate">{currentMerchantId}</div>
                  </div>

                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/60 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Public Storefront API Key</span>
                    <div className="font-mono font-bold text-foreground truncate">
                      {activeStore?.apiKey || "aimiko_pk_live_preview9802"}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 rounded-2xl border border-border/60 space-y-1 text-xs">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Webhook Secret</span>
                  <div className="font-mono text-muted-foreground truncate">
                    {activeStore?.webhookSecret || "whsec_live_90f230ae981bc..."}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: SUBSCRIPTION CHECKOUT & PAYMENT FLOW ── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-black text-base text-foreground">
                  {selectedCheckoutPlan.id === "starter" ? "Start 14-Day Free Trial" : `Subscribe to ${selectedCheckoutPlan.name}`}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedCheckoutPlan.id === "starter"
                    ? "Full access to Aimiko Starter for 14 days. Cancel anytime."
                    : `Billed ${billingCycle} at ₹${(billingCycle === "monthly" ? selectedCheckoutPlan.priceMonthly : selectedCheckoutPlan.priceAnnual).toLocaleString()}/month.`}
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleProcessSubscription} className="space-y-4 text-xs">
              <div className="p-3.5 bg-secondary/40 rounded-2xl border border-border/60 space-y-2">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Plan</span>
                  <span>{selectedCheckoutPlan.name} ({billingCycle})</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Due Today</span>
                  <span className="font-bold text-foreground">
                    {selectedCheckoutPlan.id === "starter"
                      ? "₹0 (Free Trial)"
                      : `₹${(billingCycle === "monthly" ? selectedCheckoutPlan.priceMonthly : selectedCheckoutPlan.priceAnnual * 12).toLocaleString()}`}
                  </span>
                </div>
              </div>

              {selectedCheckoutPlan.id !== "starter" && (
                <div className="space-y-3">
                  <span className="font-bold text-foreground block">Payment Details</span>
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Card Number</label>
                    <input
                      type="text"
                      required
                      value={cardNumberInput}
                      onChange={(e) => setCardNumberInput(e.target.value)}
                      className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">Expires</label>
                      <input
                        type="text"
                        required
                        value={cardExpiryInput}
                        onChange={(e) => setCardExpiryInput(e.target.value)}
                        className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground block mb-1">CVC</label>
                      <input
                        type="text"
                        required
                        value={cardCvcInput}
                        onChange={(e) => setCardCvcInput(e.target.value)}
                        className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2 font-mono text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="rounded-xl text-xs font-bold h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="rounded-xl text-xs font-bold h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  {isProcessingPayment && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>
                    {isProcessingPayment
                      ? "Verifying..."
                      : selectedCheckoutPlan.id === "starter"
                      ? "Activate Free Trial"
                      : "Pay & Activate Subscription"}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONNECT STORE WIZARD ── */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-black text-base text-foreground">Connect Your Online Store</h3>
                <p className="text-xs text-muted-foreground">Choose a supported platform or upload a product feed.</p>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConnectStoreSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1.5">Select Store Platform</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Shopify", "WooCommerce", "Custom Store", "Product Feed"] as const).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedPlatform(plat)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all text-xs ${
                        selectedPlatform === plat
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Store / Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NovaMart Tech"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Store Domain URL</label>
                <input
                  type="text"
                  placeholder="e.g. novamart.store or novamart.myshopify.com"
                  value={newStoreDomain}
                  onChange={(e) => setNewStoreDomain(e.target.value)}
                  className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConnectModalOpen(false)}
                  className="rounded-xl text-xs font-bold h-10 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isConnecting || !newStoreName.trim()}
                  className="rounded-xl text-xs font-bold h-10 px-5 bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
                >
                  {isConnecting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
                  <span>{isConnecting ? "Authorizing..." : "Authorize & Connect"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD COUPON ── */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="font-bold text-base text-foreground">Add Store Coupon</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER15"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2 uppercase font-mono font-bold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(parseInt(e.target.value, 10))}
                  className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Offer Description</label>
                <input
                  type="text"
                  placeholder="e.g. 15% off orders above ₹2,000"
                  value={newCouponDesc}
                  onChange={(e) => setNewCouponDesc(e.target.value)}
                  className="w-full bg-secondary/40 border border-border/80 rounded-xl px-3.5 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="rounded-xl text-xs font-bold h-9 px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newCouponCode.trim()}
                  className="rounded-xl text-xs font-bold h-9 px-5 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: FULLSCREEN NOVAMART INTERACTIVE DEMO ── */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6">
          <div className="w-full max-w-5xl h-[88vh] bg-card border border-border/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-secondary/70 border-b border-border/60 px-5 py-3 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="font-mono text-muted-foreground bg-background px-3 py-1 rounded-md border border-border/40">
                  https://novamart.store (Simulated Storefront)
                </span>
              </div>
              <button
                onClick={() => setDemoOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/60 overflow-hidden">
              <div className="md:col-span-2 p-5 overflow-y-auto space-y-4">
                <div className="border-b border-border/40 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-foreground">NovaMart Electronics</h2>
                    <p className="text-xs text-muted-foreground">Your everyday tech, made easier to find.</p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">
                    4 Products Catalog
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {NOVAMART_DEMO_PRODUCTS.map((prod) => (
                    <div key={prod.id} className="bg-secondary/30 border border-border/60 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-32 w-full rounded-xl overflow-hidden bg-background">
                          <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{prod.name}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{prod.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs font-black text-foreground">₹{prod.price.toLocaleString()}</span>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSendDemoMessage(`Compare ${prod.name} with other options`)}
                          className="rounded-xl h-7 px-2 text-[10px] font-bold"
                        >
                          Ask Aimiko
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Assistant */}
              <div className="p-4 flex flex-col justify-between bg-purple-500/5 overflow-hidden">
                <div className="space-y-3 overflow-hidden flex flex-col h-full">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-3 shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">Aimiko Assistant</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Active Shopping Copilot</div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
                    {demoMessages.map((msg) => (
                      <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`p-3 rounded-2xl max-w-[90%] space-y-2 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-purple-600 text-white rounded-tr-none"
                              : "bg-card border border-border/80 text-foreground rounded-tl-none shadow-2xs"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="p-2.5 bg-card border border-border/80 rounded-xl inline-flex gap-1">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="pt-2 border-t border-border/60 shrink-0 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={demoInput}
                        onChange={(e) => setDemoInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendDemoMessage();
                        }}
                        placeholder="Ask anything..."
                        className="flex-1 bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none"
                      />
                      <Button
                        size="sm"
                        disabled={!demoInput.trim() || isTyping}
                        onClick={() => handleSendDemoMessage()}
                        className="rounded-xl h-8.5 px-3 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
