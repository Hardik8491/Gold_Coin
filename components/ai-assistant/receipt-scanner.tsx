"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Camera, Loader2, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ScannedReceipt {
  merchant: string
  amount: number
  date: string
  items: Array<{ name: string; price: number; quantity: number }>
  category: string
  tax: number
  tip: number
  paymentMethod: string
  confidence: number
}

export function ReceiptScanner() {
  const [file, setFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScannedReceipt | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleScan = async () => {
    if (!file) return

    setScanning(true)
    try {
      const formData = new FormData()
      formData.append("receipt", file)

      const response = await fetch("/api/ai/receipt-scan", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to scan receipt")
      }

      const data = await response.json()
      setResult(data)

      toast({
        title: "Receipt scanned successfully!",
        description: `Found transaction for ${data.merchant} - $${data.amount}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scan receipt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setScanning(false)
    }
  }

  const handleCreateTransaction = async () => {
    if (!result) return

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "expense",
          merchant: result.merchant,
          amount: result.amount,
          category: result.category,
          date: new Date(result.date).toISOString(),
          description: `Receipt scan - ${result.items.length} items`,
          tags: ["receipt-scan"],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create transaction")
      }

      toast({
        title: "Transaction created!",
        description: "Your receipt has been added to your transactions.",
      })

      setFile(null)
      setResult(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Receipt Scanner
          </CardTitle>
          <CardDescription>Upload a receipt image and let AI extract the transaction details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt Image</Label>
            <Input id="receipt" type="file" accept="image/*" onChange={handleFileChange} disabled={scanning} />
          </div>

          {file && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Selected: {file.name}</p>
              <img
                src={URL.createObjectURL(file) || "/placeholder.svg"}
                alt="Receipt preview"
                className="max-w-full h-48 object-contain border rounded"
              />
            </div>
          )}

          <Button onClick={handleScan} disabled={!file || scanning} className="w-full">
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning Receipt...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Scan Receipt
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Scan Results
            </CardTitle>
            <CardDescription>Confidence: {Math.round(result.confidence * 100)}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Merchant</Label>
                <p className="font-medium">{result.merchant}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="font-medium">${result.amount.toFixed(2)}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p className="font-medium">{new Date(result.date).toLocaleDateString()}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p className="font-medium">{result.category}</p>
              </div>
            </div>

            {result.items && result.items.length > 0 && (
              <div>
                <Label>Items ({result.items.length})</Label>
                <div className="max-h-32 overflow-y-auto space-y-1 mt-1">
                  {result.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {result.tax > 0 && (
                <div>
                  <Label>Tax</Label>
                  <p>${result.tax.toFixed(2)}</p>
                </div>
              )}
              {result.tip > 0 && (
                <div>
                  <Label>Tip</Label>
                  <p>${result.tip.toFixed(2)}</p>
                </div>
              )}
            </div>

            <Button onClick={handleCreateTransaction} className="w-full">
              Create Transaction
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
