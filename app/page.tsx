import ResearchActivity from "@/components/dashboard/research-activity"
import SystemStatus from "@/components/dashboard/system-status"
import BracketsIcon from "@/components/icons/brackets"
import mockDataJson from "@/mock.json"
import type { MockData } from "@/types/dashboard"
import Widget from "@/components/dashboard/widget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Database, Users, Clock, Sparkles, Rocket, Shield, Activity, Star, Globe, ArrowUp, TrendingUp } from "lucide-react"

const mockData = mockDataJson as MockData

export default function DashboardOverview() {
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Compact Hero */}
        <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/25">
                  <BracketsIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    TL;DR DASHBOARD
                  </h1>
                  <p className="text-slate-400 mt-1">Making research digestible since 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 font-medium">All Systems Online</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-200px)]">
            
            {/* Time Widget - Prominent */}
            <div className="col-span-12 lg:col-span-8 h-48">
              <Widget widgetData={mockData.widgetData} />
            </div>

            {/* Quick Action Card */}
            <div className="col-span-12 lg:col-span-4 h-48">
              <Card className="h-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 relative overflow-hidden group hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 group-hover:from-emerald-600/20 group-hover:to-teal-600/20 transition-all duration-500" />
                <CardContent className="relative z-10 p-6 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-emerald-500/30">
                      <Rocket className="h-8 w-8 text-emerald-400" />
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      Ready
                    </Badge>
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Quick Start</h3>
                    <p className="text-emerald-200 text-sm">Upload a paper and get instant AI summaries</p>
                  </div>
                  <button className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-emerald-400 font-medium transition-all duration-300 hover:scale-105">
                    Start Analyzing
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Stats Row - Compact */}
            <div className="col-span-12 lg:col-span-3 h-32">
              <Card className="h-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 group hover:scale-105 transition-transform duration-300">
                <CardContent className="p-4 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-500/30">
                      <Brain className="h-5 w-5 text-blue-400" />
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      +12%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-blue-400 text-sm font-medium uppercase tracking-wide">AI Summaries</p>
                    <p className="text-2xl font-bold text-white">847</p>
                    <p className="text-xs text-slate-400">Papers processed</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-3 h-32">
              <Card className="h-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 group hover:scale-105 transition-transform duration-300">
                <CardContent className="p-4 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-500/30">
                      <Clock className="h-5 w-5 text-purple-400" />
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      +8%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-purple-400 text-sm font-medium uppercase tracking-wide">Time Saved</p>
                    <p className="text-2xl font-bold text-white">156h</p>
                    <p className="text-xs text-slate-400">This month</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-3 h-32">
              <Card className="h-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 group hover:scale-105 transition-transform duration-300">
                <CardContent className="p-4 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-cyan-500/30">
                      <Database className="h-5 w-5 text-cyan-400" />
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                      24H
                    </Badge>
                  </div>
                  <div>
                    <p className="text-cyan-400 text-sm font-medium uppercase tracking-wide">Papers</p>
                    <p className="text-2xl font-bold text-white">42</p>
                    <p className="text-xs text-slate-400">Simplified today</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-3 h-32">
              <Card className="h-full bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 group hover:scale-105 transition-transform duration-300">
                <CardContent className="p-4 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/30">
                      <Users className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex items-center gap-1">
                      <ArrowUp className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400">Growing</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-green-400 text-sm font-medium uppercase tracking-wide">Users</p>
                    <p className="text-2xl font-bold text-white">1.2K</p>
                    <p className="text-xs text-slate-400">Active community</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-6">
              <Card className="h-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/60 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    App Creators
                    <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 ml-auto">
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <ResearchActivity activity={mockData.researchActivity} />
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <Card className="h-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-900/60 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-400" />
                    System Status
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm text-green-400 font-medium">Online</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <SystemStatus statuses={mockData.systemStatus} />
                </CardContent>
              </Card>
            </div>

          </div>

          {/* Bottom Feature Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="group bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="p-3 rounded-xl bg-orange-500/30 group-hover:bg-orange-500/40 transition-colors w-fit mx-auto mb-4">
                  <Zap className="h-6 w-6 text-orange-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Lightning Fast</h4>
                <p className="text-slate-400 text-sm">Get research summaries in seconds</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="p-3 rounded-xl bg-pink-500/30 group-hover:bg-pink-500/40 transition-colors w-fit mx-auto mb-4">
                  <Brain className="h-6 w-6 text-pink-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">AI Powered</h4>
                <p className="text-slate-400 text-sm">Advanced algorithms understand research</p>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-teal-500/30 hover:scale-105 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="p-3 rounded-xl bg-teal-500/30 group-hover:bg-teal-500/40 transition-colors w-fit mx-auto mb-4">
                  <Globe className="h-6 w-6 text-teal-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Global Access</h4>
                <p className="text-slate-400 text-sm">Millions of papers worldwide</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}