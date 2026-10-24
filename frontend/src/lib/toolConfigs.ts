import {
  BookOpen,
  FileText,
  HelpCircle,
  Sparkles,
  Video,
  Image,
  TrendingUp,
  Search,
  Code,
  Terminal,
  Cpu,
  Database,
  BarChart3,
  LineChart,
  Target,
  Mail,
  MessageSquare,
  User,
  Share2,
  Lightbulb,
  Briefcase,
  Users,
  GraduationCap,
  Award,
  Boxes,
  Palette,
  Heart,
  Brain,
  PenTool,
  Network,
  PieChart,
  Presentation
} from "lucide-react";
import { ToolConfig, StudioAction } from "@/components/roles/ToolChatWorkspace";

// --- Studio Actions Grouped by Role ---
const studentActions: StudioAction[] = [
  {
    label: "Create Flashcards",
    icon: BookOpen,
    description: "Generate interactive flashcards from the study concepts.",
    promptTemplate: "Convert the key terms and concepts from the response below into a clear list of front/back flashcards for revision:\n\n{{response}}"
  },
  {
    label: "Quiz Me",
    icon: HelpCircle,
    description: "Test knowledge with a customized quiz.",
    promptTemplate: "Generate a 3-question multiple-choice trivia quiz based on the key points in this response to test my understanding:\n\n{{response}}"
  },
  {
    label: "Summarize",
    icon: FileText,
    description: "Generate a clean bulleted summary.",
    promptTemplate: "Summarize the primary takeaways from this response in exactly 3 simple bullet points with emojis:\n\n{{response}}"
  }
];

const developerActions: StudioAction[] = [
  {
    label: "Copy Code",
    icon: Code,
    description: "Extract only the code snippet to clipboard.",
    promptTemplate: "Extract and isolate only the code snippets from the following response, formatting them cleanly without extra commentary:\n\n{{response}}"
  },
  {
    label: "Format as README",
    icon: FileText,
    description: "Format the response as a GitHub README section.",
    promptTemplate: "Format this output as a clean, markdown-compliant README documentation section with headings and lists:\n\n{{response}}"
  }
];

const creatorActions: StudioAction[] = [
  {
    label: "Export Script",
    icon: Video,
    description: "Draft a high-retention video script.",
    promptTemplate: "Convert this information into a 45-second TikTok/Shorts script with a strong Hook, engaging Body, and clear Call to Action:\n\n{{response}}"
  },
  {
    label: "Thumbnail Prompt",
    icon: Image,
    description: "Create a text-to-image prompt for thumbnail design.",
    promptTemplate: "Create a descriptive, high-detail prompt for Midjourney/DALL-E to build a modern YouTube thumbnail based on this concept:\n\n{{response}}"
  }
];

const analystActions: StudioAction[] = [
  {
    label: "Format as Table",
    icon: BarChart3,
    description: "Format the data into a Markdown table.",
    promptTemplate: "Convert the metrics or datasets present in this response into a beautifully formatted Markdown table:\n\n{{response}}"
  },
  {
    label: "Export SQL",
    icon: Database,
    description: "Generate query command matching the context.",
    promptTemplate: "Generate the SQL query matching the table schema or data retrieval query described here:\n\n{{response}}"
  }
];

const founderActions: StudioAction[] = [
  {
    label: "Pitch Deck Slide",
    icon: Presentation,
    description: "Structure a pitch slide based on the response.",
    promptTemplate: "Outline a 3-slide presentation pitch (Problem, Solution, Value Proposition) based on this concept:\n\n{{response}}"
  }
];

const teacherActions: StudioAction[] = [
  {
    label: "Lesson Plan Draft",
    icon: GraduationCap,
    description: "Format as a structured school lesson plan.",
    promptTemplate: "Turn this response content into a 50-minute structured lesson outline (Objective, Activity, Assessment):\n\n{{response}}"
  }
];

