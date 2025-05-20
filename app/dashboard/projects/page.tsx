"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Plus, Search } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import ProjectCard from "@/components/project-card"
import { useEffect, useState } from "react"
import { api, type Project } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"
import ProtectedRoute from "@/components/protected-route"
import CreateProjectModal from "@/components/create-project-modal"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { user } = useAuth()

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (user) {
          const projectsData = await api.getProjects({ userId: user.id })
          setProjects(projectsData)
          setFilteredProjects(projectsData)
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  useEffect(() => {
    let filtered = projects

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filter by category
    if (activeTab !== "all") {
      const categorySkills = {
        web: ["React", "JavaScript", "HTML", "CSS", "Next.js", "Vue", "Angular", "Node.js", "Express"],
        mobile: ["React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin"],
        ai: ["Python", "Machine Learning", "AI", "TensorFlow", "PyTorch", "Data Science"],
        design: ["Figma", "Adobe XD", "UI/UX", "Design", "Photoshop", "Illustrator"],
      }

      const relevantSkills = categorySkills[activeTab as keyof typeof categorySkills] || []
      filtered = filtered.filter((project) =>
        project.skills.some((skill) =>
          relevantSkills.some((catSkill) => skill.toLowerCase().includes(catSkill.toLowerCase())),
        ),
      )
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, activeTab])

  const handleProjectCreated = () => {
    if (user) {
      api.getProjects({ userId: user.id }).then((projectsData) => {
        setProjects(projectsData)
        setFilteredProjects(projectsData)
      })
    }
  }

  return (
    <ProtectedRoute requiredUserType="student">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">My Projects</h1>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add New Project
              </Button>
            </div>

            <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" /> Filters
                </Button>
              </div>
            </Card>

            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
                <TabsTrigger value="web">Web Development</TabsTrigger>
                <TabsTrigger value="mobile">Mobile Apps</TabsTrigger>
                <TabsTrigger value="ai">AI & ML</TabsTrigger>
                <TabsTrigger value="design">UI/UX Design</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredProjects.map((project) => (
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
                    {searchTerm || activeTab !== "all" ? (
                      <>
                        <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                        <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
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
                        <div className="mb-4 text-gray-400">
                          <Plus className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                        <p className="mt-1 text-gray-500">Get started by creating your first project</p>
                        <Button
                          className="mt-4 bg-purple-600 hover:bg-purple-700"
                          onClick={() => setShowCreateModal(true)}
                        >
                          Create Project
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Other tab contents show filtered results */}
              {["web", "mobile", "ai", "design"].map((category) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredProjects.map((project) => (
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
                  {filteredProjects.length === 0 && !loading && (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-900">No {category} projects found</h3>
                      <p className="mt-1 text-gray-500">Create a project in this category to see it here</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </ProtectedRoute>
  )
}
