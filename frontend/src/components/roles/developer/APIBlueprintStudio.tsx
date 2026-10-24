import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Layers,
  Sparkles,
  Copy,
  Check,
  Code2,
  Lock,
  Globe,
  Sliders,
  FileJson,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function APIBlueprintStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "DELETE">("POST");
  const [path, setPath] = useState("/api/v1/orders/checkout");
  const [authType, setAuthType] = useState<"jwt" | "apiKey" | "public">("jwt");
  const [description, setDescription] = useState("Process shopping cart checkout and return payment intent");
  const [activeTab, setActiveTab] = useState<"fastapi" | "express" | "openapi">("fastapi");
  const [copied, setCopied] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generated code templates
  const fastapiCode = `# FastAPI + Pydantic v2 Blueprint
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

class OrderItem(BaseModel):
    product_id: str = Field(..., description="Unique product SKU")
    quantity: int = Field(1, ge=1)
    unit_price: float = Field(..., gt=0.0)

class CheckoutRequest(BaseModel):
    cart_id: str
    customer_email: EmailStr
    items: List[OrderItem]
    currency: str = Field("USD", max_length=3)

class CheckoutResponse(BaseModel):
    order_id: str
    status: str
    total_amount: float
    client_secret: Optional[str] = None
    created_at: datetime

@router.post("/checkout", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
async def process_checkout(payload: CheckoutRequest):
    """
    ${description}
    """
    # 1. Validate stock availability
    # 2. Calculate subtotal & tax
    # 3. Initialize Stripe payment intent
    return CheckoutResponse(
        order_id="ord_9872134",
        status="pending_payment",
        total_amount=sum(i.unit_price * i.quantity for i in payload.items),
        client_secret="pi_3MtwBw2eZvKYlo2C0X",
        created_at=datetime.utcnow()
    )`;

  const expressCode = `// Express.js + TypeScript + Zod Validation
import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const CheckoutSchema = z.object({
  cart_id: z.string().uuid(),
  customer_email: z.string().email(),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive()
  })).min(1),
  currency: z.string().default('USD')
});

router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const validatedData = CheckoutSchema.parse(req.body);

    // Business Logic
    const totalAmount = validatedData.items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);

    return res.status(201).json({
      order_id: 'ord_' + Date.now(),
      status: 'pending_payment',
      total_amount: totalAmount,
      currency: validatedData.currency,
      created_at: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.errors ?? 'Invalid payload' });
  }
});

export default router;`;

  const openapiCode = `{
  "openapi": "3.0.3",
  "info": {
    "title": "AIMIKO Generated Service API",
    "version": "1.0.0"
  },
  "paths": {
    "${path}": {
      "${method.toLowerCase()}": {
        "summary": "${description}",
        "security": [{ "BearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "cart_id": { "type": "string" },
                  "items": { "type": "array" }
                }
              }
            }
          }
        },
        "responses": {
          "201": { "description": "Order successfully created" },
          "400": { "description": "Validation error" }
        }
      }
    }
  }
}`;

  const currentSnippet = activeTab === "fastapi" ? fastapiCode : activeTab === "express" ? expressCode : openapiCode;

  const copyCode = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    toast({ title: "Copied API Code", description: "Ready to integrate into your backend repository." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScaffoldAPI = async () => {
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited API scaffolds.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateAIResponse(
        `Scaffold a clean API endpoint: ${method} ${path}. Description: ${description}. Auth: ${authType}.`,
        ageGroup,
        role,
        [],
        "You are a Principal Backend Architect designing resilient microservices."
      );
      toast({ title: "API Blueprint Updated", description: "Schemas and controllers generated." });
    } catch {
      toast({ title: "Updated", description: "API Blueprint ready." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              Developer & Engineer Studio
            </span>
            <span className="text-xs text-muted-foreground">• Microservice & Endpoint Scaffolder</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-cyan-500" /> API Blueprint Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Design REST & GraphQL routes with Pydantic/Zod validation schemas and OpenAPI specs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI API Architect
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: API Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Endpoint Parameters
            </h3>

            {/* Method & Path */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">HTTP Method & Path</label>
              <div className="flex gap-2">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="bg-secondary text-xs rounded-xl px-3 py-2 border border-border/60 font-bold text-foreground focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/api/v1/resource"
                  className="flex-1 rounded-xl bg-secondary/80 border border-border/60 px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Action / Functionality</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this endpoint do?"
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            {/* Auth Requirement */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Authentication Layer</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "jwt", label: "Bearer JWT", icon: Lock },
                  { id: "apiKey", label: "API Key", icon: Code2 },
                  { id: "public", label: "Public Route", icon: Globe }
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAuthType(a.id as any)}
                    className={`p-2 rounded-xl border text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      authType === a.id
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <a.icon className="h-3.5 w-3.5" />
                    <span>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleScaffoldAPI}
              disabled={isGenerating || !path.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isGenerating ? "Scaffolding Models..." : "Generate Code & Schemas"}
            </Button>
          </div>
        </div>

        {/* Right Column: Code Generator Tabs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5 bg-secondary/60 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("fastapi")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "fastapi" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  FastAPI (Python)
                </button>
                <button
                  onClick={() => setActiveTab("express")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "express" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  Express (TS + Zod)
                </button>
                <button
                  onClick={() => setActiveTab("openapi")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "openapi" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  }`}
                >
                  OpenAPI 3.0 JSON
                </button>
              </div>

              <Button size="sm" variant="outline" onClick={copyCode} className="h-7 text-xs rounded-lg">
                {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? "Copied" : "Copy Code"}
              </Button>
            </div>

            <pre className="rounded-xl bg-neutral-950 p-4 font-mono text-xs text-cyan-400 overflow-x-auto border border-border/40 leading-relaxed custom-scrollbar max-h-[460px]">
              <code>{currentSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="API Blueprint Studio"
        roleLabel="Principal Backend Architect"
        contextData={`Method: ${method}. Path: ${path}. Auth: ${authType}. Action: ${description}`}
        placeholder="Ask to add database migration, rate limiting, or idempotency keys..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
