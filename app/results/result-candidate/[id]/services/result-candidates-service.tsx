// /result-candidates/[id]/services/result-candidates-service.ts
import { api } from "@/public/services/api";
import axios from "axios";

// =======================
// Interfaces
// =======================

export interface Candidate {
  id: number;
  name: string;
  position: string;
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
}

export interface DiscResult {
  id: number;
  candidate_test_id: number;
  section_id: number;
  most_d: number;
  most_i: number;
  most_s: number;
  most_c: number;
  least_d: number;
  least_i: number;
  least_s: number;
  least_c: number;
  diff_d: number;
  diff_i: number;
  diff_s: number;
  diff_c: number;
  std1_d: number;
  std1_i: number;
  std1_s: number;
  std1_c: number;
  std2_d: number;
  std2_i: number;
  std2_s: number;
  std2_c: number;
  std3_d: number;
  std3_i: number;
  std3_s: number;
  std3_c: number;
  dominant_type: string;
  dominant_type_2: string;
  dominant_type_3: string;
  interpretation: string;
  interpretation_2: string;
  interpretation_3: string;
  candidate_test: CandidateTest;
}

export interface CaasResult {
  id: number;
  candidate_test_id: number;
  section_id: number;
  concern: number;
  control: number;
  curiosity: number;
  confidence: number;
  total: number;
  category: string;
}

export interface TelitiResult {
  id: number;
  candidate_test_id: number;
  section_id: number | null;
  score: number;
  total_questions: number;
  category: string;
}

export interface CandidateResult {
  id: string;
  name: string;
  position: string;
  phone?: string;
  nik?: string;
  email?: string;
  gender?: string;
  caas: string;
  completedAt?: string; // Tanggal completed test
  adaptability: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    norma: string; // Norma berdasarkan kategori (SANGAT AKURAT, AKURAT, dll)
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
  jobMatch: string[];
}

// =======================
// Service Implementation
// =======================

// =======================
// Service Implementation
// =======================

