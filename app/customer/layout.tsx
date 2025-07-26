"use client"

import type React from "react"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Home, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className=" shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span className="font-semibold">Support Portal</span>
              </Link>
              <Badge variant="outline">Customer</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Jane Customer</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
    </div>
  )
}
