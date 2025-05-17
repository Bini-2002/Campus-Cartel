"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BellRing, Plus, Search } from "lucide-react"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import JobListingCard from "@/components/job-listing-card"
import ApplicantCard from "@/components/applicant-card"
import ProtectedRoute from "@/components/protected-route"
import { useEffect, useState } from "react"
import { api, type DashboardStats, type JobListing, type Application } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function CompanyDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({})
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  const handleJobDelete = (deletedJobId: number) => {
    setJobs(jobs.filter((job) => job.id !== deletedJobId))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return

        const [statsData, jobsData, applicationsData] = await Promise.all([
          api.getDashboardStats(),
          api.getJobs({ companyId: user.id }),
          api.getApplications({ companyId: user.id }),
        ])

        setStats(statsData)
        setJobs(jobsData)
        setApplications(applicationsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const handlePostJob = () => {
    router.push("/company-dashboard/post-job")
  }

  return (
    <ProtectedRoute requiredUserType="company">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <CompanyDashboardNav />

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold dark:text-white">Company Dashboard</h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <BellRing className="h-4 w-4" />
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" /> Post Job
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium dark:text-white">Active Listings</CardTitle>
                  <CardDescription className="dark:text-gray-300">Current job and internship postings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.activeListings || 0}</div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium dark:text-white">Applications</CardTitle>
                  <CardDescription className="dark:text-gray-300">Total applications received</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.applications || 0}</div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium dark:text-white">Profile Views</CardTitle>
                  <CardDescription className="dark:text-gray-300">
                    How many students viewed your company
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.profileViews || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="listings">
              <TabsList>
                <TabsTrigger value="listings">Job Listings</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="talent">Talent Pool</TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="space-y-4">
                <div className="flex justify-between items-center mt-6">
                  <h2 className="text-xl font-semibold dark:text-white">Your Job Listings</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search listings..."
                        className="pl-8 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : jobs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 mt-4">
                    {jobs.map((job) => (
                      <JobListingCard
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        description={job.description}
                        type={job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : "Job"}
                        location={job.location}
                        applicants={job.applicationsCount}
                        posted={new Date(job.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        status={job.status ? (job.status.charAt(0).toUpperCase() + job.status.slice(1)) as "Active" | "Paused" | "Closed" : "Active"}
                        onDelete={handleJobDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mb-4 text-gray-400">
                      <Plus className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No job listings yet</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-300">Get started by posting your first job</p>
                    <Button className="mt-4 bg-purple-600 hover:bg-purple-700"  onClick={() => router.push("/company-dashboard/post-job")}>
                      Post Job
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="applications" className="space-y-4">
                <div className="flex justify-between items-center mt-6">
                  <h2 className="text-xl font-semibold dark:text-white">Recent Applications</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search applicants..."
                        className="pl-8 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : applications.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 mt-4">
                    {applications.map((application) => (
                      <ApplicantCard
                        key={application.id}
                        name={`${application.firstName} ${application.lastName}`}
                        university={application.university}
                        position={application.jobTitle}
                        skills={[]} // We need to add skills to the application API response
                        applied={new Date(application.appliedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        status={(application.status.charAt(0).toUpperCase() + application.status.slice(1)) as "New" | "Reviewed" | "Interviewing" | "Rejected" | "Hired"}
                        applicationId={application.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No applications yet</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-300">
                      When students apply to your job listings, they will appear here
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="talent" className="space-y-4">
                {/* Talent pool section remains the same for now */}
                <div className="flex justify-between items-center mt-6">
                  <h2 className="text-xl font-semibold dark:text-white">Discover Talent</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="pl-8 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="text-center py-10">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Talent discovery coming soon</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-300">
                    We're working on a feature to help you discover talented students
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
