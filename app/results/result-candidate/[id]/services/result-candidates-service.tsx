// /result-candidates/[id]/services/result-candidates-service.tsx

export interface CandidateResult {
  id: string;
  name: string;
  position: string;
  caas: string;
  adaptability: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
  };
  graphs: {
    most: { label: string; value: number }[];
    least: { label: string; value: number }[];
    change: { label: string; value: number }[];
  };
  characteristics: {
    userPublic: string[];
    teammate: string[];
    intimate: string[];
  };
  personalityDescription: string;
}

// Dummy data
const dummyData: Record<string, CandidateResult> = {
  "1": {
    id: "1",
    name: "Muhammad Rivaldi Fatah",
    position: "UI/UX Designer",
    caas: "CAAS",
    adaptability: {
      score: 4.721,
      correctAnswers: 120,
      totalQuestions: 120
    },
    graphs: {
      most: [
        { label: "D", value: 2 },
        { label: "I", value: 4 },
        { label: "S", value: 6 },
        { label: "C", value: 8 }
      ],
      least: [
        { label: "A", value: 6 },
        { label: "B", value: 3 },
        { label: "C", value: 7 },
        { label: "D", value: 5 }
      ],
      change: [
        { label: "A", value: 2 },
        { label: "B", value: 3 },
        { label: "C", value: 5 },
        { label: "D", value: 6 }
      ]
    },
    characteristics: {
      userPublic: [
        "Loyal",
        "Tegas (Emotional)",
        "Curious",
        "Sensitif",
        "Good Communication Skill",
        "Good Analytical Think",
        "Good Interpersonal Skill",
        "Cepat Bersahabat",
        "Anti Kritik",
        "Not Leader",
        "Wory/Pay Conflict"
      ],
      teammate: [
        "Sulit Beradaptasi",
        "Anti Kritik",
        "Penubuhan",
        "Suka Bintuhan",
        "Detail",
        "Empath",
        "Memilukan Dampak ke Orang lain",
        "Menerima Orang lain dalam Bergaul",
        "Optimis ke Orag, dan Fakta",
        "Introvert",
        "Loyal"
      ],
      intimate: [
        "Detail & Teliti",
        "Butuh Aturan Jelas",
        "Sistematis & Prosedural",
        "Menghindari Konflik",
        "Anti Kritik",
        "Lambat Memutuskan",
        "Sulit Adaptasi",
        "Penubuhan",
        "Anti Perubahan"
      ]
    },
    personalityDescription: "Pengalaman terkait DISK dapat digunakan untuk memahami prioritas dalam kehidupan pribadi dan pekerjanya. Terutama dan memiliki penampilan yang baik, ia selalu dan fokus pada diri. Berbicare dengan penuh keyakinan, diplomasi dan jarang menunjang rekan kerjanya dengan sempurna. Ia ingin dan percaya pada orang lain dan pembaharuan. Meskipun sangsi Orang sedalam dalam hal yang kompleks, sehingga melompat lalu ke aspek yang kecil, bebasisya ia harus mendalaam. Menampilkan adanya prioritas, struktur dan prosedur yang telah dan tanpa perubahan mendadak."
  }
};

export const resultCandidatesService = {
  async getCandidateById(id: string): Promise<CandidateResult> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = dummyData[id];
    if (!result) {
      throw new Error("Candidate not found");
    }
    
    return result;
  }
};