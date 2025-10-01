"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { resetPasswordService } from "../services/reset-password-service";

export default function ResetEmailForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.includes("@")) {
      setError("Email harus berisi karakter '@'");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordService.requestReset(email);
      setSuccess(res.message);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to send reset link.");
      } else {
        setError("Unexpected error occurred.");
      }
    } finally {
      setLoading(false); // ✅ jangan lupa reset
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
        <p className="text-gray-500 text-sm">
          Enter your email and we’ll send you a link to reset your password.
        </p>
      </div>
      <div>
        <Label htmlFor="email" className="mb-2 font-semibold">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="example@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
      <Button
        type="submit"
        className="w-full bg-primary font-semibold"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>
    </form>
  );
}
