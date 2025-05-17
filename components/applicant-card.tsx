"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Check, Download, Eye, X, MessageSquare } from "lucide-react"
import { useState } from "react"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ApplicantCardProps {
  name: string
  university: string
  position: string
  skills: string[]
  applied: string
  status: "New" | "Reviewed" | "Interviewing" | "Rejected" | "Hired"
  applicationId?: number
  studentId?: number
  onStatusUpdate?: () => void
}

export default function ApplicantCard({
  name,
  university,
  position,
  skills,
  applied,
  status,
  applicationId,
  studentId,
  onStatusUpdate,
}: ApplicantCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  const updateStatus = async (newStatus: string) => {
    if (!applicationId) return

    setUpdating(true)
    try {
      await api.updateApplicationStatus(applicationId, newStatus.toLowerCase())
      setCurrentStatus(newStatus as any)

      if (newStatus === "Hired") {
        toast({
          title: "Application Accepted",
          description: "Redirecting to messages to discuss further details...",
        })
        // Redirect to messages after a short delay
        setTimeout(() => {
          router.push(`/company-dashboard/messages?student=${studentId}`)
        }, 2000)
      } else if (newStatus === "Rejected") {
        toast({
          title: "Application Rejected",
          description: "Application has been removed from the list",
        })
        // Call parent component to refresh the list
        if (onStatusUpdate) {
          setTimeout(() => {
            onStatusUpdate()
          }, 1000)
        }
      } else {
        toast({
          title: "Status Updated",
          description: `Application status changed to ${newStatus}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const viewProfile = () => {
    if (studentId) {
      router.push(`/company-dashboard/student-profile/${studentId}`)
    }
  }

  const downloadResume = async () => {
    if (!applicationId) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/applications/${applicationId}/resume`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to download resume")
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${name.replace(/\s+/g, "_")}_resume.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Resume Downloaded",
        description: "Resume has been downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download resume",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div className="space-y-1">
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-gray-500">{university}</p>
              <p className="text-sm text-gray-600">Applied for: {position}</p>
              <p className="text-sm text-gray-500">Applied {applied}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-gray-100 text-gray-800">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <Badge
            className={
              currentStatus === "New"
                ? "bg-blue-100 text-blue-800"
                : currentStatus === "Reviewed"
                  ? "bg-purple-100 text-purple-800"
                  : currentStatus === "Interviewing"
                    ? "bg-yellow-100 text-yellow-800"
                    : currentStatus === "Hired"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
            }
          >
            {currentStatus || "Unknown"}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-gray-50 border-t flex justify-between">
        <Button variant="outline" size="sm" onClick={viewProfile}>
          <Eye className="h-4 w-4 mr-2" /> View Profile
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadResume}>
            <Download className="h-4 w-4 mr-2" /> Resume
          </Button>
          {currentStatus === "Hired" && (
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push(`/company-dashboard/messages?student=${studentId}`)}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Message
            </Button>
          )}
          {currentStatus !== "Hired" && currentStatus !== "Rejected" && (
            <>
              <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => updateStatus("Hired")}
                disabled={updating}
              >
                <Check className="h-4 w-4 mr-2" /> Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => updateStatus("Rejected")}
                disabled={updating}
              >
                <X className="h-4 w-4 mr-2" /> Reject
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
