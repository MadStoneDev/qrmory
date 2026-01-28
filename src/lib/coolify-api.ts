// src/lib/coolify-api.ts
// Coolify API integration for managing custom domains via Traefik
//
// Note: Requires Coolify v4.0.0-beta.427 or later for proper domain updates.
// Earlier versions have a bug where Traefik labels don't regenerate after
// domain changes via API. See: https://github.com/coollabsio/coolify/issues/6281

const COOLIFY_API_URL = process.env.COOLIFY_API_URL; // e.g., https://coolify.yourdomain.com/api/v1
const COOLIFY_API_TOKEN = process.env.COOLIFY_API_TOKEN;
const COOLIFY_APP_UUID = process.env.COOLIFY_APP_UUID; // Your QRmory app's UUID in Coolify

interface CoolifyDomain {
  domain: string;
}

interface CoolifyAppResponse {
  uuid: string;
  fqdn: string; // Comma-separated list of domains
  // ... other fields
}

/**
 * Get current domains configured for the QRmory app
 */
export async function getCurrentDomains(): Promise<string[]> {
  if (!COOLIFY_API_URL || !COOLIFY_API_TOKEN || !COOLIFY_APP_UUID) {
    console.warn("Coolify API not configured - skipping domain management");
    return [];
  }

  try {
    const response = await fetch(
      `${COOLIFY_API_URL}/applications/${COOLIFY_APP_UUID}`,
      {
        headers: {
          Authorization: `Bearer ${COOLIFY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch Coolify app:", await response.text());
      return [];
    }

    const app: CoolifyAppResponse = await response.json();

    // fqdn is comma-separated: "https://qrmory.com,https://www.qrmory.com"
    if (!app.fqdn) return [];

    return app.fqdn
      .split(",")
      .map((d) => d.trim().replace(/^https?:\/\//, ""))
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching Coolify domains:", error);
    return [];
  }
}

/**
 * Add a custom domain to the QRmory app in Coolify
 */
export async function addDomainToCoolify(domain: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!COOLIFY_API_URL || !COOLIFY_API_TOKEN || !COOLIFY_APP_UUID) {
    console.warn("Coolify API not configured - skipping domain addition");
    return { success: true }; // Don't fail if not configured
  }

  try {
    // Get current domains
    const currentDomains = await getCurrentDomains();

    // Check if domain already exists
    const normalizedDomain = domain.toLowerCase();
    if (currentDomains.some((d) => d.toLowerCase() === normalizedDomain)) {
      return { success: true }; // Already added
    }

    // Build new FQDN list
    const newFqdn = [...currentDomains, domain]
      .map((d) => `https://${d}`)
      .join(",");

    // Update the application using the correct 'domains' field (not 'fqdn')
    // Note: Coolify API expects 'domains' for PATCH, even though GET returns 'fqdn'
    const response = await fetch(
      `${COOLIFY_API_URL}/applications/${COOLIFY_APP_UUID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${COOLIFY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domains: newFqdn,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to add domain to Coolify:", errorText);
      return { success: false, error: `Failed to configure domain routing: ${errorText}` };
    }

    console.log(`Successfully added domain ${domain} to Coolify`);
    return { success: true };
  } catch (error) {
    console.error("Error adding domain to Coolify:", error);
    return { success: false, error: "Failed to configure domain routing" };
  }
}

/**
 * Remove a custom domain from the QRmory app in Coolify
 */
export async function removeDomainFromCoolify(domain: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!COOLIFY_API_URL || !COOLIFY_API_TOKEN || !COOLIFY_APP_UUID) {
    console.warn("Coolify API not configured - skipping domain removal");
    return { success: true };
  }

  try {
    // Get current domains
    const currentDomains = await getCurrentDomains();

    // Filter out the domain to remove
    const normalizedDomain = domain.toLowerCase();
    const updatedDomains = currentDomains.filter(
      (d) => d.toLowerCase() !== normalizedDomain
    );

    // If nothing changed, domain wasn't there
    if (updatedDomains.length === currentDomains.length) {
      return { success: true };
    }

    // Build new FQDN list
    const newFqdn = updatedDomains.map((d) => `https://${d}`).join(",");

    // Update the application using the correct 'domains' field
    const response = await fetch(
      `${COOLIFY_API_URL}/applications/${COOLIFY_APP_UUID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${COOLIFY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domains: newFqdn,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to remove domain from Coolify:", errorText);
      return { success: false, error: `Failed to remove domain routing: ${errorText}` };
    }

    console.log(`Successfully removed domain ${domain} from Coolify`);
    return { success: true };
  } catch (error) {
    console.error("Error removing domain from Coolify:", error);
    return { success: false, error: "Failed to remove domain routing" };
  }
}

/**
 * Sync all active custom domains from database to Coolify
 * Useful for initial setup or recovery
 */
export async function syncDomainsWithCoolify(
  activeDomains: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!COOLIFY_API_URL || !COOLIFY_API_TOKEN || !COOLIFY_APP_UUID) {
    console.warn("Coolify API not configured - skipping domain sync");
    return { success: true };
  }

  try {
    // Get current domains from Coolify
    const currentDomains = await getCurrentDomains();

    // Preserve main domains (qrmory.com, www.qrmory.com, etc.)
    const mainDomains = currentDomains.filter(
      (d) =>
        d.includes("qrmory.com") ||
        d.includes("localhost")
    );

    // Combine main domains with active custom domains (deduplicated)
    const allDomains = Array.from(new Set([...mainDomains, ...activeDomains]));
    const newFqdn = allDomains.map((d) => `https://${d}`).join(",");

    const response = await fetch(
      `${COOLIFY_API_URL}/applications/${COOLIFY_APP_UUID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${COOLIFY_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domains: newFqdn,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to sync domains with Coolify:", errorText);
      return { success: false, error: `Failed to sync domain routing: ${errorText}` };
    }

    console.log(`Successfully synced ${activeDomains.length} custom domains with Coolify`);
    return { success: true };
  } catch (error) {
    console.error("Error syncing domains with Coolify:", error);
    return { success: false, error: "Failed to sync domain routing" };
  }
}
