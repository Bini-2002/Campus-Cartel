"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Upload } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: () => void
}

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    githubUrl: "",
    demoUrl: "",
  })
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

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
      const projectFormData = new FormData()
      projectFormData.append("title", formData.title)
      projectFormData.append("description", formData.description)
      projectFormData.append("githubUrl", formData.githubUrl)
      projectFormData.append("demoUrl", formData.demoUrl)
      projectFormData.append("skills", JSON.stringify(skills))

      if (image) {
        projectFormData.append("projectImage", image)
      }

      await api.createProject(projectFormData)

      toast({
        title: "Success",
        description: "Project created successfully!",
      })

      // Reset form
      setFormData({ title: "", description: "", githubUrl: "", demoUrl: "" })
      setSkills([])
      setImage(null)
      onProjectCreated()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900 dark:text-white">Create New Project</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 bg-white dark:bg-gray-800">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-900 dark:text-white">
                Project Title
              </Label>
              <Input
                id="title"
                placeholder="My Awesome Project"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-900 dark:text-white">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your project, what it does, and what technologies you used..."
                className="min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="text-gray-900 dark:text-white">
                  GitHub URL (Optional)
                </Label>
                <Input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoUrl" className="text-gray-900 dark:text-white">
                  Demo URL (Optional)
                </Label>
                <Input
                  id="demoUrl"
                  type="url"
                  placeholder="https://myproject.com"
                  value={formData.demoUrl}
                  onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-gray-900 dark:text-white">
                Project Image (Optional)
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                  className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
                <Upload className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white">Skills & Technologies</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a skill (e.g., React, Python, etc.)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                />
                <Button type="button" onClick={handleAddSkill} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="bg-purple-100 text-purple-800">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 hover:text-purple-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
