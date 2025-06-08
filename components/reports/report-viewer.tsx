"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Trash2, Calendar } from "lucide-react"

interface Report {
  id: string
  name: string
  type: string
  dateRange: string
  format: string
  size: string
  createdAt: string
  downloadUrl: string
}

export function ReportViewer() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      try {
        const response = await fetch("/api/reports")
        if (response.ok) {
          const data = await response.json()
          setReports(data.reports)
        }
      } catch (error) {
        console.error("Error fetching reports:", error)
        // Fallback data
        setReports([
          {
            id: "1",
            name: "Monthly Summary - December 2023",
            type: "Monthly",
            dateRange: "Dec 1-31, 2023",
            format: "PDF",
            size: "2.4 MB",
            createdAt: "2024-01-02",
            downloadUrl: "/reports/monthly-dec-2023.pdf",
          },
          {
            id: "2",
            name: "Quarterly Report - Q4 2023",
            type: "Quarterly",
            dateRange: "Oct-Dec 2023",
            format: "Excel",
            size: "1.8 MB",
            createdAt: "2024-01-01",
            downloadUrl: "/reports/quarterly-q4-2023.xlsx",
          },
          {
            id: "3",
            name: "Tax Report 2023",
            type: "Tax",
            dateRange: "Jan-Dec 2023",
            format: "PDF",
            size: "3.2 MB",
            createdAt: "2023-12-30",
            downloadUrl: "/reports/tax-2023.pdf",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  const handleDownload = (report: Report) => {
    // In a real app, this would trigger the actual download
    const link = document.createElement("a")
    link.href = report.downloadUrl
    link.download = report.name
    link.click()
  }

  const handleDelete = async (reportId: string) => {
    try {
      await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      })
      setReports(reports.filter((report) => report.id !== reportId))
    } catch (error) {
      console.error("Error deleting report:", error)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "monthly":
        return "bg-blue-100 text-blue-800"
      case "quarterly":
        return "bg-green-100 text-green-800"
      case "annual":
        return "bg-purple-100 text-purple-800"
      case "tax":
        return "bg-red-100 text-red-800"
      case "budget":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>View and download your generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Recent Reports
        </CardTitle>
        <CardDescription>View and download your generated reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold">{report.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{report.dateRange}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                    <span>•</span>
                    <span>Created {formatDate(report.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={getTypeColor(report.type)}>{report.type}</Badge>
                <Badge variant="outline">{report.format}</Badge>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => handleDownload(report)}>
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(report.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
