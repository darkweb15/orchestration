"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { 
  Key, 
  Database, 
  CheckCircle2, 
  XCircle,
  Save,
  Trash2,
  Server,
  Globe,
  Shield
} from "lucide-react"

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [stats, setStats] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load saved API key
    const saved = localStorage.getItem('scrapepro_api_key')
    if (saved) setApiKey(saved)

    checkConnections()
  }, [])

  const checkConnections = async () => {
    // Check backend
    try {
      const statsData = await apiClient.getStats()
      setStats(statsData)
      setBackendStatus('connected')
      setDbStatus('connected')
    } catch (error) {
      setBackendStatus('disconnected')
      setDbStatus('disconnected')
    }
  }

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key.",
        variant: "destructive",
      })
      return
    }

    apiClient.setApiKey(apiKey)
    toast({
      title: "API Key Saved",
      description: "Your API key has been saved to browser storage.",
    })
  }

  const handleClearApiKey = () => {
    setApiKey("")
    apiClient.clearApiKey()
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed.",
    })
  }

  const getStatusBadge = (status: 'checking' | 'connected' | 'disconnected') => {
    if (status === 'checking') {
      return <Badge variant="secondary">Checking...</Badge>
    }
    if (status === 'connected') {
      return (
        <Badge variant="default" className="bg-neon-green/20 text-neon-green border-neon-green/30">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Connected
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" />
        Disconnected
      </Badge>
    )
  }

  return (
    <DashboardLayout title="Settings">
      <div className="p-6 space-y-6 max-w-4xl">
        {/* System Status */}
        <Card className="border-neon-blue/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-neon-blue" />
              System Status
            </CardTitle>
            <CardDescription>Connection status and health checks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-blue/20">
                  <Globe className="h-5 w-5 text-neon-blue" />
                </div>
                <div>
                  <p className="font-medium">Backend API</p>
                  <p className="text-sm text-muted-foreground">
                    {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                  </p>
                </div>
              </div>
              {getStatusBadge(backendStatus)}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-green/20">
                  <Database className="h-5 w-5 text-neon-green" />
                </div>
                <div>
                  <p className="font-medium">Database (Supabase)</p>
                  <p className="text-sm text-muted-foreground">
                    {stats ? `${stats.total_businesses} records` : 'Checking...'}
                  </p>
                </div>
              </div>
              {getStatusBadge(dbStatus)}
            </div>

            <Button onClick={checkConnections} variant="outline" className="w-full">
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        {/* API Key Configuration */}
        <Card className="border-neon-cyan/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-neon-cyan" />
              API Key Configuration
            </CardTitle>
            <CardDescription>
              Configure API key for protected endpoints (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={handleSaveApiKey} size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button onClick={handleClearApiKey} variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                API key is stored locally in your browser. Set this if your backend requires authentication.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Protected Endpoints</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  POST /api/scrape - Start scraping job
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  DELETE /api/tasks/:id - Delete task
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  DELETE /api/data - Delete all data
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Database Statistics */}
        {stats && (
          <Card className="border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-400" />
                Database Statistics
              </CardTitle>
              <CardDescription>Current database metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Total Businesses</p>
                  <p className="text-2xl font-bold">{stats.total_businesses.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Emails Found</p>
                  <p className="text-2xl font-bold text-neon-green">{stats.total_emails.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Total Tasks</p>
                  <p className="text-2xl font-bold text-neon-cyan">{stats.total_tasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Info */}
        <Card className="border-neon-blue/30">
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frontend Version</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backend API</span>
              <span className="font-mono text-neon-cyan">FastAPI 2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-mono">Next.js 16</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database</span>
              <span className="font-mono">Supabase (PostgreSQL)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
