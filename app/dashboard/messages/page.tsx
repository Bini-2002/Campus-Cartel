"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search, Send, Plus, Users, Building } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useSearchParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  subject: string
  message: string
  is_read: boolean
  sent_at: string
  sender_first_name: string
  sender_last_name: string
  receiver_first_name: string
  receiver_last_name: string
  sender_user_type: string
  receiver_user_type: string
  sender_company_name?: string
  receiver_company_name?: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showComingSoon, setShowComingSoon] = useState(false)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const messagesData = await response.json()
          setMessages(messagesData)
          setShowComingSoon(messagesData.length === 0)

          // Check if we should start a conversation with a specific user
          const userId = searchParams.get("userId")
          if (userId) {
            setSelectedConversation(Number(userId))
            setShowComingSoon(false)
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [searchParams])

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          receiverId: selectedConversation,
          subject: "Direct Message",
          message: newMessage,
        }),
      })

      if (response.ok) {
        setNewMessage("")
        toast({
          title: "Success",
          description: "Message sent successfully!",
        })

        // Add the new message to the local state
        const newMsg: Message = {
          id: Date.now(), // Temporary ID
          sender_id: user?.id || 0,
          receiver_id: selectedConversation,
          subject: "Direct Message",
          message: newMessage,
          is_read: false,
          sent_at: new Date().toISOString(),
          sender_first_name: user?.firstName || "",
          sender_last_name: user?.lastName || "",
          receiver_first_name: "",
          receiver_last_name: "",
          sender_user_type: "student",
          receiver_user_type: "company",
        }
        setMessages((prev) => [newMsg, ...prev])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  // Group messages by conversation
  const conversations = messages.reduce(
    (acc, message) => {
      const otherUserId = message.sender_id === user?.id ? message.receiver_id : message.sender_id
      if (!acc[otherUserId]) {
        acc[otherUserId] = []
      }
      acc[otherUserId].push(message)
      return acc
    },
    {} as Record<number, Message[]>,
  )

  return (
    <ProtectedRoute requiredUserType="student">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
              <Badge
                variant="outline"
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
              >
                Student Messaging
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Conversations List */}
              <Card className="lg:col-span-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900 dark:text-white">Conversations</CardTitle>
                    <Button size="sm" variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                      <Plus className="h-4 w-4 mr-1" /> New
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                    </div>
                  ) : Object.keys(conversations).length > 0 || selectedConversation ? (
                    <div className="space-y-1">
                      {/* Show selected conversation even if no messages yet */}
                      {selectedConversation && !conversations[selectedConversation] && searchParams.get("userId") && (
                        <div
                          className="p-4 cursor-pointer bg-purple-50 dark:bg-purple-900/20 border-b dark:border-gray-700"
                          onClick={() => setSelectedConversation(selectedConversation)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 dark:text-white">New Conversation</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Start a conversation</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {Object.entries(conversations).map(([userId, msgs]) => {
                        const latestMessage = msgs[0]
                        const otherUser =
                          latestMessage.sender_id === user?.id
                            ? {
                                first_name: latestMessage.receiver_first_name,
                                last_name: latestMessage.receiver_last_name,
                                user_type: latestMessage.receiver_user_type,
                                company_name: latestMessage.receiver_company_name,
                              }
                            : {
                                first_name: latestMessage.sender_first_name,
                                last_name: latestMessage.sender_last_name,
                                user_type: latestMessage.sender_user_type,
                                company_name: latestMessage.sender_company_name,
                              }

                        return (
                          <div
                            key={userId}
                            className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700 ${
                              selectedConversation === Number(userId) ? "bg-purple-50 dark:bg-purple-900/20" : ""
                            }`}
                            onClick={() => setSelectedConversation(Number(userId))}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                {otherUser.user_type === "company" ? (
                                  <Building className="h-5 w-5 text-white" />
                                ) : (
                                  <span className="text-sm font-bold text-white">
                                    {otherUser.first_name[0]}
                                    {otherUser.last_name[0]}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                                    {otherUser.user_type === "company"
                                      ? otherUser.company_name || `${otherUser.first_name} ${otherUser.last_name}`
                                      : `${otherUser.first_name} ${otherUser.last_name}`}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    {otherUser.user_type}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {latestMessage.message}
                                </p>
                              </div>
                              {!latestMessage.is_read && latestMessage.receiver_id === user?.id && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="mb-4 text-gray-400">
                        <MessageSquare className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">No conversations yet</h3>
                      <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                        Start networking to begin conversations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-0 h-full flex flex-col">
                  {showComingSoon ? (
                    <div className="flex-1 p-6 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mb-4 text-gray-400">
                          <MessageSquare className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">Enhanced Messaging System</h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          Connect with other students, companies, and mentors directly on the platform. Build your
                          professional network and explore opportunities.
                        </p>
                        <div className="mt-6 space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-300">Features available:</p>
                          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            <li>• Real-time messaging with instant notifications</li>
                            <li>• Connect with companies and recruiters</li>
                            <li>• Network with fellow students</li>
                            <li>• Professional communication tools</li>
                            <li>• Message history and search</li>
                          </ul>
                        </div>
                        <div className="mt-8">
                          <Button
                            onClick={() => setShowComingSoon(false)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Start Messaging
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {conversations[selectedConversation]?.[0]?.sender_id === user?.id
                                ? conversations[selectedConversation][0].receiver_company_name ||
                                  `${conversations[selectedConversation][0].receiver_first_name} ${conversations[selectedConversation][0].receiver_last_name}`
                                : conversations[selectedConversation]?.[0]
                                  ? conversations[selectedConversation][0].sender_company_name ||
                                    `${conversations[selectedConversation][0].sender_first_name} ${conversations[selectedConversation][0].sender_last_name}`
                                  : "New Conversation"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {conversations[selectedConversation]?.[0]?.sender_id === user?.id
                                ? conversations[selectedConversation][0].receiver_user_type
                                : conversations[selectedConversation]?.[0]?.sender_user_type || "User"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                          {conversations[selectedConversation]?.length > 0 ? (
                            conversations[selectedConversation]
                              .slice()
                              .reverse()
                              .map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                      message.sender_id === user?.id
                                        ? "bg-purple-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                    }`}
                                  >
                                    <p className="text-sm">{message.message}</p>
                                    <p
                                      className={`text-xs mt-1 ${
                                        message.sender_id === user?.id
                                          ? "text-purple-200"
                                          : "text-gray-500 dark:text-gray-400"
                                      }`}
                                    >
                                      {new Date(message.sent_at).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center py-10">
                              <div className="mb-4 text-gray-400">
                                <MessageSquare className="h-12 w-12 mx-auto" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Start a conversation
                              </h3>
                              <p className="mt-1 text-gray-500 dark:text-gray-400">Send your first message below</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Message Input */}
                      <div className="p-4 border-t dark:border-gray-700">
                        <div className="flex space-x-2">
                          <Textarea
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 min-h-[40px] max-h-[120px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                sendMessage()
                              }
                            }}
                          />
                          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 p-6 flex items-center justify-center">
                      <div className="text-center">
                        <div className="mb-4 text-gray-400">
                          <MessageSquare className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select a conversation</h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                          Choose a conversation from the sidebar to start messaging
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
