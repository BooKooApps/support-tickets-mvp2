import { Suspense } from "react"
import { TicketsList } from "@/components/creator/tickets-list"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreatorTicketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold ">Open Tickets</h1>
        <p className="text-muted-foreground mt-2">Manage and respond to customer support requests</p>
      </div>

      <Suspense fallback={<TicketsListSkeleton />}>
        <TicketsList />
      </Suspense>
    </div>
  )
}

function TicketsListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
