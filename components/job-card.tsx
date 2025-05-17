"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, MapPin } from "lucide-react"

// Add router for navigation to application page
import { useRouter } from "next/navigation"

// Add jobId to the props
interface JobCardProps {
  title: string
  company: string
  location: string
  type: string
  tags: string[]
  jobId?: number // Add this prop
}

export default function JobCard({ title, company, location, type, tags, jobId }: JobCardProps) {
  const router = useRouter()

  const handleApply = () => {
    if (jobId) {
      router.push(`/job-application/${jobId}`)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600">{company}</p>
          </div>
          <Badge
            variant={type === "Internship" ? "outline" : "default"}
            className={type === "Internship" ? "border-purple-500 text-purple-500" : "bg-purple-600"}
          >
            {type || "Job"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1" /> {location}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {tags &&
            tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                {tag}
              </Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleApply} disabled={!jobId}>
          <Briefcase className="h-4 w-4 mr-2" /> Apply Now
        </Button>
      </CardFooter>
    </Card>
  )
}
