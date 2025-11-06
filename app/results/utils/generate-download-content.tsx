import { CandidateResult } from "../result-candidate/[id]/services/result-candidates-service";

// Generate HTML content untuk download PDF yang sama dengan view result
export function generateDownloadContent(data: CandidateResult): string {
  // Gunakan completedAt jika ada, jika tidak gunakan tanggal sekarang
  const periodDate = data.completedAt 
    ? new Date(data.completedAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
  
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long", 
    year: "numeric"
  });
  
  // Helper function untuk membuat chart SVG
  const createChartSVG = (
    data: { label: string; value: number }[],
    color: string,
    title: string,
    yMin: number,
    yMax: number
  ): string => {
    const width = 280;
    const height = 180;
    const padding = 45;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const xScale = chartWidth / (data.length - 1);
    const yScale = chartHeight / (yMax - yMin);
    
    const points = data.map((d, i) => {
      const x = i * xScale;
      const y = chartHeight - (d.value - yMin) * yScale;
      return `${x},${y}`;
    }).join(' ');
    
    // Area fill points (relative to chart area, not SVG)
    const areaPoints = `${points} ${chartWidth},${chartHeight} 0,${chartHeight}`;
    
    return `
      <svg width="${width}" height="${height}" style="background: white;">
        <defs>
          <linearGradient id="grad-${color.replace('#', '')}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:${color}40;stop-opacity:1" />
            <stop offset="100%" style="stop-color:${color}10;stop-opacity:1" />
          </linearGradient>
        </defs>
        <g transform="translate(${padding},${padding})">
          <!-- Grid lines -->
          ${Array.from({ length: 5 }, (_, i) => {
            const y = (chartHeight / 4) * i;
            return `<line x1="0" y1="${y}" x2="${chartWidth}" y2="${y}" stroke="#f3f4f6" stroke-width="1"/>`;
          }).join('')}
          <!-- Zero line -->
          ${yMin <= 0 && yMax >= 0 ? `<line x1="0" y1="${chartHeight - (0 - yMin) * yScale}" x2="${chartWidth}" y2="${chartHeight - (0 - yMin) * yScale}" stroke="#d1d5db" stroke-width="1" stroke-dasharray="2,2"/>` : ''}
          <!-- Area fill -->
          <polygon points="${areaPoints}" fill="url(#grad-${color.replace('#', '')})" opacity="0.3"/>
          <!-- Chart line -->
          <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Data points -->
          ${data.map((d, i) => {
            const x = i * xScale;
            const y = chartHeight - (d.value - yMin) * yScale;
            return `<circle cx="${x}" cy="${y}" r="4" fill="${color}" stroke="white" stroke-width="2"/>`;
          }).join('')}
          <!-- X-axis labels -->
          ${data.map((d, i) => {
            const x = i * xScale;
            return `<text x="${x}" y="${chartHeight + 25}" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">${d.label}</text>`;
          }).join('')}
          <!-- Y-axis labels -->
          ${Array.from({ length: 5 }, (_, i) => {
            const value = yMin + ((yMax - yMin) / 4) * (4 - i);
            const y = (chartHeight / 4) * i;
            return `<text x="-15" y="${y + 4}" text-anchor="end" font-size="10" fill="#6b7280">${Math.round(value)}</text>`;
          }).join('')}
          <!-- Y-axis line -->
          <line x1="0" y1="0" x2="0" y2="${chartHeight}" stroke="#e5e7eb" stroke-width="1"/>
          <!-- X-axis line -->
          <line x1="0" y1="${chartHeight}" x2="${chartWidth}" y2="${chartHeight}" stroke="#e5e7eb" stroke-width="1"/>
        </g>
      </svg>
    `;
  };
  
  // Tentukan Y-axis range untuk setiap chart
  const getYRange = (data: { label: string; value: number }[], title: string) => {
    if (title.includes("MOST")) {
      return { min: -10, max: 10 };
    } else if (title.includes("LEAST") || title.includes("CHANGE")) {
      return { min: -4, max: 8 };
    }
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max(1, (max - min) * 0.1);
    return { min: Math.floor(min - padding), max: Math.ceil(max + padding) };
  };
  
  const mostRange = getYRange(data.graphs.most, "MOST");
  const leastRange = getYRange(data.graphs.least, "LEAST");
  const changeRange = getYRange(data.graphs.change, "CHANGE");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Psychotest Report - ${data.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Arial, sans-serif !important;
          margin: 0 !important;
          padding: 30px !important;
          background: #ffffff !important;
          color: #1f2937 !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
        }
        .header {
          text-align: center !important;
          border-bottom: 3px solid #2563eb !important;
          padding-bottom: 25px !important;
          margin-bottom: 35px !important;
          background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important;
          padding: 25px 20px !important;
          border-radius: 8px 8px 0 0 !important;
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
        .candidate-info {
          background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%) !important;
          padding: 25px !important;
          border-radius: 12px !important;
          margin-bottom: 30px !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        }
        .candidate-name {
          font-size: 24px !important;
          font-weight: bold !important;
          margin-bottom: 10px !important;
          color: #1f2937 !important;
        }
        .candidate-position {
          font-size: 18px !important;
          color: #6b7280 !important;
        }
        .scores-section {
          display: flex !important;
          gap: 20px !important;
          margin-bottom: 30px !important;
        }
        .score-card {
          flex: 1 !important;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 25px 20px !important;
          text-align: center !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
          transition: transform 0.2s !important;
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
        .section-title {
          font-size: 18px !important;
          font-weight: bold !important;
          margin-bottom: 20px !important;
          color: #1f2937 !important;
          border-bottom: 2px solid #e5e7eb !important;
          padding-bottom: 10px !important;
        }
        .character-description {
          margin-bottom: 30px !important;
        }
        .character-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 20px !important;
          margin-bottom: 20px !important;
        }
        .character-column {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 20px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        }
        .character-column-title {
          font-size: 14px !important;
          font-weight: bold !important;
          margin-bottom: 10px !important;
          color: #1f2937 !important;
        }
        .character-summary {
          font-size: 11px !important;
          color: #6b7280 !important;
          margin-bottom: 15px !important;
          text-transform: uppercase !important;
          line-height: 1.4 !important;
        }
        .character-list {
          list-style: none !important;
          padding: 0 !important;
        }
        .character-item {
          font-size: 12px !important;
          margin-bottom: 8px !important;
          padding-left: 15px !important;
          position: relative !important;
        }
        .character-item::before {
          content: "•" !important;
          position: absolute !important;
          left: 0 !important;
          font-size: 16px !important;
        }
        .personality-description {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 25px !important;
          margin-bottom: 30px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        }
        .personality-text {
          font-size: 14px !important;
          line-height: 1.8 !important;
          color: #374151 !important;
          text-align: justify !important;
        }
        .job-match {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 25px !important;
          margin-bottom: 30px !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        }
        .job-list {
          list-style: none !important;
          padding: 0 !important;
        }
        .job-item {
          font-size: 14px !important;
          margin-bottom: 10px !important;
          padding-left: 25px !important;
          position: relative !important;
        }
        .job-item::before {
          content: counter(job-counter) !important;
          counter-increment: job-counter !important;
          position: absolute !important;
          left: 0 !important;
          width: 20px !important;
          height: 20px !important;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          color: white !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 11px !important;
          font-weight: bold !important;
        }
        .job-list {
          counter-reset: job-counter !important;
        }
        .charts-section {
          margin-bottom: 30px !important;
        }
        .charts-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 20px !important;
          margin-bottom: 20px !important;
        }
        .chart-container {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 12px !important;
          padding: 20px !important;
          text-align: center !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        }
        .chart-title {
          font-size: 12px !important;
          font-weight: bold !important;
          margin-bottom: 5px !important;
          color: #1f2937 !important;
        }
        .chart-subtitle {
          font-size: 10px !important;
          color: #6b7280 !important;
          margin-bottom: 10px !important;
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
        <div style="color: #6b7280; font-size: 16px;">Hasil Tes Psikometri Kandidat</div>
      </div>

      <div class="candidate-info">
        <div class="candidate-name">${data.name}</div>
        <div class="candidate-position">${data.position}</div>
        ${data.completedAt ? `<div style="margin-top: 10px; font-size: 12px; color: #6b7280;">Periode: ${periodDate}</div>` : ''}
      </div>

      <div class="scores-section">
        <div class="score-card">
          <div class="score-title">Career Adaptability</div>
          <div class="score-value">${data.caas}</div>
          <div class="score-subtitle">Adaptability</div>
        </div>
        <div class="score-card">
          <div class="score-title">Fast Accuracy</div>
          <div class="score-value">${data.adaptability.score} / ${data.adaptability.totalQuestions}</div>
          <div class="score-subtitle">Correct Answers</div>
        </div>
        <div class="score-card">
          <div class="score-title">Total Question</div>
          <div class="score-value">${data.adaptability.totalQuestions}</div>
        </div>
      </div>

      <div class="charts-section">
        <div class="section-title">DISC Assessment Graphs</div>
        <div class="charts-grid">
          <div class="chart-container">
            <div class="chart-title">GRAPH 1 MOST</div>
            <div class="chart-subtitle">Make Public Self</div>
            ${createChartSVG(data.graphs.most, "#3b82f6", "GRAPH 1 MOST", mostRange.min, mostRange.max)}
          </div>
          <div class="chart-container">
            <div class="chart-title">GRAPH 2 LEAST</div>
            <div class="chart-subtitle">Core Private Self</div>
            ${createChartSVG(data.graphs.least, "#eab308", "GRAPH 2 LEAST", leastRange.min, leastRange.max)}
          </div>
          <div class="chart-container">
            <div class="chart-title">GRAPH 3 CHANGE</div>
            <div class="chart-subtitle">Mirror Perceived Self</div>
            ${createChartSVG(data.graphs.change, "#10b981", "GRAPH 3 CHANGE", changeRange.min, changeRange.max)}
          </div>
        </div>
      </div>

      <div class="character-description">
        <div class="section-title">Character Description</div>
        <div class="character-grid">
          <div class="character-column">
            <div class="character-column-title">User Public Self</div>
            <div class="character-summary">${data.characteristics.userPublic.join(", ")}</div>
            <ul class="character-list">
              ${data.characteristics.userPublic.map(item => `<li class="character-item" style="color: #3b82f6;">${item}</li>`).join('')}
            </ul>
          </div>
          <div class="character-column">
            <div class="character-column-title">Teammate Perspective</div>
            <div class="character-summary">${data.characteristics.teammate.join(", ")}</div>
            <ul class="character-list">
              ${data.characteristics.teammate.map(item => `<li class="character-item" style="color: #eab308;">${item}</li>`).join('')}
            </ul>
          </div>
          <div class="character-column">
            <div class="character-column-title">Intimate Partners Self</div>
            <div class="character-summary">${data.characteristics.intimate.join(", ")}</div>
            <ul class="character-list">
              ${data.characteristics.intimate.map(item => `<li class="character-item" style="color: #10b981;">${item}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>

      <div class="personality-description">
        <div class="section-title">Personality Description</div>
        <div class="personality-text">${data.personalityDescription}</div>
      </div>

      <div class="job-match">
        <div class="section-title">Job Match</div>
        <ul class="job-list">
          ${data.jobMatch.slice(0, 4).map(job => `<li class="job-item">${job}</li>`).join('')}
        </ul>
      </div>

      <div class="footer">
        <p>Laporan ini dibuat secara otomatis pada ${currentDate}</p>
        <p>DWP Psychotest System - Confidential Document</p>
      </div>
    </body>
    </html>
  `;
}

