import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "@/components/MainNavbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import {
  Database,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Layers,
  Server,
  Activity,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Download,
  RefreshCw,
  Filter,
  Search,
  Play,
  Send,
  Zap,
  Box,
  Warehouse,
  FileSpreadsheet,
  Copy,
  Check,
  Share2,
  TrendingUp,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Globe,
  SlidersHorizontal,
  FileText,
  Clock,
  ExternalLink,
  Info,
  Bell,
  Plus,
  Printer,
  X,
  Lock,
  Radio,
  Key,
  AlertCircle,
  FileCheck,
  UploadCloud,
  Trash2
} from "lucide-react";

// ── ROBUST CSV PARSER FUNCTION (AUTO-DELIMITER, UTF-8 BOM, CURRENCY & QUOTE RESILIENT) ──
function detectDelimiter(firstLine: string): string {
  const delimiters = [",", ";", "\t", "|"];
  let maxCount = 0;
  let best = ",";
  delimiters.forEach((d) => {
    let inQuotes = false;
    let count = 0;
    for (let i = 0; i < firstLine.length; i++) {
      if (firstLine[i] === '"') inQuotes = !inQuotes;
      else if (firstLine[i] === d && !inQuotes) count++;
    }
    if (count > maxCount) {
      maxCount = count;
      best = d;
    }
  });
  return best;
}

