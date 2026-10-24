import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAimiko } from "@/context/AimikoContext";
import { ToolChatWorkspace } from "@/components/roles/ToolChatWorkspace";
import { getToolConfig } from "@/lib/toolConfigs";
import { StoryToyCreator } from "@/components/roles/kids/StoryToyCreator";
import { AdventureBook } from "@/components/roles/kids/AdventureBook";
import { DoodleCanvas } from "@/components/roles/kids/DoodleCanvas";

// Dedicated Student Interactive Studios
import { LearningPathsStudio } from "@/components/roles/student/LearningPathsStudio";
import { PdfSummarizerStudio } from "@/components/roles/student/PdfSummarizerStudio";
import { PracticeQuizStudio } from "@/components/roles/student/PracticeQuizStudio";
import { ExplainLikeIm10Studio } from "@/components/roles/student/ExplainLikeIm10Studio";
import { SnapToSolveStudio } from "@/components/roles/student/SnapToSolveStudio";
import { VoiceTutorRoom } from "@/components/roles/student/VoiceTutorRoom";
import { SpacedRepetitionStudio } from "@/components/roles/student/SpacedRepetitionStudio";
import { AgentPlayground } from "@/components/roles/student/AgentPlayground";

// Dedicated Content Creator Studios
import {
  ScriptStudio,
  ThumbnailStudio,
  TrendAnalyzerStudio,
  SEOTitleStudio
} from "@/components/roles/creator";

// Dedicated Developer Studios
import {
  CodeDebuggerStudio,
  APIBlueprintStudio,
  CodeExplainerStudio,
  ReadmeStudio
} from "@/components/roles/developer";

// Dedicated Data Analyst Studios
import {
  DataInsightsStudio,
  SQLStudio,
  ChartAdvisorStudio,
  KPIBuilderStudio
} from "@/components/roles/analyst";

// Dedicated Job Seeker Studios
import {
  ResumeStudio,
  CoverLetterStudio,
  InterviewPrepStudio,
  LinkedInStudio
} from "@/components/roles/jobseeker";

// Dedicated Startup Founder Studios
import {
  IdeaValidationStudio,
  LeanCanvasStudio,
  PitchDeckStudio,
  EquityAdvisorStudio,
  AgilePMStudio
} from "@/components/roles/founder";

// Dedicated Teacher & Educator Studios
import {
  LessonPlanStudio,
  AssignmentStudio,
  ClassroomHelperStudio,
  ProgressReportsStudio
} from "@/components/roles/teacher";

export default function ToolPage() {
  const { toolSlug } = useParams<{ toolSlug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { role, ageGroup } = useAimiko();

  const closeWidget = () => {
    navigate("/dashboard");
  };

  if (!toolSlug) {
    return null;
  }

  // 1. Student Studios
  if (toolSlug === "snap-to-solve" || toolSlug === "homework-solver") {
    return <SnapToSolveStudio />;
  }
  if (toolSlug === "voice-tutor" || toolSlug === "live-voice") {
    navigate("/chat", { replace: true });
    return null;
  }
  if (toolSlug === "spaced-repetition" || toolSlug === "flashcards") {
    return <SpacedRepetitionStudio />;
  }
  if (toolSlug === "learning-paths") {
    return <LearningPathsStudio />;
  }
  if (toolSlug === "pdf-summarizer") {
    return <PdfSummarizerStudio />;
  }
  if (toolSlug === "question-generator" || toolSlug === "practice-quizzes") {
    return <PracticeQuizStudio />;
  }
  if (toolSlug === "explain-like-im-10") {
    return <ExplainLikeIm10Studio />;
  }
  if (toolSlug === "agent-playground" || toolSlug === "ai-playground" || toolSlug === "playground") {
    return <AgentPlayground />;
  }

  // 2. Content Creator Studios
  if (toolSlug === "script-generator" || toolSlug === "trend-analyzer" || toolSlug === "title-seo-builder") {
    return <ScriptStudio />;
  }
  if (toolSlug === "thumbnail-generator") {
    return <ThumbnailStudio />;
  }

  // 3. Developer & Engineer Studios
  if (toolSlug === "code-debugger" || toolSlug === "code-explanation") {
    return <CodeDebuggerStudio />;
  }
  if (toolSlug === "api-blueprint") {
    return <APIBlueprintStudio />;
  }
  if (toolSlug === "readme-builder") {
    return <ReadmeStudio />;
  }

  // 4. Data Analyst Studios
  if (toolSlug === "data-insights") {
    return <DataInsightsStudio />;
  }
  if (toolSlug === "sql-query-builder") {
    return <SQLStudio />;
  }
  if (toolSlug === "automated-visualizations") {
    return <ChartAdvisorStudio />;
  }
  if (toolSlug === "kpi-tracking") {
    return <KPIBuilderStudio />;
  }

  // 5. Job Seeker & Career Studios
  if (toolSlug === "resume-optimizer") {
    return <ResumeStudio />;
  }
  if (toolSlug === "cover-letter-builder" || toolSlug === "linkedin-headline") {
    return <CoverLetterStudio />;
  }
  if (toolSlug === "interview-prep") {
    return <InterviewPrepStudio />;
  }

  // 6. Startup Founder Studios
  if (toolSlug === "idea-validation" || toolSlug === "team-equity") {
    return <IdeaValidationStudio />;
  }
  if (toolSlug === "business-plan") {
    return <LeanCanvasStudio />;
  }
  if (toolSlug === "pitch-deck") {
    return <PitchDeckStudio />;
  }
  if (toolSlug === "agile-pm" || toolSlug === "sprint-board" || toolSlug === "project-management") {
    return <AgilePMStudio />;
  }

  // 7. Teacher & Educator Studios
  if (toolSlug === "lesson-plan") {
    return <LessonPlanStudio />;
  }
  if (toolSlug === "quiz-task-builder") {
    return <AssignmentStudio />;
  }
  if (toolSlug === "classroom-helper") {
    return <ClassroomHelperStudio />;
  }
  if (toolSlug === "parent-reports") {
    return <ProgressReportsStudio />;
  }

  // Kid views overrides
  if (ageGroup === "kids") {
    if (toolSlug === "story-teller") {
      return (
        <div className="p-4 bg-background w-full">
          <StoryToyCreator activeToolLabel="Story Teller" onClose={closeWidget} />
        </div>
      );
    }
    if (toolSlug === "adventure-book") {
      return (
        <div className="p-4 bg-background w-full">
          <AdventureBook activeToolLabel="Adventure Book" onClose={closeWidget} />
        </div>
      );
    }
    if (toolSlug === "doodle-canvas") {
      return (
        <div className="p-4 bg-background w-full">
          <DoodleCanvas activeToolLabel="Doodle Canvas" onClose={closeWidget} />
        </div>
      );
    }
  }

  // Fallback to configurable studio workspace
  const config = getToolConfig(toolSlug, ageGroup, role);

  const suggestedPrompt = (location.state as any)?.suggestedPrompt;
  if (suggestedPrompt && !config.suggestedPrompts.includes(suggestedPrompt)) {
    config.suggestedPrompts = [suggestedPrompt, ...config.suggestedPrompts.filter(p => p !== suggestedPrompt)];
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-background">
      <ToolChatWorkspace config={config} onClose={closeWidget} />
    </div>
  );
}
