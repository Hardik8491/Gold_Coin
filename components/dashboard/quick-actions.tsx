import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowUpDown, Target, Calendar, Sparkles } from "lucide-react"
import Link from "next/link"

const actions = [
  {
    title: "Add Transaction",
    description: "Record income or expense",
    icon: Plus,
    color: "bg-blue-500 hover:bg-blue-600",
    href: "/transactions/new",
  },
  {
    title: "Transfer Money",
    description: "Between accounts",
    icon: ArrowUpDown,
    color: "bg-green-500 hover:bg-green-600",
    href: "/transactions/transfer",
  },
  {
    title: "Set Goal",
    description: "Create savings target",
    icon: Target,
    color: "bg-purple-500 hover:bg-purple-600",
    href: "/goals/new",
  },
  {
    title: "Schedule Bill",
    description: "Add recurring payment",
    icon: Calendar,
    color: "bg-orange-500 hover:bg-orange-600",
    href: "/bills/new",
  },
]

export function QuickActions() {
  return (
    <Card variant="hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common tasks to manage your finances</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant="ghost"
            className="justify-start h-auto p-3 hover:bg-accent/10 transition-colors"
            asChild
          >
            <Link href={action.href}>
              <div className={`p-2 rounded-md ${action.color} mr-3 shadow-sm`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
