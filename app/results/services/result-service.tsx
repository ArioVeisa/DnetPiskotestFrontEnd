// services/resultsService.ts

export interface Result {
  candidateId: string;
  avatarUrl: string;
  name: string;
  email: string;
  position: string;
  types: string[];
  period: string;
  status: "Completed" | "Ongoing";
}

export interface DiscDimension {
  dimension: string;
  score: number;
}

export interface BestFitRole {
  name: string;
  percentage: number;
}

export interface ResultDetail {
  candidateId: string;
  candidateName: string;
  avatarUrl?: string;
  position: string;
  personality: string;
  fastAccuracy: number;
  caas: number;
  totalQuestion: number;
  discProfile: DiscDimension[];
  strengths: string[];
  developmentAreas: string[];
  bestFitRoles: BestFitRole[];
  scores: Array<{ testName: string; date: string; score: number }>;
}

// Data dummy untuk daftar
const DUMMY_RESULTS: Result[] = [
  {
    candidateId: "1",
    avatarUrl: "/avatars/rivaldi.jpg",
    name: "Muhammad Rivaldi Fatah",
    email: "rivaldir7@gmail.com",
    position: "UI/UX Designer",
    types: ["DISC", "CAAS"],
    period: "25 Jun 2025",
    status: "Completed",
  },
  {
    candidateId: "2",
    avatarUrl: "/avatars/dicky.jpg",
    name: "Dicky Zanuar Saputra",
    email: "dzsaputra@gmail.com",
    position: "Quality Assurance",
    types: ["DISC", "CAAS", "Fast Accuracy"],
    period: "25 Jun 2025",
    status: "Completed",
  },
  {
    candidateId: "3",
    avatarUrl: "/avatars/bryan.jpg",
    name: "Bryan Pratama",
    email: "bryanpra08@gmail.com",
    position: "Engineer",
    types: ["CAAS"],
    period: "25 Jun 2025",
    status: "Completed",
  },
  {
    candidateId: "4",
    avatarUrl: "/avatars/fahmi.jpg",
    name: "Fahmi Tio Maulana",
    email: "maulanaft@gmail.com",
    position: "Frontend Dev",
    types: ["Fast Accuracy"],
    period: "25 Jun 2025",
    status: "Completed",
  },
];

// Data dummy untuk detail per kandidat
const DUMMY_DETAILS: Record<string, ResultDetail> = {
  "1": {
    candidateId: "1",
    candidateName: "Muhammad Rivaldi Fatah",
    avatarUrl: "/avatars/rivaldi.jpg",
    position: "UI/UX Designer",
    personality: "Dominance",
    fastAccuracy: 4.721,
    caas: 86.9,
    totalQuestion: 120,
    discProfile: [
      { dimension: "Dominance", score: 80 },
      { dimension: "Influence", score: 60 },
      { dimension: "Steadiness", score: 40 },
      { dimension: "Conscientiousness", score: 35 },
    ],
    strengths: [
      "Creative Problem Solving",
      "High Adaptability",
      "Strong Communication",
      "Team Leadership",
      "Analytical Thinking",
    ],
    developmentAreas: [
      "Attention to Detail",
      "Time Management",
      "Delegation Skills",
      "Networking Skills",
    ],
    bestFitRoles: [
      { name: "Product Designer", percentage: 88 },
      { name: "UI Designer", percentage: 82 },
      { name: "UX Design", percentage: 80 },
      { name: "System Analyst", percentage: 75 },
    ],
    scores: [
      { testName: "Leadership Assessment", date: "30 Jun 2025", score: 85 },
      { testName: "Focus & Accuracy Test", date: "25 Jun 2025", score: 92 },
    ],
  },
  "2": {
    candidateId: "2",
    candidateName: "Dicky Zanuar Saputra",
    avatarUrl: "/avatars/dicky.jpg",
    position: "Quality Assurance",
    personality: "Steadiness",
    fastAccuracy: 4.215,
    caas: 78.4,
    totalQuestion: 110,
    discProfile: [
      { dimension: "Dominance", score: 55 },
      { dimension: "Influence", score: 65 },
      { dimension: "Steadiness", score: 70 },
      { dimension: "Conscientiousness", score: 60 },
    ],
    strengths: ["Detail Oriented", "Team Player", "Good Communication"],
    developmentAreas: ["Creativity Boost", "Leadership Exposure"],
    bestFitRoles: [
      { name: "QA Engineer", percentage: 85 },
      { name: "Automation Tester", percentage: 78 },
    ],
    scores: [{ testName: "Quality Analysis", date: "25 Jun 2025", score: 88 }],
  },
  "3": {
    candidateId: "3",
    candidateName: "Bryan Pratama",
    avatarUrl: "/avatars/bryan.jpg",
    position: "Engineer",
    personality: "Conscientiousness",
    fastAccuracy: 3.876,
    caas: 74.2,
    totalQuestion: 95,
    discProfile: [
      { dimension: "Dominance", score: 45 },
      { dimension: "Influence", score: 40 },
      { dimension: "Steadiness", score: 55 },
      { dimension: "Conscientiousness", score: 75 },
    ],
    strengths: ["Logical Thinking", "Problem Solving"],
    developmentAreas: ["Team Communication", "Adaptability"],
    bestFitRoles: [
      { name: "Backend Engineer", percentage: 80 },
      { name: "System Analyst", percentage: 72 },
    ],
    scores: [
      {
        testName: "Entry-Level Psychotest",
        date: "21 Jun 2025",
        score: 79,
      },
    ],
  },
  "4": {
    candidateId: "4",
    candidateName: "Fahmi Tio Maulana",
    avatarUrl: "/avatars/fahmi.jpg",
    position: "Frontend Dev",
    personality: "Influence",
    fastAccuracy: 4.112,
    caas: 82.5,
    totalQuestion: 105,
    discProfile: [
      { dimension: "Dominance", score: 50 },
      { dimension: "Influence", score: 75 },
      { dimension: "Steadiness", score: 45 },
      { dimension: "Conscientiousness", score: 55 },
    ],
    strengths: ["UI Design", "Collaboration"],
    developmentAreas: ["Deep Technical Knowledge", "Stress Management"],
    bestFitRoles: [
      { name: "Frontend Developer", percentage: 84 },
      { name: "UI Engineer", percentage: 76 },
    ],
    scores: [
      {
        testName: "Emotional Intelligence",
        date: "11 Jun 2025",
        score: 73,
      },
    ],
  },
};

// Simulasi panggilan API
export async function getResults(): Promise<Result[]> {
  await new Promise((r) => setTimeout(r, 300));
  return DUMMY_RESULTS;
}

export async function getResultDetail(
  candidateId: string
): Promise<ResultDetail> {
  await new Promise((r) => setTimeout(r, 300));
  return (
    DUMMY_DETAILS[candidateId] || {
      candidateId,
      candidateName: "Unknown",
      position: "-",
      personality: "-",
      fastAccuracy: 0,
      caas: 0,
      totalQuestion: 0,
      discProfile: [],
      strengths: [],
      developmentAreas: [],
      bestFitRoles: [],
      scores: [],
    }
  );
}

// Dummy export functions
export function exportAllResults(): void {
  console.log("Export all results (dummy)");
}

export function exportResultPdf(candidateId: string): void {
  console.log(`Export PDF for candidate ${candidateId} (dummy)`);
}
