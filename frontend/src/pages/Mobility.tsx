import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import {
  Car,
  Bike,
  Navigation,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  Phone,
  MapPin,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Sliders,
  DollarSign,
  UserCheck,
  Compass,
  Repeat,
  Radio,
  FileText,
  Upload,
  Check,
  Sparkles,
  Layers,
  Activity,
  Award,
  Bell,
  HelpCircle,
  ExternalLink,
  Info,
  Train
} from "lucide-react";

// ── HYDERABAD LOCALITIES & METRO STATIONS ──
const HYD_LOCATIONS = [
  { id: "loc_1", name: "Madhapur (Ayyappa Society)", area: "Hitec City", lat: 17.4483, lng: 78.3915, type: "residential" },
  { id: "loc_2", name: "Cyber Towers / Cyber Gateway", area: "Hitec City", lat: 17.4504, lng: 78.3808, type: "office" },
  { id: "loc_3", name: "Ameerpet Metro Interchange", area: "Central", lat: 17.4375, lng: 78.4482, type: "metro" },
  { id: "loc_4", name: "Raidurg Metro Station", area: "Mindspace", lat: 17.4429, lng: 78.3772, type: "metro" },
  { id: "loc_5", name: "Gachibowli (DLF Cybercity)", area: "Financial Dist", lat: 17.4401, lng: 78.3489, type: "office" },
  { id: "loc_6", name: "Kondapur (Botanical Garden)", area: "West", lat: 17.4646, lng: 78.3567, type: "residential" },
  { id: "loc_7", name: "Banjara Hills (Road No. 12)", area: "Central", lat: 17.4156, lng: 78.4350, type: "commercial" },
  { id: "loc_8", name: "Miyapur Metro Station", area: "North-West", lat: 17.4968, lng: 78.3614, type: "metro" },
  { id: "loc_9", name: "Secunderabad Station", area: "East", lat: 17.4399, lng: 78.5017, type: "railway" },
  { id: "loc_10", name: "Jubilee Hills Check Post", area: "West", lat: 17.4289, lng: 78.4124, type: "residential" },
];

// Available vehicle types
const VEHICLE_TYPES = [
  {
    id: "auto",
    title: "AIMIKO Auto",
    tagline: "Everyday staple • Fast & breezy",
    icon: Car,
    baseFare: 35,
    perKm: 13,
    etaMins: 3,
    popular: true,
    capacity: "3 passengers",
  },
  {
    id: "bike",
    title: "AIMIKO Bike",
    tagline: "Beat Hyderabad traffic solo",
    icon: Bike,
    baseFare: 20,
    perKm: 8,
    etaMins: 2,
    popular: false,
    capacity: "1 passenger",
  },
  {
    id: "cab",
    title: "AIMIKO Cab Mini",
    tagline: "AC comfort • Clean sedan / hatch",
    icon: Car,
    baseFare: 75,
    perKm: 18,
    etaMins: 5,
    popular: false,
    capacity: "4 passengers",
  },
];

