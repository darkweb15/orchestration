"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { 
  Database, 
  Mail, 
  Building2, 
  TrendingUp,
  Download,
  Search,
  Loader2,
  Globe,
  CheckCircle2,
  XCircle
} from "lucide-react"

export default function StatisticsPage() {
  const [stats, setStats] = useState({
    total_businesses: 0,
    total_emails: 0,
    total_tasks: 0,
  })
  const [industries, setIndustries] = useState<string[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState("")
  const [businessData, setBusinessData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadBusinessData()
  }, [selectedIndustry])

  useEffect(() => {
    filterData()
  }, [searchQuery, businessData])

  const loadData = async () => {
    try {
      const [statsData, industriesData] = await Promise.all([
        apiClient.getStats(),
        apiClient.getIndustries(),
      ])
      setStats(statsData)
      setIndustries(industriesData.industries || [])
      setLoading(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load statistics.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const loadBusinessData = async () => {
    try {
      const response = await apiClient.getBusinessData(selectedIndustry, 1000)
      setBusinessData(response.data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load business data.",
        variant: "destructive",
      })
    }
  }

  const filterData = () => {
    if (!searchQuery.trim()) {
      setFilteredData(businessData)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = businessData.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.final_email?.toLowerCase().includes(query) ||
      item.phone?.toLowerCase().includes(query) ||
      item.website?.toLowerCase().includes(query) ||
      item.search_query?.toLowerCase().includes(query)
    )
    setFilteredData(filtered)
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await apiClient.exportDbData(format, selectedIndustry)
      const filename = selectedIndustry 
        ? `leads_${selectedIndustry}.${format}` 
        : `leads_all.${format}`
      apiClient.downloadBlob(blob, filename)
      toast({
        title: "Export Successful",
        description: `Downloaded ${filteredData.length} records as ${format.toUpperCase()}.`,
      })
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const emailRate = stats.total_businesses > 0 
    ? Math.round((stats.total_emails / stats.total_businesses) * 100) 
    : 0

  const posCount = businessData.filter(b => b.has_pos === 'Yes').length
  const posRate = businessData.length > 0 
    ? Math.round((posCount / businessData.length) * 100) 
    : 0

  if (loading) {
    return (
      <DashboardLayout title="Statistics">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Statistics">
      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-neon-blue/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Total Businesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_businesses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">All time records</p>
            </CardContent>
          </Card>

          <Card className="border-neon-green/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Emails Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neon-green">{stats.total_emails.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{emailRate}% success rate</p>
            </CardContent>
          </Card>

          <Card className="border-neon-cyan/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-neon-cyan">{stats.total_tasks}</div>
              <p className="text-xs text-muted-foreground mt-1">Scraping jobs</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Industries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{industries.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Unique categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="border-neon-blue/30">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Business Database</CardTitle>
                <CardDescription>
                  {filteredData.length} of {businessData.length} records
                  {selectedIndustry && ` in ${selectedIndustry}`}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => handleExport('csv')} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button onClick={() => handleExport('json')} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, website..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Current View Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-neon-blue" />
                <span className="text-muted-foreground">Records:</span>
                <span className="font-bold">{filteredData.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-neon-green" />
                <span className="text-muted-foreground">With Email:</span>
                <span className="font-bold text-neon-green">
                  {filteredData.filter(d => d.final_email).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span className="text-muted-foreground">POS:</span>
                <span className="font-bold text-purple-400">
                  {filteredData.filter(d => d.has_pos === 'Yes').length}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>POS</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.slice(0, 100).map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.search_query || '-'}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-neon-cyan">
                          {item.final_email || '-'}
                        </TableCell>
                        <TableCell className="text-sm">{item.phone || '-'}</TableCell>
                        <TableCell className="text-xs">
                          {item.website ? (
                            <a 
                              href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-neon-blue hover:underline flex items-center gap-1"
                            >
                              <Globe className="h-3 w-3" />
                              Visit
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {item.has_pos === 'Yes' ? (
                            <Badge variant="default" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {item.pos_system || 'Yes'}
                            </Badge>
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell>
                          {item.status === 'Open' ? (
                            <Badge variant="default" className="bg-neon-green/20 text-neon-green border-neon-green/30">
                              Open
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Closed</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredData.length > 100 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing first 100 of {filteredData.length} results
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
