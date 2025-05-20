"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, Code, GraduationCap, Users } from "lucide-react"
import AIChatbot from "@/components/ai-chatbot"
import { ThemeToggle } from "@/components/theme-toggle"
import LottieAnimation from "@/components/LottieAnimation"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with Theme Toggle */}
      <header className="absolute top-0 w-full z-50 p-4 flex justify-between items-center">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center">
            <img src="/landing-logo.png" alt="CampusCraft Logo" className="h-28 w-45" />
          </Link>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 py-20 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Where Student Talent Meets Opportunity
                </h1>
              </div>
              <p className="text-xl opacity-90">
                Showcase your projects, connect with tech companies, and land your dream internship or job.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-purple-700 hover:bg-white/10">
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <LottieAnimation
                src="/students-working.lottie"
                className="rounded-lg shadow-xl w-full max-w-[500px] h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Why CampusCraft?</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              A platform designed specifically for university students and tech companies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<GraduationCap className="h-10 w-10 text-purple-600" />}
              title="Student Portfolios"
              description="Showcase your projects and skills to stand out from the crowd"
            />
            <FeatureCard
              icon={<Code className="h-10 w-10 text-purple-600" />}
              title="Project Showcase"
              description="Share your work and get feedback from peers and professionals"
            />
            <FeatureCard
              icon={<Briefcase className="h-10 w-10 text-purple-600" />}
              title="Job Opportunities"
              description="Apply for internships and jobs posted by tech companies"
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-purple-600" />}
              title="Community"
              description="Connect with fellow students, alumni, and industry professionals"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
              Simple steps to get started and make the most of CampusCraft
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Create Your Profile"
              description="Sign up with your university email and build your professional profile"
            />
            <StepCard
              number="2"
              title="Showcase Your Projects"
              description="Upload and share your projects, assignments, and portfolio pieces"
            />
            <StepCard
              number="3"
              title="Connect & Apply"
              description="Apply for opportunities and connect with tech companies"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-600 dark:bg-purple-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Ready to Showcase Your Talent?</h2>
          <p className="mt-4 text-xl opacity-90">Join thousands of students and companies on CampusCraft today.</p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-gray-100">
              <Link href="/register">
                Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 relative">
      <div className="absolute -top-4 -left-4 bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 mt-4">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}
