"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "@/hooks/use-toast"

interface JobData {
  title: string
  description: string
  requirements: string
  location: string
  job_type: string
  salary_range: string
  status: string
}

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<JobData>({
    title: "",
    description: "",
    requirements: "",
    location: "",
    job_type: "",
    salary_range: "",
    status: "active",
  })

  useEffect(() => {
    fetchJobDetails()
  }, [params.id])

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/jobs/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch job details")
      }

      const jobData = await response.json()
      setFormData({
        title: jobData.title || "",
        description: jobData.description || "",
        requirements: jobData.requirements || "",
        location: jobData.location || "",
        job_type: jobData.job_type || "",
        salary_range: jobData.salary_range || "",
        status: jobData.status || "active",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      })
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/jobs/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formData),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to update job")
      }

      toast({
        title: "Success",
        description: "Job updated successfully",
      })

      router.push("/company-dashboard/jobs")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job",
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
          <main className="flex-1 p-6">
            <div className="flex justify-center py-10">
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

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <h1 className="text-3xl font-bold dark:text-white">Edit Job Listing</h1>
            </div>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Job Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="dark:text-white">
                        Job Title
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="dark:text-white">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job_type" className="dark:text-white">
                        Job Type
                      </Label>
                      <Select
                        value={formData.job_type}
                        onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary_range" className="dark:text-white">
                        Salary Range
                      </Label>
                      <Input
                        id="salary_range"
                        value={formData.salary_range}
                        onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                        placeholder="e.g., $50,000 - $70,000"
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="dark:text-white">
                        Status
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="dark:text-white">
                      Job Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                      required
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements" className="dark:text-white">
                      Requirements
                    </Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      rows={4}
                      required
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                      {saving ? "Saving..." : "Update Job"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
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
