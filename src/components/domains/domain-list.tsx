// src/components/domains/domain-list.tsx
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  IconWorld,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconRefresh,
  IconTrash,
  IconCopy,
  IconExternalLink,
  IconLoader2,
} from "@tabler/icons-react";
import { CustomDomain, getVerificationDNSRecord } from "@/lib/domain-verification";

interface DomainListProps {
  domains: CustomDomain[];
  onVerify: (domainId: string) => Promise<void>;
  onDelete: (domainId: string) => Promise<void>;
  isLoading?: boolean;
}

function DomainStatusBadge({ domain }: { domain: CustomDomain }) {
  if (domain.is_active && domain.verified_at) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
        <IconCheck size={12} />
        Active
      </span>
    );
  }

  if (domain.verified_at) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
        <IconCheck size={12} />
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
      <IconClock size={12} />
      Pending Verification
    </span>
  );
}

function DomainCard({
  domain,
  onVerify,
  onDelete,
}: {
  domain: CustomDomain;
  onVerify: (domainId: string) => Promise<void>;
  onDelete: (domainId: string) => Promise<void>;
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDNS, setShowDNS] = useState(!domain.verified_at);

  const dnsRecord = getVerificationDNSRecord(domain.domain, domain.verification_token);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await onVerify(domain.id);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this domain? Any QR codes using it will revert to the default QRmory URL.")) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete(domain.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast(`${label} copied to clipboard`);
  };

  return (
    <div className="border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-qrmory-purple-100 rounded-lg flex items-center justify-center">
            <IconWorld size={20} className="text-qrmory-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-neutral-800">{domain.domain}</h4>
            <p className="text-xs text-neutral-500">
              Added {new Date(domain.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <DomainStatusBadge domain={domain} />
      </div>

      {/* DNS Configuration (show when not verified) */}
      {!domain.verified_at && (
        <div className="mb-4">
          <button
            onClick={() => setShowDNS(!showDNS)}
            className="text-sm text-qrmory-purple-600 hover:text-qrmory-purple-800 font-medium mb-2"
          >
            {showDNS ? "Hide" : "Show"} DNS Configuration
          </button>

          {showDNS && (
            <div className="bg-neutral-50 rounded-lg p-3 space-y-2">
              <p className="text-xs text-neutral-600 mb-2">
                Add this TXT record to your domain&apos;s DNS settings:
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded border border-neutral-200 px-3 py-2">
                  <div>
                    <span className="text-xs text-neutral-500 block">Host/Name</span>
                    <code className="text-sm font-mono text-neutral-800">
                      {dnsRecord.host}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(dnsRecord.host, "Host")}
                    className="p-1 text-neutral-400 hover:text-neutral-600"
                  >
                    <IconCopy size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white rounded border border-neutral-200 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-neutral-500 block">Value</span>
                    <code className="text-sm font-mono text-neutral-800 break-all">
                      {dnsRecord.value}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(dnsRecord.value, "Value")}
                    className="p-1 text-neutral-400 hover:text-neutral-600 ml-2"
                  >
                    <IconCopy size={16} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-500 mt-2">
                DNS changes can take up to 48 hours to propagate.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
        {!domain.verified_at && (
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-qrmory-purple-600 text-white text-sm font-medium rounded-lg hover:bg-qrmory-purple-700 transition-colors disabled:opacity-50"
          >
            {isVerifying ? (
              <IconLoader2 size={14} className="animate-spin" />
            ) : (
              <IconRefresh size={14} />
            )}
            Verify Now
          </button>
        )}

        {domain.is_active && (
          <a
            href={`https://${domain.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-600 text-sm font-medium rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <IconExternalLink size={14} />
            Visit
          </a>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
        >
          {isDeleting ? (
            <IconLoader2 size={14} className="animate-spin" />
          ) : (
            <IconTrash size={14} />
          )}
          Remove
        </button>
      </div>
    </div>
  );
}

export default function DomainList({
  domains,
  onVerify,
  onDelete,
  isLoading = false,
}: DomainListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 size={32} className="text-qrmory-purple-600 animate-spin" />
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconWorld size={32} className="text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-700 mb-2">
          No custom domains yet
        </h3>
        <p className="text-neutral-500 text-sm max-w-md mx-auto">
          Add a custom domain to brand your QR code links with your own domain name.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {domains.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          onVerify={onVerify}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
