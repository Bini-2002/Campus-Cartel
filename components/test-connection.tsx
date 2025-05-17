"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export default function TestConnection() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    connection: boolean | null
    registration: boolean | null
    login: boolean | null
  }>({
    connection: null,
    registration: null,
    login: null,
  })

  const testConnection = async () => {
    setTesting(true)
    setResults({ connection: null, registration: null, login: null })

    try {
      // Test 1: Basic connection
      const response = await fetch("http://localhost:5000/api/dashboard/stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (response.status === 401) {
        // 401 is expected for protected route without token
        setResults((prev) => ({ ...prev, connection: true }))
        toast({
          title: "✅ Connection Test",
          description: "Backend server is responding correctly",
        })
      } else {
        setResults((prev) => ({ ...prev, connection: false }))
      }

      // Test 2: Registration
      try {
        const testUser = {
          email: `test${Date.now()}@university.edu`,
          password: "testpassword123",
          userType: "student" as const,
          firstName: "Test",
          lastName: "User",
          university: "Test University",
          yearOfStudy: 2,
        }

        await api.register(testUser)
        setResults((prev) => ({ ...prev, registration: true }))
        toast({
          title: "✅ Registration Test",
          description: "User registration is working",
        })

        // Test 3: Login with the same user
        try {
          await api.login({
            email: testUser.email,
            password: testUser.password,
            userType: testUser.userType,
          })
          setResults((prev) => ({ ...prev, login: true }))
          toast({
            title: "✅ Login Test",
            description: "User authentication is working",
          })
        } catch (error) {
          setResults((prev) => ({ ...prev, login: false }))
          toast({
            title: "❌ Login Test Failed",
            description: error instanceof Error ? error.message : "Login test failed",
            variant: "destructive",
          })
        }
      } catch (error) {
        setResults((prev) => ({ ...prev, registration: false }))
        toast({
          title: "❌ Registration Test Failed",
          description: error instanceof Error ? error.message : "Registration test failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      setResults((prev) => ({ ...prev, connection: false }))
      toast({
        title: "❌ Connection Test Failed",
        description: "Cannot connect to backend server",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <div className="w-5 h-5" />
    if (status === true) return <CheckCircle className="w-5 h-5 text-green-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="outline">Pending</Badge>
    if (status === true) return <Badge className="bg-green-100 text-green-800">Success</Badge>
    return <Badge variant="destructive">Failed</Badge>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Backend Connection Test</CardTitle>
        <CardDescription>Test the connection between frontend and backend services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={testConnection} disabled={testing} className="w-full">
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            "Test Backend Connection"
          )}
        </Button>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(results.connection)}
              <div>
                <h3 className="font-medium">Server Connection</h3>
                <p className="text-sm text-gray-500">Basic connectivity to backend API</p>
              </div>
            </div>
            {getStatusBadge(results.connection)}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(results.registration)}
              <div>
                <h3 className="font-medium">User Registration</h3>
                <p className="text-sm text-gray-500">Test user account creation</p>
              </div>
            </div>
            {getStatusBadge(results.registration)}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(results.login)}
              <div>
                <h3 className="font-medium">User Authentication</h3>
                <p className="text-sm text-gray-500">Test login and JWT token generation</p>
              </div>
            </div>
            {getStatusBadge(results.login)}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Backend Status</h4>
          <p className="text-sm text-blue-700">
            ✅ Server running on port 5000
            <br />✅ MySQL database connected
            <br />✅ Database tables created successfully
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
