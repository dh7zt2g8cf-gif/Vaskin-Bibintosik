import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Note = {
  id: string;
  content: string;
  createdAt: number;
};

export type Reminder = {
  id: string;
  title: string;
  remindAt: string;
  done: boolean;
  due?: string;
  time?: string;
  createdAt: number;
};

export type Task = {
  id: string;
  title: string;
  done: boolean;
  due?: string;
  time?: string;
  createdAt: number;
};

export type Member = {
  id: string;
  name: string;
  relation: string;
  notes: string;
  birthday?: string;
  createdAt: number;
};

export type Goal = {
  id: string;
  title: string;
  price: number;
  saved: number;
  by: string;
  createdAt: number;
};

const WELCOME =
  "Привет. Я Бибинтосик. Я рядом. Расскажи, как ты себя чувствуешь?";

function uid() {
  return crypto.randomUUID();
}

function welcome(): ChatMsg {
  return { id: "welcome", role: "assistant", content: WELCOME };
}

type State = {
  messages: ChatMsg[];
  notes: Note[];
  reminders: Reminder[];
  tasks: Task[];
  family: Member[];
  goals: Goal[];
  portrait: string | null;
  fired: string[];
  setPortrait: (portrait: string | null) => void;
  markFired: (key: string) => void;
  addMessage: (role: ChatMsg["role"], content: string) => void;
  resetChat: () => void;
  addNote: (content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  addReminder: (title: string, remindAt: string, due?: string, time?: string) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  addTask: (title: string, due?: string, time?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addMember: (input: { name: string; relation: string; notes: string; birthday?: string }) => void;
  updateMember: (
    id: string,
    patch: Partial<Pick<Member, "name" | "relation" | "notes" | "birthday">>,
  ) => void;
  deleteMember: (id: string) => void;
  addGoal: (input: { title: string; price: number; saved: number; by: string }) => void;
  addSaved: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
};

export const useBib = create<State>()(
  persist(
    (set) => ({
      messages: [welcome()],
      notes: [],
      reminders: [],
      tasks: [],
      family: [],
      goals: [],
      portrait: null,
      fired: [],
      setPortrait: (portrait) => set({ portrait }),
      markFired: (key) =>
        set((s) => ({ fired: s.fired.includes(key) ? s.fired : [...s.fired, key].slice(-80) })),
      addMessage: (role, content) =>
        set((s) => ({
          messages: [...s.messages, { id: uid(), role, content }].slice(-80),
        })),
      resetChat: () => set({ messages: [{ ...welcome(), id: uid() }] }),
      addNote: (content) =>
        set((s) => ({
          notes: [{ id: uid(), content, createdAt: Date.now() }, ...s.notes],
        })),
      updateNote: (id, content) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, content } : n)),
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      addReminder: (title, remindAt, due = "", time = "") =>
        set((s) => ({
          reminders: [
            { id: uid(), title, remindAt, due, time, done: false, createdAt: Date.now() },
            ...s.reminders,
          ],
        })),
      toggleReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
        })),
      deleteReminder: (id) =>
        set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      addTask: (title, due = "", time = "") =>
        set((s) => ({
          tasks: [{ id: uid(), title, done: false, due, time, createdAt: Date.now() }, ...s.tasks],
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      addMember: ({ name, relation, notes, birthday = "" }) =>
        set((s) => ({
          family: [
            { id: uid(), name, relation, notes, birthday, createdAt: Date.now() },
            ...s.family,
          ],
        })),
      updateMember: (id, patch) =>
        set((s) => ({
          family: s.family.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      deleteMember: (id) => set((s) => ({ family: s.family.filter((m) => m.id !== id) })),
      addGoal: ({ title, price, saved, by }) =>
        set((s) => ({
          goals: [{ id: uid(), title, price, saved, by, createdAt: Date.now() }, ...s.goals],
        })),
      addSaved: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g,
          ),
        })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
    }),
    { name: "bibintosik-v1", skipHydration: true },
  ),
);
