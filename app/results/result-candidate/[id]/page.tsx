// /result-candidates/[id]/page.tsx

"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useResultCandidates } from "./hooks/use-result-candidates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { Chart, ChartConfiguration } from "chart.js/auto";
import { Download } from "lucide-react";


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
    color: string
  ) => {
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
          },
          y: {
            grid: { color: "#f0f0f0" },
            border: { display: false },
            ticks: { stepSize: 2 },
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
      "#3b82f6"
    );
    const chart2 = createChart(
      chartLeastRef.current,
      data.graphs.least,
      "#eab308"
    );
    const chart3 = createChart(
      chartChangeRef.current,
      data.graphs.change,
      "#10b981"
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

  if (error || !data) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Failed to load candidate data"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(data.name)}
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{data.name}</h1>
                <p className="text-sm text-muted-foreground">
                  👤 {data.position}
                </p>
              </div>
              <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                More Info
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Job Match
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground">
              Show more
            </button>
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
                <p className="text-xs text-muted-foreground mt-1">Assessment</p>
              </div>
              <button className="p-2 hover:bg-accent rounded-md">
                <ArrowUpRight className="w-5 h-5" />
              </button>
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
                  {data.adaptability.score.toFixed(3)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Correct Answers
                </p>
              </div>
              <button className="p-2 hover:bg-accent rounded-md">
                <ArrowUpRight className="w-5 h-5" />
              </button>
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
                <p className="text-xs text-muted-foreground mt-1">Overall</p>
              </div>
              <button className="p-2 hover:bg-accent rounded-md">
                <ArrowUpRight className="w-5 h-5" />
              </button>
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
            {[
              { title: "Researcher", subtitle: "Human and Quality Control" },
              { title: "Engineer", subtitle: "Project Supervisor" },
              { title: "Statistician", subtitle: "" },
              { title: "Surveyor", subtitle: "" },
            ].map((job, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium">{job.title}</h4>
                  {job.subtitle && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {job.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <Button
              variant="link"
              className="w-full text-primary p-0 h-auto text-xs"
            >
              Show more
            </Button>
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
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">User Public Self</h3>
                  <p className="text-xs text-muted-foreground">
                    PEACEMAKER, RESPECTFUL & ACCURATE
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

              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Teammate Perspective</h3>
                  <p className="text-xs text-muted-foreground">
                    PEACEMAKER, RESPECTFUL & ACCURATE
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

              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">
                    Intimate Partners Self
                  </h3>
                  <p className="text-xs text-muted-foreground">PERFECTIONIST</p>
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
          onClick={() => {
            // Ganti dengan logika download kamu
            const element = document.createElement("a");
            const file = new Blob(["Report data here"], { type: "text/plain" });
            element.href = URL.createObjectURL(file);
            element.download = `${data.name}-report.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
        >
          <Download />
          Download
        </Button>
      </div>
    </div>
  );
}