export default function Mobility() {
  // Navigation View modes
  const [activePortal, setActivePortal] = useState<"customer" | "driver" | "concierge" | "admin">("customer");
  const [customerTab, setCustomerTab] = useState<"rides" | "autocommute" | "passes">("rides");

  // ── CUSTOMER RIDE STATE ──
  const [pickupLoc, setPickupLoc] = useState(HYD_LOCATIONS[0].id);
  const [dropLoc, setDropLoc] = useState(HYD_LOCATIONS[1].id);
  const [selectedVehicle, setSelectedVehicle] = useState("auto");
  const [rideStatus, setRideStatus] = useState<"idle" | "searching" | "accepted" | "in_trip" | "completed">("idle");
  const [otpCode, setOtpCode] = useState("4829");
  const [activeDriver, setActiveDriver] = useState({
    name: "Rameshwar Goud",
    rating: 4.89,
    trips: "3,412 rides",
    vehicleNumber: "TS 09 UA 8841",
    model: "Bajaj RE Auto Green/Yellow",
    phone: "+91 98480 23145",
    etaSec: 140,
  });

  // ── AUTOCOMMUTE SCHEDULER STATE ──
  const [commuteName, setCommuteName] = useState("Weekday Office Rush");
  const [commutePickupTime, setCommutePickupTime] = useState("08:45");
  const [commuteDays, setCommuteDays] = useState(["Mon", "Tue", "Wed", "Thu", "Fri"]);
  const [commuteMode, setCommuteMode] = useState<"direct_auto" | "multimodal">("multimodal");
  const [commuteSaved, setCommuteSaved] = useState(true);
  const [commuteStatus, setCommuteStatus] = useState<"scheduled" | "dispatching" | "ready" | "in_transit">("ready");

  // ── METRO CONCIERGE TICKET STATE ──
  const [activeMetroTicket, setActiveMetroTicket] = useState<{
    id: string;
    passengerName: string;
    fromStation: string;
    toStation: string;
    ticketNumber: string;
    qrData: string;
    issuedAt: string;
    expiresAt: string;
    fare: number;
    status: "pending" | "issued" | "used";
  }>({
    id: "METRO-HYD-77291",
    passengerName: "Vickee Rao",
    fromStation: "Ameerpet Metro Interchange (Blue Line)",
    toStation: "Raidurg / Hitec City Metro (Blue Line)",
    ticketNumber: "L&T-HYD-QR-94827103",
    qrData: "https://aimiko.in/verify/metro?id=HYD-94827103",
    issuedAt: "Today, 08:35 AM",
    expiresAt: "Today, 11:59 PM",
    fare: 45,
    status: "issued",
  });

  // ── DRIVER PARTNER STATE ──
  const [driverOnline, setDriverOnline] = useState(true);
  const [hasActivePass, setHasActivePass] = useState(true);
  const [passExpiresInHours, setPassExpiresInHours] = useState(18);
  const [incomingRequest, setIncomingRequest] = useState<null | {
    id: string;
    pickup: string;
    drop: string;
    distanceKm: number;
    estimatedFare: number;
    customerName: string;
    customerRating: number;
    timeRemaining: number;
  }>({
    id: "REQ-88219",
    pickup: "Madhapur (Near D-Mart)",
    drop: "Cyber Towers, Hitec City",
    distanceKm: 3.8,
    estimatedFare: 68,
    customerName: "Sneha Reddy",
    customerRating: 4.9,
    timeRemaining: 15,
  });
  const [driverAcceptedRide, setDriverAcceptedRide] = useState(false);
  const [driverTripStep, setDriverTripStep] = useState<"pickup" | "running" | "ended">("pickup");
  const [driverOtpInput, setDriverOtpInput] = useState("");
  const [driverTodayEarnings, setDriverTodayEarnings] = useState(840);
  const [driverTripsCount, setDriverTripsCount] = useState(9);

  // ── CONCIERGE / DISPATCHER OPS DESK STATE ──
  const [conciergeQueue, setConciergeQueue] = useState([
    {
      id: "QUEUE-101",
      customer: "Karthik Srinivas",
      route: "Ameerpet ➔ Raidurg",
      commuteTime: "08:50 AM",
      fare: 45,
      status: "pending",
      leg: "Leg 2 of 3 (AutoCommute)",
    },
    {
      id: "QUEUE-102",
      customer: "Ananya Deshmukh",
      route: "Miyapur ➔ Hitec City",
      commuteTime: "09:05 AM",
      fare: 50,
      status: "pending",
      leg: "Leg 2 of 3 (AutoCommute)",
    },
    {
      id: "QUEUE-103",
      customer: "Vickee Rao",
      route: "Ameerpet ➔ Raidurg",
      commuteTime: "08:45 AM",
      fare: 45,
      status: "issued",
      leg: "Leg 2 of 3 (AutoCommute)",
    },
  ]);
  const [manualTicketInput, setManualTicketInput] = useState("");
  const [selectedQueueItem, setSelectedQueueItem] = useState("QUEUE-101");

  // Fare calculations
  const pickupObj = HYD_LOCATIONS.find((l) => l.id === pickupLoc) || HYD_LOCATIONS[0];
  const dropObj = HYD_LOCATIONS.find((l) => l.id === dropLoc) || HYD_LOCATIONS[1];
  const selectedVehicleObj = VEHICLE_TYPES.find((v) => v.id === selectedVehicle) || VEHICLE_TYPES[0];

  // Rough distance calculation in KM for Hyderabad coordinates
  const estDistanceKm = Math.max(
    2.5,
    parseFloat(
      (
        Math.sqrt(
          Math.pow((pickupObj.lat - dropObj.lat) * 111, 2) +
            Math.pow((pickupObj.lng - dropObj.lng) * 95, 2)
        ) || 4.2
      ).toFixed(1)
    )
  );

  const estimatedRideFare = Math.round(
    selectedVehicleObj.baseFare + estDistanceKm * selectedVehicleObj.perKm
  );

  // Handle Ride Booking Flow
  const handleBookRide = () => {
    setRideStatus("searching");
    setTimeout(() => {
      setRideStatus("accepted");
      setOtpCode(Math.floor(1000 + Math.random() * 9000).toString());
    }, 2800);
  };

  // Handle Driver Accepting ride
  const handleDriverAccept = () => {
    setDriverAcceptedRide(true);
    setIncomingRequest(null);
    setDriverTripStep("pickup");
  };

  // Driver Start Trip
  const handleStartTripWithOtp = () => {
    if (driverOtpInput.length >= 4) {
      setDriverTripStep("running");
    }
  };

  // Driver End Trip
  const handleDriverCompleteTrip = () => {
    setDriverTripStep("ended");
    setDriverTodayEarnings((prev) => prev + 68);
    setDriverTripsCount((prev) => prev + 1);
    setTimeout(() => {
      setDriverAcceptedRide(false);
      setDriverTripStep("pickup");
      setDriverOtpInput("");
    }, 2500);
  };

  // Concierge issue ticket
  const handleIssueMetroTicket = (queueId: string) => {
    setConciergeQueue((prev) =>
      prev.map((item) => (item.id === queueId ? { ...item, status: "issued" } : item))
    );
    setActiveMetroTicket((prev) => ({
      ...prev,
      ticketNumber: `HYD-METRO-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "issued",
      issuedAt: "Just now",
    }));
  };

  // Countdown timer for incoming driver request
  useEffect(() => {
    if (!incomingRequest) return;
    const interval = setInterval(() => {
      setIncomingRequest((prev) => {
        if (!prev) return null;
        if (prev.timeRemaining <= 1) return null;
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [incomingRequest]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      <MainNavbar />

      {/* ── TOP PLATFORM SELECTOR BAR ── */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-sm">AIMIKO Mobility</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Hyderabad Pilot
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  L&T Metro + Fleet Live
                </span>
              </div>
              <p className="text-[11px] text-slate-700">Ride-Hailing Marketplace + Set-and-Forget Daily Commute</p>
            </div>
          </div>

          {/* Portals Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => setActivePortal("customer")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activePortal === "customer"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-amber-600" />
              <span>Customer App</span>
            </button>

            <button
              onClick={() => setActivePortal("driver")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activePortal === "driver"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              <span>Driver Partner (₹50 Pass)</span>
              {hasActivePass && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
            </button>

            <button
              onClick={() => setActivePortal("concierge")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activePortal === "concierge"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Train className="w-3.5 h-3.5 text-blue-600" />
              <span>Metro Ops Desk</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px]">
                {conciergeQueue.filter((q) => q.status === "pending").length}
              </span>
            </button>

            <button
              onClick={() => setActivePortal("admin")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activePortal === "admin"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── PORTAL 1: CUSTOMER APP (RIDES + AUTOCOMMUTE + PASSES) ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activePortal === "customer" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Banner explaining the dual product */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-6 sm:p-8 mb-8 shadow-md">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Hyderabad Transit Engine • Zero-Commission Drivers
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                Ride instantly or automate your daily commute.
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                Connect seamlessly across Hyderabad with <strong>AIMIKO Rides</strong> (Autos, Bikes & Cabs)
                and <strong>AIMIKO AutoCommute</strong> — the multimodal scheduler that books your first-mile ride,
                issues your Hyderabad Metro QR ticket, and coordinates your last-mile drop every single workday.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setCustomerTab("rides")}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                    customerTab === "rides"
                      ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  Instant Ride Hailing
                </button>

                <button
                  onClick={() => setCustomerTab("autocommute")}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                    customerTab === "autocommute"
                      ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  AutoCommute Daily Automation
                  <span className="bg-emerald-500 text-slate-950 text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded">
                    Multimodal
                  </span>
                </button>

                <button
                  onClick={() => setCustomerTab("passes")}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                    customerTab === "passes"
                      ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                      : "bg-white/10 hover:bg-white/15 text-white"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  My Metro QR Ticket & Passes
                </button>
              </div>
            </div>
          </div>

          {/* ── TAB 1: INSTANT RIDE HAILING (AIMIKO RIDES) ── */}
          {customerTab === "rides" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Ride Booking Controls */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-amber-500" />
                    Book an Instant Ride
                  </h2>
                  <p className="text-xs text-slate-700 mt-1">
                    Direct driver dispatch in Hyderabad • Driver receives 100% of your fare
                  </p>
                </div>

                {/* Pickup & Drop inputs */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      PICKUP LOCATION (HYDERABAD)
                    </label>
                    <select
                      value={pickupLoc}
                      onChange={(e) => setPickupLoc(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    >
                      {HYD_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.area})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-dashed border-slate-200 my-1"></div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      DROP DESTINATION
                    </label>
                    <select
                      value={dropLoc}
                      onChange={(e) => setDropLoc(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    >
                      {HYD_LOCATIONS.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} ({loc.area})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Vehicle</span>
                    <span className="text-xs text-emerald-700 font-semibold">100% goes to driver</span>
                  </div>

                  <div className="space-y-2.5">
                    {VEHICLE_TYPES.map((veh) => {
                      const Icon = veh.icon;
                      const fare = Math.round(veh.baseFare + estDistanceKm * veh.perKm);
                      const isSelected = selectedVehicle === veh.id;

                      return (
                        <div
                          key={veh.id}
                          onClick={() => setSelectedVehicle(veh.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-400"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                isSelected ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">{veh.title}</span>
                                {veh.popular && (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                                    FASTEST
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 mt-0.5">
                                {veh.etaMins} mins away • {veh.capacity}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-extrabold text-base text-slate-900">₹{fare}</div>
                            <span className="text-[10px] text-slate-700 block">est. total</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fare Summary & Booking Button */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Estimated distance:</span>
                    <span className="font-semibold text-slate-800">{estDistanceKm} km (~18 mins)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Payment mode:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Direct UPI / Cash to Driver
                    </span>
                  </div>

                  {rideStatus === "idle" && (
                    <button
                      onClick={handleBookRide}
                      className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Navigation className="w-4 h-4" />
                      Book {selectedVehicleObj.title} — ₹{estimatedRideFare}
                    </button>
                  )}

                  {rideStatus === "searching" && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
                      <div className="w-8 h-8 mx-auto border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-bold text-amber-900">Broadcasting to nearby verified drivers in {pickupObj.area}...</p>
                      <p className="text-[11px] text-amber-700">Drivers receive 100% of ₹{estimatedRideFare}. Matching in progress.</p>
                    </div>
                  )}

                  {rideStatus === "accepted" && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Driver Confirmed!
                        </span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                          OTP: {otpCode}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="font-bold text-sm text-slate-900">{activeDriver.name}</div>
                          <p className="text-xs text-slate-700">{activeDriver.model} • {activeDriver.vehicleNumber}</p>
                          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">⭐ {activeDriver.rating} ({activeDriver.trips})</p>
                        </div>
                        <a
                          href={`tel:${activeDriver.phone}`}
                          className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>

                      <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                        <span className="text-emerald-700">Arriving in ~2 mins at {pickupObj.name}</span>
                        <button
                          onClick={() => setRideStatus("idle")}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Cancel Ride
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Interactive Hyderabad Route Visualizer & Zero-Commission Value Prop */}
              <div className="lg:col-span-7 space-y-6">
                {/* Visual Route Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Hyderabad Route Simulation</h3>
                      <p className="text-xs text-slate-700">Real-time corridor: {pickupObj.name} ➔ {dropObj.name}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      Live GPS Mock
                    </span>
                  </div>

                  {/* SVG Route Visualization */}
                  <div className="relative h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 p-4 flex flex-col justify-between">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>

                    {/* Simulated Map Roads */}
                    <svg className="absolute inset-0 w-full h-full stroke-slate-800" strokeWidth="6">
                      <line x1="10%" y1="20%" x2="90%" y2="20%" />
                      <line x1="20%" y1="10%" x2="20%" y2="90%" />
                      <line x1="20%" y1="50%" x2="80%" y2="50%" />
                      <line x1="80%" y1="20%" x2="80%" y2="90%" />
                    </svg>

                    {/* Active Route Path */}
                    <svg className="absolute inset-0 w-full h-full stroke-amber-400 stroke-dasharray-4" strokeWidth="4" fill="none">
                      <path d="M 80 180 Q 220 80 420 120 T 680 70" />
                    </svg>

                    {/* Pickup Marker */}
                    <div className="relative z-10 flex items-center gap-2 bg-slate-800/90 text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs w-max">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <div>
                        <div className="font-bold text-emerald-400 text-[10px]">PICKUP</div>
                        <div>{pickupObj.name}</div>
                      </div>
                    </div>

                    {/* Moving Vehicle Mock */}
                    <div className="relative z-10 self-center bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg animate-bounce">
                      <Car className="w-4 h-4" />
                      <span>{activeDriver.vehicleNumber}</span>
                    </div>

                    {/* Drop Marker */}
                    <div className="relative z-10 self-end flex items-center gap-2 bg-slate-800/90 text-white px-3 py-1.5 rounded-lg border border-slate-700 text-xs w-max">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-bold text-rose-400 text-[10px]">DROP</div>
                        <div>{dropObj.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Pillars of AIMIKO Rides */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-2">
                        ₹0
                      </div>
                      <div className="font-bold text-xs text-slate-900">Zero Commission</div>
                      <p className="text-[11px] text-slate-700 mt-0.5">
                        Drivers pay ₹50/day flat pass. 100% of your fare stays with the driver.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">Zero Surge Price Gouging</div>
                      <p className="text-[11px] text-slate-700 mt-0.5">
                        Predictable base + per-km pricing calibrated to Hyderabad transport rates.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold mb-2">
                        <Repeat className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-xs text-slate-900">AutoCommute Ready</div>
                      <p className="text-[11px] text-slate-700 mt-0.5">
                        Turn any frequent route into an automated recurring commute with 1 click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: AUTOCOMMUTE (EVERYDAY COMMUTE AUTOMATION) ── */}
          {customerTab === "autocommute" && (
            <div className="space-y-8">
              {/* AutoCommute Header */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                    <Repeat className="w-3.5 h-3.5" /> Product B: Recurring Travel Automation
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    AIMIKO AutoCommute
                  </h2>
                  <p className="text-sm text-slate-700 mt-1 max-w-2xl">
                    Configure your daily travel once. Every morning, AIMIKO dispatches your first-mile ride,
                    fetches your Hyderabad Metro QR ticket, and readies your drop without manual hassle.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-700 block">Commute Status:</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active & Scheduled
                    </span>
                  </div>
                  <button
                    onClick={() => setCustomerTab("passes")}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-all flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-amber-400" />
                    View Today's Metro QR
                  </button>
                </div>
              </div>

              {/* Commute Configuration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form to configure commute */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Configure Recurring Commute</h3>
                    <p className="text-xs text-slate-700 mt-0.5">Runs automatically on your scheduled workdays</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Commute Routine Name</label>
                      <input
                        type="text"
                        value={commuteName}
                        onChange={(e) => setCommuteName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g. Morning Hitec City Office"
                      />
                    </div>

                    {/* Schedule Days */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Recurrence Days</label>
                      <div className="grid grid-cols-7 gap-1.5">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                          const active = commuteDays.includes(day);
                          return (
                            <button
                              key={day}
                              onClick={() => {
                                setCommuteDays((prev) =>
                                  active ? prev.filter((d) => d !== day) : [...prev, day]
                                );
                              }}
                              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                active
                                  ? "bg-amber-500 text-slate-950 font-extrabold shadow-xs"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pickup Time */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Daily Pickup Time (Dispatch starts 12m prior)
                      </label>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <input
                          type="time"
                          value={commutePickupTime}
                          onChange={(e) => setCommutePickupTime(e.target.value)}
                          className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-xs text-slate-700">Auto-dispatch at 08:33 AM</span>
                      </div>
                    </div>

                    {/* Commute Mode Selector */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Travel Mode Architecture</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setCommuteMode("multimodal")}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            commuteMode === "multimodal"
                              ? "border-amber-500 bg-amber-50/60 ring-1 ring-amber-400"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <Train className="w-3.5 h-3.5 text-blue-600" /> Multimodal Hub
                          </div>
                          <p className="text-[11px] text-slate-700 mt-1">
                            Auto ➔ Hyderabad Metro ➔ Auto (Recommended for Hitec City / Cyberabad)
                          </p>
                        </div>

                        <div
                          onClick={() => setCommuteMode("direct_auto")}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            commuteMode === "direct_auto"
                              ? "border-amber-500 bg-amber-50/60 ring-1 ring-amber-400"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-amber-600" /> Direct Ride Only
                          </div>
                          <p className="text-[11px] text-slate-700 mt-1">
                            Single Auto/Cab directly from doorstep to destination.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Exceptions & Retries */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Automated Safety & Fallback Engine
                      </div>
                      <p className="text-[11px] text-slate-700">
                        • Retries 3 nearby drivers within 45 seconds if first driver declines.
                        <br />• If rain/traffic causes delays, sends SMS + WhatsApp reminder with alternative route.
                        <br />• Concierge Ops instantly uploads metro ticket 10 minutes prior to station arrival.
                      </p>
                    </div>

                    <button
                      onClick={() => setCommuteSaved(true)}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      Save & Activate AutoCommute
                    </button>
                  </div>
                </div>

                {/* Right: Active Multimodal Commute Journey Visualization */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                          Daily Multi-Leg Journey
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-lg">
                          Home (Madhapur) ➔ Cyber Towers via L&T Metro
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                        Total Est: ₹110 / day
                      </span>
                    </div>

                    {/* Timeline of 3 Legs */}
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                      {/* Leg 1: First-Mile Auto */}
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px] ring-4 ring-white">
                          1
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-amber-600" />
                              Leg 1: First-Mile AIMIKO Auto
                            </span>
                            <span className="text-xs font-extrabold text-slate-800">₹40 • 8 mins</span>
                          </div>
                          <p className="text-xs text-slate-700">
                            Doorstep Pickup (Madhapur) ➔ Ameerpet Metro Interchange Station (Gate 2)
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold pt-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Auto-dispatched at 08:33 AM (Driver Rameshwar assigned)
                          </div>
                        </div>
                      </div>

                      {/* Leg 2: Hyderabad Metro Line */}
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] ring-4 ring-white">
                          2
                        </div>
                        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                              <Train className="w-3.5 h-3.5 text-blue-600" />
                              Leg 2: Hyderabad Metro (Blue Line Express)
                            </span>
                            <span className="text-xs font-extrabold text-blue-950">₹45 • 14 mins</span>
                          </div>
                          <p className="text-xs text-blue-900">
                            Ameerpet Metro Station ➔ Raidurg / Hitec City Metro Terminal
                          </p>

                          {/* Metro Ticket Status Box */}
                          <div className="p-3 bg-white rounded-lg border border-blue-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <QrCode className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="text-xs font-bold text-slate-900">Digital QR Metro Pass</div>
                                <div className="text-[10px] text-slate-700">
                                  {activeMetroTicket.ticketNumber} • Valid till 11:59 PM
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setCustomerTab("passes")}
                              className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all"
                            >
                              Open QR
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Leg 3: Last-Mile Drop */}
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[10px] ring-4 ring-white">
                          3
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Bike className="w-3.5 h-3.5 text-amber-600" />
                              Leg 3: Last-Mile AIMIKO Bike / Auto
                            </span>
                            <span className="text-xs font-extrabold text-slate-800">₹25 • 4 mins</span>
                          </div>
                          <p className="text-xs text-slate-700">
                            Raidurg Metro Gate 3 ➔ Cyber Towers Main Reception, Hitec City
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-700 pt-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            Pre-matches driver when metro arrives at Durgam Cheruvu station
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Commute Savings vs Single Cab */}
                    <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-emerald-900">
                          Commute Efficiency Comparison
                        </div>
                        <div className="text-xs text-emerald-700 mt-0.5">
                          Daily Cab in traffic: ₹260 (48 mins) • AIMIKO AutoCommute: ₹110 (26 mins)
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-xs">
                        Save ₹3,300/mo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: PASSES & ACTIVE QR TICKET ── */}
          {customerTab === "passes" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                  Hyd Metro Concierge Ticket
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Your Active Metro QR Pass</h3>
                <p className="text-xs text-slate-700">
                  Scan this QR code at the L&T Metro AFC entry/exit gates at Ameerpet & Raidurg stations
                </p>
              </div>

              {/* Scannable Ticket Card */}
              <div className="bg-white rounded-2xl border-2 border-slate-900 overflow-hidden shadow-xl">
                {/* Metro Header */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Train className="w-6 h-6 text-amber-300" />
                    <div>
                      <div className="font-extrabold text-base tracking-tight">Hyderabad Metro Rail</div>
                      <div className="text-[11px] text-blue-200">Official Multimodal Commute Pass</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 font-extrabold text-xs">
                    ACTIVE
                  </span>
                </div>

                {/* Stations corridor */}
                <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-700 block text-[10px] uppercase font-bold">From Station</span>
                    <span className="font-extrabold text-slate-900 text-sm">{activeMetroTicket.fromStation}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-700 block text-[10px] uppercase font-bold">To Destination</span>
                    <span className="font-extrabold text-slate-900 text-sm">{activeMetroTicket.toStation}</span>
                  </div>
                </div>

                {/* Interactive QR Display */}
                <div className="p-8 text-center bg-white space-y-4">
                  <div className="w-56 h-56 mx-auto p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-inner flex flex-col items-center justify-center relative">
                    {/* Simulated High-Res QR Matrix */}
                    <div className="w-full h-full bg-slate-900 rounded-lg p-3 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                          <div className="w-4 h-4 bg-white"></div>
                        </div>
                        <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                          <div className="w-4 h-4 bg-white"></div>
                        </div>
                      </div>
                      <div className="text-center text-[10px] text-amber-400 font-mono tracking-widest">
                        {activeMetroTicket.ticketNumber}
                      </div>
                      <div className="flex justify-between">
                        <div className="w-10 h-10 border-4 border-white flex items-center justify-center">
                          <div className="w-4 h-4 bg-white"></div>
                        </div>
                        <div className="w-6 h-6 bg-amber-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-sm font-bold text-slate-800">{activeMetroTicket.ticketNumber}</div>
                    <p className="text-xs text-slate-700 mt-0.5">Passenger: {activeMetroTicket.passengerName} • Fare: ₹{activeMetroTicket.fare}</p>
                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">Issued via AIMIKO Metro Concierge Desk</p>
                  </div>
                </div>

                {/* Gate scan instructions */}
                <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-600">
                  Hold phone 10cm above the scanner at the Automated Fare Collection (AFC) Gate.
                </div>
              </div>

              {/* Commute Pass Subscription Options */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">AIMIKO Commute Passes</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      5-DAY SPRINT PASS
                    </span>
                    <div className="text-lg font-extrabold text-slate-900">₹499 / week</div>
                    <p className="text-xs text-slate-700">Includes 10 auto rides + 10 Metro QR tickets with zero surge.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-500 bg-amber-50/40 space-y-2 ring-1 ring-amber-400">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      22-DAY MONTHLY COMMUTE
                    </span>
                    <div className="text-lg font-extrabold text-slate-900">₹1,899 / month</div>
                    <p className="text-xs text-slate-700">Full weekday commute automation with priority driver dispatch.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── PORTAL 2: DRIVER PARTNER APP (₹50 PASS & 100% EARNINGS) ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activePortal === "driver" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Driver Profile & ₹50 Daily Pass Card */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-lg">
                    RG
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Rameshwar Goud</h3>
                    <p className="text-xs text-slate-700">Auto Driver • TS 09 UA 8841</p>
                    <span className="text-[11px] font-semibold text-emerald-600">⭐ 4.89 Rating</span>
                  </div>
                </div>

                {/* Online / Offline switch */}
                <button
                  onClick={() => {
                    if (!hasActivePass) {
                      alert("Please activate your 24h driving pass (₹50) to go online!");
                      return;
                    }
                    setDriverOnline(!driverOnline);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                    driverOnline
                      ? "bg-emerald-500 text-slate-950 shadow-xs"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${driverOnline ? "bg-white animate-pulse" : "bg-slate-400"}`}></span>
                  {driverOnline ? "ONLINE" : "OFFLINE"}
                </button>
              </div>

              {/* The ₹50/Day Flat Pass Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    DRIVER 24H PASS
                  </span>
                  <span className="text-xs font-bold text-amber-300">₹50 / 24 Hours</span>
                </div>

                <div>
                  <div className="text-xs text-slate-300">Pass Status:</div>
                  <div className="text-lg font-black text-white flex items-center gap-2 mt-0.5">
                    {hasActivePass ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        Active ({passExpiresInHours}h remaining)
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                        Expired (Renew to drive)
                      </>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  Keep <strong>100% of all customer fares</strong>. Zero commission deducted per ride.
                </div>

                <button
                  onClick={() => {
                    setHasActivePass(true);
                    setPassExpiresInHours(24);
                    alert("24-Hour Driver Pass renewed successfully! You have unlimited ride dispatches for ₹50.");
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {hasActivePass ? "Extend 24h Pass (₹50 via UPI)" : "Pay ₹50 & Start Driving"}
                </button>
              </div>

              {/* Driver Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-700 uppercase font-bold block">Today's Earnings</span>
                  <span className="text-xl font-extrabold text-slate-900">₹{driverTodayEarnings}</span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5">100% retained</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-700 uppercase font-bold block">Trips Completed</span>
                  <span className="text-xl font-extrabold text-slate-900">{driverTripsCount}</span>
                  <span className="text-[10px] text-slate-700 block mt-0.5">Hyderabad West</span>
                </div>
              </div>

              {/* Commission Comparison */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                <div className="font-bold text-emerald-950">How AIMIKO saves your money today:</div>
                <div className="flex justify-between text-emerald-800">
                  <span>Ola/Rapido 25% cut on ₹{driverTodayEarnings}:</span>
                  <span className="font-bold">-₹{Math.round(driverTodayEarnings * 0.25)}</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>AIMIKO Flat Daily Fee:</span>
                  <span className="font-bold">-₹50</span>
                </div>
                <div className="pt-1 border-t border-emerald-300 flex justify-between font-extrabold text-emerald-900">
                  <span>Extra in your pocket today:</span>
                  <span>+₹{Math.round(driverTodayEarnings * 0.25 - 50)}</span>
                </div>
              </div>
            </div>

            {/* Live Driver Ride Radar & Active Trip */}
            <div className="lg:col-span-8 space-y-6">
              {/* Incoming Ride Notification Banner */}
              {incomingRequest && !driverAcceptedRide && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950 text-white text-xs font-black uppercase">
                      Incoming Ride Request ({incomingRequest.timeRemaining}s)
                    </span>
                    <span className="text-2xl font-black">₹{incomingRequest.estimatedFare} (100% You)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs font-semibold">
                    <div className="bg-white/80 p-3 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-700 block">Pickup ({incomingRequest.distanceKm} km away)</span>
                      <span className="font-extrabold text-slate-900 text-sm">{incomingRequest.pickup}</span>
                    </div>
                    <div className="bg-white/80 p-3 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-700 block">Destination</span>
                      <span className="font-extrabold text-slate-900 text-sm">{incomingRequest.drop}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDriverAccept}
                      className="flex-1 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5 text-emerald-400" />
                      ACCEPT RIDE (₹{incomingRequest.estimatedFare})
                    </button>
                    <button
                      onClick={() => setIncomingRequest(null)}
                      className="px-5 py-3 rounded-xl bg-white/40 hover:bg-white/60 text-slate-950 font-bold text-sm transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {/* Ongoing Trip Console */}
              {driverAcceptedRide && (
                <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-md space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Trip Ongoing</span>
                      <h4 className="text-lg font-black text-slate-900">Passenger: Sneha Reddy (⭐ 4.9)</h4>
                    </div>
                    <span className="text-xl font-extrabold text-slate-900">₹68.00</span>
                  </div>

                  {/* Step 1: Navigating to pickup */}
                  {driverTripStep === "pickup" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-amber-900">Pickup Location:</div>
                          <div className="text-sm font-bold text-slate-900">Madhapur (Near D-Mart)</div>
                        </div>
                        <a
                          href="https://maps.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1"
                        >
                          <Navigation className="w-3.5 h-3.5" /> Navigate
                        </a>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 block">
                          Enter 4-Digit Passenger OTP to Start Ride:
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            maxLength={4}
                            value={driverOtpInput}
                            onChange={(e) => setDriverOtpInput(e.target.value)}
                            placeholder="e.g. 4829"
                            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-center font-mono font-bold text-lg tracking-widest text-slate-900 w-36 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            onClick={handleStartTripWithOtp}
                            disabled={driverOtpInput.length < 4}
                            className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs"
                          >
                            Verify & Start Trip
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Trip Running */}
                  {driverTripStep === "running" && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                        <div className="text-xs font-bold text-emerald-900">Heading to Drop:</div>
                        <div className="text-base font-extrabold text-slate-900">Cyber Towers, Hitec City</div>
                        <div className="text-xs text-emerald-700 mt-1">Distance: 3.8 km • Est. 12 mins</div>
                      </div>

                      <button
                        onClick={handleDriverCompleteTrip}
                        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Complete Trip & Collect ₹68
                      </button>
                    </div>
                  )}

                  {/* Step 3: Trip Ended */}
                  {driverTripStep === "ended" && (
                    <div className="p-6 text-center bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <h5 className="font-extrabold text-slate-900 text-base">Trip Completed!</h5>
                      <p className="text-xs text-emerald-800">
                        ₹68 collected directly from passenger. ₹0 platform commission deducted.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Idle Driver Standby Radar */}
              {!incomingRequest && !driverAcceptedRide && (
                <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-pulse">
                    <Radio className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">You are Online & Ready in Hitec City</h4>
                    <p className="text-xs text-slate-700 mt-1 max-w-md mx-auto">
                      Listening for incoming instant rides and scheduled AutoCommute legs.
                      Your ₹50 daily pass is active for another {passExpiresInHours} hours.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIncomingRequest({
                        id: "REQ-99410",
                        pickup: "Inorbit Mall Durgam Cheruvu",
                        drop: "Mindspace Building 12",
                        distanceKm: 2.9,
                        estimatedFare: 55,
                        customerName: "Rahul Verma",
                        customerRating: 4.8,
                        timeRemaining: 15,
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all border border-slate-300"
                  >
                    Simulate Incoming Commute Ride
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── PORTAL 3: METRO CONCIERGE / TICKETING DESK (OPS DESK) ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activePortal === "concierge" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
                <Train className="w-3.5 h-3.5" /> Wizard-of-Oz Concierge Ticketing Engine
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Hyderabad Metro Ticketing Operations Desk
              </h2>
              <p className="text-sm text-slate-700 mt-1 max-w-2xl">
                This portal is for the AIMIKO ticketing agent. As users' multimodal AutoCommutes are dispatched,
                the agent purchases their L&T Metro ticket (via WhatsApp / Paytm / Metro counter) and issues the
                active scannable QR pass directly to their profile in real time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                Operator Turnaround: &lt; 40 sec
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Pending Commute Queue */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Upcoming Commuter Metro Legs</h3>
                <span className="text-xs text-slate-700 font-semibold">Today's Batch</span>
              </div>

              <div className="space-y-3">
                {conciergeQueue.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedQueueItem(item.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedQueueItem === item.id
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-400"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-sm text-slate-900">{item.customer}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          item.status === "issued"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}
                      >
                        {item.status === "issued" ? "TICKET DELIVERED" : "ACTION REQUIRED"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                      Route: <strong>{item.route}</strong> • Time: {item.commuteTime}
                    </div>
                    <div className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center justify-between">
                      <span>{item.leg}</span>
                      <span>Fare: ₹{item.fare}</span>
                    </div>

                    {item.status === "pending" && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleIssueMetroTicket(item.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          1-Click Issue QR Ticket
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Ticket Generation / Upload Bridge */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Issue L&T Metro Ticket</h3>
                <p className="text-xs text-slate-700 mt-0.5">
                  Paste official QR string or simulate WhatsApp bot purchase
                </p>
              </div>

              {/* Operator Quick Guide */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" /> Hyderabad Metro Concierge SOP:
                </div>
                <p className="text-slate-700 leading-relaxed">
                  1. Operator opens Hyderabad Metro WhatsApp bot (`+91 83411 46464`) or Metro agent POS.
                  <br />2. Purchases <strong>Ameerpet ➔ Raidurg (₹45)</strong> using company commute wallet.
                  <br />3. Clicks 'Generate & Push' below to sync the valid QR ticket to the commuter's screen.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Ticket ID / QR Payload
                  </label>
                  <input
                    type="text"
                    value={manualTicketInput}
                    onChange={(e) => setManualTicketInput(e.target.value)}
                    placeholder="e.g. LNT-HYD-METRO-QR-889123"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                  <Upload className="w-6 h-6 text-slate-600 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">Drop Ticket PDF / QR Screenshot</div>
                  <p className="text-[11px] text-slate-600">Instantly extracts QR image and routes to commuter</p>
                </div>

                <button
                  onClick={() => {
                    handleIssueMetroTicket(selectedQueueItem);
                    alert("Ticket verified and published! Commuter's mobile app has received the active QR code.");
                  }}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-amber-300" />
                  Publish Ticket to Commuter Profile
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* ── PORTAL 4: ADMIN OPERATIONS CONSOLE (FLEET + METRICS) ── */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activePortal === "admin" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
              AIMIKO Mobility Ops
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Fleet & AutoCommute Operations Console
            </h2>
            <p className="text-xs text-slate-700 mt-1">
              Live monitoring of Hyderabad active fleet, driver ₹50 subscriptions, and morning commute queues.
            </p>
          </div>

          {/* Top 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-700 font-bold uppercase block">Active Drivers Online</span>
              <div className="text-2xl font-black text-slate-900 mt-1">148 Drivers</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                ● 100% with Active ₹50 Pass
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-700 font-bold uppercase block">Driver Subscription Rev</span>
              <div className="text-2xl font-black text-slate-900 mt-1">₹7,400 / day</div>
              <span className="text-[11px] text-slate-700 block mt-1">
                148 active passes × ₹50/day
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-700 font-bold uppercase block">Scheduled AutoCommutes</span>
              <div className="text-2xl font-black text-slate-900 mt-1">420 Commutes</div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                98.4% on-time dispatch rate
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-700 font-bold uppercase block">Platform Commission Cut</span>
              <div className="text-2xl font-black text-slate-900 mt-1">0.0%</div>
              <span className="text-[11px] text-purple-700 font-semibold mt-1 block">
                Disruptive zero-cut model
              </span>
            </div>
          </div>

          {/* Admin Table of Active Subscriptions & Commutes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Verified Driver Fleet Ledger</h3>
              <span className="text-xs text-slate-700">Auto, Bike, Cab Partners (Hyderabad)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Zone</th>
                    <th className="py-3 px-4">₹50 Pass Status</th>
                    <th className="py-3 px-4">Today's Fares (100% kept)</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="py-3 px-4 font-bold">Rameshwar Goud</td>
                    <td className="py-3 px-4">Bajaj Auto (TS 09 UA 8841)</td>
                    <td className="py-3 px-4">Hitec City / Madhapur</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        ACTIVE (18h left)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹840.00</td>
                    <td className="py-3 px-4 text-blue-600 font-semibold cursor-pointer hover:underline">
                      View Log
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">K. Narsimha</td>
                    <td className="py-3 px-4">Honda Activa Bike (TS 07 EQ 1920)</td>
                    <td className="py-3 px-4">Gachibowli / DLF</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        ACTIVE (12h left)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">₹620.00</td>
                    <td className="py-3 px-4 text-blue-600 font-semibold cursor-pointer hover:underline">
                      View Log
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold">Syed Azam</td>
                    <td className="py-3 px-4">WagonR Cab (TS 10 UB 4102)</td>
                    <td className="py-3 px-4">Ameerpet / Begumpet</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                        EXPIRED
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-500">₹0.00 (Offline)</td>
                    <td className="py-3 px-4 text-blue-600 font-semibold cursor-pointer hover:underline">
                      Send Reminder
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      {/* ── FOOTER ── */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700">
          <div>
            <strong>AIMIKO Mobility</strong> • Hyderabad Pilot Corridor (Hitec City — Ameerpet — Raidurg)
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-900 transition-colors">About Us</Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link to="/commerce" className="hover:text-slate-900 transition-colors">Aimiko Commerce</Link>
            <Link to="/learn" className="hover:text-slate-900 transition-colors">Aimiko Learn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
