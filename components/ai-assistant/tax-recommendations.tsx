"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, DollarSign, FileText, TrendingUp, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface TaxRecommendation {
  deductibleExpenses: Array<{
    category: string
    amount: number
    description: string
    deductionType: string
    confidence: number
  }>
  taxSavings: number
  recommendations: string[]
  missingDocuments: string[]
  quarterlyEstimates: {
    q1: number
    q2: number
    q3: number
    q4: number
  }
}

export function TaxRecommendations() {
  const [recommendations, setRecommendations] = useState<TaxRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRecommendations = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/ai/tax-recommendations")
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data)
      }
    } catch (error) {
      console.error("Error fetching tax recommendations:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!recommendations) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>No tax recommendations available</p>
        </CardContent>
      </Card>
    )
  }

  const totalDeductions = recommendations.deductibleExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-4">
      {/* Tax Savings Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Tax Optimization Summary
              </CardTitle>
              <CardDescription>AI-powered analysis of your potential tax savings</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchRecommendations} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${recommendations.taxSavings.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Potential Savings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalDeductions.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Deductions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{recommendations.deductibleExpenses.length}</div>
              <p className="text-sm text-muted-foreground">Categories Found</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductible Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Deductible Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.deductibleExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{expense.category}</h4>
                    <Badge variant="outline">{Math.round(expense.confidence * 100)}% confidence</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">{expense.deductionType}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${expense.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Missing Documents */}
      {recommendations.missingDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Missing Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.missingDocuments.map((document, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                  <p className="text-sm">{document}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quarterly Estimates */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Tax Estimates</CardTitle>
          <CardDescription>Suggested quarterly payments for next year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(recommendations.quarterlyEstimates).map(([quarter, amount]) => (
              <div key={quarter} className="text-center p-3 border rounded-lg">
                <p className="text-sm font-medium text-muted-foreground">{quarter.toUpperCase()}</p>
                <p className="text-lg font-bold">${amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
