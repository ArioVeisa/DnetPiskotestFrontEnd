import { api } from "@/public/services/api";
import axios, { AxiosError } from "axios";

export interface ImportCandidateResponse {
  message: string;
  imported_count?: number;
  errors?: string[];
}

/* ========== IMPORT FROM XLSX ========== */
export async function importCandidatesFromXlsx(
  file: File,
  testId: number,
  token: string
): Promise<ImportCandidateResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("test_id", testId.toString());

    console.log("[importCandidatesFromXlsx] Uploading file:", file.name);

    const res = await api.post<ImportCandidateResponse>(
      "/candidates/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("[importCandidatesFromXlsx] success:", res.data);
    return res.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error(
        "[importCandidatesFromXlsx] error:",
        err.response?.status,
        err.response?.data
      );
      throw new Error(
        err.response?.data?.message || "Gagal mengimpor file kandidat."
      );
    } else {
      console.error("[importCandidatesFromXlsx] unknown error:", err);
      throw err;
    }
  }
}

/* ========== DOWNLOAD TEMPLATE ========== */
export async function downloadCandidateTemplate(): Promise<void> {
  try {
    console.log("[downloadCandidateTemplate] Downloading template...");

    const res = await api.get("/candidates/template", {
      responseType: "blob",
    });

    // Create blob URL and trigger download
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-candidates.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log("[downloadCandidateTemplate] Template downloaded successfully");
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error(
        "[downloadCandidateTemplate] error:",
        err.response?.status,
        err.response?.data
      );
      throw new Error(
        err.response?.data?.message || "Gagal mendownload template kandidat."
      );
    } else {
      console.error("[downloadCandidateTemplate] unknown error:", err);
      throw err;
    }
  }
}

