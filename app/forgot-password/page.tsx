"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"

enum ResetStep {
  EMAIL = 0,
  VERIFICATION = 1,
  NEW_PASSWORD = 2,
  SUCCESS = 3,
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentStep, setCurrentStep] = useState<ResetStep>(ResetStep.EMAIL)
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState<"student" | "company">("student")

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, userType }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send verification code")
      }

      toast({
        title: "Verification code sent",
        description: "Please check your email for the verification code",
      })
      setCurrentStep(ResetStep.VERIFICATION)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/verify-reset-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code: verificationCode, userType }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Invalid verification code")
      }

      setCurrentStep(ResetStep.NEW_PASSWORD)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Invalid verification code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please enter and confirm your new password",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code: verificationCode,
            newPassword,
            userType,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reset password")
      }

      setCurrentStep(ResetStep.SUCCESS)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            {currentStep !== ResetStep.EMAIL && (
              <Button variant="ghost" size="sm" className="mr-2" onClick={() => setCurrentStep((prev) => prev - 1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStep === ResetStep.EMAIL && "Forgot Password"}
              {currentStep === ResetStep.VERIFICATION && "Verify Email"}
              {currentStep === ResetStep.NEW_PASSWORD && "Reset Password"}
              {currentStep === ResetStep.SUCCESS && "Password Reset Successful"}
            </CardTitle>
          </div>
          <CardDescription className="text-gray-500 dark:text-gray-400">
            {currentStep === ResetStep.EMAIL && "Enter your email to reset your password"}
            {currentStep === ResetStep.VERIFICATION && "Enter the verification code sent to your email"}
            {currentStep === ResetStep.NEW_PASSWORD && "Create a new password for your account"}
            {currentStep === ResetStep.SUCCESS && "Your password has been reset successfully"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === ResetStep.EMAIL && (
            <form onSubmit={handleSendVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-900 dark:text-white">Account Type</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="student"
                      name="userType"
                      value="student"
                      checked={userType === "student"}
                      onChange={() => setUserType("student")}
                      className="mr-2"
                    />
                    <Label htmlFor="student" className="text-gray-900 dark:text-white">
                      Student
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="company"
                      name="userType"
                      value="company"
                      checked={userType === "company"}
                      onChange={() => setUserType("company")}
                      className="mr-2"
                    />
                    <Label htmlFor="company" className="text-gray-900 dark:text-white">
                      Company
                    </Label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          )}

          {currentStep === ResetStep.VERIFICATION && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Check your email</AlertTitle>
                <AlertDescription>
                  We've sent a verification code to {email}. Please check your email and enter the code below.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-gray-900 dark:text-white">
                  Verification Code
                </Label>
                <Input
                  id="verificationCode"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          )}

          {currentStep === ResetStep.NEW_PASSWORD && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-900 dark:text-white">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-white">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  required
                />
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          {currentStep === ResetStep.SUCCESS && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
              <Button onClick={() => router.push("/login")} className="w-full bg-purple-600 hover:bg-purple-700">
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