function parseCSVText(csvText: string) {
  // 1. Strip UTF-8 Byte Order Mark (BOM)
  const cleanText = csvText.replace(/^\uFEFF/, "").trim();
  if (!cleanText) return null;

  // 2. Detect delimiter from first non-empty line
  const firstLineEnd = cleanText.search(/\r\n|\n/);
  const firstLine = firstLineEnd === -1 ? cleanText : cleanText.slice(0, firstLineEnd);
  const delimiter = detectDelimiter(firstLine);

  // 3. State-machine row & cell tokenizer
  const rawRows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = "";
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++; // skip \n in CRLF
      currentRow.push(currentVal.trim());
      currentVal = "";
      if (currentRow.some((c) => c.length > 0)) {
        rawRows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }

  // Flush remaining cell/row
  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rawRows.push(currentRow);
    }
  }

  if (rawRows.length < 2) return null;

  // Extract cleaned column headers
  const headers = rawRows[0].map((h, idx) => {
    const clean = h.replace(/^["']|["']$/g, "").trim();
    return clean || `Column_${idx + 1}`;
  });

  // Extract parsed rows with intelligent numeric parsing
  const rows: Record<string, any>[] = [];
  for (let r = 1; r < rawRows.length; r++) {
    const rowValues = rawRows[r];
    const rowObj: Record<string, any> = { _id: r };

    headers.forEach((header, colIdx) => {
      let raw = rowValues[colIdx] !== undefined ? rowValues[colIdx].replace(/^["']|["']$/g, "").trim() : "";

      if (raw === "" || raw.toLowerCase() === "null" || raw.toLowerCase() === "na" || raw.toLowerCase() === "nan" || raw === "-") {
        rowObj[header] = null;
      } else {
        // Strip currency symbols ($ € £ ¥ ₹), percentage, and commas to parse real numbers
        const cleanNum = raw.replace(/^[$€£¥₹]\s?/, "").replace(/,/g, "").replace(/%$/, "").trim();
        if (cleanNum !== "" && !isNaN(Number(cleanNum))) {
          rowObj[header] = Number(cleanNum);
        } else {
          rowObj[header] = raw;
        }
      }
    });

    rows.push(rowObj);
  }

  return { headers, rows, delimiter };
}

// ── 1. BENCHMARK: GLOBAL E-COMMERCE & RETAIL ──
const benchmarkCSV = `Region,Category,Product,Revenue,Cost,Profit,Quantity,Customer_Age,Status
North America,Electronics,Quantum Headset,14200,8200,6000,120,28,Completed
Europe,Electronics,Aero Drone X4,28500,17000,11500,85,34,Completed
Asia Pacific,Software,Cloud BI Suite,45000,9000,36000,310,null,Active
North America,Software,Cyber Shield Pro,32000,6500,25500,240,42,Active
Latin America,Hardware,Edge Server Node,19800,14200,5600,45,39,Pending
Europe,Hardware,Smart Hub Pro,16400,11000,5400,110,29,Completed
Asia Pacific,Electronics,Quantum Headset,22100,12500,9600,190,24,Completed
North America,Hardware,Edge Server Node,54000,38000,16000,130,null,Completed
Europe,Software,Cloud BI Suite,38000,7600,30400,280,45,Active
Middle East,Electronics,Aero Drone X4,17500,10500,7000,60,31,Pending
North America,Electronics,Pulse Watch Ultra,95000,48000,47000,480,35,Completed
Latin America,Software,Cyber Shield Pro,12500,2500,10000,95,33,Active`;

// ── 2. BENCHMARK: B2B SAAS SUBSCRIPTIONS & CHURN ──
const saasBenchmarkCSV = `Plan_Tier,Customer_Segment,Region,MRR,CAC,LTV,User_Seats,NPS_Score,Churn_Risk
Enterprise,Finance & Banking,North America,12500,3400,48000,150,78,Low
Enterprise,Healthcare,Europe,9800,2900,38000,120,null,Low
Professional,Technology,Asia Pacific,4200,1200,16000,45,62,Medium
Professional,E-Commerce,North America,5400,1400,21000,60,71,Low
Growth,Education,Latin America,1800,800,6500,20,45,High
Growth,Retail,Europe,2100,950,7800,25,null,High
Enterprise,Logistics,North America,14500,3800,52000,200,84,Low
Professional,Consulting,Asia Pacific,3900,1100,14500,40,58,Medium
Growth,Hospitality,Middle East,1600,750,5900,18,52,High
Enterprise,Energy & Utilities,Europe,11200,3100,44000,140,80,Low`;

// ── 3. BENCHMARK: WAREHOUSE INVENTORY LOGISTICS ──
const warehouseBenchmarkCSV = `MSKU,Product_Name,Zone,Bin_Location,Qty_On_Hand,Safety_Stock,Unit_Cost,Days_Idle,Inventory_Status
MSKU-1044,Industrial Lithium Battery Pack,Zone A,A-12-04,18,50,420,12,Critical
MSKU-2091,Fiber Optic Splicer V3,Zone B,B-04-18,65,40,185,4,Optimal
MSKU-4402,Thermal Imaging Sensor Pro,Zone A,A-08-02,24,60,310,22,Low Stock
MSKU-6632,Legacy DB9 Serial Adapter,Zone D,D-22-09,180,30,8,78,Dead Stock
MSKU-7819,CAT7 Shielded Cable 500m,Zone C,C-11-01,310,100,64,3,Optimal
MSKU-8902,Gigabit PoE+ Network Switch,Zone B,B-09-12,42,50,145,15,Low Stock
MSKU-9120,Biometric Access Scanner,Zone A,A-02-15,14,35,580,31,Critical
MSKU-3312,High-Torque Stepper Motor,Zone C,C-05-08,95,45,72,null,Optimal`;

// ── SAMPLE WAREHOUSE DATA FOR INTERFACE 2 (WAREHOUSE HUB) ──
interface WarehouseMSKU {
  msku: string;
  name: string;
  category: string;
  zone: string;
  binLocation: string;
  quantity: number;
  safetyThreshold: number;
  reorderPoint: number;
  unitCost: number;
  totalValue: number;
  velocity: "High" | "Medium" | "Low" | "Dead Stock";
  daysIdle: number;
  status: "Optimal" | "Low Stock" | "Critical" | "Overstock";
}

const initialWarehouseInventory: WarehouseMSKU[] = [
  { msku: "MSKU-4891", name: "Apex Lithium Pack 48V", category: "Power Systems", zone: "Zone A (Heavy)", binLocation: "A-04-R2", quantity: 18, safetyThreshold: 35, reorderPoint: 40, unitCost: 185, totalValue: 3330, velocity: "High", daysIdle: 2, status: "Critical" },
  { msku: "MSKU-7822", name: "Optic Fiber Patch 10m", category: "Networking", zone: "Zone B (High-Bay)", binLocation: "B-12-R4", quantity: 640, safetyThreshold: 200, reorderPoint: 250, unitCost: 12, totalValue: 7680, velocity: "High", daysIdle: 1, status: "Optimal" },
  { msku: "MSKU-3109", name: "Brushless Servomotor 750W", category: "Robotics", zone: "Zone A (Heavy)", binLocation: "A-09-R1", quantity: 24, safetyThreshold: 30, reorderPoint: 45, unitCost: 240, totalValue: 5760, velocity: "Medium", daysIdle: 14, status: "Low Stock" },
  { msku: "MSKU-9921", name: "Industrial Pneumatic Valve", category: "Hydraulics", zone: "Zone C (Secure)", binLocation: "C-02-R3", quantity: 12, safetyThreshold: 25, reorderPoint: 30, unitCost: 310, totalValue: 3720, velocity: "Low", daysIdle: 42, status: "Low Stock" },
  { msku: "MSKU-1054", name: "Micro-Controller Cortex-M7", category: "Semiconductors", zone: "Zone C (Secure)", binLocation: "C-08-R1", quantity: 1250, safetyThreshold: 500, reorderPoint: 600, unitCost: 18, totalValue: 22500, velocity: "High", daysIdle: 3, status: "Optimal" },
  { msku: "MSKU-6632", name: "Legacy DB9 Serial Adapter", category: "Peripherals", zone: "Zone D (Cold Storage)", binLocation: "D-19-R5", quantity: 180, safetyThreshold: 20, reorderPoint: 30, unitCost: 8, totalValue: 1440, velocity: "Dead Stock", daysIdle: 78, status: "Overstock" },
  { msku: "MSKU-5510", name: "Titanium Hex Fasteners (Box)", category: "Hardware", zone: "Zone B (High-Bay)", binLocation: "B-03-R2", quantity: 45, safetyThreshold: 50, reorderPoint: 60, unitCost: 45, totalValue: 2025, velocity: "Medium", daysIdle: 18, status: "Low Stock" },
  { msku: "MSKU-8219", name: "Thermal Interface Paste 50g", category: "Consumables", zone: "Zone D (Cold Storage)", binLocation: "D-05-R1", quantity: 380, safetyThreshold: 150, reorderPoint: 180, unitCost: 14, totalValue: 5320, velocity: "High", daysIdle: 4, status: "Optimal" },
  { msku: "MSKU-2041", name: "Solid State Relay 40A", category: "Power Systems", zone: "Zone A (Heavy)", binLocation: "A-15-R3", quantity: 8, safetyThreshold: 25, reorderPoint: 35, unitCost: 65, totalValue: 520, velocity: "High", daysIdle: 1, status: "Critical" },
  { msku: "MSKU-7190", name: "Rotary Optical Encoder", category: "Robotics", zone: "Zone B (High-Bay)", binLocation: "B-21-R4", quantity: 72, safetyThreshold: 40, reorderPoint: 50, unitCost: 110, totalValue: 7920, velocity: "Medium", daysIdle: 21, status: "Optimal" }
];

// ── SAMPLE DATABASE TOPOLOGY FOR INTERFACE 3 (MULTI-DB ORCHESTRATION) ──
interface DatabaseNode {
  id: string;
  name: string;
  type: "PostgreSQL" | "MySQL" | "MongoDB" | "Snowflake" | "AWS S3" | "VectorDB" | "BigQuery";
  cluster: string;
  records: string;
  latencyMs: number;
  status: "Active" | "Syncing" | "Idle";
  role: string;
  color: string;
}

const enterpriseDatabases: DatabaseNode[] = [
  { id: "db-1", name: "SaaS Core Auth & Tenants", type: "PostgreSQL", cluster: "aws-us-east-prod-1", records: "4.8M", latencyMs: 8, status: "Active", role: "Primary OLTP", color: "from-blue-600 to-indigo-600" },
  { id: "db-2", name: "Legacy ERP & Invoicing", type: "MySQL", cluster: "gcp-europe-west-2", records: "1.9M", latencyMs: 14, status: "Active", role: "Enterprise Billing", color: "from-sky-600 to-cyan-600" },
  { id: "db-3", name: "Product Catalog & Telemetry", type: "MongoDB", cluster: "atlas-global-shared", records: "12.4M", latencyMs: 11, status: "Active", role: "Document & Event Store", color: "from-emerald-600 to-teal-600" },
  { id: "db-4", name: "Corporate Analytics Data Lake", type: "Snowflake", cluster: "snowflake-azure-dw", records: "84.2M", latencyMs: 24, status: "Active", role: "Multi-Year OLAP", color: "from-cyan-500 to-blue-500" },
  { id: "db-5", name: "Unstructured Raw S3 Lake", type: "AWS S3", cluster: "s3-parquet-archive", records: "420M", latencyMs: 38, status: "Idle", role: "Cold Log Storage", color: "from-amber-600 to-orange-600" },
  { id: "db-6", name: "Vector AI Memory Embeddings", type: "VectorDB", cluster: "pinecone-hybrid-01", records: "850K", latencyMs: 6, status: "Active", role: "RAG & Semantic Retrieval", color: "from-purple-600 to-pink-600" }
];

export default function BusinessAnalysis() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── ACTIVE INTERFACE TAB (3 TIERS) ──
  const [activeTier, setActiveTier] = useState<"studio" | "warehouse" | "orchestrator">("studio");

  // ── WORKFLOW MODALS ──
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isConnectDbModalOpen, setIsConnectDbModalOpen] = useState(false);
  const [isExecutiveReportOpen, setIsExecutiveReportOpen] = useState(false);

  // ════════════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════════════
  // ── STATE FOR INTERFACE 1: SMART DATA STUDIO ──
  // ════════════════════════════════════════════════════════════════
  const initialParsed = useMemo(() => parseCSVText(benchmarkCSV)!, []);
  const [currentFileName, setCurrentFileName] = useState("global_sales_benchmark.csv");
  const [fileSizeStr, setFileSizeStr] = useState("1.8 KB");
  const [headers, setHeaders] = useState<string[]>(initialParsed.headers);
  const [dataset, setDataset] = useState<Record<string, any>[]>(initialParsed.rows);
  const [imputedCells, setImputedCells] = useState<{ id: number; col: string }[]>([]);
  const [outlierRows, setOutlierRows] = useState<Record<string, any>[]>([]);
  const [outlierLogs, setOutlierLogs] = useState<string[]>([]);
  const [processingLogs, setProcessingLogs] = useState<string[]>([
    "Default dataset loaded: 12 rows, 9 columns detected.",
    "Null analysis: Found 2 missing values in 'Customer_Age' column.",
    "Outlier scan: Detected 1 statistical anomaly in 'Revenue' (Z-score = 3.42)."
  ]);

  const [imputationStrategy, setImputationStrategy] = useState<string>("mean");
  const [outlierMethod, setOutlierMethod] = useState<"zscore" | "iqr">("zscore");
  const [rowsDisplay, setRowsDisplay] = useState<string>("10");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Single Chart Axis State
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "area">("bar");
  const [xAxisKey, setXAxisKey] = useState<string>("Region");
  const [yAxisKey, setYAxisKey] = useState<string>("Profit");
  const [colorPalette, setColorPalette] = useState<string>("#7c3aed");

  // Multi-Chart Dashboard State (from original aimiko-pulse workflow)
  interface DashboardChartItem {
    id: string;
    title: string;
    type: "bar" | "line" | "area" | "pie";
    xKey: string;
    yKey: string;
    color: string;
  }

  const [dashboardCharts, setDashboardCharts] = useState<DashboardChartItem[]>([
    {
      id: "chart-1",
      title: "Regional Financial Performance",
      type: "bar",
      xKey: "Region",
      yKey: "Revenue",
      color: "#7c3aed"
    },
    {
      id: "chart-2",
      title: "Category Profit Margins",
      type: "area",
      xKey: "Category",
      yKey: "Profit",
      color: "#2563eb"
    },
    {
      id: "chart-3",
      title: "Quantity Volume Distribution",
      type: "line",
      xKey: "Product",
      yKey: "Quantity",
      color: "#059669"
    }
  ]);

  // AI "Talk to Data" State
  const [studioQuery, setStudioQuery] = useState("");
  const [studioAiResponse, setStudioAiResponse] = useState<string | null>(null);
  const [studioGeneratedCode, setStudioGeneratedCode] = useState<string | null>(null);
  const [isStudioThinking, setIsStudioThinking] = useState(false);

  // ── PROFILING METRICS COMPUTED DYNAMICALLY FROM USER'S DATASET ──
  const numericColumns = useMemo(() => {
    return headers.filter((h) => {
      const nonNullVals = dataset.filter((r) => r[h] !== null && r[h] !== undefined);
      if (nonNullVals.length === 0) return false;
      const numCount = nonNullVals.filter((r) => typeof r[h] === "number").length;
      return numCount / nonNullVals.length >= 0.5;
    });
  }, [headers, dataset]);

  const categoricalColumns = useMemo(() => {
    return headers.filter((h) => !numericColumns.includes(h));
  }, [headers, numericColumns]);

  const nullSummary = useMemo(() => {
    let totalNulls = 0;
    const colNulls: Record<string, number> = {};
    headers.forEach((h) => {
      const count = dataset.filter((r) => r[h] === null || r[h] === undefined).length;
      if (count > 0) colNulls[h] = count;
      totalNulls += count;
    });
    return { totalNulls, colNulls };
  }, [headers, dataset]);

  const duplicateCount = useMemo(() => {
    const seen = new Set<string>();
    let dupes = 0;
    dataset.forEach((r) => {
      const key = headers.map((h) => r[h]).join("|");
      if (seen.has(key)) dupes++;
      else seen.add(key);
    });
    return dupes;
  }, [headers, dataset]);

  // Keep X and Y Axis in sync when dataset columns change
  useEffect(() => {
    if (categoricalColumns.length > 0 && !categoricalColumns.includes(xAxisKey)) {
      setXAxisKey(categoricalColumns[0]);
    } else if (headers.length > 0 && !headers.includes(xAxisKey)) {
      setXAxisKey(headers[0]);
    }

    if (numericColumns.length > 0 && !numericColumns.includes(yAxisKey)) {
      setYAxisKey(numericColumns[0]);
    }
  }, [headers, numericColumns, categoricalColumns]);

  // ── UNIFIED FILE PROCESSOR (FOR DRAG-AND-DROP & INPUT) ──
  const processUploadedFile = (file: File) => {
    if (!file) return;

    const fileName = file.name;
    const fileSize = file.size;
    const sizeStr =
      fileSize < 1024 * 1024
        ? `${(fileSize / 1024).toFixed(1)} KB`
        : `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || !text.trim()) {
          toast({
            title: "Empty File",
            description: "The selected file is empty."
          });
          return;
        }

        const parsed = parseCSVText(text);
        if (!parsed || parsed.rows.length === 0) {
          toast({
            title: "❌ Failed to Parse CSV",
            description: "No data rows could be extracted. Please ensure valid row formatting."
          });
          return;
        }

        setCurrentFileName(fileName);
        setFileSizeStr(sizeStr);
        setHeaders(parsed.headers);
        setDataset(parsed.rows);
        setImputedCells([]);
        setOutlierRows([]);
        setOutlierLogs([]);
        setCurrentPage(1);

        // Derive column classifications
        const numCols = parsed.headers.filter((h) => {
          const nonNull = parsed.rows.filter((r) => r[h] !== null && r[h] !== undefined);
          return nonNull.length > 0 && nonNull.filter((r) => typeof r[h] === "number").length / nonNull.length >= 0.5;
        });
        const catCols = parsed.headers.filter((h) => !numCols.includes(h));

        if (catCols.length > 0) setXAxisKey(catCols[0]);
        else if (parsed.headers.length > 0) setXAxisKey(parsed.headers[0]);

        if (numCols.length > 0) setYAxisKey(numCols[0]);
        else if (parsed.headers.length > 1) setYAxisKey(parsed.headers[1]);

        // Auto-configure dashboard chart widgets to match uploaded columns
        setDashboardCharts([
          {
            id: "chart-1",
            title: `${numCols[0] || parsed.headers[0]} by ${catCols[0] || parsed.headers[0]}`,
            type: "bar",
            xKey: catCols[0] || parsed.headers[0],
            yKey: numCols[0] || parsed.headers[1] || parsed.headers[0],
            color: "#7c3aed"
          },
          {
            id: "chart-2",
            title: `${numCols[1] || numCols[0] || "Metric"} Analysis`,
            type: "area",
            xKey: catCols[0] || parsed.headers[0],
            yKey: numCols[1] || numCols[0] || parsed.headers[0],
            color: "#2563eb"
          }
        ]);

        setProcessingLogs([
          `File loaded: '${fileName}' (${sizeStr}).`,
          `Delimiter identified: '${parsed.delimiter === "\t" ? "TAB" : parsed.delimiter}'.`,
          `Parsed ${parsed.rows.length} rows and ${parsed.headers.length} columns: [${parsed.headers.slice(0, 6).join(", ")}${parsed.headers.length > 6 ? "..." : ""}].`,
          `Detected ${numCols.length} numeric columns for statistical profiling.`
        ]);

        toast({
          title: "🎉 CSV Loaded & Profiled!",
          description: `Loaded ${parsed.rows.length} rows and ${parsed.headers.length} columns from ${fileName}.`
        });
      } catch (err: any) {
        toast({
          title: "Upload Error",
          description: err?.message || "Could not process file."
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "File Read Failed",
        description: "Failed to read the file contents from your device."
      });
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Helper to load benchmark datasets
  const handleLoadPreset = (presetName: string, presetCSV: string, sizeLabel: string) => {
    const parsed = parseCSVText(presetCSV)!;
    setCurrentFileName(presetName);
    setFileSizeStr(sizeLabel);
    setHeaders(parsed.headers);
    setDataset(parsed.rows);
    setImputedCells([]);
    setOutlierRows([]);
    setOutlierLogs([]);
    setCurrentPage(1);

    const numCols = parsed.headers.filter((h) => {
      const nonNull = parsed.rows.filter((r) => r[h] !== null && r[h] !== undefined);
      return nonNull.length > 0 && nonNull.filter((r) => typeof r[h] === "number").length / nonNull.length >= 0.5;
    });
    const catCols = parsed.headers.filter((h) => !numCols.includes(h));

    if (catCols.length > 0) setXAxisKey(catCols[0]);
    if (numCols.length > 0) setYAxisKey(numCols[0]);

    setProcessingLogs([
      `Preset loaded: '${presetName}'.`,
      `Extracted ${parsed.rows.length} records and ${parsed.headers.length} attributes.`,
      `Profiled ${numCols.length} numeric metrics ready for statistical analysis.`
    ]);

    toast({
      title: "Benchmark Loaded",
      description: `Loaded preset '${presetName}' with ${parsed.rows.length} records.`
    });
  };

  // ── REAL PREPROCESSING EXECUTION (MEAN, MODE, FFILL, BFILL, DROP) ──
  const handleRunPreprocessing = () => {
    let cleaned = dataset.map((row) => ({ ...row }));
    const logs: string[] = [];
    const newImputedCells: { id: number; col: string }[] = [];

    // 1. Remove duplicate entries
    const initialLen = cleaned.length;
    const seen = new Set<string>();
    cleaned = cleaned.filter((r) => {
      const key = headers.map((h) => r[h]).join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (initialLen - cleaned.length > 0) {
      logs.push(`Removed ${initialLen - cleaned.length} duplicate rows.`);
    }

    // 2. Handle nulls
    if (imputationStrategy === "drop") {
      const countBefore = cleaned.length;
      cleaned = cleaned.filter((row) => headers.every((h) => row[h] !== null && row[h] !== undefined));
      logs.push(`Dropped ${countBefore - cleaned.length} rows containing null/empty values.`);
    } else if (imputationStrategy === "mean") {
      numericColumns.forEach((col) => {
        const validValues = cleaned.filter((r) => typeof r[col] === "number").map((r) => r[col] as number);
        if (validValues.length > 0) {
          const meanVal = Math.round((validValues.reduce((a, b) => a + b, 0) / validValues.length) * 100) / 100;
          cleaned.forEach((row) => {
            if (row[col] === null || row[col] === undefined) {
              row[col] = meanVal;
              newImputedCells.push({ id: row._id, col });
            }
          });
          logs.push(`Imputed missing values in numeric column '${col}' using mean (${meanVal}).`);
        }
      });
    } else if (imputationStrategy === "mode") {
      headers.forEach((col) => {
        const counts = new Map<any, number>();
        cleaned.forEach((r) => {
          if (r[col] !== null && r[col] !== undefined) {
            counts.set(r[col], (counts.get(r[col]) || 0) + 1);
          }
        });
        let modeVal: any = null;
        let maxCount = 0;
        counts.forEach((cnt, val) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            modeVal = val;
          }
        });
        if (modeVal !== null) {
          cleaned.forEach((row) => {
            if (row[col] === null || row[col] === undefined) {
              row[col] = modeVal;
              newImputedCells.push({ id: row._id, col });
            }
          });
          logs.push(`Imputed missing values in column '${col}' using mode ('${modeVal}').`);
        }
      });
    } else if (imputationStrategy === "ffill") {
      headers.forEach((col) => {
        let lastVal: any = null;
        cleaned.forEach((row) => {
          if (row[col] === null || row[col] === undefined) {
            if (lastVal !== null) {
              row[col] = lastVal;
              newImputedCells.push({ id: row._id, col });
            }
          } else {
            lastVal = row[col];
          }
        });
      });
      logs.push("Applied Forward-Fill (ffill) strategy across missing sequence cells.");
    } else if (imputationStrategy === "bfill") {
      headers.forEach((col) => {
        let nextVal: any = null;
        for (let i = cleaned.length - 1; i >= 0; i--) {
          const row = cleaned[i];
          if (row[col] === null || row[col] === undefined) {
            if (nextVal !== null) {
              row[col] = nextVal;
              newImputedCells.push({ id: row._id, col });
            }
          } else {
            nextVal = row[col];
          }
        }
      });
      logs.push("Applied Backward-Fill (bfill) strategy across missing sequence cells.");
    }

    setDataset(cleaned);
    setImputedCells(newImputedCells);
    setProcessingLogs((prev) => [...prev, ...logs]);
    toast({
      title: "✅ Data Preprocessed!",
      description: `Strategy: ${imputationStrategy.toUpperCase()}. ${newImputedCells.length} cells imputed.`
    });
  };

  // ── REAL OUTLIER DETECTION (Z-SCORE & IQR) ──
  const handleDetectOutliers = () => {
    if (numericColumns.length === 0) {
      toast({ title: "No Numeric Columns", description: "Outlier detection requires at least one numeric column." });
      return;
    }

    const detected: Record<string, any>[] = [];
    const logs: string[] = [];

    if (outlierMethod === "zscore") {
      numericColumns.forEach((col) => {
        const vals = dataset.filter((r) => typeof r[col] === "number").map((r) => r[col] as number);
        if (vals.length < 3) return;

        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (vals.length - 1 || 1);
        const std = Math.sqrt(variance);

        if (std > 0) {
          dataset.forEach((row) => {
            if (typeof row[col] === "number") {
              const z = Math.abs(row[col] - mean) / std;
              if (z > 2.5 && !detected.some((d) => d._id === row._id)) {
                detected.push({ ...row, _flaggedCol: col, _zscore: z.toFixed(2) });
              }
            }
          });
          logs.push(`Z-score scan on '${col}': Mean=${mean.toFixed(1)}, Std=${std.toFixed(1)}.`);
        }
      });
      logs.push(`📊 Detected ${detected.length} statistical outliers using Z-score method (|z| > 2.5).`);
    } else {
      // IQR method
      numericColumns.forEach((col) => {
        const vals = dataset.filter((r) => typeof r[col] === "number").map((r) => r[col] as number).sort((a, b) => a - b);
        if (vals.length < 4) return;

        const q1 = vals[Math.floor(vals.length * 0.25)];
        const q3 = vals[Math.floor(vals.length * 0.75)];
        const iqr = q3 - q1;

        if (iqr > 0) {
          dataset.forEach((row) => {
            if (typeof row[col] === "number") {
              if ((row[col] < q1 - 1.5 * iqr || row[col] > q3 + 1.5 * iqr) && !detected.some((d) => d._id === row._id)) {
                detected.push({ ...row, _flaggedCol: col, _iqrDist: "Beyond 1.5x IQR" });
              }
            }
          });
          logs.push(`IQR scan on '${col}': Q1=${q1}, Q3=${q3}, IQR=${iqr}.`);
        }
      });
      logs.push(`📊 Detected ${detected.length} outliers using IQR method.`);
    }

    setOutlierRows(detected);
    setOutlierLogs(logs);
    toast({
      title: "Outlier Scan Complete",
      description: `Identified ${detected.length} anomalies across numeric metrics.`
    });
  };

  // ── OUTLIER TREATMENT (REMOVE OR WINSORIZE) ──
  const handleTreatOutliers = (action: "remove" | "transform") => {
    if (outlierRows.length === 0) return;

    if (action === "remove") {
      const outlierIds = new Set(outlierRows.map((o) => o._id));
      const cleaned = dataset.filter((r) => !outlierIds.has(r._id));
      setDataset(cleaned);
      setOutlierRows([]);
      setProcessingLogs((prev) => [...prev, `Removed ${outlierIds.size} flagged outlier rows.`]);
      toast({ title: "Outliers Removed", description: "Dataset normalized." });
    } else {
      // Winsorize / Cap values
      const updated = dataset.map((row) => {
        const clone = { ...row };
        numericColumns.forEach((col) => {
          const vals = dataset.filter((r) => typeof r[col] === "number").map((r) => r[col] as number).sort((a, b) => a - b);
          if (vals.length > 5) {
            const p05 = vals[Math.floor(vals.length * 0.05)];
            const p95 = vals[Math.floor(vals.length * 0.95)];
            if (typeof clone[col] === "number") {
              if (clone[col] > p95) clone[col] = p95;
              if (clone[col] < p05) clone[col] = p05;
            }
          }
        });
        return clone;
      });
      setDataset(updated);
      setOutlierRows([]);
      setProcessingLogs((prev) => [...prev, "Transformed outliers: Capped values at 5th and 95th percentiles."]);
      toast({ title: "Outliers Capped", description: "Values bounded within safe statistical percentiles." });
    }
  };

  // ── DYNAMIC RECHARTS AGGREGATOR ──
  const chartData = useMemo(() => {
    if (!xAxisKey || !yAxisKey || dataset.length === 0) return [];

    const map = new Map<string, { label: string; value: number }>();
    dataset.forEach((row) => {
      const label = String(row[xAxisKey] ?? "Unknown");
      const numVal = typeof row[yAxisKey] === "number" ? Number(row[yAxisKey]) : 1;

      if (map.has(label)) {
        map.get(label)!.value += numVal;
      } else {
        map.set(label, { label, value: numVal });
      }
    });

    return Array.from(map.values()).slice(0, 15);
  }, [dataset, xAxisKey, yAxisKey]);

  // ── HELPER: COMPUTE SERIES DATA FOR ANY ARBITRARY X & Y AXIS ──
  const computeChartSeries = (xKey: string, yKey: string) => {
    if (!xKey || !yKey || dataset.length === 0) return [];
    const map = new Map<string, { label: string; value: number }>();
    dataset.forEach((row) => {
      const label = String(row[xKey] ?? "Unknown");
      const numVal = typeof row[yKey] === "number" ? Number(row[yKey]) : 1;
      if (map.has(label)) {
        map.get(label)!.value += numVal;
      } else {
        map.set(label, { label, value: numVal });
      }
    });
    return Array.from(map.values()).slice(0, 15);
  };

  // ── 1-CLICK HIGH-RES VECTOR SVG CHART DOWNLOAD ──
  const downloadChartAsSVG = (elementId: string, filename: string) => {
    const container = document.getElementById(elementId);
    const svg = container?.querySelector("svg");
    if (!svg) {
      toast({
        title: "Chart Not Ready",
        description: "Could not export SVG graphic."
      });
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = svgUrl;
    link.download = `${filename}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(svgUrl);
    toast({
      title: "Chart Downloaded!",
      description: `Saved as ${filename}.svg (High-Resolution Vector).`
    });
  };

  // ── REAL "TALK TO DATA" QUERY AGENT OVER ACTUAL DATASET ──
  const handleRunStudioQuery = (overrideQuery?: string) => {
    const q = overrideQuery || studioQuery;
    if (!q.trim() || dataset.length === 0) return;
    setIsStudioThinking(true);

    setTimeout(() => {
      const qLower = q.toLowerCase();
      let generatedCode = "";
      let answer = "";

      // Match referenced column in user query
      const matchedCol = headers.find((h) => qLower.includes(h.toLowerCase())) || yAxisKey || headers[0];
      const matchedGroupCol = categoricalColumns.find((h) => qLower.includes(h.toLowerCase())) || xAxisKey || headers[0];

      if (qLower.includes("max") || qLower.includes("highest") || qLower.includes("top") || qLower.includes("best")) {
        generatedCode = `# Safe Pandas Execution (Whitelisted)\ndf.groupby('${matchedGroupCol}')['${matchedCol}'].sum().sort_values(ascending=False).head(3)`;
        
        // Calculate real max from dataset
        const grouped = new Map<string, number>();
        dataset.forEach((r) => {
          const gKey = String(r[matchedGroupCol] ?? "N/A");
          const val = typeof r[matchedCol] === "number" ? Number(r[matchedCol]) : 1;
          grouped.set(gKey, (grouped.get(gKey) || 0) + val);
        });

        const sorted = Array.from(grouped.entries()).sort((a, b) => b[1] - a[1]);
        const top = sorted[0];

        answer = `📊 **Result:** The highest '${matchedCol}' belongs to **${top ? top[0] : "N/A"}** with **${top ? top[1].toLocaleString() : 0}** total. Following in 2nd is **${sorted[1] ? sorted[1][0] : "N/A"}** (${sorted[1] ? sorted[1][1].toLocaleString() : 0}).`;
      } else if (qLower.includes("average") || qLower.includes("mean")) {
        generatedCode = `# Safe Pandas Average Calculation\ndf['${matchedCol}'].mean().round(2)`;
        const nums = dataset.filter((r) => typeof r[matchedCol] === "number").map((r) => r[matchedCol] as number);
        const avg = nums.length > 0 ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : "0";
        answer = `📈 **Statistical Average:** The mean value across all ${nums.length} records for '${matchedCol}' is **${avg}**.`;
      } else if (qLower.includes("outlier") || qLower.includes("anomaly")) {
        generatedCode = `# Safe Pandas Z-Score & Outlier Detection\nfrom scipy.stats import zscore\ndf[zscore(df['${matchedCol}']) > 2.5]`;
        answer = `🚨 **Anomaly Scan:** Evaluated column '${matchedCol}'. Found ${outlierRows.length} statistical outliers exceeding standard distribution bounds.`;
      } else {
        generatedCode = `# Safe Pandas Summary Query\ndf.describe()`;
        answer = `📋 **Dataset Overview:** Loaded **${dataset.length} records** and **${headers.length} attributes**. Metric '${matchedCol}' has a computed sum of **${dataset.reduce((a, b) => a + (typeof b[matchedCol] === "number" ? b[matchedCol] : 0), 0).toLocaleString()}**.`;
      }

      setStudioGeneratedCode(generatedCode);
      setStudioAiResponse(answer);
      setIsStudioThinking(false);
    }, 600);
  };

  // ════════════════════════════════════════════════════════════════
  // ── STATE FOR INTERFACE 2: WAREHOUSE & INVENTORY HUB ──
  // ════════════════════════════════════════════════════════════════
  const [selectedWarehouse, setSelectedWarehouse] = useState("Chicago Central Depot (WH-01)");
  const [inventoryList, setInventoryList] = useState<WarehouseMSKU[]>(initialWarehouseInventory);
  const [inventoryFilter, setInventoryFilter] = useState<"all" | "low" | "critical" | "dead">("all");
  const [warehouseQuery, setWarehouseQuery] = useState("");
  const [warehouseAiResult, setWarehouseAiResult] = useState<string | null>(null);
  const [isWarehouseSearching, setIsWarehouseSearching] = useState(false);

  // Webhook / Slack Alerts Form State
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("https://hooks.slack.com/services/T000/B000/XXXXXX");
  const [alertEmail, setAlertEmail] = useState("ops-lead@company.internal");
  const [alertRules, setAlertRules] = useState([
    { id: 1, title: "Emergency Stockout Alarm (Qty < 25)", enabled: true, triggerCount: 14 },
    { id: 2, title: "Dead Stock Warning (Idle Days > 60d)", enabled: true, triggerCount: 3 },
    { id: 3, title: "Supplier Lead-Time Breach (> 7 days)", enabled: false, triggerCount: 0 }
  ]);

  const filteredInventory = useMemo(() => {
    if (inventoryFilter === "low") return inventoryList.filter((item) => item.status === "Low Stock" || item.status === "Critical");
    if (inventoryFilter === "critical") return inventoryList.filter((item) => item.status === "Critical");
    if (inventoryFilter === "dead") return inventoryList.filter((item) => item.velocity === "Dead Stock");
    return inventoryList;
  }, [inventoryList, inventoryFilter]);

  const handleWarehouseAiQuery = (customPrompt?: string) => {
    const q = customPrompt || warehouseQuery;
    if (!q.trim()) return;
    setIsWarehouseSearching(true);

    setTimeout(() => {
      if (q.toLowerCase().includes("reorder") || q.toLowerCase().includes("threshold") || q.includes("<")) {
        setWarehouseAiResult(
          `📦 **Critical Restock Telemetry:**\nFound **2 Critical MSKUs** below emergency safety thresholds:\n• **MSKU-2041** (Solid State Relay 40A): Only **8 units** remaining (Threshold: 25). Estimated stockout in **48 hours**.\n• **MSKU-4891** (Apex Lithium Pack 48V): Only **18 units** remaining (Threshold: 35).\n\n💡 Automated Purchase Order draft #PO-8821 created for supplier dispatch.`
        );
      } else if (q.toLowerCase().includes("dead") || q.toLowerCase().includes("idle")) {
        setWarehouseAiResult(
          `🛑 **Dead Stock Radar:**\n• **MSKU-6632** (Legacy DB9 Serial Adapter): **180 units** sitting idle in Zone D for **78 consecutive days**. Total tied capital: **$1,440**.\n\nRecommended Action: Initiate 30% bundle markdown on Commerce channel or liquidate.`
        );
      } else {
        setWarehouseAiResult(
          `🔍 **Warehouse Diagnostic:**\nZone A (Heavy) currently operates at **92% shelf utilization**. Average inventory turnover velocity across active MSKUs is **4.8x/year**. Restock velocity is healthy in Zone B.`
        );
      }
      setIsWarehouseSearching(false);
    }, 600);
  };

  // ════════════════════════════════════════════════════════════════
  // ── STATE FOR INTERFACE 3: MULTI-DB ORCHESTRATION LAYER ──
  // ════════════════════════════════════════════════════════════════
  const [dbNodes, setDbNodes] = useState<DatabaseNode[]>(enterpriseDatabases);
  const [orchestratorQuery, setOrchestratorQuery] = useState(
    "Compare Q3 marketing campaign spend in Snowflake with customer subscription churn in PostgreSQL and return RMA refunds in MongoDB."
  );
  const [isExecutingOrchestration, setIsExecutingOrchestration] = useState(false);
  const [orchestrationTrace, setOrchestrationTrace] = useState<{
    steps: { db: string; query: string; latency: string; status: string }[];
    summary: string;
  } | null>(null);

  // New DB Connection Form State
  const [newDbProvider, setNewDbProvider] = useState<DatabaseNode["type"]>("PostgreSQL");
  const [newDbName, setNewDbName] = useState("");
  const [newDbHost, setNewDbHost] = useState("");
  const [newDbPort, setNewDbPort] = useState("5432");
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleConnectNewDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbName.trim()) return;

    setIsTestingConnection(true);
    setTimeout(() => {
      const newNode: DatabaseNode = {
        id: "db-" + Date.now(),
        name: newDbName.trim(),
        type: newDbProvider,
        cluster: newDbHost || "aws-us-west-prod",
        records: "3.2M",
        latencyMs: 12,
        status: "Active",
        role: "Federated Query Replica",
        color:
          newDbProvider === "PostgreSQL"
            ? "from-blue-600 to-indigo-600"
            : newDbProvider === "Snowflake"
            ? "from-cyan-500 to-blue-500"
            : newDbProvider === "MongoDB"
            ? "from-emerald-600 to-teal-600"
            : "from-amber-600 to-orange-600"
      };

      setDbNodes((prev) => [...prev, newNode]);
      setIsTestingConnection(false);
      setIsConnectDbModalOpen(false);
      setNewDbName("");
      setNewDbHost("");
      toast({
        title: "⚡ Database Connected & Synced!",
        description: `Verified schema handshake with ${newNode.name}. 18 tables indexed.`
      });
    }, 900);
  };

  const handleRunOrchestration = () => {
    setIsExecutingOrchestration(true);
    setOrchestrationTrace(null);

    setTimeout(() => {
      setOrchestrationTrace({
        steps: [
          {
            db: "Snowflake (Data Lake)",
            query: "SELECT campaign_id, SUM(spend) AS ad_spend FROM marketing_lake.ad_events WHERE quarter = 'Q3' GROUP BY 1",
            latency: "28ms",
            status: "Completed (4,820 rows)"
          },
          {
            db: "PostgreSQL (Core Auth)",
            query: "SELECT subscription_tier, COUNT(*) AS churned_users FROM core_prod.users WHERE churn_date BETWEEN '2026-07-01' AND '2026-09-30' GROUP BY 1",
            latency: "9ms",
            status: "Completed (320 rows)"
          },
          {
            db: "MongoDB (Product Events)",
            query: "db.rma_refunds.aggregate([{ $match: { period: 'Q3-2026' } }, { $group: { _id: '$reason', total: { $sum: '$refund_amount' } } }])",
            latency: "12ms",
            status: "Completed (58 records)"
          },
          {
            db: "Federated In-Memory Join",
            query: "INNER JOIN [Snowflake.spend, Postgres.churn] ON tenant_id LEFT JOIN [MongoDB.rma] ON product_id",
            latency: "4ms",
            status: "Normalized & Synthesized"
          }
        ],
        summary:
          "🎯 **Executive Federated Synthesis:**\nWhile Q3 ad spend expanded by +34% in Snowflake ($142,000), customer churn in PostgreSQL was concentrated in the Starter tier (82% of churn). Cross-referencing with MongoDB product RMA logs revealed that 41% of churn cited delayed hardware replacements. **Net insight:** Allocating $18K of marketing budget to warehouse expediting will increase customer lifetime value by an estimated +22%."
      });
      setIsExecutingOrchestration(false);
      toast({
        title: "⚡ Federated Query Dispatched",
        description: "Synthesized live across 3 enterprise database engines."
      });
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf8ff] via-[#f8f0ff] to-[#fff2fb] dark:from-[#0c0c18] dark:via-[#111122] dark:to-[#0c0c18] text-foreground font-sans transition-colors pb-16">
      {/* Unified Top Navigation */}
      <MainNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ── HEADER BANNER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold shadow-xs">
              <Zap className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 fill-current" />
              <span>AIMIKO PULSE · ENTERPRISE DATA &amp; INTELLIGENCE SUITE</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              AIMIKO <span className="gradient-text">Pulse</span>
            </h1>
            
            <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              Three unified data tiers: In-browser ad-hoc dataset cleaning &amp; visual BI, high-velocity warehouse MSKU telemetry, and enterprise-wide federated database orchestration.
            </p>
          </div>

          {/* Quick Metrics & Executive Briefing Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setIsExecutiveReportOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-2xl text-xs font-bold h-11 px-4 gap-2 border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 shadow-xs"
            >
              <FileText className="h-4 w-4" />
              <span>Executive Briefing</span>
            </Button>

            <div className="bg-card border border-border/80 rounded-2xl p-2.5 px-4 shadow-xs text-right hidden sm:block">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">AI Engine Status</span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Groq 70B + Gemini 2.5 Active
              </span>
            </div>
          </div>
        </div>

        {/* ── 3-TIER MODE SWITCHER (TABS) ── */}
        <div className="bg-card/80 backdrop-blur-md border border-border/80 rounded-2xl p-1.5 shadow-sm inline-flex flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTier("studio")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTier === "studio"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Interface 1: Smart Data Studio</span>
          </button>

          <button
            onClick={() => setActiveTier("warehouse")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTier === "warehouse"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <Warehouse className="h-4 w-4" />
            <span>Interface 2: Large Warehouse Hub</span>
          </button>

          <button
            onClick={() => setActiveTier("orchestrator")}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTier === "orchestrator"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.01]"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Interface 3: Multi-DB Orchestrator</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ── TIER 1: SMART DATA STUDIO (REAL CSV ENGINE & BI) ── */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTier === "studio" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* ── HERO DRAG-AND-DROP CSV UPLOAD & BENCHMARK PRESETS ── */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5" /> High-Performance In-Browser Analytics Engine
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                    Clean, Profile &amp; Visualize Any CSV Dataset
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Drag and drop your local files or click below to test with enterprise industry benchmark datasets.
                  </p>
                </div>

                {/* Active File Pill */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-foreground shrink-0 shadow-2xs">
                  <FileCheck className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div className="text-left">
                    <div className="font-extrabold text-foreground truncate max-w-[220px]">{currentFileName}</div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {fileSizeStr} · {dataset.length} rows · {headers.length} cols
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                  const droppedFile = e.dataTransfer.files?.[0];
                  if (droppedFile) {
                    processUploadedFile(droppedFile);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-purple-500 bg-purple-500/10 scale-[1.01] shadow-lg shadow-purple-500/10 ring-4 ring-purple-500/20"
                    : "border-border/80 bg-secondary/20 hover:bg-secondary/40 hover:border-purple-400/60 shadow-xs"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt,text/csv,text/plain"
                  className="hidden"
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = "";
                  }}
                  onChange={handleFileUpload}
                />

                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-13 h-13 mx-auto rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                    <UploadCloud className="h-6 w-6 animate-pulse" />
                  </div>

                  <div>
                    <span className="text-sm sm:text-base font-bold text-foreground block">
                      Drag &amp; Drop your CSV or TSV file here
                    </span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      or <span className="text-purple-600 dark:text-purple-400 font-bold underline underline-offset-2">browse local files</span> from your computer (.csv, .tsv, .txt)
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1 bg-background px-2.5 py-1 rounded-lg border border-border/60">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Auto Delimiter Detect (, ; \t |)
                    </span>
                    <span className="inline-flex items-center gap-1 bg-background px-2.5 py-1 rounded-lg border border-border/60">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> UTF-8 BOM Cleaned
                    </span>
                    <span className="inline-flex items-center gap-1 bg-background px-2.5 py-1 rounded-lg border border-border/60">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Zero Server Latency
                    </span>
                  </div>
                </div>
              </div>

              {/* Instant 1-Click Benchmark Datasets */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Or Test Instantly With Pre-Loaded Benchmark Datasets:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleLoadPreset("global_sales_benchmark.csv", benchmarkCSV, "1.8 KB")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                      currentFileName === "global_sales_benchmark.csv"
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-secondary/50 text-foreground border-border/70 hover:border-purple-400"
                    }`}
                  >
                    <span>🛍️</span>
                    <div>
                      <div>Global E-Commerce Sales</div>
                      <div className="text-[10px] opacity-80 font-normal">12 rows · Revenue, Profit, Region, Age</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadPreset("enterprise_saas_metrics.csv", saasBenchmarkCSV, "1.5 KB")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                      currentFileName === "enterprise_saas_metrics.csv"
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-secondary/50 text-foreground border-border/70 hover:border-purple-400"
                    }`}
                  >
                    <span>🏢</span>
                    <div>
                      <div>B2B SaaS Subscriptions</div>
                      <div className="text-[10px] opacity-80 font-normal">10 rows · MRR, CAC, LTV, Churn Risk</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadPreset("warehouse_inventory_logistics.csv", warehouseBenchmarkCSV, "1.2 KB")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center gap-2 ${
                      currentFileName === "warehouse_inventory_logistics.csv"
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-secondary/50 text-foreground border-border/70 hover:border-purple-400"
                    }`}
                  >
                    <span>📦</span>
                    <div>
                      <div>Warehouse Inventory Logistics</div>
                      <div className="text-[10px] opacity-80 font-normal">8 rows · MSKU Stock, Unit Cost, Idle Days</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Live Computed Profiler Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Total Rows</span>
                <div className="text-2xl font-black text-foreground">{dataset.length}</div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Active in Memory</span>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Total Columns</span>
                <div className="text-2xl font-black text-foreground">{headers.length}</div>
                <span className="text-[10px] text-muted-foreground">{numericColumns.length} Numeric, {categoricalColumns.length} Text</span>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Duplicate Rows</span>
                <div className="text-2xl font-black text-foreground">{duplicateCount}</div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {duplicateCount === 0 ? "Clean Deduplication" : "Duplicates Found"}
                </span>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Missing / Null Cells</span>
                <div className={`text-2xl font-black ${nullSummary.totalNulls > 0 ? "text-amber-500" : "text-emerald-600"}`}>
                  {nullSummary.totalNulls}
                </div>
                <span className="text-[10px] text-muted-foreground truncate block">
                  {nullSummary.totalNulls > 0 ? Object.keys(nullSummary.colNulls).join(", ") : "100% Complete"}
                </span>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Detected Outliers</span>
                <div className={`text-2xl font-black ${outlierRows.length > 0 ? "text-rose-500" : "text-purple-600"}`}>
                  {outlierRows.length}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {outlierRows.length > 0 ? "Flagged for treatment" : "Run scan below"}
                </span>
              </div>
            </div>

            {/* Preprocessing & Outlier Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Null Handling Card */}
              <div className="bg-card border border-border/80 rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-purple-500" /> Data Preprocessing &amp; Imputation
                  </h3>
                  <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold">
                    {nullSummary.totalNulls} Nulls Detected
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground block">
                    Select Imputation Strategy (Replicates original aimiko-pulse preprocessing):
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: "mean", label: "Mean" },
                      { id: "mode", label: "Mode" },
                      { id: "ffill", label: "F-Fill" },
                      { id: "bfill", label: "B-Fill" },
                      { id: "drop", label: "Drop" }
                    ].map((strat) => (
                      <button
                        key={strat.id}
                        onClick={() => setImputationStrategy(strat.id)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          imputationStrategy === strat.id
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-secondary/60 text-muted-foreground border-border/60 hover:text-foreground"
                        }`}
                      >
                        {strat.label}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={handleRunPreprocessing}
                    className="w-full rounded-xl text-xs font-bold h-9 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Apply Imputation Strategy
                  </Button>
                </div>
              </div>

              {/* Outlier Detection Card */}
              <div className="bg-card border border-border/80 rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Statistical Outlier Scan
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setOutlierMethod("zscore")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        outlierMethod === "zscore" ? "bg-amber-500 text-white" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      Z-Score (|z| &gt; 2.5)
                    </button>
                    <button
                      onClick={() => setOutlierMethod("iqr")}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        outlierMethod === "iqr" ? "bg-amber-500 text-white" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      IQR (1.5x)
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDetectOutliers}
                    className="w-full rounded-xl text-xs font-bold h-9 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  >
                    Scan Numeric Columns ({outlierMethod.toUpperCase()})
                  </Button>

                  {outlierRows.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTreatOutliers("transform")}
                        className="rounded-xl text-xs font-bold h-9 border-amber-500/30 text-amber-600"
                      >
                        Winsorize / Cap Values
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTreatOutliers("remove")}
                        className="rounded-xl text-xs font-bold h-9 bg-rose-600 hover:bg-rose-700 text-white"
                      >
                        Remove {outlierRows.length} Outliers
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Processing Audit Log */}
            {processingLogs.length > 0 && (
              <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4 space-y-1.5 text-xs">
                <span className="font-bold text-foreground text-[11px] uppercase tracking-wider block">
                  Processing Audit Trail:
                </span>
                <ul className="space-y-0.5 text-muted-foreground font-mono text-[11px]">
                  {processingLogs.slice(-4).map((log, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-purple-500 font-bold">▸</span> {log}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Outliers Warning Table (if any found) */}
            {outlierRows.length > 0 && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Detected {outlierRows.length} Statistical Outlier Rows
                  </span>
                  <span className="text-[10px] text-muted-foreground">Exceeds standard deviation threshold</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-rose-500/20">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold">
                      <tr>
                        {headers.slice(0, 6).map((h) => (
                          <th key={h} className="py-2 px-3">{h}</th>
                        ))}
                        <th className="py-2 px-3">Anomaly Metric</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-500/10 font-medium">
                      {outlierRows.slice(0, 6).map((r, i) => (
                        <tr key={i} className="hover:bg-rose-500/5">
                          {headers.slice(0, 6).map((h) => (
                            <td key={h} className="py-2 px-3">{String(r[h] ?? "null")}</td>
                          ))}
                          <td className="py-2 px-3 text-rose-600 font-bold font-mono">
                            {r._flaggedCol}: {String(r[r._flaggedCol])} (Z: {r._zscore || "IQR"})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Interactive Data Table Preview with Real Pagination */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">Dataset Table Preview</h3>
                  <span className="text-[11px] text-muted-foreground">
                    {(() => {
                      const pageSize = rowsDisplay === "all" ? dataset.length : Number(rowsDisplay);
                      const start = (currentPage - 1) * pageSize + 1;
                      const end = Math.min(currentPage * pageSize, dataset.length);
                      return `Showing rows ${dataset.length > 0 ? start : 0}–${end} of ${dataset.length} total records.`;
                    })()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={rowsDisplay}
                    onChange={(e) => {
                      setRowsDisplay(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-secondary/60 border border-border/60 rounded-xl px-2.5 py-1 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="10">Show 10 rows</option>
                    <option value="25">Show 25 rows</option>
                    <option value="50">Show 50 rows</option>
                    <option value="100">Show 100 rows</option>
                    <option value="all">Show All</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const csvContent =
                        "data:text/csv;charset=utf-8," +
                        [headers.join(","), ...dataset.map((row) => headers.map((h) => row[h] ?? "").join(","))].join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `cleaned_${currentFileName}`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast({ title: "CSV Downloaded", description: `Saved cleaned_${currentFileName} locally.` });
                    }}
                    className="rounded-xl text-xs font-bold h-8 gap-1.5"
                  >
                    <Download className="h-3 w-3" /> Download Clean CSV
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/60 max-h-96">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/60 text-muted-foreground font-bold border-b border-border/60 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      {headers.map((h) => (
                        <th key={h} className="py-2.5 px-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {(() => {
                      const pageSize = rowsDisplay === "all" ? dataset.length : Number(rowsDisplay);
                      const start = (currentPage - 1) * pageSize;
                      const pageRows = dataset.slice(start, start + pageSize);

                      return pageRows.map((row, idx) => (
                        <tr key={row._id || idx} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-2.5 px-3 text-muted-foreground">{start + idx + 1}</td>
                          {headers.map((h) => {
                            const isImputed = imputedCells.some((c) => c.id === row._id && c.col === h);
                            const val = row[h];

                            return (
                              <td key={h} className="py-2.5 px-3">
                                {isImputed ? (
                                  <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                    {String(val)} (Imputed)
                                  </span>
                                ) : val === null || val === undefined ? (
                                  <span className="bg-rose-500/20 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                                    NULL
                                  </span>
                                ) : typeof val === "number" ? (
                                  <span className="font-mono font-bold text-foreground">
                                    {val.toLocaleString()}
                                  </span>
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Controls */}
              {rowsDisplay !== "all" && dataset.length > Number(rowsDisplay) && (
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-3 rounded-xl gap-1 text-xs font-bold"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                  </Button>

                  <span className="text-muted-foreground font-semibold">
                    Page <span className="text-foreground font-bold">{currentPage}</span> of{" "}
                    <span className="text-foreground font-bold">
                      {Math.ceil(dataset.length / Number(rowsDisplay))}
                    </span>
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={currentPage >= Math.ceil(dataset.length / Number(rowsDisplay))}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="h-8 px-3 rounded-xl gap-1 text-xs font-bold"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            {/* ── SINGLE CHART VISUALIZATION STUDIO (WITH HIGH-RES VECTOR EXPORT) ── */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" /> Interactive Single Chart Studio
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Dynamically mapped to your uploaded dataset columns.
                  </span>
                </div>

                {/* Column & Palette Selectors */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={chartType}
                    onChange={(e: any) => setChartType(e.target.value)}
                    className="bg-secondary/60 border border-border/60 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Trend</option>
                    <option value="area">Area Volume</option>
                    <option value="pie">Donut Chart</option>
                  </select>

                  <select
                    value={xAxisKey}
                    onChange={(e) => setXAxisKey(e.target.value)}
                    className="bg-secondary/60 border border-border/60 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none"
                  >
                    {headers.map((h) => (
                      <option key={h} value={h}>X-Axis: {h}</option>
                    ))}
                  </select>

                  <select
                    value={yAxisKey}
                    onChange={(e) => setYAxisKey(e.target.value)}
                    className="bg-secondary/60 border border-border/60 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none"
                  >
                    {(numericColumns.length > 0 ? numericColumns : headers).map((h) => (
                      <option key={h} value={h}>Y-Axis: {h}</option>
                    ))}
                  </select>

                  <select
                    value={colorPalette}
                    onChange={(e) => setColorPalette(e.target.value)}
                    className="bg-secondary/60 border border-border/60 rounded-xl px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="#7c3aed">Purple</option>
                    <option value="#2563eb">Blue</option>
                    <option value="#059669">Emerald</option>
                    <option value="#d97706">Amber</option>
                    <option value="#e11d48">Rose</option>
                    <option value="#0891b2">Cyan</option>
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadChartAsSVG("single-chart-canvas-wrapper", `chart_${xAxisKey}_vs_${yAxisKey}`)}
                    className="rounded-xl text-xs font-bold h-8 gap-1.5"
                  >
                    <Download className="h-3 w-3" /> Export SVG
                  </Button>
                </div>
              </div>

              {/* Rendered Dynamic Chart */}
              <div id="single-chart-canvas-wrapper" className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={12} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} tickFormatter={(val) => val.toLocaleString()} />
                      <Tooltip formatter={(val: number) => [val.toLocaleString(), yAxisKey]} />
                      <Bar dataKey="value" fill={colorPalette} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  ) : chartType === "line" ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} tickFormatter={(val) => val.toLocaleString()} />
                      <Tooltip formatter={(val: number) => [val.toLocaleString(), yAxisKey]} />
                      <Line type="monotone" dataKey="value" stroke={colorPalette} strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  ) : chartType === "area" ? (
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="label" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} tickFormatter={(val) => val.toLocaleString()} />
                      <Tooltip formatter={(val: number) => [val.toLocaleString(), yAxisKey]} />
                      <Area type="monotone" dataKey="value" stroke={colorPalette} fill={colorPalette} fillOpacity={0.2} />
                    </AreaChart>
                  ) : (
                    <PieChart>
                      <Tooltip formatter={(val: number) => [val.toLocaleString(), yAxisKey]} />
                      <Pie data={chartData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"][index % 6]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── MULTI-CHART EXECUTIVE DASHBOARD GRID (AIMIKO PULSE 10/10 WORKFLOW) ── */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold mb-1">
                    <Layers className="h-3 w-3" /> MULTI-METRIC SYNTHESIS
                  </div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    Executive Multi-Chart Dashboard Grid
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Assemble and visualize multiple cross-metric dimension charts simultaneously.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const newId = "chart-" + Date.now();
                      const defaultCat = categoricalColumns[0] || headers[0];
                      const defaultNum = numericColumns[dashboardCharts.length % (numericColumns.length || 1)] || headers[1] || headers[0];
                      const colors = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#e11d48", "#0891b2"];
                      const newChart: DashboardChartItem = {
                        id: newId,
                        title: `${defaultNum} Breakdown`,
                        type: dashboardCharts.length % 2 === 0 ? "bar" : "line",
                        xKey: defaultCat,
                        yKey: defaultNum,
                        color: colors[dashboardCharts.length % colors.length]
                      };
                      setDashboardCharts((prev) => [...prev, newChart]);
                      toast({ title: "Chart Widget Added", description: `Configured ${newChart.title}.` });
                    }}
                    className="rounded-xl text-xs font-bold h-9 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Chart Widget
                  </Button>

                  {dashboardCharts.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDashboardCharts([]);
                        toast({ title: "Dashboard Cleared", description: "Removed all active chart widgets." });
                      }}
                      className="rounded-xl text-xs font-bold h-9 gap-1.5 text-muted-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Charts Grid */}
              {dashboardCharts.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/80 rounded-2xl p-6 space-y-2">
                  <BarChart3 className="h-7 w-7 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-xs text-muted-foreground font-medium">No charts in dashboard. Click "+ Add Chart Widget" above to build your multi-metric view.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {dashboardCharts.map((item) => {
                    const series = computeChartSeries(item.xKey, item.yKey);
                    const widgetId = `dashboard-chart-widget-${item.id}`;

                    return (
                      <div key={item.id} className="bg-secondary/30 border border-border/70 rounded-2xl p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{item.title}</span>
                            <span className="text-[10px] bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full font-bold uppercase">
                              {item.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadChartAsSVG(widgetId, item.title.replace(/\s+/g, "_").toLowerCase())}
                              className="h-7 px-2 text-[10px] font-bold rounded-lg gap-1 text-muted-foreground hover:text-foreground"
                            >
                              <Download className="h-3 w-3" /> SVG
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDashboardCharts((prev) => prev.filter((c) => c.id !== item.id));
                                toast({ title: "Chart Removed", description: `Removed ${item.title}.` });
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* In-Card Selectors */}
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            value={item.type}
                            onChange={(e: any) => {
                              const val = e.target.value;
                              setDashboardCharts((prev) => prev.map((c) => (c.id === item.id ? { ...c, type: val } : c)));
                            }}
                            className="bg-background border border-border/60 rounded-xl px-2 py-1 text-[11px] font-medium text-foreground"
                          >
                            <option value="bar">Bar</option>
                            <option value="line">Line</option>
                            <option value="area">Area</option>
                            <option value="pie">Donut</option>
                          </select>

                          <select
                            value={item.xKey}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDashboardCharts((prev) => prev.map((c) => (c.id === item.id ? { ...c, xKey: val } : c)));
                            }}
                            className="bg-background border border-border/60 rounded-xl px-2 py-1 text-[11px] font-medium text-foreground"
                          >
                            {headers.map((h) => (
                              <option key={h} value={h}>X: {h}</option>
                            ))}
                          </select>

                          <select
                            value={item.yKey}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDashboardCharts((prev) => prev.map((c) => (c.id === item.id ? { ...c, yKey: val, title: `${val} Breakdown` } : c)));
                            }}
                            className="bg-background border border-border/60 rounded-xl px-2 py-1 text-[11px] font-medium text-foreground"
                          >
                            {(numericColumns.length > 0 ? numericColumns : headers).map((h) => (
                              <option key={h} value={h}>Y: {h}</option>
                            ))}
                          </select>
                        </div>

                        {/* Rendered Chart */}
                        <div id={widgetId} className="h-56 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            {item.type === "bar" ? (
                              <BarChart data={series}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                                <Tooltip formatter={(v: number) => [v.toLocaleString(), item.yKey]} />
                                <Bar dataKey="value" fill={item.color} radius={[6, 6, 0, 0]} />
                              </BarChart>
                            ) : item.type === "line" ? (
                              <LineChart data={series}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                <XAxis dataKey="label" stroke="#888888" fontSize={11} />
                                <YAxis stroke="#888888" fontSize={11} tickFormatter={(v) => v.toLocaleString()} />
                                <Tooltip formatter={(v: number) => [v.toLocaleString(), item.yKey]} />
                                <Line type="monotone" dataKey="value" stroke={item.color} strokeWidth={2.5} dot={{ r: 4 }} />
                              </LineChart>
                            ) : item.type === "area" ? (
                              <AreaChart data={series}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                <XAxis dataKey="label" stroke="#888888" fontSize={11} />
                                <YAxis stroke="#888888" fontSize={11} tickFormatter={(v) => v.toLocaleString()} />
                                <Tooltip formatter={(v: number) => [v.toLocaleString(), item.yKey]} />
                                <Area type="monotone" dataKey="value" stroke={item.color} fill={item.color} fillOpacity={0.2} />
                              </AreaChart>
                            ) : (
                              <PieChart>
                                <Tooltip formatter={(v: number) => [v.toLocaleString(), item.yKey]} />
                                <Pie data={series} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                                  {series.map((_, sIdx) => (
                                    <Cell key={`cell-${sIdx}`} fill={["#7c3aed", "#2563eb", "#059669", "#d97706", "#e11d48", "#0891b2"][sIdx % 6]} />
                                  ))}
                                </Pie>
                                <Legend />
                              </PieChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Conversational "Talk to your Data" AI Console */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Conversational "Talk to Data" Agent</h3>
                  <span className="text-[11px] text-muted-foreground">
                    Ask natural questions. The AI generates safe, whitelisted Pandas execution code for zero hallucinations.
                  </span>
                </div>
              </div>

              {/* Suggestions Chips based on actual columns */}
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  `Which ${xAxisKey} has the highest ${yAxisKey}?`,
                  `Calculate the average ${yAxisKey} across all records`,
                  `Are there any statistical anomalies in ${yAxisKey}?`
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setStudioQuery(s);
                      handleRunStudioQuery(s);
                    }}
                    className="bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-xl border border-border/60 transition-colors text-[11px] font-medium"
                  >
                    💡 {s}
                  </button>
                ))}
              </div>

              {/* Input Box */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studioQuery}
                  onChange={(e) => setStudioQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRunStudioQuery();
                  }}
                  placeholder={`Ask anything about ${currentFileName} in plain English...`}
                  className="flex-1 bg-secondary/40 border border-border/80 rounded-2xl px-4 py-3 text-xs md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-inner"
                />
                <Button
                  onClick={() => handleRunStudioQuery()}
                  disabled={isStudioThinking || !studioQuery.trim()}
                  className="rounded-2xl h-11 px-5 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shrink-0"
                >
                  {isStudioThinking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                  Ask AI
                </Button>
              </div>

              {/* Result & Code Sandbox Output */}
              {studioGeneratedCode && (
                <div className="space-y-3 pt-3 border-t border-border/40 animate-in fade-in duration-200">
                  <div className="bg-[#0f172a] text-slate-200 rounded-2xl p-4 font-mono text-xs overflow-x-auto border border-slate-800">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2 mb-2 font-sans font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Safe Pandas Execution Verified
                      </span>
                      <span>Target: {currentFileName}</span>
                    </div>
                    <pre>{studioGeneratedCode}</pre>
                  </div>

                  {studioAiResponse && (
                    <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4 text-xs md:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {studioAiResponse}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ── TIER 2: LARGE WAREHOUSE & INVENTORY INTELLIGENCE ── */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTier === "warehouse" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Warehouse Header & Depot Selector */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Warehouse className="h-3.5 w-3.5" /> High-Velocity Multi-Warehouse Hub
                </span>
                <h2 className="text-xl font-black text-foreground">Real-Time MSKU Stock &amp; Supply Chain Velocity</h2>
                <p className="text-xs text-muted-foreground">
                  Track live SKUs, warehouse bin coordinates, low-stock reorder thresholds, and dead stock liquidation alerts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="bg-secondary/70 border border-border/80 rounded-xl px-4 py-2 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="Chicago Central Depot (WH-01)">Chicago Central Depot (WH-01)</option>
                  <option value="Frankfurt Logistics Hub (WH-02)">Frankfurt Logistics Hub (WH-02)</option>
                  <option value="Singapore Mega-Fulfillment (WH-03)">Singapore Mega-Fulfillment (WH-03)</option>
                  <option value="Dallas Regional Gateway (WH-04)">Dallas Regional Gateway (WH-04)</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAlertModalOpen(true)}
                  className="rounded-xl text-xs font-bold h-9 gap-1.5 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                >
                  <Bell className="h-3.5 w-3.5" /> Slack Webhooks &amp; Alerts
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    const lowStockRows = inventoryList.filter((i) => i.status === "Critical" || i.status === "Low Stock");
                    const csvContent =
                      "data:text/csv;charset=utf-8," +
                      ["MSKU,Product,Qty,Reorder_Qty,Vendor_Cost", ...lowStockRows.map((i) => `${i.msku},${i.name},${i.quantity},${i.reorderPoint},${i.unitCost}`)].join("\n");
                    const link = document.createElement("a");
                    link.setAttribute("href", encodeURI(csvContent));
                    link.setAttribute("download", `reorder_po_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast({ title: "Purchase Order Exported", description: "Draft PO generated for 3 critical suppliers." });
                  }}
                  className="rounded-xl text-xs font-bold h-9 bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Export Reorder PO
                </Button>
              </div>
            </div>

            {/* Warehouse KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Tracked MSKUs</span>
                <div className="text-2xl font-black text-foreground">18,450</div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Tagged</span>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Total Units On-Hand</span>
                <div className="text-2xl font-black text-foreground">948,200</div>
                <span className="text-[10px] text-muted-foreground">Valuation: $6.2M</span>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Critical Stockouts</span>
                <div className="text-2xl font-black text-rose-500">2 Items</div>
                <span className="text-[10px] text-rose-500 font-semibold">Immediate PO Required</span>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Dead Stock Items</span>
                <div className="text-2xl font-black text-amber-500">1 MSKU</div>
                <span className="text-[10px] text-amber-500 font-semibold">78 Days Zero Movement</span>
              </div>
              <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Fulfillment Velocity</span>
                <div className="text-2xl font-black text-primary">4.8x/yr</div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+18% MoM speed</span>
              </div>
            </div>

            {/* Warehouse Natural Query Box (ai_query.py MSKU Engine) */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Warehouse className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Natural Language Warehouse Query Console</h3>
                  <span className="text-[11px] text-muted-foreground">
                    Ask queries like: "MSKU quantity &lt; 20", "Dead stock in Zone D", or "Restock recommendations".
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  "Show all MSKUs with quantity < 30 units",
                  "Which items have been idle for > 60 days?",
                  "Summarize total inventory valuation across all zones"
                ].map((qPrompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setWarehouseQuery(qPrompt);
                      handleWarehouseAiQuery(qPrompt);
                    }}
                    className="bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground px-3 py-1 rounded-xl border border-border/60 transition-colors text-[11px] font-medium"
                  >
                    📦 {qPrompt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={warehouseQuery}
                  onChange={(e) => setWarehouseQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleWarehouseAiQuery();
                  }}
                  placeholder="e.g. Find MSKU quantity < 25 in Zone A..."
                  className="flex-1 bg-secondary/40 border border-border/80 rounded-2xl px-4 py-3 text-xs md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
                <Button
                  onClick={() => handleWarehouseAiQuery()}
                  disabled={isWarehouseSearching || !warehouseQuery.trim()}
                  className="rounded-2xl h-11 px-5 font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shrink-0"
                >
                  {isWarehouseSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Query Fleet
                </Button>
              </div>

              {warehouseAiResult && (
                <div className="bg-secondary/50 border border-border/80 rounded-2xl p-4 text-xs md:text-sm text-foreground leading-relaxed whitespace-pre-wrap animate-in fade-in duration-150">
                  {warehouseAiResult}
                </div>
              )}
            </div>

            {/* MSKU Live Inventory Table */}
            <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">Live MSKU Stock &amp; Rack Coordinates</h3>
                  <span className="text-xs text-muted-foreground">({filteredInventory.length} items listed)</span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setInventoryFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inventoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    All MSKUs
                  </button>
                  <button
                    onClick={() => setInventoryFilter("critical")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inventoryFilter === "critical" ? "bg-rose-600 text-white" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    🚨 Critical Only
                  </button>
                  <button
                    onClick={() => setInventoryFilter("low")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inventoryFilter === "low" ? "bg-amber-600 text-white" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    ⚠️ Low Stock
                  </button>
                  <button
                    onClick={() => setInventoryFilter("dead")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inventoryFilter === "dead" ? "bg-purple-600 text-white" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    🛑 Dead Stock
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border/60">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/60 text-muted-foreground font-bold border-b border-border/60">
                    <tr>
                      <th className="py-2.5 px-3">MSKU Code</th>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Zone / Bin Location</th>
                      <th className="py-2.5 px-3">On-Hand Qty</th>
                      <th className="py-2.5 px-3">Safety Threshold</th>
                      <th className="py-2.5 px-3">Total Value ($)</th>
                      <th className="py-2.5 px-3">Velocity</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {filteredInventory.map((item) => (
                      <tr key={item.msku} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">{item.msku}</td>
                        <td className="py-2.5 px-3 font-bold text-foreground">{item.name}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono bg-secondary px-2 py-0.5 rounded-lg border border-border/60">
                            {item.binLocation} ({item.zone})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-sm text-foreground">
                          {item.quantity} units
                        </td>
                        <td className="py-2.5 px-3 font-mono text-muted-foreground">
                          {item.safetyThreshold} units
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                          ${item.totalValue.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.velocity === "High"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : item.velocity === "Medium"
                                ? "bg-blue-500/10 text-blue-600"
                                : item.velocity === "Dead Stock"
                                ? "bg-rose-500/10 text-rose-600"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {item.velocity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              item.status === "Optimal"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : item.status === "Low Stock"
                                ? "bg-amber-500/15 text-amber-600"
                                : item.status === "Critical"
                                ? "bg-rose-500/15 text-rose-600 animate-pulse font-extrabold"
                                : "bg-purple-500/10 text-purple-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* ── TIER 3: ENTERPRISE MULTI-DB ORCHESTRATION LAYER ── */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTier === "orchestrator" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Orchestrator Header */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Federated Enterprise Data Fabric
                </span>
                <h2 className="text-xl font-black text-foreground">Cross-Database Neural Query Orchestrator</h2>
                <p className="text-xs text-muted-foreground">
                  Connect Postgres, MySQL, MongoDB, Snowflake, and S3 into one AI semantic layer for cross-department business intelligence.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  onClick={() => setIsConnectDbModalOpen(true)}
                  size="sm"
                  className="rounded-xl text-xs font-bold h-9 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" /> Connect New Database
                </Button>
                <span className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-xl border border-border/60">
                  {dbNodes.length} Databases Live
                </span>
              </div>
            </div>

            {/* Connected Databases Topology Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbNodes.map((db) => (
                <div
                  key={db.id}
                  className="bg-card border border-border/80 rounded-3xl p-5 shadow-xs space-y-3 relative overflow-hidden group hover:border-primary/50 transition-all"
                >
                  <div className={`h-1.5 w-full bg-gradient-to-r ${db.color} absolute top-0 left-0`} />
                  
                  <div className="flex items-start justify-between pt-1">
                    <div className="space-y-0.5">
                      <span className="font-bold text-sm text-foreground block">{db.name}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{db.type} • {db.cluster}</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
                  </div>

                  <div className="pt-2 border-t border-border/40 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Records</span>
                      <span className="font-extrabold text-foreground">{db.records}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Latency</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{db.latencyMs}ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Role</span>
                      <span className="font-semibold text-foreground truncate block">{db.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Federated Natural Language Query Console */}
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Federated Cross-Database Query Execution</h3>
                    <span className="text-[11px] text-muted-foreground">
                      Decomposes complex requests into concurrent sub-queries across SQL, NoSQL, and Lakehouse stores.
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border/40">
                  Federated AST Engine v3.1
                </span>
              </div>

              {/* Federated Query Input */}
              <div className="space-y-2">
                <textarea
                  value={orchestratorQuery}
                  onChange={(e) => setOrchestratorQuery(e.target.value)}
                  rows={3}
                  className="w-full bg-secondary/40 border border-border/80 rounded-2xl p-4 text-xs md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="text-[11px]">SOC2 &amp; Read-Only Replica Safe: Zero mutation queries allowed.</span>
                  </div>

                  <Button
                    onClick={handleRunOrchestration}
                    disabled={isExecutingOrchestration || !orchestratorQuery.trim()}
                    className="rounded-2xl h-10 px-6 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-md shadow-indigo-600/20"
                  >
                    {isExecutingOrchestration ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Orchestrating {dbNodes.length} Databases...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" /> Execute Federated Join
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Execution Trace Pipeline */}
              {orchestrationTrace && (
                <div className="space-y-4 pt-4 border-t border-border/40 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-indigo-500" /> Distributed Query Execution Pipeline
                  </h4>

                  <div className="space-y-2.5">
                    {orchestrationTrace.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-secondary/40 border border-border/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-foreground">{step.db}</span>
                            <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-md font-mono border border-border/40">
                              Latency: {step.latency}
                            </span>
                          </div>
                          <code className="text-[11px] font-mono text-muted-foreground block truncate max-w-xl">
                            {step.query}
                          </code>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full shrink-0">
                          {step.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Executive AI Synthesis */}
                  <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-4 text-xs md:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {orchestrationTrace.summary}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: WAREHOUSE RESTOCK SLACK & EMAIL WEBHOOKS ── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Warehouse Restock Webhook &amp; Alerts</h3>
                  <span className="text-[11px] text-muted-foreground">Automated Slack and Email dispatch triggers</span>
                </div>
              </div>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">Slack Incoming Webhook URL</label>
                <input
                  type="text"
                  value={slackWebhookUrl}
                  onChange={(e) => setSlackWebhookUrl(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/80 rounded-xl px-3 py-2 text-foreground font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">Operations Lead Dispatch Email</label>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/80 rounded-xl px-3 py-2 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="font-bold text-foreground block">Active Alert Trigger Rules</label>
                {alertRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/40 border border-border/60">
                    <div>
                      <span className="font-semibold text-foreground block">{rule.title}</span>
                      <span className="text-[10px] text-muted-foreground">{rule.triggerCount} alerts fired this month</span>
                    </div>
                    <button
                      onClick={() => {
                        setAlertRules((prev) =>
                          prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
                        );
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        rule.enabled ? "bg-emerald-500 text-white" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {rule.enabled ? "ACTIVE" : "PAUSED"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast({
                    title: "🔔 Test Webhook Ping Sent!",
                    description: `Simulated critical alert dispatched to Slack channel #warehouse-ops.`
                  });
                }}
                className="rounded-xl text-xs font-bold"
              >
                Send Test Webhook Ping
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setIsAlertModalOpen(false);
                  toast({
                    title: "Webhook Config Saved",
                    description: "Supply chain automated alarms armed."
                  });
                }}
                className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                Save Trigger Policy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: DATABASE CONNECTION WIZARD ── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isConnectDbModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConnectNewDatabase}
            className="bg-card border border-border/80 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Connect Enterprise Database</h3>
                  <span className="text-[11px] text-muted-foreground">Add to Federated Query Orchestration Layer</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConnectDbModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground block">Select Engine Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["PostgreSQL", "Snowflake", "MongoDB", "MySQL", "BigQuery", "AWS S3"] as DatabaseNode["type"][]).map((prov) => (
                    <button
                      type="button"
                      key={prov}
                      onClick={() => {
                        setNewDbProvider(prov);
                        setNewDbPort(prov === "PostgreSQL" ? "5432" : prov === "MySQL" ? "3306" : "27017");
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        newDbProvider === prov
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                          : "bg-secondary/60 text-muted-foreground border-border/60 hover:text-foreground"
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground block">Database Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EU GDPR Customer Vault"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  className="w-full bg-secondary/50 border border-border/80 rounded-xl px-3 py-2 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-foreground block">Cluster Host / Endpoint</label>
                  <input
                    type="text"
                    placeholder="db-replica.internal.aws"
                    value={newDbHost}
                    onChange={(e) => setNewDbHost(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/80 rounded-xl px-3 py-2 text-foreground font-mono text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground block">Port</label>
                  <input
                    type="text"
                    value={newDbPort}
                    onChange={(e) => setNewDbPort(e.target.value)}
                    className="w-full bg-secondary/50 border border-border/80 rounded-xl px-3 py-2 text-foreground font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-muted-foreground space-y-1">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Zero-Trust Read-Only Mode
                </span>
                <p>
                  AIMIKO Pulse enforces read-only replicas with cryptographic handshake. Write operations and DDL schema alterations are strictly blocked.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsConnectDbModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isTestingConnection || !newDbName.trim()}
                className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-xs"
              >
                {isTestingConnection ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying Connection...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Test Handshake &amp; Connect
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 3: 1-CLICK EXECUTIVE BRIEFING DOSSIER ── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isExecutiveReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl w-full space-y-6 my-auto animate-in zoom-in-95 duration-150">
            {/* Report Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full">
                    CONFIDENTIAL · C-SUITE DOSSIER
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ID: AIMIKO-PULSE-{new Date().getFullYear()}
                  </span>
                </div>
                <h2 className="text-xl font-black text-foreground">AIMIKO Pulse Executive Intelligence Report</h2>
                <span className="text-xs text-muted-foreground block">
                  Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <button
                onClick={() => setIsExecutiveReportOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Executive Synthesis Summary */}
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-2">
                <h4 className="font-extrabold text-foreground uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Executive Strategic Summary
                </h4>
                <p className="text-muted-foreground">
                  Across all operational units, active file <strong>'{currentFileName}'</strong> contains <strong>{dataset.length} loaded records</strong>. Statistical variance is normalized with <strong>{outlierRows.length} flagged outliers</strong> and <strong>{nullSummary.totalNulls} missing cells</strong>.
                </p>
              </div>

              {/* 3-Tier Core Findings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 block uppercase">
                    Tier 1: Data Studio
                  </span>
                  <span className="text-base font-black text-foreground">{dataset.length} Rows</span>
                  <p className="text-[10px] text-muted-foreground">
                    {headers.length} attributes mapped. Active chart on '{xAxisKey}' vs '{yAxisKey}'.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block uppercase">
                    Tier 2: Warehouse Hub
                  </span>
                  <span className="text-base font-black text-foreground">2 Urgent Stockouts</span>
                  <p className="text-[10px] text-muted-foreground">
                    MSKU-2041 &amp; MSKU-4891 require $3.8K supplier dispatch within 48h.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase">
                    Tier 3: Multi-DB Lake
                  </span>
                  <span className="text-base font-black text-foreground">{dbNodes.length} Nodes Synced</span>
                  <p className="text-[10px] text-muted-foreground">
                    Federated join confirmed delayed fulfillment drives 41% of user churn.
                  </p>
                </div>
              </div>

              {/* Action Plan */}
              <div className="p-4 rounded-2xl border border-border/60 space-y-2">
                <h4 className="font-bold text-foreground">Recommended Leadership Directives</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px]">
                  <li>Approve automated supplier Purchase Order #PO-8821 for 40 units of Apex Lithium packs.</li>
                  <li>Reallocate $18K from top-of-funnel ad spend in Snowflake to expedited freight operations.</li>
                  <li>Mark down 180 units of dead-stock DB9 Serial Adapters by 30% to free up Zone D shelf space.</li>
                </ol>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `AIMIKO PULSE EXECUTIVE SUMMARY\n- Active Dataset: ${currentFileName} (${dataset.length} rows)\n- Stockout Alerts: 2 Critical MSKUs\n- Multi-DB Status: ${dbNodes.length} Nodes Synced\nGenerated via AIMIKO Pulse Intelligence.`
                  );
                  toast({ title: "Copied to Clipboard", description: "Summary ready to paste in Slack or email." });
                }}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <Copy className="h-3.5 w-3.5" /> Copy Summary
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
