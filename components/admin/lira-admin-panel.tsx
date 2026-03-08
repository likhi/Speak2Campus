'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, ScrollText, BarChart3, BrainCircuit } from 'lucide-react'
import { LiraIntentManager } from './lira-intent-manager'
import { LiraLogsViewer } from './lira-logs-viewer'
import { LiraAnalytics } from './lira-analytics'
import { ConversationalTrainer } from './conversational-trainer'
import { TrainingHistory } from './training-history'

export function LiraAdminPanel() {
    const [activeTab, setActiveTab] = useState('train')
    // Increment this every time a new entry is saved to auto-refresh the history
    const [historyRefresh, setHistoryRefresh] = useState(0)

    return (
        <div className="space-y-4">
            {/* Lira branding header */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="font-bold text-lg leading-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        LIRA AI Control Center
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Manage intents, view interaction logs, and monitor analytics
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-600 font-medium">Active</span>
                </div>
            </div>

            {/* Sub-tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="train" className="flex items-center gap-1.5 text-xs font-semibold">
                        <BrainCircuit className="w-3.5 h-3.5" /> Train
                    </TabsTrigger>
                    <TabsTrigger value="intents" className="flex items-center gap-1.5 text-xs">
                        <Zap className="w-3.5 h-3.5" /> Intents
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="flex items-center gap-1.5 text-xs">
                        <ScrollText className="w-3.5 h-3.5" /> Logs
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-xs">
                        <BarChart3 className="w-3.5 h-3.5" /> Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="train" className="mt-4">
                    {/* Training builder */}
                    <ConversationalTrainer
                        onSaved={() => setHistoryRefresh(prev => prev + 1)}
                    />

                    {/* Training history — live-refreshes after every save */}
                    <TrainingHistory refreshTrigger={historyRefresh} />
                </TabsContent>

                <TabsContent value="intents" className="mt-4">
                    <LiraIntentManager />
                </TabsContent>
                <TabsContent value="logs" className="mt-4">
                    <LiraLogsViewer />
                </TabsContent>
                <TabsContent value="analytics" className="mt-4">
                    <LiraAnalytics />
                </TabsContent>
            </Tabs>
        </div>
    )
}
