"use client"

import { Card } from "@/components/ui/card"
import { GraduationCap, User } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ActionButton {
  label: string
  value: string
}

export interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  imageUrl?: string          // timetable image
  buttons?: ActionButton[]  // interactive choice buttons
}

interface ChatMessageProps {
  message: Message
  onButtonClick?: (value: string) => void
}

export function ChatMessage({ message, onButtonClick }: ChatMessageProps) {
  const isUser = message.type === "user"

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
          isUser ? "bg-secondary" : "bg-primary",
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <GraduationCap className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      <div className="flex flex-col gap-2 max-w-[80%]">
        <Card
          className={cn(
            "px-4 py-3",
            isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          )}
        >
          <p className="text-sm whitespace-pre-line">{message.content}</p>

          {/* Timetable image */}
          {message.imageUrl && (
            <div className="mt-3">
              <img
                src={message.imageUrl}
                alt="Timetable"
                className="w-full rounded-xl border border-border object-contain max-h-[420px] cursor-pointer"
                onClick={() => window.open(message.imageUrl, '_blank')}
                title="Click to open full size"
              />
              <p className="text-xs text-muted-foreground mt-1">Tap to open full size</p>
            </div>
          )}

          <p className={cn("text-xs mt-2", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {message.timestamp.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </Card>

        {/* Action buttons rendered BELOW the bubble */}
        {message.buttons && message.buttons.length > 0 && onButtonClick && (
          <div className="flex flex-wrap gap-2 mt-1">
            {message.buttons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => onButtonClick(btn.value)}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-primary text-primary bg-white hover:bg-primary hover:text-white transition-all duration-200 shadow-sm active:scale-95"
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
