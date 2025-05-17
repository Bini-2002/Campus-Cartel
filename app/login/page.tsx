"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [accountType, setAccountType] = useState<"student" | "company">("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [verificationNeeded, setVerificationNeeded] = useState(false)
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password, accountType)
      toast({
        title: "Success",
        description: "Logged in successfully!",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"

      // Check if the error is due to unverified account
      if (errorMessage.includes("not verified") || errorMessage.includes("verification")) {
        setVerificationNeeded(true)
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, userType: accountType }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to resend verification")
      }

      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification link",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">Sign in</CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationNeeded && (
            <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Account not verified</AlertTitle>
              <AlertDescription>
                Your account has not been verified yet. Please check your email for the verification link or{" "}
                <button onClick={handleResendVerification} className="text-yellow-800 dark:text-yellow-200 underline">
                  click here
                </button>{" "}
                to resend the verification email.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="student" onValueChange={(value) => setAccountType(value as "student" | "company")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={accountType === "student" ? "john.doe@university.edu" : "contact@company.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-900 dark:text-white">
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-sm text-purple-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? "Signing in..." : `Sign in as ${accountType === "student" ? "Student" : "Company"}`}
              </Button>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-purple-600 hover:underline">
              Create account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
