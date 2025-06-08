import { Coins } from "lucide-react"

export function GoldCoinLogo() {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 shadow-md animate-float">
        <Coins className="h-5 w-5 text-white coin-spin" />
      </div>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate font-bold text-lg gold-text">GoldCoin</span>
        <span className="truncate text-xs text-muted-foreground">Finance Tracker</span>
      </div>
    </div>
  )
}
