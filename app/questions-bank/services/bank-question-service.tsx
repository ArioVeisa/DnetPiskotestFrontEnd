// app/questions-bank/services/bank-question-service.ts

// ✅ Hanya deklarasi TestType global
export type TestType = "DISC" | "CAAS" | "Fast Accuracy";

// ✅ Question di level Bank: simpel aja
export type BankQuestion = {
  id: string;
  text: string;
};

// ✅ Bank menyimpan daftar pertanyaan, tanpa detail type/option
export type QuestionBank = {
  id: string;
  name: string;
  testType: TestType;
  questions: BankQuestion[];
  importSessions: number;
  createdAt: number;
  updatedAt?: number;
};

const STORAGE_KEY = "bank_questions_v1";

// ===== Helper =====
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

// ===== CRUD BANK =====
export function touchBank(id: string) {
  const banks = read();
  const idx = banks.findIndex((b) => b.id === id);
  if (idx === -1) return;
  banks[idx].updatedAt = Date.now();
  write(banks);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function seedBanksIfEmpty() {
  if (read().length) return;
  const now = Date.now();
  write([
    {
      id: generateUUID(),
      name: "DISC",
      testType: "DISC",
      questions: [],
      importSessions: 2,
      createdAt: now - 1000,
      updatedAt: now - 1000,
    },
    {
      id: generateUUID(),
      name: "CAAS",
      testType: "CAAS",
      questions: [],
      importSessions: 3,
      createdAt: now - 500,
      updatedAt: now - 500,
    },
    {
      id: generateUUID(),
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

export function addQuestion(bankId: string, question: BankQuestion) {
  const banks = read();
  const idx = banks.findIndex((b) => b.id === bankId);
  if (idx === -1) return;
  banks[idx].questions.push(question);
  banks[idx].updatedAt = Date.now();
  write(banks);
}

export function deleteBank(id: string) {
  write(read().filter((b) => b.id !== id));
}
