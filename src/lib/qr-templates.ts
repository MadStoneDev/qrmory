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

export type TemplateCategory =
  | "professional"
  | "playful"
  | "minimalist"
  | "bold"
  | "elegant"
  | "custom";

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "minimalist", label: "Minimalist" },
  { value: "bold", label: "Bold" },
  { value: "elegant", label: "Elegant" },
  { value: "playful", label: "Playful" },
  { value: "custom", label: "Custom" },
];

// System templates - these are always available
export const SYSTEM_TEMPLATES: QRTemplate[] = [
  {
    id: "system-classic",
    name: "Classic",
    description: "Traditional black and white QR code",
    isSystem: true,
    category: "professional",
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
    id: "system-qrmory",
    name: "QRmory Purple",
    description: "Our signature purple style",
    isSystem: true,
    category: "professional",
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
    id: "system-ocean",
    name: "Ocean Blue",
    description: "Calm and professional blue tones",
    isSystem: true,
    category: "professional",
    previewColors: { primary: "#1E40AF", secondary: "#DBEAFE" },
    config: {
      colors: {
        foreground: "#1E40AF",
        background: "#DBEAFE",
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
        frameColor: "#1E40AF",
      },
    },
  },
  {
    id: "system-forest",
    name: "Forest Green",
    description: "Natural and eco-friendly feel",
    isSystem: true,
    category: "elegant",
    previewColors: { primary: "#166534", secondary: "#DCFCE7" },
    config: {
      colors: {
        foreground: "#166534",
        background: "#DCFCE7",
      },
      shapeSettings: {
        dotStyle: "extra-rounded",
        cornerStyle: "extra-rounded",
        cornerDotStyle: "dot",
      },
      frameSettings: {
        type: "none",
        text: "",
        textColor: "#FFFFFF",
        frameColor: "#166534",
      },
    },
  },
  {
    id: "system-sunset",
    name: "Sunset Orange",
    description: "Warm and inviting design",
    isSystem: true,
    category: "bold",
    previewColors: { primary: "#EA580C", secondary: "#FFF7ED" },
    config: {
      colors: {
        foreground: "#EA580C",
        background: "#FFF7ED",
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
        frameColor: "#EA580C",
      },
    },
  },
  {
    id: "system-midnight",
    name: "Midnight",
    description: "Dark and sophisticated",
    isSystem: true,
    category: "elegant",
    previewColors: { primary: "#1E1B4B", secondary: "#E0E7FF" },
    config: {
      colors: {
        foreground: "#1E1B4B",
        background: "#E0E7FF",
      },
      shapeSettings: {
        dotStyle: "classy",
        cornerStyle: "square",
        cornerDotStyle: "square",
      },
      frameSettings: {
        type: "none",
        text: "",
        textColor: "#FFFFFF",
        frameColor: "#1E1B4B",
      },
    },
  },
  {
    id: "system-rose",
    name: "Rose Gold",
    description: "Elegant and feminine style",
    isSystem: true,
    category: "elegant",
    previewColors: { primary: "#9F1239", secondary: "#FFF1F2" },
    config: {
      colors: {
        foreground: "#9F1239",
        background: "#FFF1F2",
      },
      shapeSettings: {
        dotStyle: "classy-rounded",
        cornerStyle: "extra-rounded",
        cornerDotStyle: "dot",
      },
      frameSettings: {
        type: "none",
        text: "",
        textColor: "#FFFFFF",
        frameColor: "#9F1239",
      },
    },
  },
  {
    id: "system-neon",
    name: "Neon Pop",
    description: "Bold and eye-catching",
    isSystem: true,
    category: "playful",
    previewColors: { primary: "#7C3AED", secondary: "#FEF3C7" },
    config: {
      colors: {
        foreground: "#7C3AED",
        background: "#FEF3C7",
      },
      shapeSettings: {
        dotStyle: "dots",
        cornerStyle: "extra-rounded",
        cornerDotStyle: "dot",
      },
      frameSettings: {
        type: "rounded",
        text: "SCAN ME",
        textColor: "#FFFFFF",
        frameColor: "#7C3AED",
      },
    },
  },
  {
    id: "system-minimal-dark",
    name: "Minimal Dark",
    description: "Clean dark mode aesthetic",
    isSystem: true,
    category: "minimalist",
    previewColors: { primary: "#18181B", secondary: "#F4F4F5" },
    config: {
      colors: {
        foreground: "#18181B",
        background: "#F4F4F5",
      },
      shapeSettings: {
        dotStyle: "square",
        cornerStyle: "square",
        cornerDotStyle: "square",
      },
      frameSettings: {
        type: "simple",
        text: "",
        textColor: "#FFFFFF",
        frameColor: "#18181B",
      },
    },
  },
  {
    id: "system-cafe",
    name: "Cafe Menu",
    description: "Perfect for restaurants and cafes",
    isSystem: true,
    category: "professional",
    previewColors: { primary: "#78350F", secondary: "#FFFBEB" },
    config: {
      colors: {
        foreground: "#78350F",
        background: "#FFFBEB",
      },
      shapeSettings: {
        dotStyle: "rounded",
        cornerStyle: "dot",
        cornerDotStyle: "dot",
      },
      frameSettings: {
        type: "banner-bottom",
        text: "View Menu",
        textColor: "#FFFBEB",
        frameColor: "#78350F",
      },
    },
  },
];

// Get system templates by category
export function getSystemTemplatesByCategory(
  category?: TemplateCategory
): QRTemplate[] {
  if (!category) return SYSTEM_TEMPLATES;
  return SYSTEM_TEMPLATES.filter((t) => t.category === category);
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
