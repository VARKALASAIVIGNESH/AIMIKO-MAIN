import { useState, useEffect } from "react";
import { CalendarDays, CheckCircle2, ListChecks, Sparkles, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAimiko } from "@/context/AimikoContext";
import { api } from "@/lib/api";

export default function Planner() {
  const { goals, tasks: localTasks, streakDays, badges, addGoal, addTask, toggleTask, deleteTask, incrementStreak, addBadge } = useAimiko();
  const [goalText, setGoalText] = useState("");
  const [taskText, setTaskText] = useState("");
  const [liveTasks, setLiveTasks] = useState<Array<{ id: number | string; title: string; is_completed: boolean; priority?: string }>>([]);

  useEffect(() => {
    const token = localStorage.getItem("aimiko_token");
    if (token) {
      api.buddy.getTasks().then((data) => {
        if (data && Array.isArray(data)) {
          setLiveTasks(data);
        }
      }).catch(() => {
        setLiveTasks(localTasks.map((t) => ({ id: t.id, title: t.title, is_completed: t.completed })));
      });
    } else {
      setLiveTasks(localTasks.map((t) => ({ id: t.id, title: t.title, is_completed: t.completed })));
    }
  }, [localTasks]);

  const handleAddGoal = () => {
    if (!goalText.trim()) return;
    addGoal(goalText.trim());
    setGoalText("");
  };

  const handleAddTask = async () => {
    if (!taskText.trim()) return;
    const text = taskText.trim();
    const token = localStorage.getItem("aimiko_token");

    if (token) {
      try {
        const created = await api.buddy.createTask({ title: text, priority: "medium" });
        setLiveTasks((prev) => [created, ...prev]);
      } catch {
        addTask(text);
      }
    } else {
      addTask(text);
    }
    setTaskText("");
  };

  const handleToggleTask = async (task: { id: number | string; is_completed: boolean }) => {
    const token = localStorage.getItem("aimiko_token");
    const nextStatus = !task.is_completed;

    if (token && typeof task.id === "number") {
      try {
        const updated = await api.buddy.updateTask(task.id, { is_completed: nextStatus });
        setLiveTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      } catch {
        toggleTask(String(task.id));
      }
    } else {
      toggleTask(String(task.id));
      setLiveTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_completed: nextStatus } : t)));
    }
  };

  const handleDeleteTask = async (taskId: number | string) => {
    const token = localStorage.getItem("aimiko_token");
    if (token && typeof taskId === "number") {
      try {
        await api.buddy.deleteTask(taskId);
        setLiveTasks((prev) => prev.filter((t) => t.id !== taskId));
      } catch {
        deleteTask(String(taskId));
      }
    } else {
      deleteTask(String(taskId));
      setLiveTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const completedCount = liveTasks.filter((t) => t.is_completed).length;

  return (
    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-6 animate-pop-in">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">Set goals, manage tasks, and track your progress.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Day Streak", value: streakDays, icon: Sparkles, color: "text-primary" },
            { label: "Active Goals", value: goals.length, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Tasks Done", value: `${completedCount}/${tasks.length}`, icon: ListChecks, color: "text-violet-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm text-center">
              <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Goals */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-foreground">Goals</h2>
            <div className="flex gap-2">
              <input
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGoal()}
                placeholder="Add a new goal..."
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
              />
              <Button onClick={handleAddGoal} size="sm" className="rounded-xl px-4 press">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2">
              {goals.length ? (
                goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/40 border border-border/50 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {goal}
                  </li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-6">No goals yet. Add your first one above!</p>
              )}
            </ul>
            <Button
              onClick={incrementStreak}
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs press"
            >
              Mark Today as Active
            </Button>
          </div>

          {/* Tasks */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-foreground">Today's Tasks</h2>
            <div className="flex gap-2">
              <input
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Add a task..."
                className="flex-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
              />
              <Button onClick={handleAddTask} size="sm" className="rounded-xl px-4 press">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {liveTasks.length ? (
                liveTasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/50 group">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => handleToggleTask(task)}
                      className="accent-primary h-4 w-4 cursor-pointer rounded"
                    />
                    <span className={`flex-1 text-sm ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {task.title}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all text-xs"
                    >
                      ×
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-6">No tasks yet. Stay organized!</p>
              )}
            </ul>
          </div>

          {/* Badges */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Badges</h2>
              <Button onClick={() => addBadge("AIMIKO Explorer")} variant="outline" size="sm" className="rounded-xl text-xs press">
                <Trophy className="mr-1.5 h-3.5 w-3.5" />
                Claim Explorer Badge
              </Button>
            </div>
            {badges.length ? (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold">
                    <Sparkles className="h-3 w-3" />
                    {badge}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No badges yet. Keep using AIMIKO to earn rewards!</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
