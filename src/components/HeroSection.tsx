import { Zap, Network, Globe, Sparkles, Database, Share2 } from 'lucide-react'

export default function HeroSection() {
  const features = [
    {
      icon: Zap,
      title: 'AI Agent Orchestration',
      description: 'Run multiple scraping agents in parallel',
    },
    {
      icon: Network,
      title: 'Smart Proxy Rotation',
      description: 'Built-in proxy intelligence & rotation',
    },
    {
      icon: Globe,
      title: 'Browser Automation',
      description: 'Real browser instances with live monitoring',
    },
    {
      icon: Sparkles,
      title: 'Data Enrichment',
      description: 'Extract, clean and enrich automatically',
    },
    {
      icon: Share2,
      title: 'Export Anywhere',
      description: 'CSV, Excel, API, Webhooks & more',
    },
  ]

  const stats = [
    { value: '2.4M+', label: 'Records Extracted' },
    { value: '14', label: 'Active Agents' },
    { value: '98.9%', label: 'Success Rate' },
    { value: '99.9%', label: 'Uptime' },
  ]

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-50 to-purple-50 px-8 py-12 flex flex-col justify-between">
      {/* Logo Section */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
            <div className="text-white font-bold text-lg">A</div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Agentic Scraper</h1>
            <p className="text-sm text-gray-600">AI-Powered Web Scraping Platform</p>
          </div>
        </div>

        {/* Main Headline */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Extract. Automate. Scale.
          </h2>
          <p className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-purple-600">AI Agents</span>
            {' Doing the Work '}
            <span className="text-purple-600">While You Focus on Growth.</span>
          </p>
          <p className="text-gray-700 text-lg mb-8">
            Deploy intelligent scraping agents, manage browser fleets, and turn unstructured web data into real business value.
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-4 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stat.value}</p>
            <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
