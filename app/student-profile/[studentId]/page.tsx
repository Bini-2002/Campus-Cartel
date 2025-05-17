"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MessageSquare, User, GraduationCap, MapPin, Mail, Phone, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "@/hooks/use-toast"

interface StudentProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  university: string
  year_of_study: number
  phone?: string
  location?: string
  bio?: string
  profile_image?: string
  created_at: string
  projects: Array<{
    id: number
    title: string
    description: string
    skills: string[]
    image?: string
    created_at: string
  }>
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/students/${params.studentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )

        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error("Failed to fetch student profile:", error)
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
      fetchProfile()
    }
  }, [params.studentId])

  const startConversation = () => {
    if (user?.userType === "student") {
      router.push(`/dashboard/messages?userId=${profile?.id}`)
    } else {
      router.push(`/company-dashboard/messages?userId=${profile?.id}`)
    }
  }

  const goBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile not found</h1>
          <Button onClick={goBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={startConversation} className="bg-purple-600 hover:bg-purple-700">
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-4">
                  {profile.profile_image ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${profile.profile_image}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-3xl">
                        {profile.first_name?.[0]?.toUpperCase() || "U"}
                        {profile.last_name?.[0]?.toUpperCase() || ""}
                      </span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">
                  {profile.first_name} {profile.last_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span>{profile.university}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Year {profile.year_of_study}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{profile.phone}</span>
                  </div>
                )}

                <Separator />

                {profile.bio && (
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Projects */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Projects ({profile.projects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {profile.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.projects.map((project) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          {project.image && (
                            <img
                              src={project.image || "/placeholder.svg"}
                              alt={project.title}
                              className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                          )}
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">{project.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {project.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {project.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-4 text-gray-400">
                      <User className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects yet</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">This student hasn't shared any projects yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
