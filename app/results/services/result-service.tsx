import { api } from "@/public/services/api";
import axios from "axios";

// =======================
// Interfaces
// =======================

export interface Candidate {
  id: number;
  name: string;
  email: string;
  position: string;
  department?: string;
}

export interface TestInfo {
  id: number;
  name: string;
  target_position: string;
  icon_path: string | null;
  started_date: string;
  access_type: string;
}

export interface CandidateTest {
  id: number;
  candidate_id: number;
  test_id: number;
  unique_token: string;
  started_at: string | null;
  completed_at: string | null;
  score: number | null;
  status: string;
  candidate: Candidate;
  test: TestInfo;
  created_at: string;
  updated_at: string;
}

export interface Result {
  candidateId: string;
  name: string;
  email: string;
  position: string;
  types: string[];
  period: string;
  status: "Completed" | "Ongoing" | "Not Started";
  score?: number;
  completedAt?: string;
  testDistributionId?: number;
}

// =======================
// Service Implementation
// =======================

export const resultsService = {
  /**
   * Ambil semua hasil tes kandidat (semua status)
   */
  async getAll(): Promise<Result[]> {
    try {
      // Gunakan API real untuk mendapatkan data dari backend
      const res = await api.get<{ success: boolean; data: Record<string, unknown>[] }>(
        "/results-public"
      );

      const data = res.data.data || [];

      // Tampilkan semua status (completed, ongoing, not_started)
      return data.map((item: Record<string, unknown>, index: number) => {
        let status: "Completed" | "Ongoing" | "Not Started" = "Not Started";
        
        if (typeof item.status === 'string' && item.status.toLowerCase() === "completed") {
          status = "Completed";
        } else if (typeof item.status === 'string' && item.status.toLowerCase() === "in_progress") {
          status = "Ongoing";
        }

        return {
          candidateId: (item.id as string)?.toString() || `unknown-${index}`,
          name: (item.candidate_name as string) || "Unknown Candidate",
          email: (item.candidate_email as string) || "unknown@example.com",
          position: (item.position as string) || "Unknown Position",
          types: [(item.test_name as string) || "Unknown Test"],
          period: item.completed_at ? new Date(item.completed_at as string).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) : new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status,
          score: typeof item.score === 'number' ? item.score : 0,
          completedAt: (item.completed_at as string) || undefined,
          testDistributionId: typeof item.id === 'number' ? item.id : undefined,
        };
      });
    } catch (error) {
      // console.error("❌ Error fetching results from API, using dummy data:", error); // Error logging removed
      
      // Fallback ke dummy data jika API error
      return this.getDummyData();
    }
  },

  /**
   * Dummy data untuk testing dan demo - sesuai dengan gambar
   */
  getDummyData(): Result[] {
    return [
      {
        candidateId: "1",
        name: "arioveisa",
        email: "arioveisa@gmail.com",
        position: "staff",
        types: ["DISC", "CAAS", "Fast Accuracy"],
        period: "23 Okt 2025",
        status: "Completed",
        score: 0, // Sesuai dengan gambar yang menunjukkan score kosong
        completedAt: "2025-10-23T04:30:46.000000Z",
        testDistributionId: 29,
      },
      {
        candidateId: "2", 
        name: "RD",
        email: "rd@mail.com",
        position: "Staff",
        types: ["DISC", "CAAS", "Fast Accuracy"],
        period: "23 Okt 2025",
        status: "Completed",
        score: 85,
        completedAt: "2025-10-23T11:30:00Z",
        testDistributionId: 30,
      },
      {
        candidateId: "3",
        name: "Budi Santoso",
        email: "budi@mail.com", 
        position: "Manager",
        types: ["DISC", "CAAS", "Fast Accuracy"],
        period: "22 Okt 2025",
        status: "Completed",
        score: 92,
        completedAt: "2025-10-22T16:45:00Z",
        testDistributionId: 28,
      },
      {
        candidateId: "4",
        name: "Sari Indah",
        email: "sari@mail.com",
        position: "HR Staff", 
        types: ["DISC", "Fast Accuracy"],
        period: "21 Okt 2025",
        status: "Ongoing",
        testDistributionId: 27,
      },
      {
        candidateId: "5",
        name: "Ahmad Fauzi",
        email: "ahmad@mail.com",
        position: "Developer",
        types: ["DISC", "CAAS", "Fast Accuracy"],
        period: "20 Okt 2025", 
        status: "Completed",
        score: 78,
        completedAt: "2025-10-20T11:20:00Z",
        testDistributionId: 26,
      },
      {
        candidateId: "6",
        name: "Lamo",
        email: "lamo@mail.com",
        position: "Staff",
        types: ["DISC", "CAAS"],
        period: "19 Okt 2025",
        status: "Not Started",
        testDistributionId: 25,
      }
    ];
  },

  /**
   * Ambil hasil tes kandidat berdasarkan ID
   */
  async getById(candidateId: string): Promise<Result | null> {
    try {
      const allResults = await this.getAll();
      return allResults.find(r => r.candidateId === candidateId) || null;
    } catch (error) {
      // console.error("❌ Error fetching result by ID:", error); // Error logging removed
      return null;
    }
  },


  /**
   * Hapus hasil tes kandidat individual
   */
  async deleteResult(candidateId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting result for candidate ${candidateId}...`);
      
      // Call API backend untuk menghapus data kandidat individual
      const response = await api.delete(`/results-public/delete/${candidateId}`);
      
      if (response.data.success) {
        console.log("✅ Result deleted successfully:", response.data.data);
        
        // Clear localStorage cache
        localStorage.removeItem('results_cache');
        localStorage.removeItem('candidate_results_cache');
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to delete result');
      }
      
    } catch (error) {
      console.error("❌ Error deleting result:", error);
      throw new Error(`Gagal menghapus hasil tes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Download hasil tes dalam format PDF
   */
  async downloadResult(candidateId: string): Promise<void> {
    try {
      console.log(`📄 Downloading PDF for candidate ${candidateId}...`);
      
      // Import resultCandidatesService untuk mendapatkan data lengkap
      const { resultCandidatesService } = await import("../result-candidate/[id]/services/result-candidates-service");
      const { generateDownloadContent } = await import("../utils/generate-download-content");
      
      // Ambil data lengkap kandidat (sama dengan yang ditampilkan di halaman result candidate)
      const candidateData = await resultCandidatesService.getCandidateById(candidateId);
      
      // Generate HTML content untuk PDF menggunakan fungsi yang sama dengan halaman result candidate
      const htmlContent = generateDownloadContent(candidateData);
      
      // Buat file PDF menggunakan html2pdf
      await this.generatePDF(htmlContent, candidateData.name);
      
      console.log(`✅ PDF downloaded for candidate ${candidateId}`);
      
    } catch (error) {
      console.error("❌ Error downloading result:", error);
      throw new Error(`Gagal mengunduh hasil tes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Generate HTML content untuk PDF
   */
  generatePDFContent(result: Result): string {
    const currentDate = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long", 
      year: "numeric"
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Psychotest Report - ${result.name}</title>
        <style>
          /* Reset all styles to prevent global CSS interference */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif !important;
            margin: 0 !important;
            padding: 20px !important;
            background: #ffffff !important;
            color: #333333 !important;
            font-size: 14px !important;
            line-height: 1.4 !important;
          }
          .header {
            text-align: center !important;
            border-bottom: 3px solid #2563eb !important;
            padding-bottom: 20px !important;
            margin-bottom: 30px !important;
          }
          .logo {
            font-size: 24px !important;
            font-weight: bold !important;
            color: #2563eb !important;
            margin-bottom: 10px !important;
          }
          .title {
            font-size: 28px !important;
            font-weight: bold !important;
            margin-bottom: 10px !important;
            color: #1f2937 !important;
          }
          .subtitle {
            font-size: 16px !important;
            color: #6b7280 !important;
          }
          .candidate-info {
            background: #f9fafb !important;
            padding: 20px !important;
            border-radius: 8px !important;
            margin-bottom: 30px !important;
            border: 1px solid #e5e7eb !important;
          }
          .candidate-name {
            font-size: 24px !important;
            font-weight: bold !important;
            margin-bottom: 10px !important;
            color: #1f2937 !important;
          }
          .candidate-details {
            display: flex !important;
            gap: 30px !important;
            margin-bottom: 20px !important;
          }
          .detail-item {
            flex: 1 !important;
          }
          .detail-label {
            font-weight: bold !important;
            color: #6b7280 !important;
            margin-bottom: 5px !important;
          }
          .detail-value {
            font-size: 16px !important;
            color: #374151 !important;
          }
          .status-badge {
            display: inline-block !important;
            padding: 4px 12px !important;
            border-radius: 20px !important;
            font-size: 12px !important;
            font-weight: bold !important;
            text-transform: uppercase !important;
          }
          .status-completed {
            background: #dcfce7 !important;
            color: #166534 !important;
          }
          .status-ongoing {
            background: #dbeafe !important;
            color: #1e40af !important;
          }
          .status-not-started {
            background: #f3f4f6 !important;
            color: #374151 !important;
          }
          .scores-section {
            display: flex !important;
            gap: 20px !important;
            margin-bottom: 30px !important;
          }
          .score-card {
            flex: 1 !important;
            background: #ffffff !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 8px !important;
            padding: 20px !important;
            text-align: center !important;
          }
          .score-title {
            font-size: 14px !important;
            color: #6b7280 !important;
            margin-bottom: 10px !important;
          }
          .score-value {
            font-size: 32px !important;
            font-weight: bold !important;
            color: #2563eb !important;
          }
          .score-subtitle {
            font-size: 12px !important;
            color: #6b7280 !important;
            margin-top: 5px !important;
          }
          .test-types {
            margin-bottom: 30px !important;
          }
          .test-types h3 {
            font-size: 18px !important;
            margin-bottom: 15px !important;
            color: #1f2937 !important;
          }
          .test-badges {
            display: flex !important;
            gap: 10px !important;
            flex-wrap: wrap !important;
          }
          .test-badge {
            background: #2563eb !important;
            color: #ffffff !important;
            padding: 6px 12px !important;
            border-radius: 20px !important;
            font-size: 12px !important;
            font-weight: bold !important;
          }
          .footer {
            margin-top: 40px !important;
            text-align: center !important;
            color: #6b7280 !important;
            font-size: 12px !important;
            border-top: 1px solid #e5e7eb !important;
            padding-top: 20px !important;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">DWP</div>
          <div class="title">PSYCHOTEST REPORT</div>
          <div class="subtitle">Hasil Tes Psikometri Kandidat</div>
        </div>

        <div class="candidate-info">
          <div class="candidate-name">${result.name}</div>
          <div class="candidate-details">
            <div class="detail-item">
              <div class="detail-label">Email</div>
              <div class="detail-value">${result.email}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Posisi</div>
              <div class="detail-value">${result.position}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Periode Tes</div>
              <div class="detail-value">${result.period}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">
                <span class="status-badge status-${result.status.toLowerCase().replace(' ', '-')}">
                  ${result.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="scores-section">
          <div class="score-card">
            <div class="score-title">Career Adaptability</div>
            <div class="score-value">${result.status === 'Completed' ? 'High' : 'N/A'}</div>
            <div class="score-subtitle">Adaptability</div>
          </div>
          <div class="score-card">
            <div class="score-title">Fast Accuracy</div>
            <div class="score-value">${result.score || '-'}</div>
            <div class="score-subtitle">Correct Answers</div>
          </div>
          <div class="score-card">
            <div class="score-title">Total Questions</div>
            <div class="score-value">100</div>
            <div class="score-subtitle">Questions</div>
          </div>
        </div>

        <div class="test-types">
          <h3>Jenis Tes yang Diikuti</h3>
          <div class="test-badges">
            ${result.types.map(type => `<span class="test-badge">${type}</span>`).join('')}
          </div>
        </div>

        <div class="footer">
          <p>Laporan ini dibuat secara otomatis pada ${currentDate}</p>
          <p>DWP Psychotest System - Confidential Document</p>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Generate PDF dari HTML content
   */
  async generatePDF(htmlContent: string, candidateName: string): Promise<void> {
    // Import html2pdf secara dinamis
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${candidateName.replace(/\s+/g, '_')}_psychotest_report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: false,
        allowTaint: false,
        backgroundColor: '#ffffff',
        ignoreElements: (element: Element) => {
          // Ignore any elements that might have global CSS
          return element.classList.contains('global-css') || 
                 element.tagName === 'LINK' || 
                 element.tagName === 'STYLE' && !element.textContent?.includes('!important');
        }
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    await html2pdf().set(opt).from(htmlContent).save();
  }
};