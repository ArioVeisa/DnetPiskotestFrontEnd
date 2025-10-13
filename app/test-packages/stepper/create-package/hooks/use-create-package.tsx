"use client";

import { useState } from "react";
import {
  createPackageService,
  updatePackageService,
  CreateTestStep1Payload,
} from "../service/create-package-service";
import { QuestionType } from "../../manage-question/service/manage-question-service";
import { IconKey } from "@/lib/icon-mapping";

export type CreateNewTestResult = {
  testId: number;
  testName: string;
  icon_path: IconKey;
  selectedTypes: QuestionType[];
  sections: { section_id: number; section_type: QuestionType }[];
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

export function useCreateNewTestForm() {
  const [icon, setIcon] = useState<IconKey>("square-code");
  const [testName, setTestName] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<{ type: string; sequence: number }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdTest, setCreatedTest] = useState<CreateNewTestResult | null>(null);

  /** ---------------------------
   * TYPE & TEMPLATE HANDLERS
   --------------------------- */
  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => {
      const exists = prev.find((t) => t.type === type);
      if (exists) return prev.filter((t) => t.type !== type);
      return [...prev, { type, sequence: prev.length + 1 }];
    });
    setSelectedTemplate(null);
  };

  const applyTemplate = (label: string) => {
    const template = TEMPLATES.find((t) => t.label === label);
    if (template) {
      setSelectedTypes(template.sequence.map((t, i) => ({ type: t, sequence: i + 1 })));
      setSelectedTemplate(label);
    }
  };

  /** ---------------------------
   * VALIDATION
   --------------------------- */
  const validate = () => {
    if (!testName.trim()) {
      setError("Test name is required");
      return false;
    }
    if (selectedTypes.length === 0) {
      setError("Please select at least one test type");
      return false;
    }
    return true;
  };

  /** ---------------------------
   * CREATE TEST
   --------------------------- */
  const createTest = async (): Promise<CreateNewTestResult | null> => {
    if (!validate()) return null;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: CreateTestStep1Payload = {
        icon_path: icon,
        name: testName,
        types: selectedTypes,
      };

      const { test, raw } = await createPackageService.createNewTestStep1(payload);

      const sections = (raw?.sections ?? []).map((s) => ({
        section_id: s.id,
        section_type: s.section_type as QuestionType,
      }));

      const result: CreateNewTestResult = {
        testId: Number(test.id),
        testName: test.name,
        icon_path: icon,
        selectedTypes: selectedTypes.map((t) => t.type as QuestionType),
        sections,
      };

      setCreatedTest(result);
      setSuccess(true);
      return result;
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  };

  /** ---------------------------
   * UPDATE TEST (selalu pakai updateTestStructure)
   --------------------------- */
  const updateTest = async (testId: number): Promise<CreateNewTestResult | null> => {
    if (!validate()) return null;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!createdTest) throw new Error("Existing test data not found");

      const payload = {
        name: testName,
        icon_path: icon,
        types: selectedTypes.map((t, idx) => ({
          type: t.type,
          sequence: idx + 1,
        })),
        existingSections: createdTest.sections.map((s, idx) => ({
          id: s.section_id,
          section_type: s.section_type,
          duration_minutes: 0,
          question_count: 0,
          sequence: idx + 1,
        })),
      };

      const { test, raw } = await updatePackageService.updateTestStructure(testId, payload);

      const sections = (raw?.sections ?? []).map((s) => ({
        section_id: s.id,
        section_type: s.section_type as QuestionType,
      }));

      const result: CreateNewTestResult = {
        testId: Number(test.id),
        testName: test.name,
        icon_path: icon,
        selectedTypes: selectedTypes.map((t) => t.type as QuestionType),
        sections,
      };

      setCreatedTest(result);
      setSuccess(true);
      return result;
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  };

  /** ---------------------------
   * AUTO DECIDER (Create or Update)
   --------------------------- */
  const handleSave = async (testId?: number): Promise<CreateNewTestResult | null> => {
    if (testId && testId > 0) {
      console.log("🛠 Update mode aktif");
      return await updateTest(testId);
    } else {
      console.log("✨ Create mode aktif");
      return await createTest();
    }
  };

  return {
    // state
    icon,
    setIcon,
    testName,
    setTestName,
    selectedTypes,
    setSelectedTypes,
    selectedTemplate,
    setSelectedTemplate,
    loading,
    error,
    success,
    setSuccess,
    createdTest,

    // handlers
    handleTypeToggle,
    applyTemplate,
    handleSave,
    createTest,
    updateTest,
  };
}
