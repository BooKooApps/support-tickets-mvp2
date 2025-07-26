"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateTicketDialog } from "./create-ticket-dialog"

export function CreateTicketButton() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Ticket
      </Button>

      <CreateTicketDialog open={showDialog} onOpenChange={setShowDialog} />
    </>
  )
}
