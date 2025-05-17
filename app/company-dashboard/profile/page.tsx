"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import { Building, MapPin, Globe, Mail, Phone, Upload } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import ProtectedRoute from "@/components/protected-route"

export default function CompanyProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    website: "",
    size: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    culture: "",
    benefits: "",
    linkedin: "",
    twitter: "",
    facebook: "",
    instagram: "",
    github: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await api.getProfile()
        setProfile(profileData)
        setFormData({
          companyName: profileData.company_name || "",
          industry: profileData.industry || "",
          website: profileData.website || "",
          size: profileData.company_size || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          location: profileData.location || "",
          bio: profileData.bio || "",
          culture: profileData.company_culture || "",
          benefits: profileData.benefits || "",
          linkedin: profileData.linkedin || "",
          twitter: profileData.twitter || "",
          facebook: profileData.facebook || "",
          instagram: profileData.instagram || "",
          github: profileData.github || "",
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

    fetchProfile()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("profileImage", file)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/users/profile/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: uploadFormData,
        },
      )

      if (!response.ok) {
        throw new Error("Failed to upload logo")
      }

      const result = await response.json()
      setProfile((prev) => ({
        ...prev,
        profile_image: result.imagePath,
      }))

      toast({
        title: "Logo Uploaded",
        description: "Company logo has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload company logo",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateProfile({
        companyName: formData.companyName,
        industry: formData.industry,
        website: formData.website,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
      })

      toast({
        title: "Profile Updated",
        description: "Your company profile has been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save profile changes",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredUserType="company">
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <CompanyDashboardNav />
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
    <ProtectedRoute requiredUserType="company">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <CompanyDashboardNav />

        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage your company information and public profile
              </p>
            </div>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-0 bg-white dark:bg-gray-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                      {profile?.profile_image ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${profile.profile_image}`}
                          alt="Company Logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white">
                        {formData.companyName || "Company Name"}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" /> {formData.location || "Location"}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <Button disabled={uploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload Logo"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 bg-white dark:bg-gray-800">
                <Tabs defaultValue="info">
                  <TabsList className="mb-6 bg-gray-100 dark:bg-gray-700">
                    <TabsTrigger
                      value="info"
                      className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                    >
                      Basic Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="about"
                      className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                    >
                      About Company
                    </TabsTrigger>
                    <TabsTrigger
                      value="social"
                      className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-600"
                    >
                      Social Media
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-gray-900 dark:text-white">
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange("companyName", e.target.value)}
                          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry" className="text-gray-900 dark:text-white">
                          Industry
                        </Label>
                        <Input
                          id="industry"
                          value={formData.industry}
                          onChange={(e) => handleInputChange("industry", e.target.value)}
                          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="website" className="text-gray-900 dark:text-white">
                          Website
                        </Label>
                        <div className="flex">
                          <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-600">
                            <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => handleInputChange("website", e.target.value)}
                            className="rounded-l-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="size" className="text-gray-900 dark:text-white">
                          Company Size
                        </Label>
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => handleInputChange("size", e.target.value)}
                          className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-900 dark:text-white">
                          Contact Email
                        </Label>
                        <div className="flex">
                          <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-600">
                            <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <Input
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="rounded-l-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-900 dark:text-white">
                          Phone Number
                        </Label>
                        <div className="flex">
                          <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-600">
                            <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </div>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            className="rounded-l-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-900 dark:text-white">
                        Headquarters Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="about" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="about" className="text-gray-900 dark:text-white">
                        About the Company
                      </Label>
                      <Textarea
                        id="about"
                        className="min-h-[200px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        value={formData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="culture" className="text-gray-900 dark:text-white">
                        Company Culture
                      </Label>
                      <Textarea
                        id="culture"
                        className="min-h-[150px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        value={formData.culture}
                        onChange={(e) => handleInputChange("culture", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="benefits" className="text-gray-900 dark:text-white">
                        Benefits & Perks
                      </Label>
                      <Textarea
                        id="benefits"
                        className="min-h-[150px] bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        value={formData.benefits}
                        onChange={(e) => handleInputChange("benefits", e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="text-gray-900 dark:text-white">
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-gray-900 dark:text-white">
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange("twitter", e.target.value)}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="text-gray-900 dark:text-white">
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        value={formData.facebook}
                        onChange={(e) => handleInputChange("facebook", e.target.value)}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-gray-900 dark:text-white">
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => handleInputChange("instagram", e.target.value)}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github" className="text-gray-900 dark:text-white">
                        GitHub
                      </Label>
                      <Input
                        id="github"
                        value={formData.github}
                        onChange={(e) => handleInputChange("github", e.target.value)}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4 bg-white dark:bg-gray-800">
                <Button variant="outline" className="border-gray-300 dark:border-gray-600">
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
