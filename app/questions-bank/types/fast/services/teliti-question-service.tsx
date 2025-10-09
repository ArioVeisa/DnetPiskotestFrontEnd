// /app/questions-bank/services/caas-question-service.ts
import { api } from "@services/api";
import { AxiosError } from "axios";

export type QuestionType = "DISC" | "CAAS" | "Fast Accuracy";

export type MediaType = "image" | "audio" | "video";

export type QuestionOption = {
  id: string;
  text: string;
  score: number;
  is_correct?: boolean;
};

export type Question = {
  id: string;
  type?: QuestionType;
  text: string; // "Pertanyaan A | Pertanyaan B"
  category?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  options: QuestionOption[];
  correct_option_id?: string | null; // 🔹 ditambahin
  answer?: string;
  tags?: string[];
  createdAt?: string;
};

export type QuestionBank = {
  id: string;
  name: string;
  icon?: string;
  testType: QuestionType;
  questions: Question[];
  importSessions: number;
  createdAt: number;
};

/* ===== tipe response dari backend ===== */
type ApiOption = {
  id: number;
  question_id: number;
  option_text: string;
  score: number;
  is_correct?: boolean; // backend kadang null/ga ada
  created_at: string;
  updated_at: string;
};

type ApiQuestion = {
  id: number;
  question_text: string;
  media_path: string | null;
  is_active: number;
  correct_option_id: number | null;
  category_id: number;
  created_at: string;
  updated_at: string;
  options: ApiOption[];
};

type ApiResponse<T> = { data: T };

/* ===== Helper normalisasi ===== */
function normalizeQuestion(q: ApiQuestion): Question {
  let correctId: string | null = null;

  // 🔹 Jika backend sudah menyediakan correct_option_id, gunakan itu
  if (q.correct_option_id) {
    correctId = q.correct_option_id.toString();
  }
  // 🔹 Jika belum ada correct_option_id, tentukan berdasarkan logika Fast Accuracy
  else if (q.question_text.includes("|")) {
    const [left, right] = q.question_text.split("|").map((s) => s.trim());
    const isSame = left === right;

    const correctOpt = q.options.find((opt) => {
      const txt = opt.option_text.toLowerCase().trim();
      return (isSame && txt === "true") || (!isSame && txt === "false");
    });

    if (correctOpt) {
      correctId = correctOpt.id.toString();
    }
  }

  return {
    id: q.id.toString(),
    text: q.question_text,
    options: q.options.map((o) => ({
      id: o.id.toString(),
      text: o.option_text,
      score: o.score,
      is_correct: o.id.toString() === correctId, // tandai benar
    })),
    correct_option_id: correctId,
    category: q.category_id.toString(),
    mediaUrl: q.media_path ?? undefined,
    createdAt: q.created_at,
  };
}

/* ========== READ ALL ========== */
export async function fetchQuestions(): Promise<Question[]> {
  const res = await api.get<ApiResponse<ApiQuestion[]>>("/teliti-questions");
  return res.data.data.map(normalizeQuestion);
}

/* ========== GET BY ID ========== */
export async function fetchQuestionById(id: string): Promise<Question> {
  const res = await api.get<ApiResponse<ApiQuestion>>(`/teliti-questions/${id}`);
  return normalizeQuestion(res.data.data);
}

/* ========== CREATE ========== */
export async function createQuestion(
  data: Omit<Question, "id">
): Promise<Question> {
  try {
    console.log("[createQuestion] payload (FE):", data);

    const payload = {
      question_text: data.text,
      media_path: data.mediaUrl ?? null,
      category_id: Number(data.category) || 1,
      options: data.options.map((o) => ({
        option_text: o.text,
        score: o.score,
        is_correct: o.is_correct ?? false,
      })),
    };

    console.log("[createQuestion] payload (API):", payload);

    const res = await api.post<ApiResponse<ApiQuestion>>(
      "/teliti-questions",
      payload
    );

    return normalizeQuestion(res.data.data);
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error(
        "[createQuestion] error response:",
        err.response?.status,
        err.response?.data
      );
    } else {
      console.error("[createQuestion] unknown error:", err);
    }
    throw err;
  }
}

/* ========== UPDATE ========== */
type ApiUpdatePayload = {
  question_text?: string;
  media_path?: string | null;
  category_id?: number | null;
  options?: { option_text: string; score: number; is_correct: boolean }[];
};

export async function updateQuestion(
  id: string,
  data: Partial<Question>
): Promise<Question> {
  try {
    console.log("[updateQuestion] called id:", id, "payload (FE):", data);

    const payload: ApiUpdatePayload = {};

    if (data.text !== undefined) payload.question_text = data.text;
    if ("mediaUrl" in data) payload.media_path = data.mediaUrl ?? null;
    if ("category" in data) {
      const cid = data.category === undefined ? 1 : Number(data.category) || 1;
      payload.category_id = cid;
    }
    if (data.options !== undefined) {
      payload.options = data.options.map((o) => ({
        option_text: o.text,
        score: o.score,
        is_correct: o.is_correct ?? false,
      }));
    }

    console.log("[updateQuestion] payload (API):", payload);

    const res = await api.put<ApiResponse<ApiQuestion>>(
      `/teliti-questions/${id}`,
      payload
    );

    return normalizeQuestion(res.data.data);
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error(
        "[updateQuestion] error response:",
        err.response?.status,
        err.response?.data
      );
    } else {
      console.error("[updateQuestion] unknown error:", err);
    }
    throw err;
  }
}

/* ========== DELETE ========== */
export async function deleteQuestion(id: string): Promise<void> {
  await api.delete(`/teliti-questions/${id}`);
}
