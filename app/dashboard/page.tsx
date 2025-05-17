"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BellRing, Plus, Users } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import ProjectCard from "@/components/project-card"
import JobCard from "@/components/job-card"
import ProtectedRoute from "@/components/protected-route"
import { useEffect, useState } from "react"
import { api, type DashboardStats, type Project, type JobListing } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import CreateProjectModal from "@/components/create-project-modal"
import { useRouter } from "next/navigation"

interface Student {
  id: number
  firstName: string
  lastName: string
  university: string
  profileImage?: string
  latestProject?: {
    title: string
    skills: string[]
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({})
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [jobs, setJobs] = useState<JobListing[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, projectsData, jobsData, studentsData] = await Promise.all([
          api.getDashboardStats(),
          api.getProjects({ userId: user?.id }),
          api.getJobs(),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/students/discover`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }).then((res) => res.json()),
        ])
        setStats(statsData)
        setProjects(projectsData)
        setJobs(jobsData)
        setStudents(studentsData.slice(0, 6)) // Show only first 6 students
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

  const viewStudentProfile = (studentId: number) => {
    router.push(`/student-profile/${studentId}`)
  }

  return (
    <ProtectedRoute requiredUserType="student">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />

        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <BellRing className="h-4 w-4" />
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Project
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Projects</CardTitle>
                  <CardDescription>Total projects you've shared</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.projects || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <CardDescription>Jobs and internships you've applied to</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.applications || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
                  <CardDescription>How many people viewed your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.profileViews || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="projects">
              <TabsList>
                <TabsTrigger value="projects">My Projects</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="network">Student Network</TabsTrigger>
              </TabsList>

              <TabsContent value="projects" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {projects.slice(0, 6).map((project) => (
                      <ProjectCard
                        key={project.id}
                        title={project.title}
                        description={project.description}
                        image={project.image || "/placeholder.svg?height=200&width=300"}
                        tags={project.skills}
                        likes={project.likesCount}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mb-4 text-gray-400">
                      <Plus className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects yet</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating your first project</p>
                    <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreateModal(true)}>
                      Create Project
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : jobs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {jobs.slice(0, 4).map((job) => (
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
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      No job opportunities available
                    </h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Check back later for new opportunities</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="network" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : students.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {students.map((student) => (
                      <Card key={student.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center overflow-hidden">
                            {student.profileImage ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${student.profileImage}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {student.firstName?.[0]?.toUpperCase() || "U"}
                                  {student.lastName?.[0]?.toUpperCase() || ""}
                                </span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {student.firstName} {student.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{student.university}</p>
                          {student.latestProject && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Latest project: {student.latestProject.title}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {student.latestProject.skills.slice(0, 3).map((skill) => (
                                  <span
                                    key={skill}
                                    className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => viewStudentProfile(student.id)}
                          >
                            <Users className="h-4 w-4 mr-2" /> View Profile
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mb-4 text-gray-400">
                      <Users className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No other students yet</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      When other students join and create projects, they'll appear here
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={() => {
          // Refresh projects data
          if (user) {
            api.getProjects({ userId: user.id }).then(setProjects)
          }
        }}
      />
    </ProtectedRoute>
  )
}
