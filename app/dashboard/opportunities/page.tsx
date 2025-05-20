"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Search } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import JobCard from "@/components/job-card"
import { useEffect, useState } from "react"
import { api, type JobListing } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import ProtectedRoute from "@/components/protected-route"

export default function OpportunitiesPage() {
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsData = await api.getJobs()
        setJobs(jobsData)
        setFilteredJobs(jobsData)
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  useEffect(() => {
    let filtered = jobs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by job type
    if (activeTab !== "all") {
      if (activeTab === "remote") {
        filtered = filtered.filter((job) => job.location.toLowerCase().includes("remote"))
      } else {
        filtered = filtered.filter((job) => job.jobType === activeTab)
      }
    }

    setFilteredJobs(filtered)
  }, [jobs, searchTerm, activeTab])

  return (
    <ProtectedRoute requiredUserType="student">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Opportunities</h1>
            </div>

            <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search jobs and internships..."
                    className="pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                  <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
              </div>
            </Card>

            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="bg-white dark:bg-gray-800">
                <TabsTrigger value="all">All Opportunities ({jobs.length})</TabsTrigger>
                <TabsTrigger value="internship">Internships</TabsTrigger>
                <TabsTrigger value="fulltime">Full-time</TabsTrigger>
                <TabsTrigger value="parttime">Part-time</TabsTrigger>
                <TabsTrigger value="remote">Remote</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : filteredJobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        title={job.title}
                        company={job.companyName}
                        location={job.location}
                        type={job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : "Job"}
                        tags={job.skills}
                        jobId={job.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    {searchTerm || activeTab !== "all" ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No opportunities found</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setSearchTerm("")
                            setActiveTab("all")
                          }}
                        >
                          Clear filters
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          No opportunities available
                        </h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Check back later for new job postings</p>
                      </>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Other tab contents show filtered results */}
              {["internship", "fulltime", "parttime", "remote"].map((category) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {filteredJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        title={job.title}
                        company={job.companyName}
                        location={job.location}
                        type={job.jobType ? job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1) : "Job"}
                        tags={job.skills}
                        jobId={job.id}
                      />
                    ))}
                  </div>
                  {filteredJobs.length === 0 && !loading && (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        No {category === "remote" ? "remote" : category} opportunities found
                      </h3>
                      <p className="mt-1 text-gray-500 dark:text-gray-400">
                        Check back later for new postings in this category
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
