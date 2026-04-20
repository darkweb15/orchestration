"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function HistoryPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getTasks()
      setTasks(response.tasks || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load task history.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (jobId: string, format: 'csv' | 'json') => {
    try {
      const blob = await apiClient.exportTaskResults(jobId, format)
      apiClient.downloadBlob(blob, `task_${jobId}.${format}`)
      toast({
        title: "Export Successful",
        description: `Downloaded task results as ${format.toUpperCase()}.`,
      })
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!taskToDelete) return

    try {
      await apiClient.deleteTask(taskToDelete)
      toast({
        title: "Task Deleted",
        description: "Task and all associated data removed.",
      })
      setTasks(tasks.filter(t => t.job_id !== taskToDelete))
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; color: string }> = {
      'Completed': { 
        variant: 'default', 
        icon: CheckCircle2, 
        color: 'text-neon-green' 
      },
      'Running': { 
        variant: 'secondary', 
        icon: Clock, 
        color: 'text-neon-blue' 
      },
      'Failed': { 
        variant: 'destructive', 
        icon: XCircle, 
        color: 'text-red-500' 
      },
    }

    const config = variants[status] || variants['Failed']
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <DashboardLayout title="Task History">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-neon-blue" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Task History">
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card className="border-neon-blue/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold">{tasks.length}</span>
            </CardContent>
          </Card>

          <Card className="border-neon-green/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-neon-green">
                {tasks.filter(t => t.status === 'Completed').length}
              </span>
            </CardContent>
          </Card>

          <Card className="border-neon-cyan/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Running
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-neon-cyan">
                {tasks.filter(t => t.status === 'Running').length}
              </span>
            </CardContent>
          </Card>

          <Card className="border-red-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-red-400">
                {tasks.filter(t => t.status === 'Failed').length}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <Card className="border-neon-blue/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Tasks</CardTitle>
                <CardDescription>Complete history of scraping jobs</CardDescription>
              </div>
              <Button onClick={loadTasks} variant="outline" size="sm">
                <Loader2 className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tasks Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start scraping to see your task history here.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Search Term</TableHead>
                      <TableHead>Locations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Results</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.job_id}>
                        <TableCell className="font-mono text-xs text-neon-cyan">
                          {task.job_id}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {task.search_term}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {task.zip_codes}
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>
                          <span className="font-bold text-neon-green">
                            {task.total_results || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(task.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExport(task.job_id, 'csv')}
                              title="Export CSV"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExport(task.job_id, 'json')}
                              title="Export JSON"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTaskToDelete(task.job_id)
                                setDeleteDialogOpen(true)
                              }}
                              title="Delete Task"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the task and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
