"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download } from "lucide-react"

interface ReportFormData {
  reportType: string
  dateRange: string
  startDate: string
  endDate: string
  format: string
  includeCharts: boolean
  includeTransactions: boolean
  includeBudgets: boolean
  includeGoals: boolean
}

export function ReportGenerator() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    defaultValues: {
      format: "pdf",
      includeCharts: true,
      includeTransactions: true,
      includeBudgets: true,
      includeGoals: true,
    },
  })

  const reportTypes = [
    { value: "monthly", label: "Monthly Summary" },
    { value: "quarterly", label: "Quarterly Report" },
    { value: "annual", label: "Annual Report" },
    { value: "custom", label: "Custom Date Range" },
    { value: "tax", label: "Tax Report" },
    { value: "budget", label: "Budget Analysis" },
  ]

  const dateRanges = [
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "this-quarter", label: "This Quarter" },
    { value: "last-quarter", label: "Last Quarter" },
    { value: "this-year", label: "This Year" },
    { value: "last-year", label: "Last Year" },
    { value: "custom", label: "Custom Range" },
  ]

  const formats = [
    { value: "pdf", label: "PDF" },
    { value: "excel", label: "Excel" },
    { value: "csv", label: "CSV" },
  ]

  async function onSubmit(data: ReportFormData) {
    setLoading(true)
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `financial-report-${Date.now()}.${data.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Report generated",
        description: "Your financial report has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedDateRange = watch("dateRange")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Report
        </CardTitle>
        <CardDescription>Create custom financial reports with your preferred settings</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select onValueChange={(value) => setValue("reportType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select onValueChange={(value) => setValue("dateRange", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  {dateRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedDateRange === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate", { required: selectedDateRange === "custom" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate", { required: selectedDateRange === "custom" })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select onValueChange={(value) => setValue("format", value)} defaultValue="pdf">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Include in Report</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  defaultChecked
                  onCheckedChange={(checked) => setValue("includeCharts", !!checked)}
                />
                <Label htmlFor="includeCharts">Charts & Graphs</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTransactions"
                  defaultChecked
                  onCheckedChange={(checked) => setValue("includeTransactions", !!checked)}
                />
                <Label htmlFor="includeTransactions">Transaction Details</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeBudgets"
                  defaultChecked
                  onCheckedChange={(checked) => setValue("includeBudgets", !!checked)}
                />
                <Label htmlFor="includeBudgets">Budget Analysis</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeGoals"
                  defaultChecked
                  onCheckedChange={(checked) => setValue("includeGoals", !!checked)}
                />
                <Label htmlFor="includeGoals">Goals Progress</Label>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              "Generating..."
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
