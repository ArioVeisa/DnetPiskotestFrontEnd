// /app/(tes-session)/hooks/use-invite-email.ts
"use client";

import { useState, useCallback } from "react";
import {
  emailInviteService,
  InvitePayload,
  InviteResponse,
} from "../service/email-invite-service";

export function useInviteEmail() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InviteResponse | null>(null);

  const sendInvite = useCallback(async (payload: InvitePayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await emailInviteService.sendInvite(payload);
      setResult(res);
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    result,
    sendInvite,
  };
}
