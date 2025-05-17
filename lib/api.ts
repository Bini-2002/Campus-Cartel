const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Types
export interface User {
  id: number
  email: string
  userType: "student" | "company"
  firstName?: string
  lastName?: string
  companyName?: string
  university?: string
  yearOfStudy?: number
  industry?: string
  website?: string
  phone?: string
  location?: string
  bio?: string
  profileImage?: string
  isVerified: boolean // Add this field
}

export interface Project {
  id: number
  userId: number
  title: string
  description: string
  image?: string
  githubUrl?: string
  demoUrl?: string
  likesCount: number
  skills: string[]
  firstName: string
  lastName: string
  university: string
  createdAt: string
}

export interface JobListing {
  id: number
  companyId: number
  title: string
  description: string
  requirements?: string
  jobType: "internship" | "fulltime" | "parttime" | "contract"
  location: string
  salary?: string
  deadline?: string
  status: "active" | "paused" | "closed"
  skills: string[]
  companyName: string
  applicationsCount: number
  createdAt: string
}

export interface Application {
  id: number
  jobId: number
  studentId: number
  coverLetter?: string
  resumeUrl?: string
  status: "new" | "reviewed" | "interviewing" | "rejected" | "hired"
  jobTitle: string
  jobType: string
  location: string
  firstName: string
  lastName: string
  university: string
  email: string
  companyName: string
  appliedAt: string
}

export interface DashboardStats {
  projects?: number
  applications?: number
  profileViews?: number
  activeListings?: number
}

// API Client class
class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("text/html")) {
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`)
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (jsonError) {
          // If we can't parse the error as JSON, use the status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error("Network error: Unable to connect to server")
      }
      throw error
    }
  }

  // Auth methods
  async register(userData: {
    email: string
    password: string
    userType: "student" | "company"
    firstName?: string
    lastName?: string
    companyName?: string
    university?: string
    yearOfStudy?: number
    industry?: string
    website?: string
    isVerified?: boolean
  }) {
    const response = await this.request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (response.token) {
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  }

  async login(credentials: {
    email: string
    password: string
    userType: "student" | "company"
  }) {
    const response = await this.request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.token) {
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  }

  logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  }

  async verifyEmail(data: { email: string; code: string; userType: "student" | "company" }) {
    return this.request<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async resendVerification(data: { email: string; userType: "student" | "company" }) {
    return this.request<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async forgotPassword(data: { email: string; userType: "student" | "company" }) {
    return this.request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async resetPassword(data: { email: string; code: string; newPassword: string; userType: "student" | "company" }) {
    return this.request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Profile methods
  async getProfile(): Promise<User> {
    return this.request<User>("/users/profile")
  }

  async updateProfile(profileData: Partial<User>): Promise<{ message: string }> {
    return this.request<{ message: string }>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    })
  }

  // Project methods
  async getProjects(filters?: {
    userId?: number
    search?: string
    skills?: string[]
  }): Promise<Project[]> {
    const params = new URLSearchParams()
    if (filters?.userId) params.append("userId", filters.userId.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.skills?.length) params.append("skills", filters.skills.join(","))

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Project[]>(`/projects${query}`)
  }

  async createProject(projectData: FormData): Promise<{ message: string; projectId: number }> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: projectData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async updateProject(projectId: number, projectData: FormData): Promise<{ message: string }> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: projectData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async deleteProject(projectId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${projectId}`, {
      method: "DELETE",
    })
  }

  async toggleProjectLike(projectId: number): Promise<{ message: string; liked: boolean }> {
    return this.request<{ message: string; liked: boolean }>(`/projects/${projectId}/like`, {
      method: "POST",
    })
  }

  // Job methods
  async getJobs(filters?: {
    companyId?: number
    search?: string
    jobType?: string
    location?: string
  }): Promise<JobListing[]> {
    const params = new URLSearchParams()
    if (filters?.companyId) params.append("companyId", filters.companyId.toString())
    if (filters?.search) params.append("search", filters.search)
    if (filters?.jobType) params.append("jobType", filters.jobType)
    if (filters?.location) params.append("location", filters.location)

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<JobListing[]>(`/jobs${query}`)
  }

  async createJob(jobData: {
    title: string
    description: string
    requirements?: string
    jobType: string
    location: string
    salary?: string
    deadline?: string
    skills: string[]
  }): Promise<{ message: string; jobId: number }> {
    return this.request<{ message: string; jobId: number }>("/jobs", {
      method: "POST",
      body: JSON.stringify(jobData),
    })
  }

  async updateJob(jobId: number, jobData: Partial<JobListing>): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/jobs/${jobId}`, {
      method: "PUT",
      body: JSON.stringify(jobData),
    })
  }

  async deleteJob(jobId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/jobs/${jobId}`, {
      method: "DELETE",
    })
  }

  // Application methods
  async getApplications(filters?: {
    jobId?: number
    studentId?: number
    companyId?: number
  }): Promise<Application[]> {
    const params = new URLSearchParams()
    if (filters?.jobId) params.append("jobId", filters.jobId.toString())
    if (filters?.studentId) params.append("studentId", filters.studentId.toString())
    if (filters?.companyId) params.append("companyId", filters.companyId.toString())

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Application[]>(`/applications${query}`)
  }

  async submitApplication(applicationData: FormData): Promise<{ message: string }> {
    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: applicationData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Network error" }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async updateApplicationStatus(applicationId: number, status: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/applications/${applicationId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/dashboard/stats")
  }

  // File upload method
  async uploadFile(file: File, fieldName = "file"): Promise<{ url: string; filename: string }> {
    const formData = new FormData()
    formData.append(fieldName, file)

    const token = localStorage.getItem("token")
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

export const api = new ApiClient()
