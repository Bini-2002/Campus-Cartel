"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Users, MessageSquare, UserPlus, Check, Clock, X } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Student {
  id: number
  first_name: string
  last_name: string
  university: string
  bio: string
  profile_image?: string
}

interface Connection {
  id: number
  requester_id: number
  receiver_id: number
  status: "pending" | "accepted" | "rejected"
  first_name: string
  last_name: string
  university: string
  profile_image?: string
}

interface ConnectionRequest {
  id: number
  requester_id: number
  first_name: string
  last_name: string
  university: string
  bio: string
  profile_image?: string
  created_at: string
}

export default function NetworkPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsData, connectionsData, requestsData] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/students/discover`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }).then((res) => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/connections`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }).then((res) => res.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/connections/requests`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }).then((res) => res.json()),
        ])

        setStudents(studentsData)
        setConnections(connectionsData)
        setConnectionRequests(requestsData)
      } catch (error) {
        console.error("Failed to fetch network data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const sendConnectionRequest = async (receiverId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/connections/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ receiverId }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Success",
        description: "Connection request sent!",
      })

      // Remove student from discover list
      setStudents((prev) => prev.filter((s) => s.id !== receiverId))
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send connection request",
        variant: "destructive",
      })
    }
  }

  const handleConnectionRequest = async (connectionId: number, status: "accepted" | "rejected") => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/connections/${connectionId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        title: "Success",
        description: `Connection request ${status}!`,
      })

      // Remove from requests list
      setConnectionRequests((prev) => prev.filter((req) => req.id !== connectionId))

      // If accepted, add to connections
      if (status === "accepted") {
        const acceptedRequest = connectionRequests.find((req) => req.id === connectionId)
        if (acceptedRequest) {
          setConnections((prev) => [
            ...prev,
            {
              id: connectionId,
              requester_id: acceptedRequest.requester_id,
              receiver_id: user?.id || 0,
              status: "accepted",
              first_name: acceptedRequest.first_name,
              last_name: acceptedRequest.last_name,
              university: acceptedRequest.university,
              profile_image: acceptedRequest.profile_image,
            },
          ])
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update connection request",
        variant: "destructive",
      })
    }
  }

  const startConversation = (userId: number) => {
    // Navigate to messages page with the selected user
    router.push(`/dashboard/messages?userId=${userId}`)
  }

  const filteredStudents = students.filter(
    (student) =>
      `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.university.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedRoute requiredUserType="student">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Network</h1>
              <Badge
                variant="outline"
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
              >
                Beta Feature
              </Badge>
            </div>

            <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                  <Users className="h-4 w-4 mr-2" /> Find Students
                </Button>
              </div>
            </Card>

            <Tabs defaultValue="discover">
              <TabsList className="bg-white dark:bg-gray-800">
                <TabsTrigger value="discover">Discover Students ({filteredStudents.length})</TabsTrigger>
                <TabsTrigger value="connections">My Connections ({connections.length})</TabsTrigger>
                <TabsTrigger value="requests">
                  Requests ({connectionRequests.length})
                  {connectionRequests.length > 0 && (
                    <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                      {connectionRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discover" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : filteredStudents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredStudents.map((student) => (
                      <Card key={student.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center overflow-hidden">
                            {student.profile_image ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${student.profile_image}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{student.university}</p>
                          {student.bio && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{student.bio}</p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 dark:border-gray-600 dark:text-gray-300"
                            onClick={() => sendConnectionRequest(student.id)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" /> Connect
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mb-4 text-gray-400">
                      <Users className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      {searchTerm ? "No students found" : "No students to discover"}
                    </h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "When other students join the platform, they'll appear here"}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="connections" className="space-y-4">
                {connections.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {connections.map((connection) => (
                      <Card
                        key={connection.id}
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center overflow-hidden">
                            {connection.profile_image ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${connection.profile_image}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {connection.first_name} {connection.last_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{connection.university}</p>
                          <Badge
                            variant="outline"
                            className="mt-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                          >
                            <Check className="h-3 w-3 mr-1" /> Connected
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 dark:border-gray-600 dark:text-gray-300"
                            onClick={() =>
                              startConversation(
                                connection.requester_id === user?.id ? connection.receiver_id : connection.requester_id,
                              )
                            }
                          >
                            <MessageSquare className="h-4 w-4 mr-2" /> Message
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mb-4 text-gray-400">
                      <Users className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">No connections yet</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      Start connecting with other students to build your network
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="requests" className="space-y-4">
                {connectionRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {connectionRequests.map((request) => (
                      <Card key={request.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 flex items-center justify-center overflow-hidden">
                            {request.profile_image ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${request.profile_image}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {request.first_name} {request.last_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{request.university}</p>
                          {request.bio && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{request.bio}</p>
                          )}
                          <Badge
                            variant="outline"
                            className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
                          >
                            <Clock className="h-3 w-3 mr-1" /> Pending
                          </Badge>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleConnectionRequest(request.id, "accepted")}
                            >
                              <Check className="h-4 w-4 mr-1" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                              onClick={() => handleConnectionRequest(request.id, "rejected")}
                            >
                              <X className="h-4 w-4 mr-1" /> Decline
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="mb-4 text-gray-400">
                      <Clock className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">No Connection Requests</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                      When other students send you connection requests, they will appear here.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