export const resultCandidatesService = {
  /**
   * Get characteristics based on DISC dominant types
   */
  getCharacteristicsByDiscType(dominantType1: string, dominantType2: string, dominantType3: string): {
    userPublic: string[];
    teammate: string[];
    intimate: string[];
  } {
    // Characteristics mapping berdasarkan DISC types
    const characteristicsMap: Record<string, {
      userPublic: string[];
      teammate: string[];
      intimate: string[];
    }> = {
      // D (Dominance) types
      'D': {
        userPublic: ["DIRECTOR", "Decisive", "Goal-Oriented", "Competitive", "Results-Driven", "Assertive", "Direct", "Ambitious", "Independent", "Strong-willed", "Leader", "Confident"],
        teammate: ["Competitive", "Challenging", "Results-oriented", "Direct", "Assertive", "Independent", "Strong-willed", "Confident", "Ambitious", "Goal-focused", "Decisive", "Leader"],
        intimate: ["Private", "Self-reliant", "Independent", "Strong-willed", "Confident", "Protective", "Direct", "Ambitious", "Goal-oriented", "Decisive"]
      },
      'D-I': {
        userPublic: ["NEGOTIATOR", "Suka Bergaul", "Anti Rutin", "Aktif", "Terlalu Percaya Diri", "Agresif", "Optimis", "Kurang Detail", "Result Oriented", "Leader", "Motivator", "Inspiring"],
        teammate: ["Motivator", "Inspiring", "Team Leader", "Optimistic", "Energetic", "Persuasive", "Confident", "Results-oriented", "Social", "Enthusiastic", "Direct", "Ambitious"],
        intimate: ["Confident", "Optimistic", "Energetic", "Social", "Direct", "Ambitious", "Independent", "Strong-willed", "Protective", "Decisive"]
      },
      'D-S': {
        userPublic: ["SELF-MOTIVATED", "Objektif", "Mandiri", "Good Planner", "Komitmen Target", "Good Analytical Think", "Good Interpersonal", "Cepat Bosan", "Monoton", "Not Leader", "Stable", "Reliable"],
        teammate: ["Stable", "Reliable", "Supportive", "Patient", "Good Listener", "Team Player", "Objective", "Independent", "Planner", "Committed", "Analytical", "Interpersonal"],
        intimate: ["Stable", "Reliable", "Supportive", "Patient", "Independent", "Objective", "Planner", "Committed", "Analytical", "Protective"]
      },
      'D-C': {
        userPublic: ["CHALLENGER", "Tekun", "Sensitif", "Keputusan Kuat", "Kreatif", "Reaksi Cepat", "Banyak Ide", "Perfeksionis", "Mandiri", "Cermat", "Detail-oriented", "Systematic"],
        teammate: ["Detail-oriented", "Systematic", "Accurate", "Cautious", "Organized", "Perfectionist", "Independent", "Creative", "Quick-thinking", "Strong decisions", "Sensitive", "Persistent"],
        intimate: ["Perfectionist", "Responsible", "Structured", "Detail-oriented", "Systematic", "Independent", "Creative", "Sensitive", "Protective", "Decisive"]
      },
      
      // I (Influence) types
      'I': {
        userPublic: ["COMMUNICATOR", "Antusias", "Percaya", "Optimis", "Persuasif", "Bicara Aktif", "Impulsif", "Emosional", "Ramah", "Inspirasional", "Social", "Energetic"],
        teammate: ["Enthusiastic", "Optimistic", "Socially-adept", "Inspiring", "Motivator", "Friendly", "Talkative", "Energetic", "Persuasive", "Confident", "Social", "Emotional"],
        intimate: ["Emotional", "Trusting", "Impulsive", "Cheerful", "Open", "Expressive", "Social", "Energetic", "Optimistic", "Inspiring"]
      },
      'I-D': {
        userPublic: ["PENGAMBIL KEPUTUSAN", "Pekerja Keras", "Leader", "Banyak Minat", "Dingin", "Kurang Pergaulan", "Kontrol Emosi", "Suka Tantangan", "Cepat Bosan", "Anti Aturan", "Kurang Detail", "Argumentatif"],
        teammate: ["Leader", "Hard worker", "Decision maker", "Challenging", "Emotional control", "Anti-rules", "Argumentative", "Quick decisions", "Independent", "Goal-oriented", "Competitive", "Direct"],
        intimate: ["Independent", "Strong-willed", "Confident", "Direct", "Ambitious", "Goal-oriented", "Decisive", "Protective", "Self-reliant", "Private"]
      },
      'I-S': {
        userPublic: ["ADVISOR", "Hangat", "Simpati", "Tenang", "Pendengar Baik", "Demonstratif", "Tidak Memaksakan Ide", "Kurang Tegas", "Menerima Kritik", "Toleran", "Penjaga Damai", "Supportive"],
        teammate: ["Warm", "Sympathetic", "Calm", "Good listener", "Demonstrative", "Non-imposing", "Accepts criticism", "Tolerant", "Peacekeeper", "Supportive", "Patient", "Team player"],
        intimate: ["Calm", "Predictable", "Loyal", "Supportive", "Patient", "Good listener", "Warm", "Sympathetic", "Peaceful", "Stable"]
      },
      'I-C': {
        userPublic: ["ASSESSOR", "Ramah", "Nyaman dengan Orang Asing", "Perfeksionis Alamiah", "Analitis", "Hati-hati", "Peduli", "Perfeksionis", "Detail-oriented", "Systematic", "Accurate", "Organized"],
        teammate: ["Friendly", "Comfortable with strangers", "Natural perfectionist", "Analytical", "Careful", "Caring", "Detail-oriented", "Systematic", "Accurate", "Organized", "Quality-oriented", "Thorough"],
        intimate: ["Perfectionist", "Responsible", "Structured", "Detail-oriented", "Systematic", "Accurate", "Organized", "Quality-oriented", "Thorough", "Caring"]
      },
      
      // S (Steadiness) types
      'S': {
        userPublic: ["SPECIALIST", "Stabil", "Konsisten", "Terkendali", "Sabar", "Loyal", "Sulit Adaptasi", "Butuh Situasi Stabil", "Process Oriented", "Need for Peace", "Anti Perubahan", "Reliable"],
        teammate: ["Patient", "Good Listener", "Team Player", "Stable", "Consistent", "Controlled", "Loyal", "Peaceful", "Process-oriented", "Reliable", "Supportive", "Steady"],
        intimate: ["Calm", "Predictable", "Loyal", "Stable", "Consistent", "Peaceful", "Reliable", "Supportive", "Steady", "Patient"]
      },
      'S-D': {
        userPublic: ["SELF-MOTIVATED", "Objektif", "Mandiri", "Planner", "Komitmen Target", "Menghindari Konflik", "Stabil", "Tekun", "Independent", "Objective", "Goal-oriented", "Reliable"],
        teammate: ["Independent", "Objective", "Planner", "Target committed", "Conflict avoiding", "Stable", "Persistent", "Reliable", "Goal-oriented", "Self-motivated", "Controlled", "Steady"],
        intimate: ["Independent", "Self-reliant", "Private", "Strong-willed", "Confident", "Protective", "Direct", "Ambitious", "Goal-oriented", "Decisive"]
      },
      'S-I': {
        userPublic: ["ADVISOR", "Hangat", "Simpati", "Tenang", "Pendengar Baik", "Demonstratif", "Tidak Memaksakan Ide", "Toleran", "Penjaga Damai", "Supportive", "Patient", "Team-oriented"],
        teammate: ["Warm", "Sympathetic", "Calm", "Good listener", "Demonstrative", "Non-imposing", "Tolerant", "Peacekeeper", "Supportive", "Patient", "Team-oriented", "Reliable"],
        intimate: ["Warm", "Sympathetic", "Calm", "Good listener", "Supportive", "Patient", "Team-oriented", "Reliable", "Peaceful", "Stable"]
      },
      'S-C': {
        userPublic: ["PEACEMAKER", "Respectful & Accurate", "Sulit Beradaptasi", "Anti Kritik", "Pendendam", "Sukar Berubah", "Detail", "Empati", "Memikirkan Dampak ke Orang Lain", "Terlalu Mendalam dalam Berpikir", "Concern ke Data dan Fakta", "Introvert", "Loyal"],
        teammate: ["Peaceful", "Respectful", "Accurate", "Difficult to adapt", "Anti-criticism", "Vindictive", "Hard to change", "Detail-oriented", "Empathetic", "Considers others", "Deep thinking", "Data-focused", "Introvert", "Loyal"],
        intimate: ["Peaceful", "Respectful", "Accurate", "Detail-oriented", "Empathetic", "Deep thinking", "Data-focused", "Introvert", "Loyal", "Stable"]
      },
      
      // C (Conscientiousness) types
      'C': {
        userPublic: ["MEDIATOR", "Loyal", "Tight Scheduled", "Curious", "Sensitif", "Good Communication Skill", "Good Analitical Think", "Good Interpersonal Skill", "Cepat Beradaptasi", "Anti Kritik", "Not Leader", "Work/Play Conflict"],
        teammate: ["PEACEMAKER, RESPECTFULL & ACCURATE", "Sulit Beradaptasi", "Anti Kritik", "Pendendam", "Sukar Berubah", "Detail", "Empati", "Memikirkan Dampak ke Orang Lain", "Terlalu Mendalam dalam Berpikir", "Concern ke Data dan Fakta", "Introvert", "Loyal"],
        intimate: ["PERFECTIONIST", "Detail & Teliti", "Butuh Situasi Stabil", "Sistematik & Prosedural", "Menghindari Konflik", "Anti Kritik", "Lambat Memutuskan", "Sulit Adaptasi", "Pendendam", "Anti Perubahan"]
      },
      'C-D': {
        userPublic: ["CHALLENGER", "Sensitif", "Kukuh", "Dingin", "Membuat Keputusan Faktual", "Pendiam", "Tidak Mudah Percaya", "Independent", "Strong-willed", "Confident", "Direct", "Ambitious"],
        teammate: ["Independent", "Strong-willed", "Confident", "Direct", "Ambitious", "Goal-oriented", "Decisive", "Competitive", "Results-oriented", "Assertive", "Cold", "Factual decisions"],
        intimate: ["Independent", "Self-reliant", "Private", "Strong-willed", "Confident", "Protective", "Direct", "Ambitious", "Goal-oriented", "Decisive"]
      },
      'C-I': {
        userPublic: ["ASSESSOR", "Analitis", "Hati-hati", "Perfeksionis", "Peduli", "Ramah", "Cermat", "Berorientasi Kualitas", "Detail-oriented", "Systematic", "Accurate", "Organized"],
        teammate: ["Analytical", "Careful", "Perfectionist", "Caring", "Friendly", "Thorough", "Quality-oriented", "Detail-oriented", "Systematic", "Accurate", "Organized", "Thorough"],
        intimate: ["Perfectionist", "Responsible", "Structured", "Detail-oriented", "Systematic", "Accurate", "Organized", "Quality-oriented", "Thorough", "Caring"]
      },
      'C-S': {
        userPublic: ["PRECISIONIST", "Sistematis", "Prosedural", "Teliti", "Fokus Detil", "Bijaksana", "Diplomatis", "Perfeksionis", "Anti Perubahan Mendadak", "Stable", "Reliable", "Process-oriented"],
        teammate: ["Systematic", "Procedural", "Meticulous", "Detail-focused", "Wise", "Diplomatic", "Perfectionist", "Anti-sudden change", "Stable", "Reliable", "Process-oriented", "Quality-focused"],
        intimate: ["Perfectionist", "Responsible", "Structured", "Detail-oriented", "Systematic", "Accurate", "Organized", "Quality-oriented", "Stable", "Reliable"]
      }
    };

    // Ambil characteristics berdasarkan dominant type
    let characteristics = characteristicsMap[dominantType1];
    
    if (!characteristics) {
      // Fallback ke C type jika tidak ditemukan
      characteristics = characteristicsMap['C'];
    }

    return characteristics;
  },

  /**
   * Get personality description based on DISC dominant types
   */
  getPersonalityDescriptionByDiscType(dominantType1: string, dominantType2: string, dominantType3: string): string {
    const personalityMap: Record<string, string> = {
      'D': "Seorang yang percaya diri, cakap dan unik. Ia orang yang mampu memiliki diri sendiri dan kritis. Ia mampu menyampaikan informasi, ia meneliti informasi yang ada dan cenderung mulai dari teratas, ia hati-hati dalam membuat keputusan dan cenderung untuk tidak suka emosi, selalu menggunakan metode dan prosedur yang ia terapkan. Ia mengerjakan sesuatu dengan sistematis dan akurat. Ia cenderung untuk tidak suka merasa bahwa keadaan berantakan dan tidak terorganisir. Ia mampu memikirkan segala, rapi dan teratur daripada pintu yang tinggi. Ia cenderung untuk tidak suka bekerja sendiri dalam pekerjaan dan ia cenderung untuk tidak suka merencanakan dan mengorganisir semua sisi kehidupannya. Ia cenderung untuk mengangguk-angguk dan tak dapat diubah.",
      
      'D-I': "Seorang yang percaya diri dan suka bergaul. Ia anti rutin dan aktif dalam berbagai kegiatan. Terlalu percaya diri dan agresif dalam mencapai tujuan. Optimis dan kurang detail dalam pekerjaan, namun result oriented. Ia adalah leader yang motivator dan inspiring bagi timnya. Suka tantangan dan tidak suka aturan yang membatasi.",
      
      'D-S': "Seorang yang self-motivated dan objektif. Mandiri dalam bekerja dan memiliki good planner skills. Komitmen tinggi terhadap target yang ditetapkan. Memiliki good analytical thinking dan good interpersonal skills. Cepat bosan dengan pekerjaan monoton dan bukan tipe leader. Stabil dan reliable dalam tim.",
      
      'D-C': "Seorang yang challenger dan tekun. Sensitif namun memiliki keputusan yang kuat. Kreatif dan memiliki reaksi cepat terhadap masalah. Banyak ide dan perfeksionis dalam pekerjaan. Mandiri dan cermat dalam setiap detail. Detail-oriented dan systematic dalam pendekatan kerja.",
      
      'I': "Seorang yang communicator dan antusias. Percaya diri dan optimis dalam menghadapi tantangan. Persuasif dan bicara aktif dalam komunikasi. Impulsif dan emosional dalam mengambil keputusan. Ramah dan inspirasional bagi orang lain. Social dan energetic dalam berinteraksi.",
      
      'I-D': "Seorang yang pengambil keputusan dan pekerja keras. Leader yang memiliki banyak minat. Dingin dalam pergaulan namun memiliki kontrol emosi yang baik. Suka tantangan dan cepat bosan dengan rutinitas. Anti aturan dan kurang detail dalam pekerjaan. Argumentatif dalam diskusi.",
      
      'I-S': "Seorang yang advisor dan hangat. Simpati dan tenang dalam menghadapi masalah. Pendengar yang baik dan demonstratif dalam komunikasi. Tidak memaksakan ide dan kurang tegas dalam keputusan. Menerima kritik dan toleran terhadap perbedaan. Penjaga damai dan supportive dalam tim.",
      
      'I-C': "Seorang yang assessor dan ramah. Nyaman dengan orang asing dan perfeksionis alamiah. Analitis dan hati-hati dalam mengambil keputusan. Peduli terhadap detail dan perfeksionis dalam pekerjaan. Detail-oriented dan systematic dalam pendekatan. Accurate dan organized dalam setiap tugas.",
      
      'S': "Seorang yang specialist dan stabil. Konsisten dan terkendali dalam setiap tindakan. Sabar dan loyal dalam hubungan. Sulit beradaptasi dengan perubahan dan butuh situasi yang stabil. Process oriented dan need for peace dalam bekerja. Anti perubahan dan reliable dalam tim.",
      
      'S-D': "Seorang yang self-motivated dan objektif. Mandiri dan planner yang baik. Komitmen tinggi terhadap target dan menghindari konflik. Stabil dan tekun dalam bekerja. Independent dan objective dalam pendekatan. Goal-oriented dan reliable dalam tim.",
      
      'S-I': "Seorang yang advisor dan hangat. Simpati dan tenang dalam menghadapi masalah. Pendengar yang baik dan demonstratif dalam komunikasi. Tidak memaksakan ide dan toleran terhadap perbedaan. Penjaga damai dan supportive dalam tim. Patient dan team-oriented dalam bekerja.",
      
      'S-C': "Seorang yang peacemaker, respectful & accurate. Sulit beradaptasi dan anti kritik. Pendendam dan sukar berubah dalam kebiasaan. Detail dan empati terhadap orang lain. Memikirkan dampak ke orang lain dan terlalu mendalam dalam berpikir. Concern ke data dan fakta, introvert dan loyal.",
      
      'C': "Berpikir sistematis dan cenderung mengikuti prosedur dalam kehidupan pribadi dan pekerjaannya. Teratur dan memiliki perencanaan yang baik, ia teliti dan fokus pada detil. Bertindak dengan penuh kebijaksanaan, diplomatis dan jarang menentang rekan kerjanya dengan sengaja. Ia sangat berhati-hati, sungguh-sungguh mengharapkan akurasi dan standard tinggi dalam pekerjaannya. Ia cenderung terjebak dalam hal detil, khususnya jika harus memutuskan. Menginginkan adanya petunjuk standard pelaksanaan kerja dan tanpa perubahan mendadak.",
      
      'C-D': "Seorang yang challenger dan sensitif. Kukuh dalam pendirian dan dingin dalam pergaulan. Membuat keputusan berdasarkan fakta dan pendiam dalam komunikasi. Tidak mudah percaya dan independent dalam bekerja. Strong-willed dan confident dalam mengambil keputusan. Direct dan ambitious dalam mencapai tujuan.",
      
      'C-I': "Seorang yang assessor dan analitis. Hati-hati dan perfeksionis dalam setiap pekerjaan. Peduli terhadap detail dan ramah dalam berinteraksi. Cermat dan berorientasi kualitas dalam bekerja. Detail-oriented dan systematic dalam pendekatan. Accurate dan organized dalam setiap tugas yang diberikan.",
      
      'C-S': "Seorang yang precisionist dan sistematis. Prosedural dan teliti dalam setiap detail pekerjaan. Fokus detil dan bijaksana dalam mengambil keputusan. Diplomatis dan perfeksionis dalam standar kerja. Anti perubahan mendadak dan stable dalam bekerja. Reliable dan process-oriented dalam tim."
    };

    return personalityMap[dominantType1] || personalityMap['C'];
  },

  /**
   * Get job matches based on DISC dominant types
   */
  getJobMatchByDiscType(dominantType1: string, dominantType2: string, dominantType3: string): string[] {
    // Job match mapping berdasarkan DISC types
    const jobMatchMap: Record<string, string[]> = {
      // D (Dominance) types
      'D': [
        "CEO (Chief Executive Officer)",
        "Director (Operations)",
        "Manager (Project)",
        "Entrepreneur",
        "Sales Director",
        "Business Development Manager"
      ],
      'D-I': [
        "Sales Manager",
        "Marketing Director",
        "Business Development",
        "Public Relations Manager",
        "Event Manager",
        "Team Leader"
      ],
      'D-S': [
        "Operations Manager",
        "Production Manager",
        "Quality Manager",
        "Process Improvement Manager",
        "Facilities Manager",
        "Logistics Manager"
      ],
      'D-C': [
        "Engineering Manager",
        "Technical Director",
        "R&D Manager",
        "Systems Manager",
        "IT Director",
        "Project Manager"
      ],
      
      // I (Influence) types
      'I': [
        "Sales Representative",
        "Marketing Specialist",
        "Public Relations",
        "Event Coordinator",
        "Customer Service Manager",
        "Training Coordinator"
      ],
      'I-D': [
        "Sales Director",
        "Marketing Manager",
        "Business Development",
        "Account Manager",
        "Regional Manager",
        "Territory Manager"
      ],
      'I-S': [
        "HR Specialist",
        "Training Manager",
        "Customer Success Manager",
        "Community Manager",
        "Recruitment Specialist",
        "Employee Relations"
      ],
      'I-C': [
        "Marketing Analyst",
        "Brand Manager",
        "Content Manager",
        "Digital Marketing",
        "Product Marketing",
        "Market Research"
      ],
      
      // S (Steadiness) types
      'S': [
        "Administrative Assistant",
        "Customer Service Representative",
        "HR Assistant",
        "Office Manager",
        "Support Specialist",
        "Team Coordinator"
      ],
      'S-D': [
        "Operations Coordinator",
        "Project Coordinator",
        "Administrative Manager",
        "Office Administrator",
        "Executive Assistant",
        "Facilities Coordinator"
      ],
      'S-I': [
        "HR Coordinator",
        "Training Assistant",
        "Customer Service Manager",
        "Team Support",
        "Employee Relations",
        "Recruitment Coordinator"
      ],
      'S-C': [
        "Quality Assurance",
        "Compliance Officer",
        "Administrative Specialist",
        "Documentation Specialist",
        "Process Coordinator",
        "Quality Coordinator"
      ],
      
      // C (Conscientiousness) types
      'C': [
        "Researcher (Human and Quality Control)",
        "Engineer (Project Supervisor)",
        "Statistician",
        "Surveyor",
        "Quality Control Specialist",
        "Data Analyst",
        "Technical Writer",
        "System Administrator"
      ],
      'C-D': [
        "Engineering Manager",
        "Technical Director",
        "R&D Manager",
        "Systems Manager",
        "IT Director",
        "Project Manager"
      ],
      'C-I': [
        "Research Analyst",
        "Data Scientist",
        "Business Analyst",
        "Market Research Analyst",
        "Financial Analyst",
        "Operations Analyst"
      ],
      'C-S': [
        "Quality Manager",
        "Compliance Manager",
        "Process Manager",
        "Documentation Manager",
        "Standards Manager",
        "Audit Manager"
      ]
    };

    // Ambil job matches berdasarkan dominant type
    let jobs: string[] = [];
    
    // Prioritas: dominant_type -> dominant_type_2 -> dominant_type_3
    if (jobMatchMap[dominantType1]) {
      jobs = jobMatchMap[dominantType1];
    } else if (jobMatchMap[dominantType2]) {
      jobs = jobMatchMap[dominantType2];
    } else if (jobMatchMap[dominantType3]) {
      jobs = jobMatchMap[dominantType3];
    } else {
      // Fallback ke default jobs
      jobs = [
        "General Manager",
        "Project Coordinator",
        "Business Analyst",
        "Operations Specialist"
      ];
    }

    // Return maksimal 8 jobs
    return jobs.slice(0, 8);
  },

  async getCandidateById(id: string): Promise<CandidateResult> {
    try {
      // Gunakan endpoint unified yang baru
      const response = await api.get<{
        success: boolean;
        message: string;
        data: {
          candidate_test: {
            id: number;
            completed_at: string | null;
            candidate: {
              id: number;
              name: string;
              email: string;
              position: string;
              nik: string;
              phone_number: string;
              birth_date: string;
              gender: string;
              department: string;
            };
            test: {
              id: number;
              name: string;
              target_position: string;
            };
          };
          disc_results: DiscResult[];
          caas_results: CaasResult[];
          teliti_results: TelitiResult[];
        };
      }>(`/candidate-tests-public/${id}/results`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch results');
      }

      const { candidate_test, disc_results, caas_results, teliti_results } = response.data.data;
      
      // Ambil data pertama dari array results
      const disc = disc_results[0] || null;
      const caas = caas_results[0] || null;
      const teliti = teliti_results[0] || null;
      const candidate = candidate_test.candidate;

      // Validasi data yang diperlukan
      if (!candidate) {
        throw new Error('Candidate data not found');
      }

      // DISC results diperlukan untuk characteristics, personality, dan job match
      if (!disc) {
        console.warn('⚠️ DISC results not found, using fallback data');
        // Jika tidak ada DISC results, gunakan dummy DISC data untuk fallback
        throw new Error('DISC results not found');
      }

      // Lanjutkan dengan processing data...
      console.log('✅ Successfully fetched real results data:', { 
        candidate: candidate.name, 
        candidateData: {
          name: candidate.name,
          email: candidate.email,
          position: candidate.position,
          nik: candidate.nik,
          phone_number: candidate.phone_number,
          gender: candidate.gender,
        },
        hasDisc: !!disc, 
        hasCaas: !!caas, 
        hasTeliti: !!teliti,
        caasCategory: caas?.category,
        discDominantType: disc?.dominant_type,
        telitiScore: teliti?.score,
        telitiCategory: teliti?.category,
        telitiTotalQuestions: teliti?.total_questions
      });

      // 🔹 Helper untuk menentukan dominant type berdasar skor tertinggi
      const getDominantType = (
        d: number,
        i: number,
        s: number,
        c: number
      ): string => {
        const max = Math.max(d, i, s, c);
        if (max === d) return "D";
        if (max === i) return "I";
        if (max === s) return "S";
        return "C";
      };

          const mostType = getDominantType(
            disc.std1_d,
            disc.std1_i,
            disc.std1_s,
            disc.std1_c
          );
          const leastType = getDominantType(
            disc.std2_d,
            disc.std2_i,
            disc.std2_s,
            disc.std2_c
          );
          const diffType = getDominantType(
            disc.std3_d,
            disc.std3_i,
            disc.std3_s,
            disc.std3_c
          );

      // 🔹 Template karakteristik berdasarkan tipe DISC
      const characteristicTemplates: Record<
        string,
        { public: string[]; teammate: string[]; intimate: string[] }
      > = {
        D: {
          public: ["Decisive", "Leader", "Goal-Oriented"],
          teammate: ["Dominant", "Assertive", "Direct Communicator"],
          intimate: ["Strong-willed", "Confident", "Protective"],
        },
        I: {
          public: ["Enthusiastic", "Optimistic", "Sociable"],
          teammate: ["Inspiring", "Friendly", "Talkative"],
          intimate: ["Cheerful", "Open", "Expressive"],
        },
        S: {
          public: ["Calm", "Supportive", "Reliable"],
          teammate: ["Patient", "Good Listener", "Team Player"],
          intimate: ["Loyal", "Kind", "Peace-Seeking"],
        },
        C: {
          public: ["Accurate", "Analytical", "Precise"],
          teammate: ["Detail-Oriented", "Cautious", "Organized"],
          intimate: ["Perfectionist", "Responsible", "Structured"],
        },
      };

      // 🔹 Ambil karakteristik berdasarkan dominant type DISC
      const characteristics = this.getCharacteristicsByDiscType(
        disc.dominant_type,
        disc.dominant_type_2,
        disc.dominant_type_3
      );

      // 🔹 Helper function untuk menghitung norma dari score (fallback jika category tidak ada)
      const calculateNorma = (score: number | undefined): string => {
        if (score === undefined || score === null) {
          return "-";
        }
        if (score >= 56 && score <= 60) {
          return "SANGAT AKURAT";
        } else if (score >= 41 && score <= 55) {
          return "AKURAT";
        } else if (score >= 21 && score <= 40) {
          return "CUKUP AKURAT";
        } else if (score >= 6 && score <= 20) {
          return "KURANG AKURAT";
        } else {
          return "SANGAT KURANG AKURAT";
        }
      };

      // 🔹 Ambil norma: gunakan category dari DB jika ada dan tidak kosong, jika tidak calculate dari score
      const norma = (teliti?.category && teliti.category.trim() !== "") 
        ? teliti.category 
        : (teliti?.score !== undefined && teliti?.score !== null 
            ? calculateNorma(teliti.score) 
            : "-");
      
      console.log('📊 Norma calculation:', {
        telitiExists: !!teliti,
        telitiCategory: teliti?.category,
        telitiScore: teliti?.score,
        calculatedNorma: norma
      });

      // 🔹 Susun hasil unified
      const result: CandidateResult = {
        id: candidate.id.toString(),
        name: candidate.name,
        position: candidate.position,
        phone: candidate.phone_number || undefined,
        nik: candidate.nik || undefined,
        email: candidate.email || undefined,
        gender: candidate.gender || undefined,
        caas: caas?.category ?? "Sedang", // Fallback ke "Sedang" jika tidak ada data
        completedAt: candidate_test.completed_at || undefined,

        adaptability: {
          score: teliti?.score ?? 0,
          correctAnswers: teliti?.score ?? 0,
          totalQuestions: teliti?.total_questions ?? 0,
          norma: norma, // Norma berdasarkan kategori dari DB atau calculated dari score
        },

        graphs: {
          most: [
            { label: "D", value: disc.std1_d },
            { label: "I", value: disc.std1_i },
            { label: "S", value: disc.std1_s },
            { label: "C", value: disc.std1_c },
          ],
          least: [
            { label: "D", value: disc.std2_d },
            { label: "I", value: disc.std2_i },
            { label: "S", value: disc.std2_s },
            { label: "C", value: disc.std2_c },
          ],
          change: [
            { label: "D", value: disc.std3_d },
            { label: "I", value: disc.std3_i },
            { label: "S", value: disc.std3_s },
            { label: "C", value: disc.std3_c },
          ],
        },

        characteristics: characteristics,

        // Gunakan interpretation dari backend (Graph 1 - MOST) sebagai personality description
        // Backend interpretation adalah format pendek dengan karakteristik yang dipisahkan koma
        // Jika tidak ada interpretation dari backend, fallback ke mapping frontend (format naratif panjang)
        personalityDescription: disc.interpretation && disc.interpretation.trim() !== ""
          ? disc.interpretation 
          : this.getPersonalityDescriptionByDiscType(
              disc.dominant_type,
              disc.dominant_type_2,
              disc.dominant_type_3
            ),

        // Job Match menggunakan mapping di frontend berdasarkan dominant_type dari backend
        // Ini sudah dinamis karena dominant_type berasal dari hasil perhitungan backend
        jobMatch: this.getJobMatchByDiscType(disc.dominant_type, disc.dominant_type_2, disc.dominant_type_3),
      };

      return result;
    } catch (error) {
      console.error("❌ Error fetching candidate data from API, using dummy data:", error);
      
      // Fallback ke dummy data jika API error
      return this.getDummyCandidateData(id);
    }
  },

  /**
   * Dummy data untuk testing dan demo
   */
  getDummyCandidateData(id: string): CandidateResult {
    // Data sesuai dengan gambar yang menunjukkan hasil DISC dengan karakteristik MEDIATOR, PEACEMAKER, PERFECTIONIST
    const personalityDescriptionText = "Berpikir sistematis dan cenderung mengikuti prosedur dalam kehidupan pribadi dan pekerjaannya. Teratur dan memiliki perencanaan yang baik, ia teliti dan fokus pada detil. Bertindak dengan penuh kebijaksanaan, diplomatis dan jarang menentang rekan kerjanya dengan sengaja. Ia sangat berhati-hati, sungguh-sungguh mengharapkan akurasi dan standard tinggi dalam pekerjaannya. Ia cenderung terjebak dalam hal detil, khususnya jika harus memutuskan. Menginginkan adanya petunjuk standard pelaksanaan kerja dan tanpa perubahan mendadak.";

    return {
      id: id,
      name: "RD",
      position: "Staff",
      phone: "-",
      nik: "-",
      email: "-",
      gender: "-",
      caas: "Rendah",
      adaptability: {
        score: 0,
        correctAnswers: 0,
        totalQuestions: 61,
        norma: "-", // Dummy data
      },
      graphs: {
        // Graph 1 MOST (Mask Public Self) - sesuai dengan data di gambar Excel
        most: [
          { label: "D", value: -5 },
          { label: "I", value: 0 },
          { label: "S", value: 2 },
          { label: "C", value: 5 },
        ],
        // Graph 2 LEAST (Core Private Self) - sesuai dengan data di gambar Excel
        least: [
          { label: "D", value: -4 },
          { label: "I", value: -3 },
          { label: "S", value: 8 },
          { label: "C", value: 6 },
        ],
        // Graph 3 CHANGE (Mirror Perceived Self) - sesuai dengan data di gambar Excel
        change: [
          { label: "D", value: -9 },
          { label: "I", value: -3 },
          { label: "S", value: 5 },
          { label: "C", value: 6 },
        ],
      },
      characteristics: this.getCharacteristicsByDiscType("C", "C-S", "C-I"), // Dummy menggunakan C type
      personalityDescription: this.getPersonalityDescriptionByDiscType("C", "C-S", "C-I"), // Dummy menggunakan C type
      jobMatch: this.getJobMatchByDiscType("C", "C-S", "C-I"), // Dummy menggunakan C type
    };
  },
};