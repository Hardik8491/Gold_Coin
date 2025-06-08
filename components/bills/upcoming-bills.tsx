"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, DollarSign, AlertCircle } from "lucide-react"

interface UpcomingBill {
  id: string
  name: string
  amount: number
  dueDate: string
  category: string
  priority: "high" | "medium" | "low"
  reminderSet: boolean
}

export function UpcomingBills() {
  const [bills, setBills] = useState<UpcomingBill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUpcomingBills() {
      try {
        const response = await fetch("/api/bills/upcoming")
        if (response.ok) {
          const data = await response.json()
          setBills(data.bills)
        }
      } catch (error) {
        console.error("Error fetching upcoming bills:", error)
        // Fallback data
        setBills([
          {
            id: "1",
            name: "Rent Payment",
            amount: 1200.0,
            dueDate: "2024-01-01",
            category: "Housing",
            priority: "high",
            reminderSet: true,
          },
          {
            id: "2",
            name: "Car Insurance",
            amount: 150.0,
            dueDate: "2024-01-05",
            category: "Insurance",
            priority: "medium",
            reminderSet: false,
          },
          {
            id: "3",
            name: "Gym Membership",
            amount: 29.99,
            dueDate: "2024-01-10",
            category: "Health & Fitness",
            priority: "low",
            reminderSet: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingBills()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const toggleReminder = async (billId: string) => {
    try {
      await fetch(`/api/bills/${billId}/reminder`, {
        method: "PATCH",
      })
      setBills(bills.map((bill) => (bill.id === billId ? { ...bill, reminderSet: !bill.reminderSet } : bill)))
    } catch (error) {
      console.error("Error toggling reminder:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
          <CardDescription>Bills due in the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalUpcoming = bills.reduce((sum, bill) => sum + bill.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Upcoming Bills
        </CardTitle>
        <CardDescription>Bills due in the next 30 days • Total: ${totalUpcoming.toFixed(2)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{bill.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Due {formatDate(bill.dueDate)}</span>
                    <Badge variant="outline" className="text-xs">
                      {bill.category}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-semibold">${bill.amount.toFixed(2)}</div>
                  <Badge className={getPriorityColor(bill.priority)}>{bill.priority}</Badge>
                </div>

                <Button
                  size="sm"
                  variant={bill.reminderSet ? "default" : "outline"}
                  onClick={() => toggleReminder(bill.id)}
                >
                  <Bell className={`h-3 w-3 ${bill.reminderSet ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
