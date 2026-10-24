import React, { createContext, useContext, useState, ReactNode } from "react";

export type AgeGroup = "kids" | "teens" | "college" | "adults" | "seniors";
export type Role = "student" | "creator" | "developer" | "job_seeker" | "founder" | "teacher";

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface AimikoState {
  ageGroup: AgeGroup | null;
  role: Role | null;
  userName: string;
  goals: string[];
  interests: string[];
  weakAreas: string[];
  badges: string[];
  streakDays: number;
  tasks: Task[];
  notes: Note[];
  notifications: string[];
  billingTier: "freemium" | "premium";
  promptsUsedToday: number;
  dailyPromptsLimit: number;
  setAgeGroup: (age: AgeGroup | null) => void;
  setRole: (role: Role | null) => void;
  setUserName: (name: string) => void;
  addGoal: (goal: string) => void;
  removeGoal: (goal: string) => void;
  addInterest: (interest: string) => void;
  removeInterest: (interest: string) => void;
  addWeakArea: (area: string) => void;
  removeWeakArea: (area: string) => void;
  addBadge: (badge: string) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addNote: (title: string, content: string) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  addNotification: (message: string) => void;
  setBillingTier: (tier: "freemium" | "premium") => void;
  incrementPromptUsage: () => boolean;
  customPresets: Record<string, any>;
  saveCustomPreset: (key: string, data: any) => void;
  resetAllData: () => void;
  themeClass: string;
  themeMode: "light" | "dark";
  toggleThemeMode: () => void;
}

const AimikoContext = createContext<AimikoState | undefined>(undefined);

const ageToTheme: Record<string, string> = {
  kids: "theme-kids",
  teens: "theme-teens",
  college: "",
  adults: "theme-adults",
  seniors: "theme-seniors",
};

