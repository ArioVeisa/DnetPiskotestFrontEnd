export type TestType = "DISC" | "CAAS" | "Fast Accuracy";

export type Question = {
  id: string;
  text: string;
  tags?: string[];
  type?: "single" | "multiple" | "scale";
};

export type QuestionBank = {
  id: string;
  name: string;
  testType: "DISC" | "CAAS" | "Fast Accuracy";
  questions: Question[];
  importSessions: number;
  createdAt: number;
  updatedAt?: number; // 👈 tambahkan ini
};


const STORAGE_KEY = "bank_questions_v1";

function read(): QuestionBank[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}
function write(data: QuestionBank[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}


export function touchBank(id: string) {
  const banks = read();
  const idx = banks.findIndex((b) => b.id === id);
  if (idx === -1) return;
  banks[idx].updatedAt = Date.now();
  write(banks);
}

/** Seed BANK ONLY (tanpa questions) */
export function seedBanksIfEmpty() {
  if (read().length) return;
  const now = Date.now();
  write([
    {
      id: crypto.randomUUID(),
      name: "DISC",
      testType: "DISC",
      questions: [],
      importSessions: 2,
      createdAt: now - 1000,
      updatedAt: now - 1000, // 👈 awalnya sama dengan created
    },
    {
      id: crypto.randomUUID(),
      name: "CAAS",
      testType: "CAAS",
      questions: [],
      importSessions: 3,
      createdAt: now - 500,
      updatedAt: now - 500,
    },
    {
      id: crypto.randomUUID(),
      name: "Fast Accuracy",
      testType: "Fast Accuracy",
      questions: [],
      importSessions: 2,
      createdAt: now - 200,
      updatedAt: now - 200,
    },
  ]);
}


export function getBanks() {
  return read();
}
export function getBankById(id: string) {
  return read().find((b) => b.id === id);
}

export function addQuestion(bankId: string, question: Question) {
  const banks = read();
  const idx = banks.findIndex((b) => b.id === bankId);
  if (idx === -1) return;
  banks[idx].questions.push(question);
  banks[idx].updatedAt = Date.now(); // 👈 setiap ada pertanyaan baru, update timestamp
  write(banks);
}


export function deleteBank(id: string) {
  write(read().filter((b) => b.id !== id));
}
