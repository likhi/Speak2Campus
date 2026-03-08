'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

/**
 * Floating button to navigate to the Founders page
 * Position: Bottom right corner, 70px above the bottom edge
 * Design: Circular button with hover animation
 */
export function FoundersFloatingButton() {
  return (
    <Link href="/founders">
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-30 right-64 z-50 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl hover:scale-110 transition-all hover:bg-slate-50 dark:hover:bg-slate-700"
        title="Meet Our Team - Click to view founders"
      >
        <Users className="h-5 w-5" />
      </Button>
    </Link>
  )
}
