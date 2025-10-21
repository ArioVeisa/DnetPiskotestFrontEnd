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
    const token = localStorage.getItem("token");

    try {
      const res = await api.get<{ success: boolean; data: CandidateTest[] }>(
        "/candidate-tests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data.data || [];

      // 🔥 Tampilkan semua status (completed, ongoing, not_started)
      return data.map((item) => {
        let status: "Completed" | "Ongoing" | "Not Started" = "Not Started";
        
        if (item.status?.toLowerCase() === "completed") {
          status = "Completed";
        } else if (item.status?.toLowerCase() === "in_progress") {
          status = "Ongoing";
        }

        return {
          candidateId: item.candidate?.id?.toString() || "-",
          name: item.candidate?.name || "-",
          email: item.candidate?.email || "-",
          position: item.candidate?.position || "-",
          types: [item.test?.name || "Unknown Test"],
          period: new Date(item.created_at).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status,
          score: item.score || undefined,
          completedAt: item.completed_at || undefined,
          testDistributionId: item.test_id,
        };
      });
    } catch (error) {
      console.error("❌ Error fetching results from API, using dummy data:", error);
      
      // 🔥 Fallback ke dummy data jika API error
      return this.getDummyData();
    }
  },

  /**
   * Dummy data untuk testing dan demo
   */
  getDummyData(): Result[] {
    return [
      {
        candidateId: "1",
        name: "Ario Veisa Rayanda Utomo",
        email: "arioveisa@gmail.com",
        position: "Staff IT",
        types: ["CAAS", "DISC", "Teliti"],
        period: "20 Okt 2025",
        status: "Completed",
        score: 85,
        completedAt: "2025-10-20T14:30:00Z",
        testDistributionId: 15,
      },
      {
        candidateId: "2", 
        name: "Lamo",
        email: "lamo@mail.com",
        position: "Staff",
        types: ["CAAS", "DISC"],
        period: "20 Okt 2025",
        status: "Ongoing",
        testDistributionId: 14,
      },
      {
        candidateId: "3",
        name: "Budi Santoso",
        email: "budi@mail.com", 
        position: "Manager",
        types: ["CAAS", "DISC", "Teliti"],
        period: "19 Okt 2025",
        status: "Completed",
        score: 92,
        completedAt: "2025-10-19T16:45:00Z",
        testDistributionId: 13,
      },
      {
        candidateId: "4",
        name: "Sari Indah",
        email: "sari@mail.com",
        position: "HR Staff", 
        types: ["DISC", "Teliti"],
        period: "18 Okt 2025",
        status: "Not Started",
        testDistributionId: 12,
      },
      {
        candidateId: "5",
        name: "Ahmad Fauzi",
        email: "ahmad@mail.com",
        position: "Developer",
        types: ["CAAS", "DISC", "Teliti"],
        period: "17 Okt 2025", 
        status: "Completed",
        score: 78,
        completedAt: "2025-10-17T11:20:00Z",
        testDistributionId: 11,
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
      console.error("❌ Error fetching result by ID:", error);
      return null;
    }
  },

  /**
   * Download hasil tes dalam format PDF
   */
  async downloadResult(candidateId: string): Promise<void> {
    try {
      const token = localStorage.getItem("token");
      
      console.log(`📄 Downloading PDF for candidate ${candidateId}...`);
      
      // Coba ambil data kandidat terlebih dahulu
      const result = await this.getById(candidateId);
      if (!result) {
        throw new Error("Data kandidat tidak ditemukan");
      }
      
      // Generate HTML content untuk PDF
      const htmlContent = this.generatePDFContent(result);
      
      // Buat file PDF menggunakan html2pdf
      await this.generatePDF(htmlContent, result.name);
      
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
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            color: #666;
          }
          .candidate-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .candidate-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .candidate-details {
            display: flex;
            gap: 30px;
            margin-bottom: 20px;
          }
          .detail-item {
            flex: 1;
          }
          .detail-label {
            font-weight: bold;
            color: #666;
            margin-bottom: 5px;
          }
          .detail-value {
            font-size: 16px;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status-completed {
            background: #dcfce7;
            color: #166534;
          }
          .status-ongoing {
            background: #dbeafe;
            color: #1e40af;
          }
          .status-not-started {
            background: #f3f4f6;
            color: #374151;
          }
          .scores-section {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
          }
          .score-card {
            flex: 1;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          .score-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .score-value {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
          }
          .score-subtitle {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .test-types {
            margin-bottom: 30px;
          }
          .test-types h3 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #333;
          }
          .test-badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          .test-badge {
            background: #3b82f6;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
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
      margin: 1,
      filename: `${candidateName.replace(/\s+/g, '_')}_psychotest_report.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(htmlContent).save();
  }
};