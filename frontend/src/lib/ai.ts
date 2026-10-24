// src/lib/ai.ts
export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export async function generateAIResponse(
  userText: string,
  ageGroup: string | null,
  role: string | null,
  history: ChatMessage[] = [],
  extraSystemContext: string = ""
): Promise<string> {
  const ollamaUrl = import.meta.env.VITE_OLLAMA_API_URL;
  const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Define the system prompt based on user context
  let systemPrompt = "You are AIMIKO, a cute, highly intelligent, and friendly AI companion. Keep your answers concise, helpful, and engaging. Use role and age context to personalize responses, remember the user’s goals, interests, achievements, and progress, and support planning, notes, productivity, and networking as part of a complete AIMIKO ecosystem.";
  
  if (ageGroup) {
    systemPrompt += ` The user is in the '${ageGroup}' age group.`;
    if (ageGroup === 'kids') systemPrompt += " Speak simply, cheerfully, and use emojis.";
    if (ageGroup === 'adults') systemPrompt += " Speak professionally but warmly.";
    if (ageGroup === 'seniors') systemPrompt += " Speak warmly, clearly, and avoid any complex jargon.";
  }
  
  if (role) {
    systemPrompt += ` The user is a ${role}. Tailor your advice to be highly relevant to this role.`;
    if (role === "student") {
      systemPrompt += " Use structured markdown formatting, lists, and simple 'Explain Like I'm 10' explanations with analogies when requested.";
    } else if (role === "creator") {
      systemPrompt += " Help with creative scripts, hook suggestions, and catchy video title recommendations with clear markdown structures.";
    } else if (role === "developer") {
      systemPrompt += " Output code in standard markdown code blocks (e.g. ```javascript or ```python) and explain algorithms line-by-line.";
    } else if (role === "analyst") {
      systemPrompt += " Formulate SQL queries in standard code blocks and organize raw statistical insights in neat markdown tables (using | columns | headers | format).";
    } else if (role === "job_seeker") {
      systemPrompt += " Produce professionally formatted resume bullet points, cover letters, and mock interview questions.";
    } else if (role === "founder") {
      systemPrompt += " Outline lean business canvases, SWOT models, and slide-by-slide pitch deck templates.";
    } else if (role === "teacher") {
      systemPrompt += " Structure lesson plans, classroom quiz assignments, and parent progress report templates using clear lists.";
    }
  }

  // Append any extra tool-specific or source-grounding context
  if (extraSystemContext && extraSystemContext.trim()) {
    systemPrompt += `\n\n${extraSystemContext.trim()}`;
  }

  // 0. PRIORITY 1: Check if user configured their own Groq BYOK key in Profile
  const userProvider = "groq";
  const userKey = localStorage.getItem("aimiko_ai_key") || groqKey;
  const userModel = localStorage.getItem("aimiko_ai_model") || "openai/gpt-oss-120b";

  if (userKey && userKey.trim()) {
    try {
      return await callGroqAPI(userKey.trim(), systemPrompt, history, userText, userModel);
    } catch (byokErr) {
      console.warn("Groq inference error, attempting fallback model:", byokErr);
      try {
        return await callGroqAPI(userKey.trim(), systemPrompt, history, userText, "openai/gpt-oss-20b");
      } catch (fallbackErr) {
        console.warn("Groq secondary fallback failed:", fallbackErr);
      }
    }
  }

  // 2. Try Gemini Cloud API second
  if (geminiKey && geminiKey.trim() !== "" && !geminiKey.includes("placeholder")) {
    try {
      return await callGeminiAPI(geminiKey, systemPrompt, history, userText);
    } catch (e) {
      console.warn("Gemini API failed, trying Ollama...", e);
    }
  }

  // 3. Try Ollama local connection third
  if (ollamaUrl && ollamaModel) {
    try {
      return await callOllamaAPI(ollamaUrl, ollamaModel, systemPrompt, history, userText);
    } catch (e) {
      console.warn("Ollama local connection failed, falling back to mock generator:", e);
    }
  }

  // 4. Return offline mock responses
  return generateMockAIResponse(userText, ageGroup, role);
}

