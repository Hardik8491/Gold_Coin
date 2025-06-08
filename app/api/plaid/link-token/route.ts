import { type NextRequest, NextResponse } from "next/server";
import { createLinkToken } from "@/lib/services/plaid";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const linkToken = await createLinkToken(userId);

    return NextResponse.json({ linkToken });
  } catch (error) {
    console.error("Error creating link token:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
