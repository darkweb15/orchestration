/**
 * API Client for FastAPI Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseUrl: string
  private apiKey: string | null

  constructor() {
    this.baseUrl = API_BASE_URL
    this.apiKey = typeof window !== 'undefined' 
      ? localStorage.getItem('scrapepro_api_key') 
      : null
  }

  private getHeaders(contentType = 'application/json'): HeadersInit {
    const headers: HeadersInit = {}
    if (contentType) headers['Content-Type'] = contentType
    if (this.apiKey) headers['X-API-Key'] = this.apiKey
    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // ==================== Scraping Endpoints ====================

  async startScrape(data: {
    search_terms: string[]
    zip_codes: string[]
    max_results_per_search: number
    scraping_speed: string
  }) {
    return this.request<{ job_id: string; message: string }>('/api/scrape', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getJobStatus(jobId: string) {
    return this.request<{
      job_id: string
      status: string
      total: number
      completed: number
      results_count: number
      results: any[]
      errors: string[]
      duplicates_skipped: number
      eta_seconds: number | null
      elapsed_seconds: number | null
    }>(`/api/job/${jobId}`)
  }

  async getAllJobs() {
    return this.request<Array<{
      job_id: string
      status: string
      total: number
      completed: number
      results_count: number
    }>>('/api/jobs')
  }

  // ==================== Task History Endpoints ====================

  async getTasks() {
    return this.request<{ tasks: any[] }>('/api/tasks')
  }

  async getTaskResults(jobId: string) {
    return this.request<{ results: any[]; count: number }>(`/api/tasks/${jobId}/results`)
  }

  async deleteTask(jobId: string) {
    return this.request<{ message: string }>(`/api/tasks/${jobId}`, {
      method: 'DELETE',
    })
  }

  // ==================== Database Endpoints ====================

  async getBusinessData(industry = '', limit = 5000) {
    return this.request<{ data: any[]; count: number }>(
      `/api/data?industry=${encodeURIComponent(industry)}&limit=${limit}`
    )
  }

  async getIndustries() {
    return this.request<{ industries: string[] }>('/api/industries')
  }

  async getStats() {
    return this.request<{
      total_businesses: number
      total_emails: number
      total_tasks: number
    }>('/api/stats')
  }

  async deleteAllData() {
    return this.request<{ message: string }>('/api/data', {
      method: 'DELETE',
    })
  }

  // ==================== Export Endpoints ====================

  async exportTaskResults(jobId: string, format: 'csv' | 'json') {
    const url = `${this.baseUrl}/api/export-task/${jobId}/${format}`
    const response = await fetch(url, {
      headers: this.getHeaders(),
    })
    if (!response.ok) throw new Error('Export failed')
    return response.blob()
  }

  async exportJobResults(jobId: string, format: 'csv' | 'json') {
    const url = `${this.baseUrl}/api/export/${jobId}/${format}`
    const response = await fetch(url, {
      headers: this.getHeaders(),
    })
    if (!response.ok) throw new Error('Export failed')
    return response.blob()
  }

  async exportDbData(format: 'csv' | 'json', industry = '') {
    const url = `${this.baseUrl}/api/export-db/${format}?industry=${encodeURIComponent(industry)}`
    const response = await fetch(url, {
      headers: this.getHeaders(),
    })
    if (!response.ok) throw new Error('Export failed')
    return response.blob()
  }

  // ==================== Utility Methods ====================

  setApiKey(key: string) {
    this.apiKey = key
    if (typeof window !== 'undefined') {
      localStorage.setItem('scrapepro_api_key', key)
    }
  }

  clearApiKey() {
    this.apiKey = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('scrapepro_api_key')
    }
  }

  downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }
}

export const apiClient = new ApiClient()
