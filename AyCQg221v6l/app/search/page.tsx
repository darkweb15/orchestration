"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { Play, Download, Loader2, CheckCircle2, XCircle, Globe, Mail, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SearchPage() {
  const [searchTerms, setSearchTerms] = useState("liquor stores\nwine shops")
  const [zipCodes, setZipCodes] = useState("10001 New York NY USA\n90001 Los Angeles CA USA")
  const [maxResults, setMaxResults] = useState(20)
  const [scrapingSpeed, setScrapingSpeed] = useState("balanced")
  const [isRunning, setIsRunning] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<any>(null)
  const [results, setResults] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (currentJobId && isRunning) {
      interval = setInterval(async () => {
        try {
          const status = await apiClient.getJobStatus(currentJobId)
          setJobStatus(status)
          setResults(status.results || [])
          
          if (status.status === 'completed' || status.status === 'failed') {
            setIsRunning(false)
            if (interval) clearInterval(interval)
            
            if (status.status === 'completed') {
              toast({
                title: "Scraping Completed!",
                description: `Found ${status.results_count} leads. ${status.duplicates_skipped || 0} duplicates skipped.`,
              })
            } else {
              toast({
                title: "Scraping Failed",
                description: "Check logs for details.",
                variant: "destructive",
              })
            }
          }
        } catch (error: any) {
          console.error('Poll error:', error)
          if (error.message.includes('404')) {
            setIsRunning(false)
            if (interval) clearInterval(interval)
            toast({
              title: "Job Not Found",
              description: "Job may have completed. Check history.",
              variant: "destructive",
            })
          }
        }
      }, 2000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentJobId, isRunning, toast])

  const handleStartScraping = async () => {
    const terms = searchTerms.split('\n').map(s => s.trim()).filter(Boolean)
    const zips = zipCodes.split('\n').map(s => s.trim()).filter(Boolean)

    if (terms.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one search term.",
        variant: "destructive",
      })
      return
    }

    if (zips.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one zip code.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsRunning(true)
      const response = await apiClient.startScrape({
        search_terms: terms,
        zip_codes: zips,
        max_results_per_search: maxResults,
        scraping_speed: scrapingSpeed,
      })
      
      setCurrentJobId(response.job_id)
      setJobStatus(null)
      setResults([])
      
      toast({
        title: "Scraping Started!",
        description: `Job ID: ${response.job_id}`,
      })
    } catch (error: any) {
      setIsRunning(false)
      toast({
        title: "Failed to Start",
        description: error.message || "Could not start scraping job.",
        variant: "destructive",
      })
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    if (!currentJobId) return
    
    try {
      const blob = await apiClient.exportJobResults(currentJobId, format)
      apiClient.downloadBlob(blob, `leads_${currentJobId}.${format}`)
      toast({
        title: "Export Successful",
        description: `Downloaded ${results.length} leads as ${format.toUpperCase()}.`,
      })
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const progress = jobStatus ? Math.round((jobStatus.completed / jobStatus.total) * 100) : 0
  const emailsFound = results.filter(r => r.final_email).length
  const posDetected = results.filter(r => r.has_pos === 'Yes').length

  return (
    <DashboardLayout title="Search & Scrape">
      <div className="p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1 border-neon-blue/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-neon-blue" />
                Scraper Configuration
              </CardTitle>
              <CardDescription>Configure your scraping job</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Terms</Label>
                <Textarea
                  placeholder="liquor stores&#10;wine shops&#10;beer distributors"
                  value={searchTerms}
                  onChange={(e) => setSearchTerms(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                  disabled={isRunning}
                />
                <p className="text-xs text-muted-foreground">One term per line</p>
              </div>

              <div className="space-y-2">
                <Label>Zip Codes</Label>
                <Textarea
                  placeholder="10001 New York NY USA&#10;90001 Los Angeles CA USA"
                  value={zipCodes}
                  onChange={(e) => setZipCodes(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                  disabled={isRunning}
                />
                <p className="text-xs text-muted-foreground">Format: zipcode city state country</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Results</Label>
                  <Input
                    type="number"
                    value={maxResults}
                    onChange={(e) => setMaxResults(parseInt(e.target.value))}
                    min={1}
                    max={100}
                    disabled={isRunning}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Speed</Label>
                  <Select value={scrapingSpeed} onValueChange={setScrapingSpeed} disabled={isRunning}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">⚡ Fast</SelectItem>
                      <SelectItem value="balanced">⚖️ Balanced</SelectItem>
                      <SelectItem value="quality">🎯 Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleStartScraping}
                disabled={isRunning}
                className="w-full bg-gradient-to-r from-neon-blue to-neon-cyan hover:opacity-90"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Scraping
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Monitor Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-neon-green/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Leads Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-neon-green" />
                    <span className="text-3xl font-bold">{results.length}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neon-cyan/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Emails Found
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-neon-cyan" />
                    <span className="text-3xl font-bold text-neon-cyan">{emailsFound}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    POS Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-400" />
                    <span className="text-3xl font-bold text-purple-400">{posDetected}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Card */}
            {jobStatus && (
              <Card className="border-neon-blue/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Scraping Progress</CardTitle>
                    <Badge variant={jobStatus.status === 'completed' ? 'default' : 'secondary'}>
                      {jobStatus.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{jobStatus.completed} / {jobStatus.total} searches</span>
                      <span className="font-bold text-neon-cyan">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Elapsed:</span>
                      <span className="ml-2 font-mono">
                        {jobStatus.elapsed_seconds ? `${Math.floor(jobStatus.elapsed_seconds / 60)}m ${jobStatus.elapsed_seconds % 60}s` : '--'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ETA:</span>
                      <span className="ml-2 font-mono">
                        {jobStatus.eta_seconds ? `${Math.floor(jobStatus.eta_seconds / 60)}m ${jobStatus.eta_seconds % 60}s` : '--'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duplicates:</span>
                      <span className="ml-2 font-mono text-orange-400">{jobStatus.duplicates_skipped || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Errors:</span>
                      <span className="ml-2 font-mono text-red-400">{jobStatus.errors?.length || 0}</span>
                    </div>
                  </div>

                  {jobStatus.status === 'completed' && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={() => handleExport('csv')} variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                      <Button onClick={() => handleExport('json')} variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Export JSON
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Results Table */}
            {results.length > 0 && (
              <Card className="border-neon-cyan/30">
                <CardHeader>
                  <CardTitle>Scraped Results ({results.length})</CardTitle>
                  <CardDescription>Latest leads from current job</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border max-h-96 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>POS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.slice(0, 50).map((result, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{idx + 1}</TableCell>
                            <TableCell className="font-medium">{result.name}</TableCell>
                            <TableCell className="text-neon-cyan text-xs font-mono">
                              {result.final_email || '-'}
                            </TableCell>
                            <TableCell className="text-xs">{result.phone || '-'}</TableCell>
                            <TableCell className="text-xs">{result.city || '-'}</TableCell>
                            <TableCell>
                              {result.has_pos === 'Yes' ? (
                                <CheckCircle2 className="h-4 w-4 text-neon-green" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {results.length > 50 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Showing first 50 of {results.length} results
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
