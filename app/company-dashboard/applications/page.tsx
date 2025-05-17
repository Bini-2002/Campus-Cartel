"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users } from "lucide-react"
import ApplicantCard from "@/components/applicant-card"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"

interface Application {
  id: number
  job_id: number
  student_id: number
  cover_letter: string
  resume_url: string
  status: "new" | "reviewed" | "interviewing" | "rejected" | "hired"
  applied_at: string
  job_title: string
  job_type: string
  location: string
  first_name: string
  last_name: string
  university: string
  email: string
  company_name: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/applications?companyId=${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch applications")
      }

      const data = await response.json()
      setApplications(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = () => {
    fetchApplications()
  }

  const filteredApplications = applications.filter(
    (app) =>
      `${app.first_name} ${app.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.university.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getApplicationsByStatus = (status: string) => {
    if (status === "all") return filteredApplications
    return filteredApplications.filter((app) => app.status === status)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const ApplicationsList = ({ applications }: { applications: Application[] }) => (
    <div className="space-y-4">
      {applications.length > 0 ? (
        applications.map((application) => (
          <ApplicantCard
            key={application.id}
            name={`${application.first_name} ${application.last_name}`}
            university={application.university}
            position={application.job_title}
            skills={[]}
            applied={formatDate(application.applied_at)}
            status={(application.status.charAt(0).toUpperCase() + application.status.slice(1)) as any}
            applicationId={application.id}
            studentId={application.student_id}
            onStatusUpdate={handleStatusUpdate}
          />
        ))
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-4 text-gray-400">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No applications found</h3>
          <p className="mt-1 text-gray-500 text-sm dark:text-gray-400">
            {searchTerm ? "Try adjusting your search terms." : "Applications will appear here when students apply."}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <ProtectedRoute requiredUserType="company">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <CompanyDashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Applications</h1>
            </div>

            <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search applications by name, position, or university..."
                  className="pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Card>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="w-full bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <TabsTrigger
                      value="all"
                      className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                    >
                      All ({getApplicationsByStatus("all").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="new"
                      className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                    >
                      New ({getApplicationsByStatus("new").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviewed"
                      className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                    >
                      Reviewed ({getApplicationsByStatus("reviewed").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="interviewing"
                      className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                    >
                      Interviewing ({getApplicationsByStatus("interviewing").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="hired"
                      className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                    >
                      Hired ({getApplicationsByStatus("hired").length})
                    </TabsTrigger>
                  </TabsList>

                  <div className="p-6 bg-white dark:bg-gray-800">
                    <TabsContent value="all" className="mt-0">
                      <ApplicationsList applications={getApplicationsByStatus("all")} />
                    </TabsContent>

                    <TabsContent value="new" className="mt-0">
                      <ApplicationsList applications={getApplicationsByStatus("new")} />
                    </TabsContent>

                    <TabsContent value="reviewed" className="mt-0">
                      <ApplicationsList applications={getApplicationsByStatus("reviewed")} />
                    </TabsContent>

                    <TabsContent value="interviewing" className="mt-0">
                      <ApplicationsList applications={getApplicationsByStatus("interviewing")} />
                    </TabsContent>

                    <TabsContent value="hired" className="mt-0">
                      <ApplicationsList applications={getApplicationsByStatus("hired")} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
