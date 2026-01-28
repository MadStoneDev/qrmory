// src/lib/qr-templates.ts
// QR Code design templates and presets

import { QRShapeSettings, DotStyle, CornerStyle, CornerDotStyle } from "./qr-shapes";
import { QRFrameSettings } from "./default-settings";

export interface QRTemplate {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  category: TemplateCategory;
  config: QRTemplateConfig;
  previewColors?: {
    primary: string;
    secondary: string;
  };
}

export interface QRTemplateConfig {
  colors: {
    foreground: string;
    background: string;
  };
  shapeSettings: QRShapeSettings;
  frameSettings: QRFrameSettings;
}

export type TemplateCategory = "all" | "custom";

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: "all", label: "All Templates" },
  { value: "custom", label: "My Templates" },
];

// System templates - simple, practical designs
export const SYSTEM_TEMPLATES: QRTemplate[] = [
  {
    id: "system-classic",
    name: "Classic",
    description: "Standard black and white",
    isSystem: true,
    category: "all",
    previewColors: { primary: "#000000", secondary: "#FFFFFF" },
    config: {
      colors: {
        foreground: "#000000",
        background: "#FFFFFF",
      },
      shapeSettings: {
        dotStyle: "square",
        cornerStyle: "square",
        cornerDotStyle: "square",
      },
      frameSettings: {
        type: "none",
        text: "",
        textColor: "#FFFFFF",
        frameColor: "#000000",
      },
    },
  },
  {
    id: "system-rounded",
    name: "Rounded",
    description: "Soft rounded dots",
    isSystem: true,
    category: "all",
    previewColors: { primary: "#171717", secondary: "#FFFFFF" },
    config: {
      colors: {
        foreground: "#171717",
        background: "#FFFFFF",
      },
      shapeSettings: {
        dotStyle: "rounded",
        cornerStyle: "extra-rounded",
        cornerDotStyle: "dot",
      },
      frameSettings: {
        type: "none",
        text: "",
        textColor: "#FFFFFF",
        frameColor: "#171717",
      },
    },
  },
  {
    id: "system-dots",
    name: "Dots",
    description: "Circular dot pattern",
    isSystem: true,
    category: "all",
    previewColors: { primary: "#1F2937", secondary: "#FFFFFF" },
    config: {
      colors: {
        foreground: "#1F2937",
        background: "#FFFFFF",
      },
      shapeSettings: {
        dotStyle: "dots",
        cornerStyle: "dot",
        cornerDotStyle: "dot",
      },
      frameSettings: {
        type: "none",
        text: "",
        textColor: "#FFFFFF",
        frameColor: "#1F2937",
      },
    },
  },
  {
    id: "system-qrmory",
    name: "QRmory",
    description: "Brand purple",
    isSystem: true,
    category: "all",
    previewColors: { primary: "#2A0B4D", secondary: "#FFFFFF" },
    config: {
      colors: {
        foreground: "#2A0B4D",
        background: "#FFFFFF",
      },
      shapeSettings: {
        dotStyle: "rounded",
        cornerStyle: "dot",
        cornerDotStyle: "dot",
      },
      frameSettings: {
        type: "none",
        text: "",
        textColor: "#FFFFFF",
        frameColor: "#2A0B4D",
      },
    },
  },
  {
    id: "system-blue",
    name: "Blue",
    description: "Professional blue",
    isSystem: true,
    category: "all",
    previewColors: { primary: "#1D4ED8", secondary: "#FFFFFF" },
    config: {
      colors: {
        foreground: "#1D4ED8",
        background: "#FFFFFF",
      },
      shapeSettings: {
        dotStyle: "rounded",
        cornerStyle: "extra-rounded",
        cornerDotStyle: "dot",
      },
      frameSettings: {
        type: "none",
        text: "",
        textColor: "#FFFFFF",
        frameColor: "#1D4ED8",
      },
    },
  },
];

// Get all system templates
export function getSystemTemplates(): QRTemplate[] {
  return SYSTEM_TEMPLATES;
}

// Find a template by ID
export function findTemplateById(
  id: string,
  userTemplates: QRTemplate[] = []
): QRTemplate | undefined {
  // Check system templates first
  const systemTemplate = SYSTEM_TEMPLATES.find((t) => t.id === id);
  if (systemTemplate) return systemTemplate;

  // Then check user templates
  return userTemplates.find((t) => t.id === id);
}

// Apply a template to get the config values
export function applyTemplate(template: QRTemplate): QRTemplateConfig {
  return { ...template.config };
}

// Create a new user template from current settings
export function createUserTemplate(
  name: string,
  description: string,
  config: QRTemplateConfig,
  category: TemplateCategory = "custom"
): Omit<QRTemplate, "id"> {
  return {
    name,
    description,
    isSystem: false,
    category,
    config,
    previewColors: {
      primary: config.colors.foreground,
      secondary: config.colors.background,
    },
  };
}

// Validate template config
export function isValidTemplateConfig(config: unknown): config is QRTemplateConfig {
  if (!config || typeof config !== "object") return false;

  const c = config as Record<string, unknown>;

  // Check colors
  if (!c.colors || typeof c.colors !== "object") return false;
  const colors = c.colors as Record<string, unknown>;
  if (typeof colors.foreground !== "string" || typeof colors.background !== "string")
    return false;

  // Check shapeSettings
  if (!c.shapeSettings || typeof c.shapeSettings !== "object") return false;
  const shapes = c.shapeSettings as Record<string, unknown>;
  if (
    typeof shapes.dotStyle !== "string" ||
    typeof shapes.cornerStyle !== "string" ||
    typeof shapes.cornerDotStyle !== "string"
  )
    return false;

  // Check frameSettings
  if (!c.frameSettings || typeof c.frameSettings !== "object") return false;
  const frame = c.frameSettings as Record<string, unknown>;
  if (
    typeof frame.type !== "string" ||
    typeof frame.text !== "string" ||
    typeof frame.textColor !== "string" ||
    typeof frame.frameColor !== "string"
  )
    return false;

  return true;
}

// Export template to JSON (for sharing)
export function exportTemplateToJSON(template: QRTemplate): string {
  return JSON.stringify(
    {
      name: template.name,
      description: template.description,
      category: template.category,
      config: template.config,
    },
    null,
    2
  );
}

// Import template from JSON
export function importTemplateFromJSON(
  json: string
): Omit<QRTemplate, "id" | "isSystem"> | null {
  try {
    const parsed = JSON.parse(json);

    if (!parsed.name || typeof parsed.name !== "string") return null;
    if (!parsed.config || !isValidTemplateConfig(parsed.config)) return null;

    return {
      name: parsed.name,
      description: parsed.description || "",
      category: parsed.category || "custom",
      config: parsed.config,
      previewColors: {
        primary: parsed.config.colors.foreground,
        secondary: parsed.config.colors.background,
      },
    };
  } catch {
    return null;
  }
}
