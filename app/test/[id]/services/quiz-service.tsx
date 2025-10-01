// src/app/users/[id]/services/quizService.ts

// Bentuk data untuk setiap pertanyaan
export interface Question {
  text: string;
  options: string[];
}

// Dummy question bank
const dummyQuestions: Record<string, Question[]> = {
  disc: Array.from({ length: 20 }, (_, i) => ({
    text: `${i + 1} Aku ingin terbang bebas di Angkasa `,
    options: ["A", "B", "C", "D"],
  })),
  caas: Array.from({ length: 15 }, (_, i) => ({
    text: `CAAS Question ${i + 1}`,
    options: ["A", "B", "C", "D"],
  })),
  fast: Array.from({ length: 10 }, (_, i) => ({
    text: `Fast Question ${i + 1}`,
    options: ["A", "B", "C", "D"],
  })),
};

// Implementasi service
const quizService = {
  /**
   * Mengembalikan array pertanyaan untuk sebuah testId.
   * @param testId ID dari test (misal 'disc', 'caas', 'fast')
   * @returns Promise yang resolve dengan daftar Question
   */
  getQuestions: async (testId: string): Promise<Question[]> => {
    return dummyQuestions[testId] ?? [];
  },
};

export default quizService;
