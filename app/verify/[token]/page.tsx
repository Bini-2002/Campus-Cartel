"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function VerifyPage() {
  const params = useParams()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = params.token as string
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/verify-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          },
        )

        if (!response.ok) {
          throw new Error("Invalid or expired verification token")
        }

        setSuccess(true)
        toast({
          title: "Success",
          description: "Your account has been verified successfully!",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Verification failed",
          variant: "destructive",
        })
        setSuccess(false)
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [params.token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Account Verification
          </CardTitle>
          <CardDescription className="text-center text-gray-500 dark:text-gray-400">
            {verifying
              ? "Verifying your account..."
              : success
                ? "Your account has been verified successfully!"
                : "Verification failed. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          {verifying ? (
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
          ) : success ? (
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
              <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!verifying && (
            <Button onClick={() => router.push("/login")} className="bg-purple-600 hover:bg-purple-700">
              Go to Login
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
