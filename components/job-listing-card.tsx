"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Edit, Eye, Trash2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface JobListingCardProps {
  id: number
  title: string
  description: string
  type: string
  location: string
  applicants: number
  posted: string
  status: "Active" | "Paused" | "Closed"
  onDelete?: (id: number) => void
  onEdit?: (id: number) => void
}

export default function JobListingCard({
  id,
  title,
  description,
  type,
  location,
  applicants,
  posted,
  status,
  onDelete,
  onEdit,
}: JobListingCardProps) {
  const router = useRouter()

  const handleViewApplicants = () => {
    router.push(`/company-dashboard/applications?jobId=${id}`)
  }

  const handleEdit = () => {
    router.push(`/company-dashboard/jobs/edit/${id}`)
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this job listing?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/jobs/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to delete job")
        }

        toast({
          title: "Success",
          description: "Job listing deleted successfully",
        })

        if (onDelete) {
          onDelete(id)
        } else {
          window.location.reload()
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete job listing",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <Badge
                variant={status && status === "Active" ? "default" : "outline"}
                className={
                  status && status === "Active"
                    ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                    : status && status === "Paused"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                }
              >
                {status || "Unknown"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {type} • {location} • Posted {posted}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{description}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4" />
            <span>{applicants} applicants</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewApplicants}
          className="border-gray-300 dark:border-gray-600"
        >
          <Eye className="h-4 w-4 mr-2" /> View Applicants
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit} className="border-gray-300 dark:border-gray-600">
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-gray-300 dark:border-gray-600"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