export function getToolConfig(slug: string, ageGroup: string | null, role: string | null): ToolConfig {
  const activeRole = role || "student";
  const activeAge = ageGroup || "teens";

  // Default color themes based on ageGroup (or role)
  let colors = {
    color: "text-violet-500",
    accentBg: "bg-violet-500/10",
    accentBorder: "border-violet-500/20"
  };

  if (activeAge === "kids") {
    colors = { color: "text-pink-500", accentBg: "bg-pink-500/10", accentBorder: "border-pink-500/20" };
  } else if (activeAge === "teens") {
    colors = { color: "text-violet-500", accentBg: "bg-violet-500/10", accentBorder: "border-violet-500/20" };
  } else if (activeAge === "college") {
    colors = { color: "text-orange-500", accentBg: "bg-orange-500/10", accentBorder: "border-orange-500/20" };
  } else if (activeAge === "adults") {
    colors = { color: "text-emerald-500", accentBg: "bg-emerald-500/10", accentBorder: "border-emerald-500/20" };
  } else if (activeAge === "seniors") {
    colors = { color: "text-amber-500", accentBg: "bg-amber-500/10", accentBorder: "border-amber-500/20" };
  }

  // Define global studio actions based on activeRole
  let studioActions = studentActions;
  if (activeRole === "developer") studioActions = developerActions;
  else if (activeRole === "creator") studioActions = creatorActions;
  else if (activeRole === "analyst") studioActions = analystActions;
  else if (activeRole === "founder") studioActions = founderActions;
  else if (activeRole === "teacher") studioActions = teacherActions;

  // Configuration Database
  switch (slug) {
    // --- student default ---
    case "learning-paths":
      return {
        name: "Age-Based Learning Paths",
        icon: BookOpen,
        ...colors,
        description: "Receive custom study path milestones mapped to your age bracket.",
        suggestedPrompts: [
          "Create a 4-week learning outline to understand introductory chemistry.",
          "Map out a study road map for learning web development this summer.",
          "Give me an outline of key topics needed to master pre-calculus."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a study guide assistant. Structure a learning curriculum or path suited for a ${activeAge} student. Break it down into clear, structured milestones.`
      };

    case "pdf-summarizer":
      return {
        name: "PDF & Notes Summarizer",
        icon: FileText,
        ...colors,
        description: "Paste text or source material to extract key concepts and bullet takeaways.",
        suggestedPrompts: [
          "Summarize my pasted chapter source into a brief overview.",
          "What are the 3 most important points in the provided notes?",
          "Explain the core arguments of the pasted document."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a reading companion. Synthesize provided content into structured takeaways suitable for a ${activeAge} audience.`
      };

    case "question-generator":
      return {
        name: "Practice Question Generator",
        icon: HelpCircle,
        ...colors,
        description: "Test your understanding with custom-generated review questions.",
        suggestedPrompts: [
          "Generate 3 multiple choice questions on cellular respiration.",
          "Test my knowledge of Newtonian physics with 2 conceptual questions.",
          "Give me a short practice quiz on fractions."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a test preparation coach. Draft practice questions or quizzes. Provide correct answers and simple explanatory feedback after each query.`
      };

    case "explain-like-im-10":
      return {
        name: "Explain Like I'm 10",
        icon: Sparkles,
        ...colors,
        description: "Deconstruct complex, scary terms into simple, fun analogies.",
        suggestedPrompts: [
          "Explain how the internet works using an analogy.",
          "What is quantum computing? Tell me a story about it.",
          "How does inflation work in economics?"
        ],
        studioActions,
        systemHint: `You are AIMIKO. Explain advanced, complex topics using vivid, simple, child-friendly analogies suited for a 10-year-old.`
      };

    // --- creator default ---
    case "script-generator":
      return {
        name: "AI Script Generator",
        icon: Video,
        ...colors,
        description: "Build engaging video scripts with hook, body, and call-to-actions.",
        suggestedPrompts: [
          "Write a 60-second YouTube shorts script about productivity hacks.",
          "Create an introductory hook for a vlog about study habits.",
          "Draft a video script explaining how photosynthesis works in a funny way."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a creative director. Help the user draft scripts optimized for content retention, highlighting hooks, body details, and call-to-actions.`
      };

    case "thumbnail-generator":
      return {
        name: "Thumbnail Idea Generator",
        icon: Image,
        ...colors,
        description: "Design concepts, layout directions, and visual text ideas.",
        suggestedPrompts: [
          "Suggest 3 thumbnail layout concepts for a 'Day in the Life of a Developer' vlog.",
          "What text overlay should I put on a thumbnail about passive income?",
          "Give me a visual prompt for an AI generated thumbnail about space travel."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a visual designer. Suggest layout plans, contrasting color recommendations, text overlays, and graphic prompts for video thumbnails.`
      };

    case "trend-analyzer":
      return {
        name: "Trend Analyzer",
        icon: TrendingUp,
        ...colors,
        description: "Analyze current market shifts, tech trends, and viral strategies.",
        suggestedPrompts: [
          "What content trends are dominating self-learning tech right now?",
          "How can I pivot my educational channel to align with current video trends?",
          "Analyze the trend of short-form educational content."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a strategic analyst. Provide predictions, engagement factors, and trend breakdowns to keep the content fresh.`
      };

    case "title-seo-builder":
      return {
        name: "Title & SEO Description Builder",
        icon: Search,
        ...colors,
        description: "Optimize video titles and video descriptions for higher CTR.",
        suggestedPrompts: [
          "Give me 5 high-CTR titles for a programming tutorial.",
          "Draft an SEO optimized description for a video about learning React.",
          "Help me find keywords for a video on startup planning."
        ],
        studioActions,
        systemHint: `You are AIMIKO, an SEO specialist. Build titles and keyword tags optimized for search discoverability.`
      };

    // --- developer default ---
    case "code-debugger":
      return {
        name: "Code Debugger",
        icon: Terminal,
        ...colors,
        description: "Identify syntax bugs, runtime failures, and logical mistakes.",
        suggestedPrompts: [
          "Find the bug in this function: [paste code here]",
          "Why is this React hook causing a memory leak?",
          "Fix a syntax error in my database connection script."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a debugger. Read code snippets, highlight bugs, explain the root cause, and provide safe, clean fixes.`
      };

    case "api-blueprint":
      return {
        name: "API Blueprint Generator",
        icon: Cpu,
        ...colors,
        description: "Draft modular backend structures and mock endpoints.",
        suggestedPrompts: [
          "Build a modular FastAPI endpoint template for user authentication.",
          "Draft an Express.js router structure for a bookstore catalog API.",
          "Generate mock JSON responses for a payment processor route."
        ],
        studioActions,
        systemHint: `You are AIMIKO, an API architect. Draft clean, modular endpoints using standard practices (REST, FastAPI, Node).`
      };

    case "code-explanation":
      return {
        name: "Code Explanation Mode",
        icon: Code,
        ...colors,
        description: "Deconstruct complex files or algorithms line-by-line.",
        suggestedPrompts: [
          "Explain this recursive sorting algorithm line-by-line.",
          "How does this async event loop work?",
          "Explain this React component structure to me."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a software engineering mentor. Explain lines of code, library methods, and algorithm flows clearly.`
      };

    case "readme-builder":
      return {
        name: "GitHub README Builder",
        icon: FileText,
        ...colors,
        description: "Draft comprehensive documentation and dependency lists.",
        suggestedPrompts: [
          "Create a professional README for a React weather application.",
          "Build a README outlining install instructions for a python CLI tool.",
          "Draft a documentation blueprint for a client dashboard."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a tech writer. Design neat markdown README structures containing install instructions, features, and schemas.`
      };

    // --- analyst default ---
    case "data-insights":
      return {
        name: "Data Insight Explorer",
        icon: LineChart,
        ...colors,
        description: "Extract correlation hypotheses and analytical breakdowns.",
        suggestedPrompts: [
          "What analytical steps should I take to find churn correlations?",
          "Explain the difference between variance and standard deviation.",
          "How do I analyze customer satisfaction trends over quarters?"
        ],
        studioActions,
        systemHint: `You are AIMIKO, a business analyst. Explain data analysis procedures, metrics, and correlation hypotheses.`
      };

    case "sql-query-builder":
      return {
        name: "SQL Query Builder",
        icon: Database,
        ...colors,
        description: "Translate natural language statements into valid SQL code.",
        suggestedPrompts: [
          "Write a SQL query to select all users who signed up last week.",
          "How do I write an inner join for users and transaction tables?",
          "Create a query counting items grouped by store location."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a database engineer. Translate plain English into optimized SQL query syntax.`
      };

    case "automated-visualizations":
      return {
        name: "Visualization Advisor",
        icon: BarChart3,
        ...colors,
        description: "Receive advice on best chart types and layout guidelines.",
        suggestedPrompts: [
          "What's the best chart type to show monthly revenue vs churn rate?",
          "Should I use a bar chart or line chart to represent visitor trends?",
          "Give me layout guidelines for a SaaS retention dashboard."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a UI/UX analyst. Recommend the best visual chart practices and reporting design guidelines.`
      };

    case "kpi-tracking":
      return {
        name: "KPI Tracking Advisor",
        icon: Target,
        ...colors,
        description: "Outline metrics, conversion funnels, and retention frameworks.",
        suggestedPrompts: [
          "What are the top 5 KPIs to track for a productivity application?",
          "Suggest key metrics for an early stage e-commerce startup.",
          "How do I structure a conversion funnel pipeline?"
        ],
        studioActions,
        systemHint: `You are AIMIKO, a business operations strategist. Outline key performance indicators, funnels, and dashboards.`
      };

    // --- job_seeker default ---
    case "resume-optimizer":
      return {
        name: "Resume Optimizer",
        icon: FileText,
        ...colors,
        description: "Refine bullet points with Google XYZ standards.",
        suggestedPrompts: [
          "Optimize this bullet point: 'I helped fix bugs on our React website.'",
          "Rewrite my job description for a Product Manager role.",
          "How can I emphasize technical leadership in my bullet points?"
        ],
        studioActions,
        systemHint: `You are AIMIKO, a recruitment coach. Help the user optimize resume bullet points. Utilize action verbs, specific metrics, and context.`
      };

    case "cover-letter-builder":
      return {
        name: "Cover Letter Builder",
        icon: Mail,
        ...colors,
        description: "Draft persuasive application letters matching job notes.",
        suggestedPrompts: [
          "Draft a professional cover letter for a Frontend developer role.",
          "Write a cover letter intro expressing interest in an operations internship.",
          "Customize my cover letter outline to match standard job specs."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a professional ghostwriter. Draft clean cover letters matching target roles and context notes.`
      };

    case "interview-prep":
      return {
        name: "Interview Prep Studio",
        icon: MessageSquare,
        ...colors,
        description: "Practice answering behavioral and domain-specific questions.",
        suggestedPrompts: [
          "Ask me a behavioral question for a software engineer role.",
          "Give me 3 common interview questions for a project manager position.",
          "How should I structure a response explaining a time I resolved team conflicts?"
        ],
        studioActions,
        systemHint: `You are AIMIKO, a mock interviewer. Ask behavioral or domain questions, analyze user responses, and give feedback using the STAR format.`
      };

    case "linkedin-headline":
      return {
        name: "LinkedIn Headline Generator",
        icon: Share2,
        ...colors,
        description: "Stand out to recruiters with catchy professional taglines.",
        suggestedPrompts: [
          "Suggest 5 LinkedIn headlines for an aspiring data analyst.",
          "Create a headline emphasizing my experience in fullstack development.",
          "Give me a clean LinkedIn profile summary intro."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a branding consultant. Draft catchy, optimized professional taglines and headers.`
      };

    // --- founder default ---
    case "idea-validation":
      return {
        name: "Idea Validation Suite",
        icon: Lightbulb,
        ...colors,
        description: "Evaluate your business concept, target markets, and risks.",
        suggestedPrompts: [
          "Validate my business concept: an on-demand dry cleaning delivery app.",
          "Perform a SWOT analysis for a subscription-based coffee box business.",
          "What are the top risks for starting an online learning platform?"
        ],
        studioActions,
        systemHint: `You are AIMIKO, a startup mentor. Evaluate business ideas, highlight potential pitfalls, and suggest market validation tests.`
      };

    case "business-plan":
      return {
        name: "Business Plan Builder",
        icon: Briefcase,
        ...colors,
        description: "Structure lean canvas formats, revenue splits, and target profiles.",
        suggestedPrompts: [
          "Outline a lean business plan canvas for a mobile fitness application.",
          "What are common monetization models for a developer SaaS tool?",
          "Help me define my primary customer profile for a local bakery service."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a business planner. Formulate structural components of a business plan (revenue models, channels, partners).`
      };

    case "pitch-deck":
      return {
        name: "Pitch Deck Outliner",
        icon: Presentation,
        ...colors,
        description: "Build high-impact slides, problem frameworks, and pitch steps.",
        suggestedPrompts: [
          "Outline a 10-slide pitch deck structure for a pre-seed marketplace startup.",
          "What points should I address in my 'Problem' slide for a waste reduction service?",
          "Create a slide draft explaining market size (TAM/SAM/SOM)."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a pitch deck consultant. Outline persuasive slide contents matching investor standards.`
      };

    case "team-equity":
      return {
        name: "Team & Equity Assistant",
        icon: Users,
        ...colors,
        description: "Analyze splits, roles, early vesting schedules, and shares.",
        suggestedPrompts: [
          "What are best practices for splitting equity among 3 early stage cofounders?",
          "Explain how a standard 4-year vesting schedule with a 1-year cliff works.",
          "How should we distribute equity when a founder is not working full-time?"
        ],
        studioActions,
        systemHint: `You are AIMIKO, a legal and team advisor. Explain vesting, founder stock pools, and team equity strategies.`
      };

    // --- teacher default ---
    case "lesson-plan":
      return {
        name: "Lesson Plan Generator",
        icon: GraduationCap,
        ...colors,
        description: "Build 50-minute lesson plans aligned to standards.",
        suggestedPrompts: [
          "Draft a 45-minute lesson plan teaching gravity to 4th graders.",
          "Create an introductory biology lesson block on animal cells.",
          "Suggest a creative icebreaker activity for high school English students."
        ],
        studioActions,
        systemHint: `You are AIMIKO, an instructional designer. Structure lesson materials, timelines, objectives, and assessments.`
      };

    case "quiz-task-builder":
      return {
        name: "Quiz & Task Builder",
        icon: HelpCircle,
        ...colors,
        description: "Formulate homework tasks, quiz templates, and rubrics.",
        suggestedPrompts: [
          "Generate a 5-question vocabulary quiz for 6th grade literature.",
          "Create a homework worksheet asking students to solve linear equations.",
          "Suggest a grading rubric for a high school history presentation."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a curriculum creator. Build custom student tasks, homework questions, and scoring matrices.`
      };

    case "classroom-helper":
      return {
        name: "Classroom AI Q&A Helper",
        icon: MessageSquare,
        ...colors,
        description: "Synthesize simplified answers to complex student questions.",
        suggestedPrompts: [
          "How do I explain how electricity works to a 7-year-old?",
          "Explain why dinosaurs went extinct in a simple, engaging sentence.",
          "Give me an analogy to explain historical timelines to elementary students."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a teaching assistant. Rephrase advanced concepts into fun, kid-friendly explanations.`
      };

    case "parent-reports":
      return {
        name: "Parent Progress Reports",
        icon: Award,
        ...colors,
        description: "Generate encouraging progress templates emphasizing strengths.",
        suggestedPrompts: [
          "Draft a progress card for a child showing great effort in math despite struggle.",
          "Write a feedback letter for a student excelling in creative writing.",
          "How do I communicate focus issues to parents constructively?"
        ],
        studioActions,
        systemHint: `You are AIMIKO, a school communications advisor. Generate encouraging, constructive progress reports for parents.`
      };

    // --- kids overrides ---
    case "school-buddy":
      if (activeAge === "kids") {
        return {
          name: "School Buddy",
          icon: BookOpen,
          color: "text-pink-500",
          accentBg: "bg-pink-500/10",
          accentBorder: "border-pink-500/20",
          description: "Your friendly AI study helper. Ask questions, take quizzes, and summarize stories!",
          suggestedPrompts: [
            "Why does it rain? 🌧️ Explain it to me step-by-step.",
            "How do magnets pull objects? 🧲",
            "Explain how the internet works like I'm 10 years old. 🌐",
            "Summarize the story of 'The Lion and the Mouse'. 🐭"
          ],
          studioActions,
          systemHint: "You are School Buddy, a smart, cute and playful robot monkey AI assistant for children. Help kids understand homework, explain science with simple analogies, tell stories, and host quizzes with plenty of emojis!"
        };
      }
      return {
        name: "School Buddy",
        icon: BookOpen,
        ...colors,
        description: "Your AI study companion — chat, create flashcards, take quizzes, and get summaries!",
        suggestedPrompts: [
          "Explain photosynthesis in a fun and simple way.",
          "Help me understand how rainbows form with an analogy.",
          "What are the planets in our solar system? Tell me a fun fact about each!",
          "Explain the water cycle step by step like I'm 8 years old."
        ],
        studioActions,
        systemHint: `You are AIMIKO, a fun, playful, and encouraging AI school buddy for a ${activeAge} child. Use simple language, emojis, and kid-friendly analogies. Be warm, patient, and celebrate every effort. When making flashcards or quizzes, keep content age-appropriate and fun.`
      };

    case "practice-quizzes":
      return {
        name: "Fun Practice Quizzes",
        icon: HelpCircle,
        color: "text-pink-500",
        accentBg: "bg-pink-500/10",
        accentBorder: "border-pink-500/20",
        description: "Play cool trivia games with emojis and claim explorer badges!",
        suggestedPrompts: [
          "Generate a 3-question trivia quiz about wild animals. 🦁",
          "Test my knowledge on space and the moon. 🚀",
          "Give me a quick dino quiz! 🦖"
        ],
        studioActions,
        systemHint: "You are AIMIKO, the trivia host. Make interactive quiz questions with 3 choice options for kids. Provide a fun fact with emojis after each answer."
      };

    case "story-summarizer":
      return {
        name: "Book & Story Summarizer",
        icon: FileText,
        color: "text-pink-500",
        accentBg: "bg-pink-500/10",
        accentBorder: "border-pink-500/20",
        description: "Explore summaries and read-along stories of famous children books.",
        suggestedPrompts: [
          "Summarize the story of 'The Lion and the Mouse'. 🐭",
          "What is the lesson of 'The Tortoise and the Hare'? 🐢",
          "Create a customized adventure story about Kiko the puppy on the Moon! 🚀"
        ],
        studioActions,
        systemHint: "You are AIMIKO, the storyteller. Summarize fairy tales, fables, and stories for young children. Emphasize the moral lesson at the end with emojis."
      };

    case "story-teller":
      return {
        name: "Animated Story Teller",
        icon: Sparkles,
        color: "text-pink-500",
        accentBg: "bg-pink-500/10",
        accentBorder: "border-pink-500/20",
        description: "Generate colorful stories with interactive scripts.",
        suggestedPrompts: [
          "Write a story about a little dragon who lost his fire.",
          "Draft a fairy tale about a magic tree that grew cookies. 🍪",
          "Tell me a story about a friendly robot monkey."
        ],
        studioActions,
        systemHint: "You are AIMIKO. Write a fun, engaging, and extremely imaginative short bedtime story or children's tale with colorful words."
      };

    case "toy-designer":
      return {
        name: "Cardboard Toy Designer",
        icon: Boxes,
        color: "text-pink-500",
        accentBg: "bg-pink-500/10",
        accentBorder: "border-pink-500/20",
        description: "Create plans for recycling household boxes into toys.",
        suggestedPrompts: [
          "How can I turn a shoe box into a spaceship? 🚀",
          "Suggest a cardboard craft to build a small castle.",
          "Give me instructions to build a paper cup walkie-talkie."
        ],
        studioActions,
        systemHint: "You are AIMIKO, the craft inventor. Provide simple, safe, step-by-step instructions for kids to build cool toys from cardboard and recycling bins."
      };

    case "drawing-prompts":
      return {
        name: "Fun Drawing Prompts",
        icon: Palette,
        color: "text-pink-500",
        accentBg: "bg-pink-500/10",
        accentBorder: "border-pink-500/20",
        description: "Unlock fun, imaginative ideas for your art sketches.",
        suggestedPrompts: [
          "Give me an imaginative drawing prompt combining an animal and a food.",
          "Suggest a scene featuring a squirrel sailing on a leaf boat.",
          "What should I draw if I want to paint a city in the clouds?"
        ],
        studioActions,
        systemHint: "You are AIMIKO, the art teacher. Suggest fun, whimsical drawing prompts with active, colorful scenes for kids to sketch."
      };

    case "riddle-maker":
      return {
        name: "Riddle & Puzzle Maker",
        icon: Brain,
        color: "text-pink-500",
        accentBg: "bg-pink-500/10",
        accentBorder: "border-pink-500/20",
        description: "Solve fun brain teasers and word riddles.",
        suggestedPrompts: [
          "Give me 3 riddles about school objects.",
          "Make a word puzzle about ocean animals.",
          "Give me a brain teaser that has a surprising answer."
        ],
        studioActions,
        systemHint: "You are AIMIKO, the riddle master. Provide engaging, simple riddles for children, and give hints if they ask, followed by answers with emojis."
      };

    // --- seniors overrides ---
    case "hobby-planner":
      return {
        name: "Hobby Discovery Planner",
        icon: Heart,
        color: "text-amber-500",
        accentBg: "bg-amber-500/10",
        accentBorder: "border-amber-500/20",
        description: "Explore indoor gardening, memory crafts, and active wellness ideas.",
        suggestedPrompts: [
          "Suggest 3 simple hobbies to start at home this month.",
          "How do I start a small kitchen windowsill herb garden?",
          "Recommend some memory-boosting crafts or card games."
        ],
        studioActions,
        systemHint: "You are AIMIKO, a wellness advisor. Help seniors discover engaging, safe, and stimulating hobbies at home."
      };

    case "book-summarizer":
      return {
        name: "Book Club Summarizer",
        icon: BookOpen,
        color: "text-amber-500",
        accentBg: "bg-amber-500/10",
        accentBorder: "border-amber-500/20",
        description: "Get key discussion guides and book highlights.",
        suggestedPrompts: [
          "Summarize the key themes of 'To Kill a Mockingbird'.",
          "Give me 3 discussion questions for a book club reading 'Pride and Prejudice'.",
          "Suggest classic historical fiction novels to read next."
        ],
        studioActions,
        systemHint: "You are AIMIKO, a book club host. Discuss classic literature, extract key themes, and draft friendly book discussion guides."
      };

    case "mind-gym":
      return {
        name: "Mind Gym Riddles",
        icon: Brain,
        color: "text-amber-500",
        accentBg: "bg-amber-500/10",
        accentBorder: "border-amber-500/20",
        description: "Challenge your mind with logical games and friendly puzzles.",
        suggestedPrompts: [
          "Give me a lateral thinking puzzle.",
          "Give me a set of word association games to exercise focus.",
          "Suggest a numbers riddle."
        ],
        studioActions,
        systemHint: "You are AIMIKO, a cognitive trainer. Create friendly, thought-provoking mind games and brain teasers for seniors."
      };

    case "socratic-conversations":
      return {
        name: "Socratic Conversations",
        icon: MessageSquare,
        color: "text-amber-500",
        accentBg: "bg-amber-500/10",
        accentBorder: "border-amber-500/20",
        description: "Engage in deep, thoughtful dialogs about philosophy and history.",
        suggestedPrompts: [
          "Discuss Marcus Aurelius' stoicism principles in simple terms.",
          "What was the main philosophical argument of Socrates regarding wisdom?",
          "Let's chat about the evolution of printing press technology."
        ],
        studioActions,
        systemHint: "You are AIMIKO, a philosophic converser. Ask open-ended questions, guide reflective discussions, and share historical context respectfully."
      };

    case "memoir-ghostwriter":
      return {
        name: "Memoir Ghostwriter",
        icon: PenTool,
        color: "text-amber-500",
        accentBg: "bg-amber-500/10",
        accentBorder: "border-amber-500/20",
        description: "Transcribe childhood memories into beautiful story prose.",
        suggestedPrompts: [
          "Help me structure a memoir chapter about growing up in the 60s.",
          "How do I describe standard family holidays from my childhood?",
          "Help me draft a paragraph about my first job experience."
        ],
        studioActions,
        systemHint: "You are AIMIKO, a warm memoir ghostwriter. Help seniors organize, write, and style their childhood and life experiences into beautiful storytelling."
      };

    case "vlog-setup":
      return {
        name: "Vlog & Life Advice Setup",
        icon: Video,
        color: "text-amber-500",
        accentBg: "bg-amber-500/10",
        accentBorder: "border-amber-500/20",
        description: "Learn how to record audio/video notes and organize video gear.",
        suggestedPrompts: [
          "What is the simplest way to record a video greeting on an iPad?",
          "Recommend some easy setup tips for lighting a desk video.",
          "How do I transfer voice recordings to my computer?"
        ],
        studioActions,
        systemHint: "You are AIMIKO, a tech helper. Guide seniors through recording processes, simple equipment setups, and organizing media files with clear steps."
      };

    case "history-storyteller":
      return {
        name: "Local History Storyteller",
        icon: Search,
        color: "text-amber-500",
        accentBg: "bg-amber-500/10",
        accentBorder: "border-amber-500/20",
        description: "Discover stories, key dates, and fun facts about local events.",
        suggestedPrompts: [
          "Tell me a story about the construction of the transcontinental railroad.",
          "What were the major changes in cities during the 1920s?",
          "Share interesting facts about ancient Rome's engineering wonders."
        ],
        studioActions,
        systemHint: "You are AIMIKO, a historical storyteller. Share engaging, narrative-driven history stories, dates, and milestones."
      };

    case "writing-prompts":
      return {
        name: "Creative Writing Prompts",
        icon: Palette,
        color: "text-amber-500",
        accentBg: "bg-amber-500/10",
        accentBorder: "border-amber-500/20",
        description: "Get inspired with daily story starters and word games.",
        suggestedPrompts: [
          "Give me a creative story starter set in a quiet mountain cabin.",
          "Write a prompt involving a mystery key found in an old drawer.",
          "Suggest a short poetry writing exercise."
        ],
        studioActions,
        systemHint: "You are AIMIKO, a writing advisor. Give creative, warm, and highly engaging writing prompts to help start standard story draft projects."
      };



    default:
      // Fallback configuration if slug is unknown
      return {
        name: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        icon: BookOpen,
        ...colors,
        description: "AIMIKO customized tool workspace to generate tailored solutions.",
        suggestedPrompts: [
          `Generate response details for this ${slug} query.`,
          `Analyze key patterns relating to ${slug}.`,
          `Draft a blueprint matching my goals.`
        ],
        studioActions,
        systemHint: `You are AIMIKO, a helpful AI buddy. Ground your solutions in context and help the user resolve their task on: ${slug}`
      };
  }
}
