"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"

interface JobData {
  id: number
  title: string
  description: string
  requirements: string
  type: string
  location: string
  salary_min: number
  salary_max: number
  status: string
}

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [jobData, setJobData] = useState<JobData | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    type: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    status: "Active",
  })

  useEffect(() => {
    fetchJobData()
  }, [jobId])

  const fetchJobData = async () => {
    try {
      console.log("Fetching job data for ID:", jobId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Error response:", errorData)
        throw new Error(`Failed to fetch job data: ${response.status}`)
      }

      const job = await response.json()
      console.log("Job data received:", job)
      setJobData(job)
      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        type: job.type || "",
        location: job.location || "",
        salaryMin: job.salary_min?.toString() || "",
        salaryMax: job.salary_max?.toString() || "",
        status: job.status || "Active",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load job data",
        variant: "destructive",
      })
      router.push("/company-dashboard/jobs")
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          type: formData.type,
          location: formData.location,
          salaryMin: formData.salaryMin ? Number.parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? Number.parseInt(formData.salaryMax) : null,
          status: formData.status,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update job")
      }

      toast({
        title: "Success",
        description: "Job listing updated successfully",
      })

      router.push("/company-dashboard/jobs")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job listing",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="company">
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <CompanyDashboardNav />
          <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredUserType="company">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <CompanyDashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/company-dashboard/jobs")}
                className="border-gray-300 dark:border-gray-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Job Listing</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Update your job posting details</p>
              </div>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-white dark:bg-gray-800">
                <CardTitle className="text-gray-900 dark:text-white">Job Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white dark:bg-gray-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-gray-900 dark:text-white">
                        Job Title *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-gray-900 dark:text-white">
                        Job Type *
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-900 dark:text-white">
                        Location *
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        required
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-gray-900 dark:text-white">
                        Status
                      </Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Paused">Paused</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="salaryMin" className="text-gray-900 dark:text-white">
                        Minimum Salary
                      </Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        value={formData.salaryMin}
                        onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                        placeholder="e.g., 50000"
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salaryMax" className="text-gray-900 dark:text-white">
                        Maximum Salary
                      </Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        value={formData.salaryMax}
                        onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                        placeholder="e.g., 80000"
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-900 dark:text-white">
                      Job Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                      className="min-h-[200px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      placeholder="Describe the role, responsibilities, and what you're looking for..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements" className="text-gray-900 dark:text-white">
                      Requirements *
                    </Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange("requirements", e.target.value)}
                      required
                      className="min-h-[150px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      placeholder="List the required skills, experience, and qualifications..."
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/company-dashboard/jobs")}
                      className="border-gray-300 dark:border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                      {saving ? "Updating..." : "Update Job"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
