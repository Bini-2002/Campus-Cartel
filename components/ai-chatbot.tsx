"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X } from "lucide-react"
import { useChat } from "@ai-sdk/react"

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <>
      {/* Chatbot Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg bg-purple-600 hover:bg-purple-700"
        aria-label="Open chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chatbot Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>CampusCraft Assistant</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 my-8">
                    <p>👋 Hi there! I'm your CampusCraft assistant.</p>
                    <p className="mt-2">
                      Ask me anything about the platform, how to create your profile, showcase projects, or find
                      opportunities!
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === "user" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-grow"
                />
                <Button type="submit">Send</Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  )
}
