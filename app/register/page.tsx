"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// List of valid university domains
const VALID_UNIVERSITY_DOMAINS = [
  "edu.et", // Ethiopian universities
  "astu.edu.et", // Adama Science and Technology University
  "aau.edu.et", // Addis Ababa University
  "aastu.edu.et", // Addis Ababa Science and Technology University
  "edu", // General education domain
  "ac.uk", // UK universities
  "edu.au", // Australian universities
  "ac.za", // South African universities
  // Add more university domains as needed
]

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<"student" | "company">("student")
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [emailToVerify, setEmailToVerify] = useState("")
  const [emailError, setEmailError] = useState("")
  const [registrationData, setRegistrationData] = useState<any>(null)
  const { register } = useAuth()

  // Student form state
  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    university: "",
    yearOfStudy: 1,
  })

  // Company form state
  const [companyData, setCompanyData] = useState({
    companyName: "",
    email: "",
    password: "",
    industry: "",
    website: "",
  })

  const validateStudentEmail = (email: string) => {
    if (!email) return false

    // Check if the email has a valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }

    // Extract the domain part after @
    const domain = email.split("@")[1]

    // Check if the domain ends with any of the valid university domains
    const isUniversityEmail = VALID_UNIVERSITY_DOMAINS.some(
      (uniDomain) => domain === uniDomain || domain.endsWith("." + uniDomain),
    )

    if (!isUniversityEmail) {
      setEmailError("Please use a valid university email address")
      return false
    }

    setEmailError("")
    return true
  }

  const handleRegisterAndSendVerification = async (userData: any, type: "student" | "company") => {
    if (type === "student" && !validateStudentEmail(userData.email)) {
      return
    }

    setLoading(true)
    try {
      // First, register the user
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          userType: type,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Store registration data for later use
      setRegistrationData(data)
      setEmailToVerify(userData.email)
      setVerificationSent(true)

      toast({
        title: "Registration successful",
        description: "Please check your email for the verification code",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!emailToVerify || !accountType) return

    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailToVerify,
            userType: accountType,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend verification code")
      }

      toast({
        title: "Verification code resent",
        description: "Please check your email for the new verification code",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndComplete = async () => {
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
      // Verify the code
      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailToVerify,
            code: verificationCode,
            userType: accountType,
          }),
        },
      )

      const verifyData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "Invalid verification code")
      }

      // If verification successful, complete the registration process
      if (registrationData) {
        // Store the token and user data
        localStorage.setItem("token", registrationData.token)
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...registrationData.user,
            isVerified: true,
          }),
        )

        toast({
          title: "Success",
          description: "Account verified successfully!",
        })

        // Redirect based on user type
        if (accountType === "student") {
          window.location.href = "/dashboard"
        } else {
          window.location.href = "/company-dashboard"
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Verification failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStudentEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setStudentData({ ...studentData, email })
    validateStudentEmail(email)
  }

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStudentEmail(studentData.email)) {
      return
    }
    handleRegisterAndSendVerification(studentData, "student")
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    handleRegisterAndSendVerification(companyData, "company")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            Join CampusCraft to showcase your talent or discover it
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationSent ? (
            <div className="space-y-4">
              <Alert className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verification Required</AlertTitle>
                <AlertDescription>
                  We've sent a verification code to {emailToVerify}. Please check your email and enter the code below.
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
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  maxLength={6}
                  required
                />
              </div>
              <Button
                onClick={handleVerifyAndComplete}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify and Complete Registration"}
              </Button>
              <div className="flex flex-col space-y-2 text-center text-sm">
                <button
                  onClick={handleResendVerification}
                  className="text-purple-600 hover:underline"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Resend verification code"}
                </button>
                <button onClick={() => setVerificationSent(false)} className="text-gray-600 hover:underline">
                  Go back to registration
                </button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="student" onValueChange={(value) => setAccountType(value as "student" | "company")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>

              <TabsContent value="student">
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-900 dark:text-white">
                        First name
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={studentData.firstName}
                        onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-900 dark:text-white">
                        Last name
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={studentData.lastName}
                        onChange={(e) => setStudentData({ ...studentData, lastName: e.target.value })}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900 dark:text-white">
                      University email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@university.edu"
                      value={studentData.email}
                      onChange={handleStudentEmailChange}
                      className={`bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 ${
                        emailError ? "border-red-500 dark:border-red-500" : ""
                      }`}
                      required
                    />
                    {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Must be a valid university email address (e.g., name@astu.edu.et)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university" className="text-gray-900 dark:text-white">
                      University
                    </Label>
                    <Input
                      id="university"
                      placeholder="University of Technology"
                      value={studentData.university}
                      onChange={(e) => setStudentData({ ...studentData, university: e.target.value })}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-900 dark:text-white">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={studentData.password}
                      onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Year of study</Label>
                    <RadioGroup
                      value={studentData.yearOfStudy.toString()}
                      onValueChange={(value) => setStudentData({ ...studentData, yearOfStudy: Number.parseInt(value) })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="year1" />
                        <Label htmlFor="year1" className="text-gray-900 dark:text-white">
                          1st year
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="year2" />
                        <Label htmlFor="year2" className="text-gray-900 dark:text-white">
                          2nd year
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="year3" />
                        <Label htmlFor="year3" className="text-gray-900 dark:text-white">
                          3rd year
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="4" id="year4" />
                        <Label htmlFor="year4" className="text-gray-900 dark:text-white">
                          4th year
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="5" id="year5" />
                        <Label htmlFor="year5" className="text-gray-900 dark:text-white">
                          5th year
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="company">
                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-gray-900 dark:text-white">
                      Company name
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="Tech Company Inc."
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyEmail" className="text-gray-900 dark:text-white">
                      Company email
                    </Label>
                    <Input
                      id="companyEmail"
                      type="email"
                      placeholder="contact@techcompany.com"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyPassword" className="text-gray-900 dark:text-white">
                      Password
                    </Label>
                    <Input
                      id="companyPassword"
                      type="password"
                      value={companyData.password}
                      onChange={(e) => setCompanyData({ ...companyData, password: e.target.value })}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-gray-900 dark:text-white">
                      Industry
                    </Label>
                    <Input
                      id="industry"
                      placeholder="Software Development"
                      value={companyData.industry}
                      onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-gray-900 dark:text-white">
                      Website (optional)
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://techcompany.com"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
