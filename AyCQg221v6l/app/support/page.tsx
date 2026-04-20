"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import {
  MessageCircle,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "How do I set up my first scraping job?",
    answer: "Navigate to the Search page, click 'New Scraper', enter your target URL and configure the extraction rules. Our visual selector tool makes it easy to select the data you want to extract.",
  },
  {
    question: "What is the difference between residential and datacenter proxies?",
    answer: "Residential proxies use real IP addresses from ISPs, making them harder to detect. Datacenter proxies are faster but may be blocked by some websites. We recommend residential for sensitive targets.",
  },
  {
    question: "How can I export my scraped data?",
    answer: "Go to History, select the jobs you want to export, and click Download. We support JSON, CSV, and SQL formats. You can also use our API to programmatically access your data.",
  },
  {
    question: "What happens if a scraping job fails?",
    answer: "Failed jobs are automatically retried up to 3 times with exponential backoff. You'll receive a notification when a job fails permanently. Check the error logs for debugging.",
  },
  {
    question: "How do I upgrade my subscription?",
    answer: "Visit Settings > Billing to view available plans and upgrade your subscription. Changes take effect immediately and are prorated.",
  },
]

const tickets = [
  { id: "TKT-001", subject: "API rate limit exceeded", status: "open", priority: "high", updated: "2 hours ago" },
  { id: "TKT-002", subject: "Custom selector not working", status: "pending", priority: "medium", updated: "1 day ago" },
  { id: "TKT-003", subject: "Billing inquiry", status: "resolved", priority: "low", updated: "3 days ago" },
]

const statusStyles = {
  open: { color: "text-neon-cyan", bg: "bg-neon-cyan/10" },
  pending: { color: "text-warning", bg: "bg-warning/10" },
  resolved: { color: "text-neon-green", bg: "bg-neon-green/10" },
}

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [message, setMessage] = useState("")

  return (
    <DashboardLayout title="Support">
      <div className="p-6 space-y-6">
        {/* Contact Options */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neon-blue/30 bg-gradient-to-br from-neon-blue/10 to-transparent p-5 text-center hover:shadow-lg hover:shadow-neon-blue/10 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-neon-blue/20 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-neon-blue" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Live Chat</h3>
            <p className="text-xs text-muted-foreground mb-3">Chat with our support team</p>
            <span className="text-xs text-neon-green font-medium">Online Now</span>
          </div>
          <div className="rounded-2xl border border-neon-green/30 bg-gradient-to-br from-neon-green/10 to-transparent p-5 text-center hover:shadow-lg hover:shadow-neon-green/10 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-neon-green/20 flex items-center justify-center mx-auto mb-3">
              <Mail className="h-6 w-6 text-neon-green" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Email Support</h3>
            <p className="text-xs text-muted-foreground mb-3">support@scraperpro.com</p>
            <span className="text-xs text-muted-foreground">Response in 24h</span>
          </div>
          <div className="rounded-2xl border border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 to-transparent p-5 text-center hover:shadow-lg hover:shadow-neon-cyan/10 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-neon-cyan" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Documentation</h3>
            <p className="text-xs text-muted-foreground mb-3">Guides and tutorials</p>
            <span className="text-xs text-neon-cyan flex items-center justify-center gap-1">
              View Docs <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* FAQs */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search FAQs..." className="pl-9 w-48 bg-muted/30 border-border/50 rounded-xl h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-xl border transition-all",
                    openFaq === index ? "border-neon-cyan/30 bg-neon-cyan/5" : "border-border/50 bg-muted/20"
                  )}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-foreground pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-neon-cyan shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Support Tickets */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">My Tickets</h3>
              <button className="text-xs text-neon-cyan font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-3 mb-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                      statusStyles[ticket.status as keyof typeof statusStyles].bg,
                      statusStyles[ticket.status as keyof typeof statusStyles].color
                    )}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.updated}</p>
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-background font-medium hover:opacity-90 transition-all text-sm">
              Create New Ticket
            </button>
          </div>
        </div>

        {/* Quick Message */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Send us a Message</h3>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <Input placeholder="Your Name" className="bg-muted/30 border-border/50 rounded-xl" />
            <Input placeholder="Email Address" className="bg-muted/30 border-border/50 rounded-xl" />
          </div>
          <Input placeholder="Subject" className="bg-muted/30 border-border/50 rounded-xl mb-4" />
          <textarea
            placeholder="Describe your issue or question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 bg-muted/30 border border-border/50 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-neon-cyan"
          />
          <div className="flex justify-end mt-4">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-background font-medium hover:opacity-90 transition-all">
              <Send className="h-4 w-4" />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
