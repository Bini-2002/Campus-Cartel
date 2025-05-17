"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Plus, Search } from "lucide-react"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import JobListingCard from "@/components/job-listing-card"
import { useEffect, useState } from "react"
import { api, type JobListing } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import ProtectedRoute from "@/components/protected-route"
import { useRouter } from "next/navigation"

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  const handleJobDelete = (deletedJobId: number) => {
    setJobs(jobs.filter((job) => job.id !== deletedJobId))
  }

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        if (user) {
          const jobsData = await api.getJobs({ companyId: user.id })
          setJobs(jobsData)
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchJobs()
    }
  }, [user])

  return (
    <ProtectedRoute requiredUserType="company">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <CompanyDashboardNav />

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold dark:text-white">Job Listings</h1>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push("/company-dashboard/post-job")}
              >
                <Plus className="h-4 w-4 mr-2" /> Post New Job
              </Button>
            </div>

            <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search job listings..."
                    className="pl-8 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
              </div>
            </Card>

            <Tabs defaultValue="all">
              <TabsList className="dark:bg-gray-800 dark:border-gray-700">
                <TabsTrigger value="all">All Listings</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="paused">Paused</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : jobs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 mt-6">
                    {jobs.map((job) => (
                      <JobListingCard
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        description={job.description}
                        type={job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : "Job"}
                        location={job.location}
                        applicants={job.applicationsCount || 0}
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
                    <div className="mb-4 text-gray-400 dark:text-gray-300">
                      <Plus className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No job listings yet</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-300">Get started by posting your first job</p>
                    <Button
                      className="mt-4 bg-purple-600 hover:bg-purple-700"
                      onClick={() => router.push("/company-dashboard/post-job")}
                    >
                      Post Job
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                <div className="grid grid-cols-1 gap-6 mt-6">
                  {jobs
                    .filter((job) => job.status === "active")
                    .map((job) => (
                      <JobListingCard
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        description={job.description}
                        type={job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : "Job"}
                        location={job.location}
                        applicants={job.applicationsCount || 0}
                        posted={new Date(job.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                        status="Active"
                        onDelete={handleJobDelete}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
