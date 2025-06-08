"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, CheckCircle, Clock, AlertTriangle, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
  category: string
  recurring: boolean
  frequency?: string
  status: string
  reminders: boolean
  autopay: boolean
  merchant?: string
  website?: string
  accountName: string
}

export function BillsList() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchBills()
  }, [])

  async function fetchBills() {
    try {
      const response = await fetch("/api/bills")
      if (response.ok) {
        const data = await response.json()
        setBills(data.bills)
      }
    } catch (error) {
      console.error("Error fetching bills:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (billId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchBills()
        toast({
          title: "Bill updated",
          description: `Bill marked as ${newStatus}`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return

    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchBills()
        toast({
          title: "Bill deleted",
          description: "Bill has been deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bill",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
          <CardDescription>Manage your recurring bills and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Bills</CardTitle>
        <CardDescription>Manage your recurring bills and payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills.map((bill) => {
            const daysUntilDue = getDaysUntilDue(bill.dueDate)
            const isOverdue = daysUntilDue < 0
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

            return (
              <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted">
                    {getStatusIcon(bill.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{bill.name}</h3>
                      {bill.recurring && (
                        <Badge variant="outline" className="text-xs">
                          {bill.frequency}
                        </Badge>
                      )}
                      {bill.autopay && (
                        <Badge variant="secondary" className="text-xs">
                          Auto-pay
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{bill.category}</span>
                      <span>Due: {format(new Date(bill.dueDate), "MMM dd, yyyy")}</span>
                      {isOverdue && (
                        <span className="text-red-600 font-medium">{Math.abs(daysUntilDue)} days overdue</span>
                      )}
                      {isDueSoon && !isOverdue && (
                        <span className="text-yellow-600 font-medium">
                          Due in {daysUntilDue} day{daysUntilDue !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{bill.accountName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">${bill.amount.toFixed(2)}</p>
                    <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                  </div>

                  {bill.website && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={bill.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {bill.status === "pending" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(bill.id, "paid")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Paid
                        </DropdownMenuItem>
                      )}
                      {bill.status === "paid" && (
                        <DropdownMenuItem onClick={() => handleStatusChange(bill.id, "pending")}>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark as Pending
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(bill.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}

          {bills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills found</p>
              <p className="text-sm">Add your first bill to get started with reminders</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
