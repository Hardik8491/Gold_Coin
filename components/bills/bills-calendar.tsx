"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, DollarSign } from "lucide-react"

interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
  category: string
  status: "upcoming" | "due" | "overdue" | "paid"
}

export function BillsCalendar() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])

  useEffect(() => {
    async function fetchBills() {
      try {
        const response = await fetch("/api/bills")
        if (response.ok) {
          const data = await response.json()
          setBills(data.bills)
        }
      } catch (error) {
        console.error("Error fetching bills:", error)
        // Fallback data
        setBills([
          {
            id: "1",
            name: "Electric Bill",
            amount: 120.5,
            dueDate: "2024-01-15",
            category: "Utilities",
            status: "upcoming",
          },
          {
            id: "2",
            name: "Internet Service",
            amount: 79.99,
            dueDate: "2024-01-18",
            category: "Utilities",
            status: "upcoming",
          },
          {
            id: "3",
            name: "Credit Card Payment",
            amount: 450.0,
            dueDate: "2024-01-20",
            category: "Credit Cards",
            status: "due",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchBills()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "due":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bills Calendar</CardTitle>
          <CardDescription>Upcoming bill payments</CardDescription>
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
          <Calendar className="h-5 w-5" />
          Bills Calendar
        </CardTitle>
        <CardDescription>Upcoming bill payments and due dates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills.map((bill) => {
            const daysUntil = getDaysUntilDue(bill.dueDate)
            return (
              <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{bill.name}</h4>
                    <p className="text-sm text-muted-foreground">{bill.category}</p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="font-semibold">${bill.amount.toFixed(2)}</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {daysUntil === 0
                        ? "Due today"
                        : daysUntil > 0
                          ? `${daysUntil} days`
                          : `${Math.abs(daysUntil)} days overdue`}
                    </span>
                  </div>
                  <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
