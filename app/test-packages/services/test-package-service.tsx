// Service untuk test package menggunakan fetch langsung ke proxy lokal

export interface Test {
  id: string;             // pakai string biar konsisten
  name: string;
  category: string;       // dari target_position
  types: string[];        // dari sections[].section_type
  questions: number;      // total dari semua section.question_count
  duration: string;       // total dari semua section.duration_minutes (jadi string: "xx min")
}

/* ============================
   API Response Types
============================ */
interface SectionResponse {
  id: number;
  test_id: number;
  section_type: string;
  duration_minutes: number;
  question_count: number;
  sequence: number;
  created_at: string;
  updated_at: string;
}

interface TestResponse {
  id: number;
  name: string;
  target_position: string;
  icon_path: string | null;
  started_date: string;
  access_type: string;
  created_at: string;
  updated_at: string;
  sections: SectionResponse[];
}

interface ApiResponse<T> {
  data: T;
  status: string;
  message: string;
}

/* ============================
   Mapper Function
============================ */
function mapApiToTest(apiData: TestResponse): Test {
  const totalQuestions = apiData.sections.reduce(
    (sum, s) => sum + (s.question_count || 0),
    0
  );

  const totalDuration = apiData.sections.reduce(
    (sum, s) => sum + (s.duration_minutes || 0),
    0
  );

  return {
    id: apiData.id.toString(),
    name: apiData.name,
    category: apiData.target_position ?? "-",
    types: apiData.sections.map((s) => s.section_type),
    questions: totalQuestions,
    duration: `${totalDuration} min`,
  };
}

/* ============================
   Service Functions
============================ */
export const testPackageService = {
  // Fetch all test packages
  async fetchAll(): Promise<Test[]> {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/test-package", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData.message || "Gagal mengambil data test package";
      }
      
      const data: ApiResponse<TestResponse[]> = await res.json();
      return data.data.map((item) => mapApiToTest(item));
    } catch (error) {
      if (error instanceof Error) {
        throw error.message;
      }
      throw "Terjadi error tidak dikenal saat mengambil test package";
    }
  },

  // Fetch test package by ID
  async fetchById(id: string): Promise<Test> {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/test-package/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData.message || "Gagal mengambil detail test package";
      }
      
      const data: ApiResponse<TestResponse> = await res.json();
      return mapApiToTest(data.data);
    } catch (error) {
      if (error instanceof Error) {
        throw error.message;
      }
      throw "Terjadi error tidak dikenal saat mengambil detail test package";
    }
  },

  // Delete test package by ID
  async deleteById(id: string): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/test-package/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw errorData.message || "Gagal menghapus test package";
      }
      
      const data: ApiResponse<null> = await res.json();
      if (data.status === "success") {
        console.log("Test package successfully deleted");
      } else {
        throw data.message || "Gagal menghapus test package";
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error.message;
      }
      throw "Terjadi error tidak dikenal saat menghapus test package";
    }
  },
};
