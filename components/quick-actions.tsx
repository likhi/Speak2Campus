"use client"

import { MapPin, Users, Calendar, Clock, HelpCircle, Image, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

interface QuickActionsProps {
  onAction: (action: string) => void
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const router = useRouter()

  const actions = [
    { icon: MapPin, label: "Locations", query: "What locations are available?" },
    { icon: Users, label: "Faculty", query: "Who are the MCA faculty members?", href: '/faculty' },
    { icon: Calendar, label: "Timetable", query: "Show timetable" },
    { icon: Clock, label: "Events", query: "What events are coming up?" },
    { icon: Image, label: "Gallery", query: "Show campus gallery", href: '/gallery' },
    { icon: Video, label: "Virtual Tour", query: "Play virtual tour", href: '/virtual-tour' },
    { icon: HelpCircle, label: "Help", query: "What can you help me with?" },
  ]

  return (
    <div className="px-4 py-3 border-b border-border bg-muted/30">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className="shrink-0 gap-2 rounded-full bg-transparent"
            onClick={() => {
              if ((action as any).href) {
                router.push((action as any).href)
                return
              }
              onAction(action.query)
            }}
          >
            <action.icon className="w-4 h-4" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
