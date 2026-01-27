// src/app/(private)/dashboard/domains/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  IconWorld,
  IconPlus,
  IconLoader2,
  IconLock,
} from "@tabler/icons-react";
import DomainList from "@/components/domains/domain-list";
import AddDomainDialog from "@/components/domains/add-domain-dialog";
import { CustomDomain, DOMAIN_LIMITS } from "@/lib/domain-verification";

export default function DomainsPage() {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionLevel, setSubscriptionLevel] = useState(0);
  const [limit, setLimit] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch domains on mount
  const fetchDomains = useCallback(async () => {
    try {
      const response = await fetch("/api/domains");
      const data = await response.json();

      if (data.success) {
        setDomains(data.domains || []);
        setSubscriptionLevel(data.subscriptionLevel || 0);
        setLimit(data.limit || 0);
      }
    } catch (error) {
      console.error("Error fetching domains:", error);
      toast("Failed to load domains", {
        description: "Please refresh the page to try again.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  // Add domain handler
  const handleAddDomain = async (domain: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      // Add the new domain to the list
      setDomains((prev) => [data.domain, ...prev]);
      return { success: true };
    } catch (error) {
      console.error("Error adding domain:", error);
      return { success: false, error: "Failed to add domain" };
    }
  };

  // Verify domain handler
  const handleVerifyDomain = async (domainId: string) => {
    try {
      const response = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });

      const data = await response.json();

      if (data.verified) {
        toast("Domain verified!", {
          description: "Your custom domain is now active.",
        });
        // Update the domain in the list
        setDomains((prev) =>
          prev.map((d) => (d.id === domainId ? data.domain : d))
        );
      } else {
        toast("Verification failed", {
          description: data.error || "DNS record not found. Please check your configuration.",
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
        });
      }
    } catch (error) {
      console.error("Error verifying domain:", error);
      toast("Verification failed", {
        description: "Please try again later.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    }
  };

  // Delete domain handler
  const handleDeleteDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/domains?id=${domainId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDomains((prev) => prev.filter((d) => d.id !== domainId));
        toast("Domain removed", {
          description: "The domain has been removed from your account.",
        });
      } else {
        const data = await response.json();
        toast("Failed to remove domain", {
          description: data.error || "Please try again.",
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
        });
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
      toast("Failed to remove domain", {
        description: "Please try again later.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    }
  };

  // Free users can't use custom domains
  if (!isLoading && subscriptionLevel === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16 bg-gradient-to-br from-qrmory-purple-50 to-qrmory-purple-100 rounded-2xl border border-qrmory-purple-200">
          <div className="w-20 h-20 bg-qrmory-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <IconLock size={40} className="text-qrmory-purple-600" />
          </div>
          <h2 className="text-2xl font-semibold text-qrmory-purple-800 mb-3">
            Custom Domains
          </h2>
          <p className="text-qrmory-purple-600 max-w-md mx-auto mb-6">
            Brand your QR code links with your own domain name. Custom domains require a paid subscription.
          </p>
          <a
            href="/dashboard/subscription"
            className="inline-block px-8 py-3 bg-qrmory-purple-600 text-white font-semibold rounded-xl hover:bg-qrmory-purple-700 transition-colors"
          >
            Upgrade to Unlock
          </a>
          <p className="text-sm text-qrmory-purple-500 mt-4">
            Starting from Explorer plan (1 domain)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800 flex items-center gap-3">
            <IconWorld size={28} className="text-qrmory-purple-600" />
            Custom Domains
          </h1>
          <p className="text-neutral-500 mt-1">
            Use your own domain for QR code links
          </p>
        </div>

        <button
          onClick={() => setShowAddDialog(true)}
          disabled={domains.length >= limit}
          className="flex items-center gap-2 px-4 py-2.5 bg-qrmory-purple-800 text-white font-medium rounded-xl hover:bg-qrmory-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <IconPlus size={18} />
          Add Domain
        </button>
      </div>

      {/* Domain limit info */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-700">
              Domain Limit
            </p>
            <p className="text-xs text-neutral-500">
              {domains.length} of {limit} domains used
            </p>
          </div>
          <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-qrmory-purple-600 rounded-full transition-all"
              style={{ width: `${(domains.length / limit) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Domain list */}
      <DomainList
        domains={domains}
        onVerify={handleVerifyDomain}
        onDelete={handleDeleteDomain}
        isLoading={isLoading}
      />

      {/* Add domain dialog */}
      <AddDomainDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleAddDomain}
        currentCount={domains.length}
        limit={limit}
      />
    </div>
  );
}
