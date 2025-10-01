// services/test-distribution-service.ts

export type DistributionStatus =
  | "Draft"
  | "Scheduled"
  | "Ongoing"
  | "Completed"
  | "Expired";

export interface Distribution {
  id: number;
  testName: string;
  category: string; // contoh: "Managerial", "Fresh Graduates", "All Candidates"
  startDate: string | null;
  endDate: string | null;
  candidatesTotal: number;
  status: DistributionStatus;
}

const STORAGE_KEY = "test_distributions";

/* ============================
   UTIL PERSISTENCE
   ============================ */
function loadDistributions(): Distribution[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Distribution[]) : [];
  } catch {
    return [];
  }
}

function persistDistributions(items: Distribution[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ============================
   FETCH
   ============================ */
export async function fetchDistributions(): Promise<Distribution[]> {
  const saved = loadDistributions();
  if (saved.length > 0) return saved;

  // Dummy awal
  const now = Date.now();
  const dummy: Distribution[] = [
    {
      id: now,
      testName: "Leadership Assessment",
      category: "Managerial",
      startDate: "2025-06-30",
      endDate: "2025-07-05",
      candidatesTotal: 78,
      status: "Completed",
    },
    {
      id: now + 1,
      testName: "Focus & Accuracy Test",
      category: "All Candidates",
      startDate: "2025-06-25",
      endDate: "2025-06-30",
      candidatesTotal: 120,
      status: "Ongoing",
    },
    {
      id: now + 2,
      testName: "Entry-Level Psychotest",
      category: "Fresh Graduates",
      startDate: null,
      endDate: null,
      candidatesTotal: 32,
      status: "Draft",
    },
    {
      id: now + 3,
      testName: "Emotional Intelligence",
      category: "HR Staff",
      startDate: "2025-06-11",
      endDate: "2025-06-20",
      candidatesTotal: 82,
      status: "Expired",
    },
  ];

  persistDistributions(dummy);
  return dummy;
}

/* ============================
   CREATE
   ============================ */
export async function addDistribution(
  item: Omit<Distribution, "id">
): Promise<Distribution> {
  const saved = loadDistributions();
  const newItem: Distribution = {
    ...item,
    id: Date.now(),
  };
  saved.push(newItem);
  persistDistributions(saved);
  return newItem;
}

/* ============================
   UPDATE
   ============================ */
export async function updateDistribution(
  id: number,
  data: Partial<Distribution>
): Promise<Distribution | null> {
  const saved = loadDistributions();
  const idx = saved.findIndex((t) => t.id === id);
  if (idx >= 0) {
    saved[idx] = { ...saved[idx], ...data };
    persistDistributions(saved);
    return saved[idx];
  }
  return null;
}

/* ============================
   DELETE
   ============================ */
export async function deleteDistribution(id: number): Promise<void> {
  const saved = loadDistributions();
  const filtered = saved.filter((t) => t.id !== id);
  persistDistributions(filtered);
}