export async function testAIConnection(
  provider: "groq" | "openrouter",
  apiKey: string,
  model: string
): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const start = performance.now();
  try {
    if (provider === "groq") {
      const endpoint = "/api/groq/openai/v1/chat/completions";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "openai/gpt-oss-120b",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5
        })
      });

      const end = performance.now();
      const latencyMs = Math.round(end - start);

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        return {
          success: false,
          latencyMs,
          message: err?.error?.message || `HTTP ${res.status}: ${res.statusText}`
        };
      }

      return {
        success: true,
        latencyMs,
        message: "Successfully connected to Groq LPU inference."
      };
    } else {
      const endpoint = "/api/openrouter/api/v1/chat/completions";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:8080",
          "X-Title": "AIMIKO"
        },
        body: JSON.stringify({
          model: model || "deepseek/deepseek-chat",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5
        })
      });

      const end = performance.now();
      const latencyMs = Math.round(end - start);

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        return {
          success: false,
          latencyMs,
          message: err?.error?.message || `HTTP ${res.status}: ${res.statusText}`
        };
      }

      return {
        success: true,
        latencyMs,
        message: "Successfully connected to OpenRouter model gateway."
      };
    }
  } catch (e: any) {
    const end = performance.now();
    return {
      success: false,
      latencyMs: Math.round(end - start),
      message: e.message || "Network error. Please check your internet connection."
    };
  }
}

