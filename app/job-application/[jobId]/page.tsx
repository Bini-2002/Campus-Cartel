"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Building, MapPin, Upload } from "lucide-react"
import { api, type JobListing } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import ProtectedRoute from "@/components/protected-route"

export default function JobApplicationPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<JobListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [resume, setResume] = useState<File | null>(null)

  // Unwrap params using React.use()
  const resolvedParams = use(params)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobs = await api.getJobs()
        const foundJob = jobs.find((j) => j.id === Number(resolvedParams.jobId))
        if (foundJob) {
          setJob(foundJob)
        } else {
          toast({
            title: "Error",
            description: "Job not found",
            variant: "destructive",
          })
          router.push("/dashboard")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch job details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [resolvedParams.jobId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("jobId", resolvedParams.jobId)
      formData.append("coverLetter", coverLetter)

      if (resume) {
        formData.append("resume", resume)
      }

      await api.submitApplication(formData)

      toast({
        title: "Success",
        description: "Application submitted successfully!",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Job not found</h1>
          <p className="mt-2 text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute requiredUserType="student">
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold">Apply for Position</h1>
            <p className="text-gray-500 mt-2">Complete the form below to apply for this job</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center text-gray-500">
                  <Building className="h-4 w-4 mr-1" /> {job.companyName}
                </div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" /> {job.location}
                </div>
                <div className="flex items-center text-gray-500">
                  <Briefcase className="h-4 w-4 mr-1" />{" "}
                  {job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : "Job"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-gray-100 text-gray-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Explain why you're a good fit for this position..."
                    className="min-h-[200px]"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume/CV</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={submitting || !coverLetter}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
