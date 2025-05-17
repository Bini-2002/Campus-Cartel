"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import CompanyDashboardNav from "@/components/company-dashboard-nav"
import ProtectedRoute from "@/components/protected-route"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { Eye, EyeOff, Moon, Sun, Bell, Shield, Building, Trash2 } from "lucide-react"

export default function CompanySettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    applicationAlerts: true,
    messageNotifications: true,
    talentUpdates: true,
  })
  const [loading, setLoading] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load notification preferences
    loadNotificationPreferences()
  }, [])

  const loadNotificationPreferences = async () => {
    setNotificationLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to load notification preferences")
      }
    } catch (error) {
      console.error("Failed to load notification preferences:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load notification preferences",
        variant: "destructive",
      })
    } finally {
      setNotificationLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || error.error || "Failed to change password")
      }

      toast({
        title: "Success",
        description: "Password changed successfully",
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Password change error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    const previousValue = notifications[key as keyof typeof notifications]

    // Optimistically update UI
    setNotifications((prev) => ({ ...prev, [key]: value }))

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/notifications`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [key]: value }),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to update notification settings")
      }

      toast({
        title: "Success",
        description: "Notification settings updated",
      })
    } catch (error) {
      // Revert the optimistic update
      setNotifications((prev) => ({ ...prev, [key]: previousValue }))

      console.error("Notification update error:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your company account? This action cannot be undone.")) {
      return
    }

    setDeleteLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/users/delete-account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      toast({
        title: "Account Deleted",
        description: "Your company account has been permanently deleted",
      })

      // Clear local storage and redirect
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/"
    } catch (error) {
      console.error("Account deletion error:", error)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <ProtectedRoute requiredUserType="company">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <CompanyDashboardNav />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Settings</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage your company account settings and preferences
              </p>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sun className="h-5 w-5 mr-2" />
                      Appearance
                    </CardTitle>
                    <CardDescription>Customize how CampusCraft looks for your team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Theme</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={theme === "light" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("light")}
                        >
                          <Sun className="h-4 w-4 mr-2" />
                          Light
                        </Button>
                        <Button
                          variant={theme === "dark" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("dark")}
                        >
                          <Moon className="h-4 w-4 mr-2" />
                          Dark
                        </Button>
                        <Button
                          variant={theme === "system" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTheme("system")}
                        >
                          System
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Change Password
                    </CardTitle>
                    <CardDescription>Update your password to keep your company account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          disabled={loading}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={loading}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loading}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handlePasswordChange}
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Choose what notifications your company wants to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationUpdate("emailNotifications", checked)}
                        disabled={notificationLoading}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Application Alerts</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified about new job applications
                        </p>
                      </div>
                      <Switch
                        checked={notifications.applicationAlerts}
                        onCheckedChange={(checked) => handleNotificationUpdate("applicationAlerts", checked)}
                        disabled={notificationLoading}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Message Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified about new messages from students
                        </p>
                      </div>
                      <Switch
                        checked={notifications.messageNotifications}
                        onCheckedChange={(checked) => handleNotificationUpdate("messageNotifications", checked)}
                        disabled={notificationLoading}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Talent Updates</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified about new talent joining the platform
                        </p>
                      </div>
                      <Switch
                        checked={notifications.talentUpdates}
                        onCheckedChange={(checked) => handleNotificationUpdate("talentUpdates", checked)}
                        disabled={notificationLoading}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Billing & Subscription
                    </CardTitle>
                    <CardDescription>Manage your company's subscription and billing information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-green-900 dark:text-green-100">Free Plan</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            You're currently on the free plan with basic features
                          </p>
                        </div>
                        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                          Upgrade Plan
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-0.5">
                        <Label className="text-red-600 dark:text-red-400">Danger Zone</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Permanently delete your company account and all data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deleteLoading ? "Deleting..." : "Delete Company Account"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
