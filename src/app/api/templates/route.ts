// src/app/api/templates/route.ts
// API endpoint for user QR code templates

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";
import {
  QRTemplate,
  QRTemplateConfig,
  TemplateCategory,
  isValidTemplateConfig,
} from "@/lib/qr-templates";

// Maximum templates per subscription level
const TEMPLATE_LIMITS: Record<number, number> = {
  0: 3,   // Free
  1: 10,  // Explorer
  2: 20,  // Creator
  3: 50,  // Champion
};

interface UserSettingsData {
  templates?: QRTemplate[];
  [key: string]: unknown;
}

// GET - Retrieve user's templates
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: settings } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", user.id)
      .single();

    const userSettings = (settings?.settings as UserSettingsData) || {};
    const templates = userSettings.templates || [];

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create a new template
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, category, config } = body as {
      name: string;
      description?: string;
      category?: TemplateCategory;
      config: QRTemplateConfig;
    };

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: "Template name must be 50 characters or less" },
        { status: 400 }
      );
    }

    if (!config || !isValidTemplateConfig(config)) {
      return NextResponse.json(
        { error: "Invalid template configuration" },
        { status: 400 }
      );
    }

    // Get subscription level for template limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_level")
      .eq("id", user.id)
      .single();

    const subscriptionLevel = profile?.subscription_level ?? 0;
    const maxTemplates = TEMPLATE_LIMITS[subscriptionLevel] || TEMPLATE_LIMITS[0];

    // Get existing settings
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", user.id)
      .single();

    const userSettings = (existingSettings?.settings as UserSettingsData) || {};
    const existingTemplates = userSettings.templates || [];

    // Check template limit
    if (existingTemplates.length >= maxTemplates) {
      return NextResponse.json(
        {
          error: `Maximum ${maxTemplates} templates allowed on your plan. Please delete some or upgrade to add more.`,
          limit: maxTemplates,
        },
        { status: 400 }
      );
    }

    // Check for duplicate name
    if (existingTemplates.some((t) => t.name.toLowerCase() === name.trim().toLowerCase())) {
      return NextResponse.json(
        { error: "A template with this name already exists" },
        { status: 400 }
      );
    }

    // Create new template
    const newTemplate: QRTemplate = {
      id: `user-${uuidv4()}`,
      name: name.trim(),
      description: description?.trim() || "",
      isSystem: false,
      category: category || "custom",
      config,
      previewColors: {
        primary: config.colors.foreground,
        secondary: config.colors.background,
      },
    };

    // Update settings with new template
    const updatedSettings = {
      ...userSettings,
      templates: [...existingTemplates, newTemplate],
    };

    // Upsert user settings
    const { error: upsertError } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          settings: updatedSettings,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (upsertError) {
      console.error("Error saving template:", upsertError);
      return NextResponse.json(
        { error: "Failed to save template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template: newTemplate,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a template
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("id");

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Can't delete system templates
    if (templateId.startsWith("system-")) {
      return NextResponse.json(
        { error: "Cannot delete system templates" },
        { status: 400 }
      );
    }

    // Get existing settings
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", user.id)
      .single();

    if (!existingSettings) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const userSettings = (existingSettings.settings as UserSettingsData) || {};
    const existingTemplates = userSettings.templates || [];

    // Find and remove the template
    const templateIndex = existingTemplates.findIndex((t) => t.id === templateId);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const updatedTemplates = existingTemplates.filter((t) => t.id !== templateId);

    // Update settings
    const updatedSettings = {
      ...userSettings,
      templates: updatedTemplates,
    };

    const { error: updateError } = await supabase
      .from("user_settings")
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error deleting template:", updateError);
      return NextResponse.json(
        { error: "Failed to delete template" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template deleted",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
