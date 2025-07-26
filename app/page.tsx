import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold  mb-4">Support Tickets MVP</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive ticket management system for creators and customers
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                Creator Dashboard
              </CardTitle>
              <CardDescription>Manage tickets, view analytics, and configure settings</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• View and manage open tickets</li>
                <li>• Comprehensive analytics dashboard</li>
                <li>• Customize categories and messages</li>
                <li>• Review customer feedback</li>
              </ul>
              <Link href="/creator">
                <Button className="w-full">Access Creator Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">

                Customer Portal
              </CardTitle>
              <CardDescription>Submit tickets and track support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li>• Create and manage support tickets</li>
                <li>• Real-time chat with support</li>
                <li>• Track ticket status</li>
                <li>• Leave reviews and feedback</li>
              </ul>
              <Link href="/customer">
                <Button variant="outline" className="w-full bg-transparent">
                  Access Customer Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  )
}
