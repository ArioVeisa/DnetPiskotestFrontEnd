"use client";
import { useAuthFormState } from "../hooks/use-auth-form";
import Link from "next/link";
import PasswordInput from "./password-input";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AuthForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    remember,
    toggleRemember,
    loading,
    error,
    handleSubmit,
  } = useAuthFormState();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Welcome Back</h1>
        <p className="text-muted-foreground text-sm">
          Login into your account to continue!
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john.doe@company.com"
            className="pl-8 pr-3 py-3 text-sm"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <PasswordInput
            value={password}
            onChange={setPassword}
            inputClassName="pl-8 pr-3 py-3 text-sm"
          />
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={toggleRemember}
          />
          <Label htmlFor="remember" className="text-sm cursor-pointer">
            Remember Me
          </Label>
        </div>
        <Link
          href="/login/reset-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      {/* Error */}
      {error && <div className="text-red-500 text-xs">{error}</div>}

      {/* Button */}
      <Button type="submit" className="w-full font-semibold rounded-lg py-3">
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