const loadState = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveState = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export function AimikoProvider({ children }: { children: ReactNode }) {
  const [ageGroup, setAgeGroupState] = useState<AgeGroup | null>(() => loadState("aimiko_ageGroup", null));
  const [role, setRoleState] = useState<Role | null>(() => {
    const saved = loadState("aimiko_role", null);
    if (saved === "analyst") return "developer";
    return saved;
  });
  const [userName, setUserNameState] = useState<string>(() => loadState("aimiko_userName", ""));
  const [goals, setGoals] = useState<string[]>(() => loadState("aimiko_goals", []));
  const [interests, setInterests] = useState<string[]>(() => loadState("aimiko_interests", []));
  const [weakAreas, setWeakAreas] = useState<string[]>(() => loadState("aimiko_weakAreas", []));
  const [badges, setBadges] = useState<string[]>(() => loadState("aimiko_badges", []));
  const [streakDays, setStreakDays] = useState<number>(() => loadState("aimiko_streakDays", 0));
  const [tasks, setTasks] = useState<Task[]>(() => loadState("aimiko_tasks", []));
  const [notes, setNotes] = useState<Note[]>(() => loadState("aimiko_notes", []));
  const [notifications, setNotifications] = useState<string[]>(() => loadState("aimiko_notifications", []));
  const [billingTier, setBillingTierState] = useState<"freemium" | "premium">(() => loadState("aimiko_billingTier", "freemium"));
  const [promptsUsedToday, setPromptsUsedToday] = useState<number>(() => loadState("aimiko_promptsUsedToday", 0));
  const [customPresets, setCustomPresets] = useState<Record<string, any>>(() => loadState("aimiko_customPresets", {}));

  const setAgeGroup = (age: AgeGroup | null) => {
    setAgeGroupState(age);
    if (age) {
      saveState("aimiko_ageGroup", age);
    } else {
      localStorage.removeItem("aimiko_ageGroup");
    }
  };

  const setRole = (r: Role | null) => {
    setRoleState(r);
    if (r) {
      saveState("aimiko_role", r);
    } else {
      localStorage.removeItem("aimiko_role");
    }
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    saveState("aimiko_userName", name);
  };

  const addGoal = (goal: string) => {
    const next = [...goals, goal];
    setGoals(next);
    saveState("aimiko_goals", next);
  };

  const removeGoal = (goal: string) => {
    const next = goals.filter((item) => item !== goal);
    setGoals(next);
    saveState("aimiko_goals", next);
  };

  const addInterest = (interest: string) => {
    const next = [...interests, interest];
    setInterests(next);
    saveState("aimiko_interests", next);
  };

  const removeInterest = (interest: string) => {
    const next = interests.filter((item) => item !== interest);
    setInterests(next);
    saveState("aimiko_interests", next);
  };

  const addWeakArea = (area: string) => {
    const next = [...weakAreas, area];
    setWeakAreas(next);
    saveState("aimiko_weakAreas", next);
  };

  const removeWeakArea = (area: string) => {
    const next = weakAreas.filter((item) => item !== area);
    setWeakAreas(next);
    saveState("aimiko_weakAreas", next);
  };

  const addBadge = (badge: string) => {
    if (!badges.includes(badge)) {
      const next = [...badges, badge];
      setBadges(next);
      saveState("aimiko_badges", next);
    }
  };

  const incrementStreak = () => {
    const next = streakDays + 1;
    setStreakDays(next);
    saveState("aimiko_streakDays", next);
  };

  const resetStreak = () => {
    setStreakDays(0);
    saveState("aimiko_streakDays", 0);
  };

  const addTask = (title: string) => {
    const next = [...tasks, { id: Date.now().toString(), title, completed: false }];
    setTasks(next);
    saveState("aimiko_tasks", next);
  };

  const toggleTask = (id: string) => {
    const next = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(next);
    saveState("aimiko_tasks", next);
  };

  const deleteTask = (id: string) => {
    const next = tasks.filter((task) => task.id !== id);
    setTasks(next);
    saveState("aimiko_tasks", next);
  };

  const addNote = (title: string, content: string) => {
    const note: Note = {
      id: Date.now().toString(),
      title,
      content,
      updatedAt: new Date().toISOString(),
    };
    const next = [note, ...notes];
    setNotes(next);
    saveState("aimiko_notes", next);
  };

  const updateNote = (id: string, title: string, content: string) => {
    const next = notes.map((note) =>
      note.id === id ? { ...note, title, content, updatedAt: new Date().toISOString() } : note
    );
    setNotes(next);
    saveState("aimiko_notes", next);
  };

  const deleteNote = (id: string) => {
    const next = notes.filter((note) => note.id !== id);
    setNotes(next);
    saveState("aimiko_notes", next);
  };

  const addNotification = (message: string) => {
    const next = [message, ...notifications].slice(0, 20);
    setNotifications(next);
    saveState("aimiko_notifications", next);
  };

  const setBillingTier = (tier: "freemium" | "premium") => {
    setBillingTierState(tier);
    saveState("aimiko_billingTier", tier);
  };

  const dailyPromptsLimit = billingTier === "premium" ? 100 : 5;

  const incrementPromptUsage = (): boolean => {
    // Bypassed daily limits for testing
    const next = promptsUsedToday + 1;
    setPromptsUsedToday(next);
    saveState("aimiko_promptsUsedToday", next);
    return true;
  };

  const saveCustomPreset = (key: string, data: any) => {
    const next = { ...customPresets, [key]: data };
    setCustomPresets(next);
    saveState("aimiko_customPresets", next);
  };

  const resetAllData = () => {
    localStorage.clear();
    setAgeGroupState(null);
    setRoleState(null);
    setUserNameState("");
    setGoals([]);
    setInterests([]);
    setWeakAreas([]);
    setBadges([]);
    setStreakDays(0);
    setTasks([]);
    setNotes([]);
    setNotifications([]);
    setBillingTierState("freemium");
    setPromptsUsedToday(0);
    setCustomPresets({});
  };

  const [themeMode, setThemeModeState] = useState<"light" | "dark">(() => {
    const saved = loadState<"light" | "dark">("aimiko_themeMode", "light");
    return saved === "dark" ? "light" : (saved || "light");
  });

  const toggleThemeMode = () => {
    const next = themeMode === "light" ? "dark" : "light";
    setThemeModeState(next);
    saveState("aimiko_themeMode", next);
  };

  React.useEffect(() => {
    const root = window.document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [themeMode]);

  const themeClass = ageGroup ? ageToTheme[ageGroup] || "" : "";

  return (
    <AimikoContext.Provider
      value={{
        ageGroup,
        role,
        userName,
        goals,
        interests,
        weakAreas,
        badges,
        streakDays,
        tasks,
        notes,
        notifications,
        billingTier,
        promptsUsedToday,
        dailyPromptsLimit,
        setAgeGroup,
        setRole,
        setUserName,
        addGoal,
        removeGoal,
        addInterest,
        removeInterest,
        addWeakArea,
        removeWeakArea,
        addBadge,
        incrementStreak,
        resetStreak,
        addTask,
        toggleTask,
        deleteTask,
        addNote,
        updateNote,
        deleteNote,
        addNotification,
        setBillingTier,
        incrementPromptUsage,
        customPresets,
        saveCustomPreset,
        resetAllData,
        themeClass,
        themeMode,
        toggleThemeMode,
      }}
    >
      <div className={themeClass}>{children}</div>
    </AimikoContext.Provider>
  );
}

export function useAimiko() {
  const ctx = useContext(AimikoContext);
  if (!ctx) throw new Error("useAimiko must be used within AimikoProvider");
  return ctx;
}

