"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Users } from "lucide-react"
import ApplicantCard from "@/components/applicant-card"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "@/hooks/use-toast"

interface Application {
  id: number
  student_id: number
  status: string
  applied_at: string
  first_name: string
  last_name: string
  university: string
  email: string
}

interface JobDetails {
  id: number
  title: string
  description: string
  location: string
  job_type: string
}

export default function JobApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobApplicants()
  }, [params.id])

  const fetchJobApplicants = async () => {
    try {
      const [applicationsResponse, jobResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/jobs/${params.id}/applications`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/jobs/${params.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ])

      if (!applicationsResponse.ok || !jobResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const applicationsData = await applicationsResponse.json()
      const jobData = await jobResponse.json()

      setApplications(applicationsData)
      setJobDetails(jobData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load job applicants",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = () => {
    fetchJobApplicants()
  }

  return (
    <ProtectedRoute requiredUserType="company">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <CompanyDashboardNav />

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold dark:text-white">{jobDetails?.title || "Job"} - Applicants</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {applications.length} applicant{applications.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <ApplicantCard
                    key={application.id}
                    name={`${application.first_name} ${application.last_name}`}
                    university={application.university}
                    position={jobDetails?.title || "Position"}
                    skills={[]}
                    applied={new Date(application.applied_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    status={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    applicationId={application.id}
                    studentId={application.student_id}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center dark:bg-gray-800 dark:border-gray-700">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No applicants yet</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Applications will appear here when students apply to this job.
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
