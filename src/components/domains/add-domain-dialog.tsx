// src/components/domains/add-domain-dialog.tsx
"use client";

import React, { useState } from "react";
import {
  IconX,
  IconWorld,
  IconLoader2,
  IconAlertCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { normalizeDomain, isValidDomain } from "@/lib/domain-verification";

interface AddDomainDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (domain: string) => Promise<{ success: boolean; error?: string }>;
  currentCount: number;
  limit: number;
}

export default function AddDomainDialog({
  isOpen,
  onClose,
  onAdd,
  currentCount,
  limit,
}: AddDomainDialogProps) {
  const [domain, setDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!isAdding) {
      setDomain("");
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalizedDomain = normalizeDomain(domain);

    if (!normalizedDomain) {
      setError("Please enter a domain name");
      return;
    }

    if (!isValidDomain(normalizedDomain)) {
      setError("Please enter a valid domain name (e.g., links.yourbrand.com)");
      return;
    }

    setIsAdding(true);

    try {
      const result = await onAdd(normalizedDomain);

      if (result.success) {
        toast("Domain added successfully", {
          description: "Please configure the DNS record to verify ownership.",
        });
        setDomain("");
        onClose();
      } else {
        setError(result.error || "Failed to add domain");
      }
    } catch (err) {
      console.error("Error adding domain:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const canAdd = currentCount < limit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-qrmory-purple-100 rounded-full flex items-center justify-center">
              <IconWorld className="w-5 h-5 text-qrmory-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Add Custom Domain</h2>
              <p className="text-sm text-neutral-500">
                {currentCount}/{limit} domains used
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <IconX size={20} className="text-neutral-500" />
          </button>
        </div>

        {!canAdd ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconAlertCircle size={32} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              Domain limit reached
            </h3>
            <p className="text-neutral-500 text-sm mb-4">
              Your plan allows up to {limit} custom domain{limit === 1 ? "" : "s"}.
              Please remove an existing domain or upgrade your plan.
            </p>
            <a
              href="/dashboard/subscription"
              className="inline-block px-6 py-2.5 bg-qrmory-purple-600 text-white rounded-lg hover:bg-qrmory-purple-700 transition-colors"
            >
              Upgrade Plan
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Domain Name
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setError(null);
                }}
                placeholder="links.yourbrand.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent"
                disabled={isAdding}
                autoFocus
              />
              <p className="text-xs text-neutral-500 mt-1">
                Enter a domain or subdomain you own (without http:// or https://)
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <IconAlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-neutral-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-neutral-700 mb-2">
                What happens next?
              </h4>
              <ol className="text-xs text-neutral-600 space-y-1 list-decimal list-inside">
                <li>We&apos;ll generate a unique verification token</li>
                <li>You&apos;ll add a TXT record to your domain&apos;s DNS</li>
                <li>Click &quot;Verify&quot; to confirm ownership</li>
                <li>Your QR codes can then use your custom domain</li>
              </ol>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isAdding}
                className="flex-1 px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdding || !domain.trim()}
                className="flex-1 px-4 py-2.5 bg-qrmory-purple-800 text-white rounded-lg hover:bg-qrmory-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Domain"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
