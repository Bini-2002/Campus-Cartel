"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Mail, Phone, ExternalLink, Github } from "lucide-react"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import { toast } from "@/hooks/use-toast"

interface StudentProfile {
  id: number
  first_name: string
  last_name: string
  university: string
  year_of_study: number
  bio: string
  profile_image: string
  email: string
  phone: string
  location: string
  projects: Array<{
    id: number
    title: string
    description: string
    image: string
    github_url: string
    demo_url: string
    likes_count: number
    skills: string[]
    created_at: string
  }>
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/students/${params.studentId}/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error("Failed to fetch student profile")
        }

        const data = await response.json()
        setStudent(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load student profile",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.studentId) {
      fetchStudentProfile()
    }
  }, [params.studentId])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CompanyDashboardNav />
        <main className="flex-1 p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CompanyDashboardNav />
        <main className="flex-1 p-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-900">Student not found</h3>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CompanyDashboardNav />

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-bold">Student Profile</h1>
          </div>

          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  {student.profile_image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${student.profile_image}`}
                      alt={`${student.first_name} ${student.last_name}`}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-500">
                        {student.first_name[0]}
                        {student.last_name[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {student.first_name} {student.last_name}
                  </h2>
                  <p className="text-lg text-gray-600 mb-2">{student.university}</p>
                  <p className="text-sm text-gray-500 mb-4">Year {student.year_of_study}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {student.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{student.email}</span>
                      </div>
                    )}
                    {student.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{student.phone}</span>
                      </div>
                    )}
                    {student.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{student.location}</span>
                      </div>
                    )}
                  </div>

                  {student.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-gray-700">{student.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Projects ({student.projects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {student.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {student.projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden">
                      {project.image && (
                        <div className="aspect-video bg-gray-100">
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${project.image}`}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{project.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          {project.github_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                <Github className="h-3 w-3 mr-1" />
                                Code
                              </a>
                            </Button>
                          )}
                          {project.demo_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Demo
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No projects available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
