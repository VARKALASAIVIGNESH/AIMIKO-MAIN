import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { generateAIResponse } from "@/lib/ai";
import { GenericToolWidget } from "../GenericToolWidget";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { FileSpreadsheet, BarChart2, Lightbulb, RefreshCw, Upload, AlertCircle } from "lucide-react";

interface DataAnalystWidgetsProps {
  activeToolLabel: string;
  suggestedPrompt?: string;
  onClose: () => void;
}

export function DataAnalystWidgets({ activeToolLabel, suggestedPrompt, onClose }: DataAnalystWidgetsProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [csvText, setCsvText] = useState(`Month,Revenue,Expenses,Users
Jan,12000,8000,150
Feb,15000,9000,180
Mar,18000,9500,210
Apr,22000,11000,260
May,26000,12000,320
Jun,31000,14000,410`);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [xAxisKey, setXAxisKey] = useState("");
  const [yAxisKey, setYAxisKey] = useState("");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("bar");
  const [insights, setInsights] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Parse CSV text into arrays of records
  const handleParseCsv = () => {
    setErrorMsg("");
    setInsights(null);
    try {
      const lines = csvText.trim().split("\n");
      if (lines.length < 2) {
        throw new Error("CSV must contain a header row and at least one data row.");
      }
      
      const head = lines[0].split(",").map(h => h.trim());
      const data: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(",").map(v => v.trim());
        const row: any = {};
        
        head.forEach((colName, colIdx) => {
          const rawVal = values[colIdx];
          // Convert to number if numeric, otherwise preserve text
          const numVal = Number(rawVal);
          row[colName] = isNaN(numVal) ? rawVal : numVal;
        });
        data.push(row);
      }

      setHeaders(head);
      setParsedData(data);
      
      // Auto-assign axis defaults
      if (head.length > 1) {
        setXAxisKey(head[0]);
        setYAxisKey(head[1]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to parse CSV syntax. Make sure columns are comma-separated.");
      setParsedData([]);
      setHeaders([]);
    }
  };

  const handleFetchInsights = async () => {
    if (parsedData.length === 0) return;
    setAiLoading(true);
    setInsights(null);

    try {
      const summaryString = JSON.stringify(parsedData.slice(0, 5));
      const prompt = `Analyze this dataset sample: ${summaryString}. Identify 3 core statistical insights, trends, or potential anomalies. Focus on column correlations. Organize your feedback in brief bullet points.`;
      
      const response = await generateAIResponse(prompt, "adults", "analyst");
      setInsights(response);
    } catch (e) {
      console.error(e);
      setInsights("Unable to extract insights at this moment.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="glass-bubble relative space-y-8 animate-pop-in border-border/60 shadow-2xl">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 bg-secondary hover:bg-muted border border-border text-foreground shadow-sm hover-bounce"
      >
        ✕ Close Tool
      </button>

      <div className="flex items-center gap-3 border-b border-border pb-4">
        <AimikoAvatar size="sm" />
        <div>
          <h2 className="text-lg font-display font-black text-foreground tracking-tight">{activeToolLabel}</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">AIMIKO Data Insights Lab 📊</p>
        </div>
      </div>

      {activeToolLabel === "Data Insight Explorer" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: CSV Editor (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4 bg-muted/50 p-5 rounded-2xl border border-border shadow-sm justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <FileSpreadsheet className="h-4 w-4 text-primary animate-bounce-slow" /> CSV Data Editor
                </span>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Modify cell values directly below. Separated by commas.</p>
              </div>

              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full min-h-[180px] flex-grow bg-background border border-border rounded-xl p-3.5 text-xs text-emerald-400 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 custom-scrollbar resize-none"
              />

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-[10px] text-red-500 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button onClick={handleParseCsv} className="w-full text-xs rounded-xl py-2.5 flex items-center justify-center gap-2 hover-bounce font-bold shadow-md">
                <Upload className="h-4 w-4" /> Parse & Plot Dataset
              </Button>
            </div>

            {/* Right Column: Visualization Chart (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4 bg-muted/50 p-5 rounded-2xl border border-border shadow-sm min-h-[300px] justify-between">
              {parsedData.length > 0 ? (
                <div className="space-y-4 flex flex-col h-full justify-between">
                  <div className="grid grid-cols-3 gap-3 border-b border-border pb-3">
                    {/* Chart Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Graph Layout</label>
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value as any)}
                        className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground cursor-pointer focus:outline-none"
                      >
                        <option value="bar">Bar Chart</option>
                        <option value="line">Line Chart</option>
                        <option value="area">Area Chart</option>
                      </select>
                    </div>
                    {/* X Axis Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">X-Axis Column</label>
                      <select
                        value={xAxisKey}
                        onChange={(e) => setXAxisKey(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground cursor-pointer focus:outline-none"
                      >
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                    {/* Y Axis Selector */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-muted-foreground uppercase font-black tracking-wider">Y-Axis Column</label>
                      <select
                        value={yAxisKey}
                        onChange={(e) => setYAxisKey(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground cursor-pointer focus:outline-none"
                      >
                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Recharts Wrapper */}
                  <div className="w-full h-48 sm:h-60 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <BarChart data={parsedData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey={xAxisKey} stroke="currentColor" opacity={0.6} fontSize={10} />
                          <YAxis stroke="currentColor" opacity={0.6} fontSize={10} />
                          <Tooltip contentStyle={{ background: "#0e0e15", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Bar dataKey={yAxisKey} fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      ) : chartType === "area" ? (
                        <AreaChart data={parsedData}>
                          <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey={xAxisKey} stroke="currentColor" opacity={0.6} fontSize={10} />
                          <YAxis stroke="currentColor" opacity={0.6} fontSize={10} />
                          <Tooltip contentStyle={{ background: "#0e0e15", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Area type="monotone" dataKey={yAxisKey} stroke="hsl(var(--primary))" fill="url(#areaGradient)" strokeWidth={3} />
                        </AreaChart>
                      ) : (
                        <LineChart data={parsedData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey={xAxisKey} stroke="currentColor" opacity={0.6} fontSize={10} />
                          <YAxis stroke="currentColor" opacity={0.6} fontSize={10} />
                          <Tooltip contentStyle={{ background: "#0e0e15", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "11px" }} />
                          <Legend wrapperStyle={{ fontSize: "10px" }} />
                          <Line type="monotone" dataKey={yAxisKey} stroke="hsl(var(--primary))" strokeWidth={3} activeDot={{ r: 6, fill: "hsl(var(--accent))" }} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 gap-3 h-full">
                  <BarChart2 className="h-10 w-10 text-muted-foreground opacity-35" />
                  <div>
                    <h5 className="font-bold text-xs">Dataset Unparsed</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Click "Parse & Plot Dataset" on the left to display charts.</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* AI Insights Board */}
          {parsedData.length > 0 && (
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Lightbulb className="h-4 w-4 text-primary" /> Automated Data Insights
                </span>
                <Button 
                  onClick={handleFetchInsights} 
                  size="sm" 
                  className="rounded-xl text-[10px] gap-1.5 h-9 px-4 hover-bounce bg-secondary hover:bg-muted border border-border text-foreground font-bold shadow-sm" 
                  disabled={aiLoading}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${aiLoading ? "animate-spin" : ""}`} /> Query Dataset Insights
                </Button>
              </div>

              {aiLoading ? (
                <div className="p-8 text-center animate-pulse bg-card/30 rounded-2xl border border-border/40 text-xs text-muted-foreground font-medium">
                  🐒 Analyzing structural trends and correlations...
                </div>
              ) : insights && (
                <div className="bg-card/40 p-6 rounded-2xl border border-border/60 shadow-md text-xs leading-relaxed text-foreground whitespace-pre-wrap font-medium animate-slide-up-bounce">
                  {insights}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeToolLabel !== "Data Insight Explorer" && (
        <GenericToolWidget label={activeToolLabel} suggestedPrompt={suggestedPrompt} />
      )}
    </div>
  );
}
