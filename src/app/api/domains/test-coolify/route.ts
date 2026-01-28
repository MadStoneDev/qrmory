// src/app/api/domains/test-coolify/route.ts
// Temporary endpoint to test Coolify API connection
// DELETE THIS FILE after testing

import { NextResponse } from "next/server";
import { getCurrentDomains, addDomainToCoolify, removeDomainFromCoolify } from "@/lib/coolify-api";

export async function GET() {
  try {
    // Test 1: Get current domains
    const currentDomains = await getCurrentDomains();

    return NextResponse.json({
      success: true,
      message: "Coolify integration working!",
      currentDomains,
      note: "Add ?test=add&domain=example.com to test adding a domain",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// POST for testing add/remove (optional)
export async function POST(request: Request) {
  try {
    const { action, domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: "domain required" }, { status: 400 });
    }

    if (action === "add") {
      const result = await addDomainToCoolify(domain);
      const updatedDomains = await getCurrentDomains();
      return NextResponse.json({ action: "add", result, updatedDomains });
    }

    if (action === "remove") {
      const result = await removeDomainFromCoolify(domain);
      const updatedDomains = await getCurrentDomains();
      return NextResponse.json({ action: "remove", result, updatedDomains });
    }

    return NextResponse.json({ error: "action must be 'add' or 'remove'" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
