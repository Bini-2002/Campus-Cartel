"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Users, Filter, Star, MapPin, MessageSquare, Eye, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Student {
  id: number
  first_name: string
  last_name: string
  university: string
  year_of_study: number
  bio: string
  profile_image: string
  location: string
  skills: string[]
  project_count: number
}

export default function TalentPoolPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [savedProfiles, setSavedProfiles] = useState<number[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchTalentPool()
  }, [])

  const fetchTalentPool = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/talent-pool`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch talent pool")
      }

      const data = await response.json()
      setStudents(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load talent pool",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = (studentId: number) => {
    setSavedProfiles((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )

    toast({
      title: savedProfiles.includes(studentId) ? "Profile Unsaved" : "Profile Saved",
      description: savedProfiles.includes(studentId)
        ? "Student profile removed from saved list"
        : "Student profile saved for later review",
    })
  }

  const handleViewProfile = (studentId: number) => {
    router.push(`/company-dashboard/student-profile/${studentId}`)
  }

  const handleMessage = (studentId: number) => {
    router.push(`/company-dashboard/messages?student=${studentId}`)
  }

  const filteredStudents = students.filter(
    (student) =>
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getSavedStudents = () => {
    return students.filter((student) => savedProfiles.includes(student.id))
  }

  const StudentCard = ({ student }: { student: Student }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {student.profile_image ? (
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${student.profile_image}`}
                alt={`${student.first_name} ${student.last_name}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {student.first_name[0]}
                  {student.last_name[0]}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                  {student.first_name} {student.last_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{student.university}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Year {student.year_of_study}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSaveProfile(student.id)}
                className={`flex-shrink-0 ml-2 ${savedProfiles.includes(student.id) ? "text-yellow-600" : "text-gray-400"}`}
              >
                <Star className={`h-4 w-4 ${savedProfiles.includes(student.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {student.location && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{student.location}</span>
          </div>
        )}

        <div className="flex-1 mb-4">
          {student.bio ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{student.bio}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">No bio available</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {student.skills.slice(0, 3).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                {skill}
              </Badge>
            ))}
            {student.skills.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
              >
                +{student.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Briefcase className="h-3 w-3 mr-1" />
            <span>
              {student.project_count} project{student.project_count !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewProfile(student.id)}
              className="flex-1 border-gray-300 dark:border-gray-600"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={() => handleMessage(student.id)}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute requiredUserType="company">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <CompanyDashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Talent Pool</h1>
            </div>

            <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    placeholder="Search students by skills, university, or name..."
                    className="pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="border-gray-300 dark:border-gray-600">
                  <Filter className="h-4 w-4 mr-2" /> Advanced Filters
                </Button>
              </div>
            </Card>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Tabs defaultValue="discover" className="w-full">
                <TabsList className="w-full bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <TabsTrigger
                    value="discover"
                    className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                  >
                    Discover Talent ({filteredStudents.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="saved"
                    className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                  >
                    Saved Profiles ({getSavedStudents().length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="contacted"
                    className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                  >
                    Contacted
                  </TabsTrigger>
                </TabsList>

                <div className="p-6 bg-white dark:bg-gray-800">
                  <TabsContent value="discover" className="mt-0">
                    {loading ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                      </div>
                    ) : filteredStudents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredStudents.map((student) => (
                          <StudentCard key={student.id} student={student} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="mb-4 text-gray-400">
                          <Users className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                          {searchTerm ? "No students found" : "No students available"}
                        </h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          {searchTerm
                            ? "Try adjusting your search terms to find more students."
                            : "Students will appear here as they join the platform."}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="saved" className="mt-0">
                    {getSavedStudents().length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {getSavedStudents().map((student) => (
                          <StudentCard key={student.id} student={student} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <div className="mb-4 text-gray-400">
                          <Star className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">No Saved Profiles</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                          When you save student profiles for later review, they will appear here.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="contacted" className="mt-0">
                    <div className="text-center py-20">
                      <div className="mb-4 text-gray-400">
                        <Users className="h-16 w-16 mx-auto" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white">No Contacted Students</h3>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Students you've reached out to will be tracked here.
                      </p>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
