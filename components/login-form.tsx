"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"login" | "verify">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to send OTP")
        return
      }

      setStep("verify")
    } catch (err) {
      setError(`Something went wrong. ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Invalid OTP")
        return
      }

      // Redirect berdasarkan role
      const role = data.user?.role?.id
      if (role === 1 || role === 2) {
        window.location.href = "/dashboard"
      } else if (role === 3) {
        window.location.href = "/ticket"
      } else {
        window.location.href = "/"
      }
    } catch (err) {
      setError(`Something went wrong. ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={step === "login" ? handleRequestOtp : handleVerifyOtp}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {step === "login" ? "Login to your account" : "Authentication Two Factor"}
        </h1>
        <p className="text-muted-foreground text-sm text-balance">
          {step === "login"
            ? "Enter your email & password to request OTP"
            : "Enter the 6-digit code sent to your email"}
        </p>
      </div>

      <div className="grid gap-6">
        {step === "login" && (
          <>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {step === "verify" && (
          <div className="flex flex-col items-center gap-3">
            <Label>OTP Code</Label>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              value={otp}
              onChange={setOtp}
              className="justify-center"
            >
              <InputOTPGroup>
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button className="w-full" type="submit" disabled={loading}>
          {loading
            ? step === "login"
              ? "Sending OTP..."
              : "Verifying..."
            : step === "login"
              ? "Request OTP"
              : "Verify OTP"}
        </Button>
      </div>

      {step === "login" && (
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="underline underline-offset-4">
            Register
          </Link>
        </div>
      )}
    </form>
  )
}