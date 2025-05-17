"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

export default function PostJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    jobType: "internship",
    location: "",
    salary: "",
    deadline: "",
  })
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.createJob({
        ...formData,
        skills,
      })

      toast({
        title: "Success",
        description: "Job posted successfully!",
      })

      router.push("/company-dashboard/jobs")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post job",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredUserType="company">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <CompanyDashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post a New Job</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Create a new job or internship listing for students
              </p>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-white dark:bg-gray-800">
                <CardTitle className="text-gray-900 dark:text-white">Job Details</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 bg-white dark:bg-gray-800">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-900 dark:text-white">
                      Job Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. Frontend Developer Intern"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-gray-900 dark:text-white">
                        Job Type
                      </Label>
                      <Select
                        value={formData.jobType}
                        onValueChange={(value) => setFormData({ ...formData, jobType: value })}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="fulltime">Full-time</SelectItem>
                          <SelectItem value="parttime">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-900 dark:text-white">
                        Location
                      </Label>
                      <Input
                        id="location"
                        placeholder="e.g. Remote, New York, NY"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-gray-900 dark:text-white">
                      Job Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the job responsibilities, requirements, and any other relevant information"
                      className="min-h-[150px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements" className="text-gray-900 dark:text-white">
                      Requirements
                    </Label>
                    <Textarea
                      id="requirements"
                      placeholder="List the skills, qualifications, and experience required for this position"
                      className="min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-900 dark:text-white">Required Skills</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a skill (e.g., React, Python, etc.)"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                      <Button
                        type="button"
                        onClick={handleAddSkill}
                        size="icon"
                        variant="outline"
                        className="border-gray-300 dark:border-gray-600"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 hover:text-purple-600 dark:hover:text-purple-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="text-gray-900 dark:text-white">
                        Application Deadline
                      </Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary" className="text-gray-900 dark:text-white">
                        Salary/Stipend (Optional)
                      </Label>
                      <Input
                        id="salary"
                        placeholder="e.g. $15-20/hour or $1000/month"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-white dark:bg-gray-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={loading || !formData.title || !formData.description || !formData.location}
                  >
                    {loading ? "Posting..." : "Post Job"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
