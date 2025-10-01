// /app/questions-bank/services/caas-question-service.ts
import { api } from "@services/api";
import { AxiosError } from "axios";

export type QuestionType = "DISC" | "CAAS" | "Fast Accuracy";

export type MediaType = "image" | "audio" | "video";

export type QuestionOption = {
  id: string;
  text: string;
  score: number;
};

export type Question = {
  id: string;
  type?: QuestionType;
  text: string;
  category?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  options: QuestionOption[];
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
  created_at: string;
  updated_at: string;
};

type ApiQuestion = {
  id: number;
  question_text: string;
  media_path: string | null;
  is_active: number;
  category_id: number;
  created_at: string;
  updated_at: string;
  options: ApiOption[];
};

type ApiResponse<T> = { data: T };

/* ========== READ ALL ========== */
export async function fetchQuestions(): Promise<Question[]> {
  const res = await api.get<ApiResponse<ApiQuestion[]>>("/caas-questions");

  return res.data.data.map((q) => ({
    id: q.id.toString(),
    text: q.question_text,
    options: q.options.map((o) => ({
      id: o.id.toString(),
      text: o.option_text,
      score: o.score,
    })),
    category: q.category_id.toString(),
    mediaUrl: q.media_path ?? undefined,
    createdAt: q.created_at,
  }));
}

/* ========== GET BY ID ========== */
export async function fetchQuestionById(id: string): Promise<Question> {
  const res = await api.get<ApiResponse<ApiQuestion>>(`/caas-questions/${id}`);
  const q = res.data.data;

  return {
    id: q.id.toString(),
    text: q.question_text,
    options: q.options.map((o) => ({
      id: o.id.toString(),
      text: o.option_text,
      score: o.score,
    })),
    category: q.category_id.toString(),
    mediaUrl: q.media_path ?? undefined,
    createdAt: q.created_at,
  };
}

/* ========== CREATE ========== */
export async function createQuestion(data: Omit<Question, "id">): Promise<Question> {
  try {
    console.log("[createQuestion] payload (FE):", data);

    const payload = {
      question_text: data.text,
      media_path: data.mediaUrl ?? null,
      category_id: 1,
      options: data.options.map((o) => ({
        option_text: o.text,
        score: o.score,
      })),
    };

    console.log("[createQuestion] payload (API):", payload);

    const res = await api.post<ApiResponse<ApiQuestion>>("/caas-questions", payload);
    const q = res.data.data;

    return {
      id: q.id.toString(),
      text: q.question_text,
      options: q.options.map((o) => ({
        id: o.id.toString(),
        text: o.option_text,
        score: o.score,
      })),
      category: q.category_id.toString(),
      mediaUrl: q.media_path ?? undefined,
      createdAt: q.created_at,
    };
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
  options?: { option_text: string; score: number }[];
};

export async function updateQuestion(
  id: string,
  data: Partial<Question>
): Promise<Question> {
  try {
    console.log("[updateQuestion] called id:", id, "payload (FE):", data);

    const payload: ApiUpdatePayload = {};

    if (data.text !== undefined) payload.question_text = data.text;
    // media: explicitly send null when undefined was requested to clear
    if ("mediaUrl" in data) payload.media_path = data.mediaUrl ?? null;
    // category: backend expects a number & seems required -> default to 1 if not provided
    if ("category" in data) {
      const cid = data.category === undefined ? 1 : Number(data.category) || 1;
      payload.category_id = cid;
    }
    if (data.options !== undefined) {
      payload.options = data.options.map((o) => ({
        option_text: o.text,
        score: o.score,
      }));
    }

    console.log("[updateQuestion] payload (API):", payload);

    const res = await api.put<ApiResponse<ApiQuestion>>(
      `/caas-questions/${id}`,
      payload
    );

    if (!res || !res.data || !res.data.data) {
      throw new Error("Invalid API response for updateQuestion");
    }

    const q = res.data.data;

    return {
      id: q.id.toString(),
      text: q.question_text,
      options: q.options.map((o) => ({
        id: o.id.toString(),
        text: o.option_text,
        score: o.score,
      })),
      category: q.category_id.toString(),
      mediaUrl: q.media_path ?? undefined,
      createdAt: q.created_at,
    };
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error(
        "[createQuestion/updateQuestion] error response:",
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
  await api.delete(`/caas-questions/${id}`);
}
