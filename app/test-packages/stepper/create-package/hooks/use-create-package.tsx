"use client";

import { useEffect, useState } from "react";
import {
  createPackageService,
  CreateTestStep1Payload,
  Test,
} from "../service/create-package-service";
import { QuestionType } from "../../manage-question/service/manage-question-service";

// Hasil akhir yang dilempar ke parent
export type CreateNewTestResult = {
  testId: number;
  testName: string;
  icon: "square-code" | "graduation-cap" | "user-search";
  targetPosition: string;
  selectedTypes: QuestionType[];
  sections?: { section_id: number; section_type: QuestionType }[];
};

export const TEST_TYPES = [
  { label: "DISC", value: "DISC", icon: "briefcase" },
  { label: "CAAS", value: "CAAS", icon: "graduation-cap" },
  { label: "teliti", value: "teliti", icon: "users" },
];

export const TEMPLATES = [
  { label: "Manager", sequence: ["DISC", "CAAS"] },
  { label: "Fresh Graduate", sequence: ["CAAS", "teliti"] },
  { label: "Staff", sequence: ["DISC", "teliti"] },
];

const POSITION_TEMPLATE_MAP: Record<string, string> = {
  Managerial: "Manager",
  "Fresh Graduates": "Fresh Graduate",
  Staff: "Staff",
};

export function useCreateNewTestForm() {
  const [icon, setIcon] = useState<
    "square-code" | "graduation-cap" | "user-search"
  >("square-code");
  const [testName, setTestName] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [accessType, setAccessType] = useState("Public");

  const [selectedTypes, setSelectedTypes] = useState<
    { type: string; sequence: number }[]
  >([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // simpan hasil test dari BE
  const [createdTest, setCreatedTest] = useState<Test | null>(null);

  // auto pilih template sesuai target position
  useEffect(() => {
    const label = POSITION_TEMPLATE_MAP[targetPosition];
    if (label) {
      const template = TEMPLATES.find((t) => t.label === label);
      if (template) {
        setSelectedTypes(
          template.sequence.map((t, i) => ({ type: t, sequence: i + 1 }))
        );
        setSelectedTemplate(label);
      }
    }
  }, [targetPosition]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => {
      const exists = prev.find((t) => t.type === type);
      if (exists) {
        return prev.filter((t) => t.type !== type);
      }
      return [...prev, { type, sequence: prev.length + 1 }];
    });
    setSelectedTemplate(null);
  };

  const applyTemplate = (label: string) => {
    const template = TEMPLATES.find((t) => t.label === label);
    if (template) {
      setSelectedTypes(
        template.sequence.map((t, i) => ({ type: t, sequence: i + 1 }))
      );
      setSelectedTemplate(label);
    }
  };

  const handleSubmit = async (options?: {
    overrideTargetPosition?: string;
  }): Promise<CreateNewTestResult | null> => {
    if (loading) return null;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: CreateTestStep1Payload = {
        icon,
        name: testName,
        targetPosition: options?.overrideTargetPosition ?? targetPosition,
        types: selectedTypes,
      };

      // 🚀 call BE sekali aja
      const { test, raw } = await createPackageService.createNewTestStep1(payload);

      setCreatedTest(test);
      setSuccess(true);

      // ✅ Format ulang ke bentuk yang parent butuh
      return {
        testId: Number(test.id),
        testName: test.name,
        icon,
        targetPosition: payload.targetPosition,
        selectedTypes: selectedTypes.map((t) => t.type as QuestionType),
        sections: (raw?.sections ?? []).map((s) => ({
          section_id: s.id,
          section_type: s.section_type as QuestionType,
        })),
      };
    } catch (e: unknown) {
      if (typeof e === "string") {
        setError(e);
      } else if (e instanceof Error) {
        setError(e.message || "Failed to create test");
      } else {
        setError("Failed to create test");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    icon,
    setIcon,
    testName,
    setTestName,
    targetPosition,
    setTargetPosition,
    accessType,
    setAccessType,
    selectedTypes,
    setSelectedTypes,
    selectedTemplate,
    setSelectedTemplate,
    handleTypeToggle,
    applyTemplate,
    handleSubmit, // 🔑 return CreateNewTestResult
    createdTest,
    loading,
    error,
    success,
    setSuccess,
  };
}
