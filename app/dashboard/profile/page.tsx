"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardNav from "@/components/dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { toast } from "@/hooks/use-toast"
import { Camera, MapPin, Mail, Phone, University, Calendar } from "lucide-react"

interface StudentProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  university: string
  year_of_study: number
  major: string
  bio: string
  location: string
  profile_image: string
  github_url: string
  linkedin_url: string
  portfolio_url: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    university: "",
    year_of_study: 1,
    major: "",
    bio: "",
    location: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      setProfile(data)
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        university: data.university || "",
        year_of_study: data.year_of_study || 1,
        major: data.major || "",
        bio: data.bio || "",
        location: data.location || "",
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
        portfolio_url: data.portfolio_url || "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setEditing(false)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        university: profile.university || "",
        year_of_study: profile.year_of_study || 1,
        major: profile.major || "",
        bio: profile.bio || "",
        location: profile.location || "",
        github_url: profile.github_url || "",
        linkedin_url: profile.linkedin_url || "",
        portfolio_url: profile.portfolio_url || "",
      })
    }
    setEditing(false)
  }

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="student">
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardNav />
          <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredUserType="student">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
              {!editing ? (
                <Button onClick={() => setEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Header */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 bg-white dark:bg-gray-800">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {profile?.profile_image ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${profile.profile_image}`}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-500 dark:text-gray-300">
                            {formData.first_name[0] || "U"}
                            {formData.last_name[0] || ""}
                          </span>
                        </div>
                      )}
                      {editing && (
                        <Button
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                          variant="outline"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {editing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-900 dark:text-white">First Name</Label>
                          <Input
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <Label className="text-gray-900 dark:text-white">Last Name</Label>
                          <Input
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formData.first_name} {formData.last_name}
                      </h2>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editing ? (
                        <>
                          <div>
                            <Label className="text-gray-900 dark:text-white">University</Label>
                            <Input
                              value={formData.university}
                              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            />
                          </div>
                          <div>
                            <Label className="text-gray-900 dark:text-white">Major</Label>
                            <Input
                              value={formData.major}
                              onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {formData.university && (
                            <div className="flex items-center gap-2">
                              <University className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">{formData.university}</span>
                            </div>
                          )}
                          {formData.major && (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 dark:text-gray-300">{formData.major}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {editing ? (
                      <div>
                        <Label className="text-gray-900 dark:text-white">Bio</Label>
                        <Textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    ) : (
                      formData.bio && (
                        <div>
                          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">About</h3>
                          <p className="text-gray-700 dark:text-gray-300">{formData.bio}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-white dark:bg-gray-800">
                <CardTitle className="text-gray-900 dark:text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-white dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-900 dark:text-white">Email</Label>
                    {editing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{formData.email || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-white">Phone</Label>
                    {editing ? (
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{formData.phone || "Not provided"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-900 dark:text-white">Location</Label>
                    {editing ? (
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{formData.location || "Not provided"}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-white">Year of Study</Label>
                    {editing ? (
                      <Select
                        value={formData.year_of_study.toString()}
                        onValueChange={(value) => setFormData({ ...formData, year_of_study: Number.parseInt(value) })}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                          <SelectItem value="5">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {formData.year_of_study
                            ? `${formData.year_of_study}${
                                formData.year_of_study === 1
                                  ? "st"
                                  : formData.year_of_study === 2
                                    ? "nd"
                                    : formData.year_of_study === 3
                                      ? "rd"
                                      : "th"
                              } Year`
                            : "Not specified"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-white dark:bg-gray-800">
                <CardTitle className="text-gray-900 dark:text-white">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-white dark:bg-gray-800">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-gray-900 dark:text-white">GitHub URL</Label>
                    {editing ? (
                      <Input
                        value={formData.github_url}
                        onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                        placeholder="https://github.com/username"
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="mt-1">
                        {formData.github_url ? (
                          <a
                            href={formData.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {formData.github_url}
                          </a>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-white">LinkedIn URL</Label>
                    {editing ? (
                      <Input
                        value={formData.linkedin_url}
                        onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="mt-1">
                        {formData.linkedin_url ? (
                          <a
                            href={formData.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {formData.linkedin_url}
                          </a>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-900 dark:text-white">Portfolio URL</Label>
                    {editing ? (
                      <Input
                        value={formData.portfolio_url}
                        onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                        placeholder="https://yourportfolio.com"
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="mt-1">
                        {formData.portfolio_url ? (
                          <a
                            href={formData.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {formData.portfolio_url}
                          </a>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Not provided</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