async function callOpenRouterAPI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  history: ChatMessage[],
  userText: string
): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userText }
  ];

  const response = await fetch("/api/openrouter/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:8080",
      "X-Title": "AIMIKO"
    },
    body: JSON.stringify({
      model: model || "deepseek/deepseek-chat",
      messages,
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${response.status} ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGroqAPI(
  apiKey: string,
  systemPrompt: string,
  history: ChatMessage[],
  userText: string,
  modelName: string = "openai/gpt-oss-120b"
): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userText }
  ];

  const response = await fetch("/api/groq/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${response.status} ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGeminiAPI(apiKey: string, systemPrompt: string, history: ChatMessage[], userText: string): Promise<string> {
  // Convert history to Gemini format (Gemini does not use "assistant", it uses "model")
  const geminiHistory = history.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));

  const contents = [
    { role: "user", parts: [{ text: `[SYSTEM INSTRUCTIONS: ${systemPrompt}]\n\nHello!` }]},
    { role: "model", parts: [{ text: "Understood! I am ready to be your companion AIMIKO." }]},
    ...geminiHistory,
    { role: "user", parts: [{ text: userText }]}
  ];

  const response = await fetch(`/api/gemini/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${response.status} ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

function generateMockAIResponse(userText: string, ageGroup: string | null, role: string | null): string {
  const query = userText.toLowerCase();

  // 1. Spaced Repetition Flashcard Deck Generator (JSON array)
  if (query.includes("flashcard") || query.includes("anki") || query.includes("supermemo") || query.includes("mnemonic")) {
    const topicMatch = userText.match(/topic:?\s*"([^"]+)"/i) || userText.match(/deck:?\s*"([^"]+)"/i);
    const topic = topicMatch ? topicMatch[1] : "Study Concepts";
    return JSON.stringify([
      {
        front: `What is the fundamental mechanism of ${topic}?`,
        back: `The core principle involves systematic interaction of underlying components to maintain functional equilibrium.`,
        mnemonic: `Remember the 3 C's: Core, Component, and Continuity.`
      },
      {
        front: `What is the primary governing formula or equation in ${topic}?`,
        back: `Standard state balance equation where rate of change equals net input minus net dissipation.`,
        mnemonic: `Visualize input flow entering a reservoir.`
      },
      {
        front: `What is a common pitfall or misconception when studying ${topic}?`,
        back: `Confusing immediate localized effects with overall long-term system response.`,
        mnemonic: `Think about the forest versus individual trees.`
      },
      {
        front: `How is ${topic} applied in real-world practical scenarios?`,
        back: `Engineers and researchers use it to optimize efficiency, stability, and predictive modeling.`,
        mnemonic: `Real-world impact: Efficiency and safety.`
      },
      {
        front: `Summary recall: Define the 2 key parameters of ${topic}.`,
        back: `Parameter 1: Magnitude / Intensity; Parameter 2: Rate of transition / Equilibrium constant.`,
        mnemonic: `M & R: Magnitude and Rate.`
      }
    ]);
  }

  // 2. Practice Quiz Generator (JSON array)
  if (query.includes("multiple choice quiz") || query.includes("question-question multiple choice") || query.includes("trivia quiz")) {
    const topicMatch = userText.match(/topic:?\s*"([^"]+)"/i);
    const topic = topicMatch ? topicMatch[1] : "General Science & Logic";
    return JSON.stringify([
      {
        question: `Which of the following best describes the primary principle of ${topic}?`,
        options: [
          `It operates under conservation of energy and proportional balance`,
          `It violates standard thermodynamics under high pressure`,
          `It occurs only in synthetic laboratory environments`,
          `It remains constant regardless of external conditions`
        ],
        answerIndex: 0,
        explanation: `The foundational law of ${topic} relies on conservation principles and proportional energy transfer.`
      },
      {
        question: `What is the primary rate-limiting factor in ${topic}?`,
        options: [
          `Substrate concentration and temperature gradients`,
          `Gravitational constant variations`,
          `Random quantum fluctuations only`,
          `Ambient humidity levels exclusively`
        ],
        answerIndex: 0,
        explanation: `Concentration and thermal kinetic energy dictate the velocity of standard reaction pathways.`
      },
      {
        question: `In a practical application of ${topic}, how is efficiency maximized?`,
        options: [
          `By minimizing resistive losses and optimizing catalyst surface area`,
          `By operating far below minimum threshold energy`,
          `By increasing internal friction without cooling`,
          `By stopping feedback loops entirely`
        ],
        answerIndex: 0,
        explanation: `Reducing friction and increasing active surface area ensures optimal throughput.`
      }
    ]);
  }

  // 3. Learning Paths Curriculum Roadmap (JSON array)
  if (query.includes("learning path") || query.includes("curriculum") || query.includes("4-stage roadmap") || query.includes("milestones")) {
    const topicMatch = userText.match(/subject:?\s*"([^"]+)"/i) || userText.match(/subject\s*"([^"]+)"/i);
    const topic = topicMatch ? topicMatch[1] : "Advanced Fundamentals";
    return JSON.stringify([
      {
        stage: 1,
        title: "Foundations & Core Terminology",
        duration: "Week 1",
        description: `Master fundamental concepts, definitions, and underlying principles of ${topic}.`,
        topics: ["Basic Terminology", "Historical Context", "Core Principles"],
        tasks: [
          { id: "1-1", text: `Read introductory overview of ${topic}`, done: true },
          { id: "1-2", text: "Create glossary of 10 primary definitions", done: false },
          { id: "1-3", text: "Complete foundational diagnostic self-assessment", done: false }
        ]
      },
      {
        stage: 2,
        title: "Mechanisms & Key Relationships",
        duration: "Week 2",
        description: `Explore governing equations, intermediate mechanics, and cause-and-effect dynamics.`,
        topics: ["Governing Formulas", "System Dynamics", "Intermediate Modeling"],
        tasks: [
          { id: "2-1", text: "Work through 5 practical calculation examples", done: false },
          { id: "2-2", text: "Explain core mechanism out loud to AI tutor", done: false }
        ]
      },
      {
        stage: 3,
        title: "Practical Application & Problem Solving",
        duration: "Week 3",
        description: `Apply knowledge to real-world scenarios, case studies, and advanced problem sets.`,
        topics: ["Case Studies", "Edge Cases", "Common Pitfalls"],
        tasks: [
          { id: "3-1", text: "Solve 3 multi-step exam-style problems", done: false },
          { id: "3-2", text: "Analyze common mistakes and diagnostic benchmarks", done: false }
        ]
      },
      {
        stage: 4,
        title: "Synthesis & Exam Mastery",
        duration: "Week 4",
        description: `Consolidate learning into an executive cheat sheet and achieve high recall speed.`,
        topics: ["Comprehensive Review", "Timed Drill", "Synthesis Cheat Sheet"],
        tasks: [
          { id: "4-1", text: "Construct 1-page summary formula cheat sheet", done: false },
          { id: "4-2", text: "Score 90%+ on full practice quiz", done: false }
        ]
      }
    ]);
  }

  // 4. Explain Like I'm 10 (JSON object)
  if (query.includes("explain the concept") || query.includes("10-year-old student") || query.includes("fun, vivid, simple analogy")) {
    const conceptMatch = userText.match(/concept\s*"([^"]+)"/i) || userText.match(/concept:?\s*"([^"]+)"/i);
    const concept = conceptMatch ? conceptMatch[1] : "Complex Science";
    return JSON.stringify({
      concept: concept,
      textbookDefinition: `A systematic framework governing interaction dynamics across physical and mathematical systems.`,
      analogyStory: `Imagine you and your friends are building a giant LEGO castle. Each piece has special snap-together bumps that fit only in certain places. When everyone works together with the right blueprint, the whole castle stays rock solid, even when you bump the table!`,
      whyItMatters: `Understanding this helps scientists and engineers build safer bridges, faster computers, and smarter software.`,
      funFact: `Nature figured this out billions of years before humans invented LEGOs!`
    });
  }

  // 5. PDF Summarizer Modes
  if (query.includes("summarize the text into 4-6 high-yield bullet takeaways")) {
    return `### High-Yield Key Takeaways

* **Core Metabolic Pathway**: Cellular respiration converts nutrient biochemical energy into Adenosine Triphosphate (ATP), releasing metabolic water and carbon dioxide.
* **Three-Phase Architecture**: Operates across (1) Anaerobic Glycolysis in the cytoplasm, (2) The Krebs Cycle in the mitochondrial matrix, and (3) Oxidative Phosphorylation on the inner mitochondrial membrane.
* **High Net Energy Yield**: Complete aerobic breakdown of 1 glucose molecule ($C_6H_{12}O_6$) produces **36 to 38 ATP molecules**.
* **Essential Oxygen Requirement**: Molecular oxygen ($O_2$) serves as the final electron acceptor in the electron transport chain, driving proton gradients across ATP synthase.
* **Exam Key Point**: Glycolysis does not require oxygen; aerobic stages occur exclusively inside the mitochondria.`;
  }

  if (query.includes("extract all key formulas, scientific laws, definitions")) {
    return `### Formulas, Laws & Key Definitions

#### 1. Core Chemical Equation
$$C_6H_{12}O_6 + 6O_2 \\longrightarrow 6CO_2 + 6H_2O + 36\\text{-}38\\text{ ATP}$$

#### 2. Key Terms & Definitions
| Term | Definition & Role |
| :--- | :--- |
| **ATP (Adenosine Triphosphate)** | The primary energetic currency of biological cells. |
| **Glycolysis** | Cytoplasmic anaerobic catabolism yielding 2 net ATP and 2 NADH. |
| **Krebs Cycle** | Mitochondrial matrix reaction cycle generating electron carriers (NADH, FADH2). |
| **ATP Synthase** | Membrane protein motor utilizing proton gradients to phosphorylate ADP into ATP. |`;
  }

  if (query.includes("executive 1-page exam revision cheat sheet")) {
    return `### Executive Exam Revision Cheat Sheet

#### 1. Core Summary
Cellular respiration is the biochemical mechanism by which cells extract energy from glucose in the presence of oxygen to produce ATP.

#### 2. Three Stages Overview
1. **Glycolysis**: Cytoplasm | Anaerobic | Net 2 ATP + 2 NADH
2. **Citric Acid Cycle**: Matrix | Aerobic | Net 2 ATP + 6 NADH + 2 FADH2
3. **Oxidative Phosphorylation**: Cristae | Aerobic | Net ~32-34 ATP

#### 3. Common Exam Pitfalls
* **Pitfall 1**: Forgetting that Glycolysis occurs in the cytoplasm, NOT inside the mitochondria.
* **Pitfall 2**: Confusing gross ATP yield (4 ATP) with net ATP yield (2 ATP) during glycolysis.
* **Pitfall 3**: Overlooking oxygen's exact role: it is the terminal electron acceptor, preventing gradient backup.`;
  }

  // 6. Snap-to-Solve Math breakdown
  if (query.includes("solve") || query.includes("derivative") || query.includes("kinematics") || query.includes("step-by-step")) {
    return `### Step-by-Step Problem Solution

#### Step 1: Identify Given Variables & Formula
Identify known constants and select the appropriate kinematic / calculus theorem.

#### Step 2: Apply Algebraic Transformation
Substitute values and compute intermediate derivatives or velocity components.

#### Step 3: Final Verification
Check dimensional units and ensure physical boundary conditions are satisfied.`;
  }

  // 7. General Socratic Tutor
  return `That's a thoughtful question! Let's break it down step-by-step:

1. **The Big Picture**: Think about how the core principles relate to real-world observations.
2. **Key Question**: If you adjust one variable, what happens to the overall balance?
3. **Try this next**: Test your understanding by predicting the outcome for a small test case!`;
}
