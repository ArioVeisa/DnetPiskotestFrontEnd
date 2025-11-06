// /result-candidates/[id]/page.tsx

"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useResultCandidates } from "./hooks/use-result-candidates";
import { CandidateResult } from "./services/result-candidates-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Chart, ChartConfiguration } from "chart.js/auto";
import { Download } from "lucide-react";
import { generateDownloadContent } from "../../utils/generate-download-content";

export default function ResultCandidatePage() {
  const params = useParams();
  const id = params.id as string;
  const { data, loading, error } = useResultCandidates(id);

  const chartMostRef = useRef<HTMLCanvasElement>(null);
  const chartLeastRef = useRef<HTMLCanvasElement>(null);
  const chartChangeRef = useRef<HTMLCanvasElement>(null);
  const chartInstancesRef = useRef<Chart[]>([]);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Create chart
  const createChart = (
    canvas: HTMLCanvasElement | null,
    data: { label: string; value: number }[],
    color: string,
    title: string
  ) => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Determine Y-axis range based on data - sesuai dengan gambar Excel
    const allValues = data.map(d => d.value);
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
    // Set Y-axis range sesuai dengan gambar Excel
    let yMin, yMax;
    if (title.includes("MOST")) {
      yMin = -10;
      yMax = 10;
    } else if (title.includes("LEAST")) {
      yMin = -4;
      yMax = 8;
    } else if (title.includes("CHANGE")) {
      yMin = -4;
      yMax = 8;
    } else {
      // Fallback
      const range = maxValue - minValue;
      const padding = Math.max(1, range * 0.1);
      yMin = Math.floor(minValue - padding);
      yMax = Math.ceil(maxValue + padding);
    }

    const config: ChartConfiguration = {
      type: "line",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            borderColor: color,
            backgroundColor: `${color}20`,
            fill: true,
            tension: 0, // Garis lurus yang tegas
            pointRadius: 0, // Tidak ada titik (sesuai gambar Excel)
            pointHoverRadius: 0,
            pointBackgroundColor: color,
            pointBorderColor: color,
            borderWidth: 3, // Garis yang lebih tebal dan tegas
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { 
            enabled: true,
            callbacks: {
              title: () => title,
              label: (context) => `${context.label}: ${context.parsed.y}`
            }
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: true, color: '#e5e7eb' },
            ticks: {
              color: '#374151',
              font: { size: 12, weight: 'bold' }
            }
          },
          y: {
            grid: { 
              color: "#f3f4f6"
            },
            border: { display: true, color: '#e5e7eb' },
            ticks: { 
              stepSize: title.includes("MOST") ? 5 : 2, // Sesuai dengan gambar Excel
              color: '#374151',
              font: { size: 11 }
            },
            min: yMin,
            max: yMax,
          },
        },
      },
    };

    return new Chart(ctx, config);
  };

  // Initialize charts
  useEffect(() => {
    if (!data) return;

    // Destroy previous charts
    chartInstancesRef.current.forEach((chart) => chart.destroy());
    chartInstancesRef.current = [];

    // Create new charts
    const chart1 = createChart(
      chartMostRef.current,
      data.graphs.most,
      "#3b82f6",
      "GRAPH 1 MOST (Make Public Self)"
    );
    const chart2 = createChart(
      chartLeastRef.current,
      data.graphs.least,
      "#eab308",
      "GRAPH 2 LEAST (Core Private Self)"
    );
    const chart3 = createChart(
      chartChangeRef.current,
      data.graphs.change,
      "#10b981",
      "GRAPH 3 CHANGE (Mirror Perceived Self)"
    );

    if (chart1) chartInstancesRef.current.push(chart1);
    if (chart2) chartInstancesRef.current.push(chart2);
    if (chart3) chartInstancesRef.current.push(chart3);

    return () => {
      chartInstancesRef.current.forEach((chart) => chart.destroy());
    };
  }, [data]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Gagal memuat data kandidat"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Jika tidak ada data sama sekali, tampilkan loading
  if (!data) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Warning jika menggunakan dummy data */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ Data yang ditampilkan adalah data demo karena API tidak tersedia. Error: {error}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {/* Profile + Info */}
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-black text-3xl font-bold shadow-inner">
              {getInitials(data.name)}
            </div>

            {/* Text info */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold leading-tight">{data.name}</h1>
              <p className="text-lg text-muted-foreground font-medium tracking-wide">
                {data.position}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* CAAS, Fast Accuracy, Total Question - 3 Cards in Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Career Adaptability
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">{data.caas}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Adaptability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fast Accuracy
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {data.adaptability.score} /{" "}
                  <span className=" text-gray-400">
                    {data.adaptability.totalQuestions}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Correct Answers
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Question
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {data.adaptability.totalQuestions}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - 4 Columns (3 charts + job match) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">GRAPH 1 MOST</CardTitle>
            <p className="text-xs text-muted-foreground">Make Public Self</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <canvas ref={chartMostRef}></canvas>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">GRAPH 2 LEAST</CardTitle>
            <p className="text-xs text-muted-foreground">Core Private Self</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <canvas ref={chartLeastRef}></canvas>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              GRAPH 3 CHANGE
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Mirror Perceived Self
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <canvas ref={chartChangeRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Job Match - Moved here */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Job Match</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data?.jobMatch?.slice(0, 4).map((job, index) => {
              // Parse job string to extract title and subtitle
              const jobParts = job.split(' (');
              const title = jobParts[0];
              const subtitle = jobParts[1] ? jobParts[1].replace(')', '') : '';
              
              return (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium">{title}</h4>
                    {subtitle && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Characteristics & Personality */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Character Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Public Self */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">User Public Self</h3>
                  <p className="text-xs text-muted-foreground uppercase">
                    {data.characteristics.userPublic.join(", ")}
                  </p>
                </div>
                <div className="space-y-2">
                  {data.characteristics.userPublic.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teammate Perspective */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Teammate Perspective</h3>
                  <p className="text-xs text-muted-foreground uppercase">
                    {data.characteristics.teammate.join(", ")}
                  </p>
                </div>
                <div className="space-y-2">
                  {data.characteristics.teammate.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0"></div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intimate Partners Self */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">
                    Intimate Partners Self
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase">
                    {data.characteristics.intimate.join(", ")}
                  </p>
                </div>
                <div className="space-y-2">
                  {data.characteristics.intimate.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personality Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {data.personalityDescription}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer Buttons */}
      <div className="flex gap-3 pt-2 justify-between">
        <Button
          variant="outline"
          className="px-10 py-4 text-sm font-medium rounded-lg"
          onClick={() => window.history.back()}
        >
          Back
        </Button>

        <Button
          className="px-12 py-4 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 text-white justify-end"
          onClick={async () => {
            try {
              // Generate PDF content yang sama dengan view result
              const htmlContent = generateDownloadContent(data);
              
              // Import html2pdf secara dinamis
              const html2pdf = (await import('html2pdf.js')).default;
              
              const opt = {
                margin: [0.5, 0.5, 0.5, 0.5],
                filename: `${data.name.replace(/\s+/g, '_')}_psychotest_report.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                  scale: 2,
                  useCORS: false,
                  allowTaint: false,
                  backgroundColor: '#ffffff',
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
            } catch (error) {
              console.error("Error downloading report:", error);
              alert("Failed to download report. Please try again.");
            }
          }}
        >
          <Download />
          Download
        </Button>
      </div>
    </div>
  );
}