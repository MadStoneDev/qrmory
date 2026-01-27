// src/components/domains/domain-selector.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  IconWorld,
  IconChevronDown,
  IconExternalLink,
  IconPlus,
} from "@tabler/icons-react";
import { CustomDomain, formatDomainURL } from "@/lib/domain-verification";

interface DomainSelectorProps {
  selectedDomainId: string | null;
  onSelect: (domainId: string | null) => void;
  shortcode?: string;
  disabled?: boolean;
}

export default function DomainSelector({
  selectedDomainId,
  onSelect,
  shortcode,
  disabled = false,
}: DomainSelectorProps) {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [subscriptionLevel, setSubscriptionLevel] = useState(0);

  // Fetch user's domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch("/api/domains");
        const data = await response.json();

        if (data.success) {
          // Only show active domains
          const activeDomains = (data.domains || []).filter(
            (d: CustomDomain) => d.is_active
          );
          setDomains(activeDomains);
          setSubscriptionLevel(data.subscriptionLevel || 0);
        }
      } catch (error) {
        console.error("Error fetching domains:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, []);

  // Get selected domain
  const selectedDomain = domains.find((d) => d.id === selectedDomainId);

  // Default QRmory domain display
  const defaultDomain = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "") || "qrmory.com";

  // Get display URL
  const getDisplayURL = (domain: CustomDomain | null) => {
    if (!shortcode) return domain ? domain.domain : defaultDomain;
    return domain
      ? formatDomainURL(domain.domain, shortcode)
      : `${process.env.NEXT_PUBLIC_SITE_URL}/${shortcode}`;
  };

  // Free users or users with no domains don't see this
  if (!isLoading && (subscriptionLevel === 0 || domains.length === 0)) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="animate-pulse h-10 bg-neutral-100 rounded-lg" />
    );
  }

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-neutral-600 mb-1">
        Link Domain
      </label>

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2
          border border-neutral-300 rounded-lg text-sm
          ${disabled ? "bg-neutral-100 cursor-not-allowed" : "bg-white hover:border-qrmory-purple-400"}
          transition-colors
        `}
      >
        <div className="flex items-center gap-2 text-neutral-700 truncate">
          <IconWorld size={16} className="text-neutral-400 flex-shrink-0" />
          <span className="truncate">
            {selectedDomain ? selectedDomain.domain : `${defaultDomain} (Default)`}
          </span>
        </div>
        <IconChevronDown
          size={16}
          className={`text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Options */}
          <div className="absolute z-20 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden">
            {/* Default option */}
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                hover:bg-neutral-50 transition-colors
                ${selectedDomainId === null ? "bg-qrmory-purple-50 text-qrmory-purple-700" : "text-neutral-700"}
              `}
            >
              <IconWorld size={16} className="text-neutral-400" />
              <span className="flex-1">{defaultDomain}</span>
              <span className="text-xs text-neutral-400">Default</span>
            </button>

            {/* Custom domains */}
            {domains.map((domain) => (
              <button
                key={domain.id}
                type="button"
                onClick={() => {
                  onSelect(domain.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-sm text-left
                  hover:bg-neutral-50 transition-colors
                  ${selectedDomainId === domain.id ? "bg-qrmory-purple-50 text-qrmory-purple-700" : "text-neutral-700"}
                `}
              >
                <IconWorld size={16} className="text-qrmory-purple-500" />
                <span className="flex-1">{domain.domain}</span>
              </button>
            ))}

            {/* Add domain link */}
            <a
              href="/dashboard/domains"
              className="flex items-center gap-2 px-3 py-2 text-sm text-qrmory-purple-600 hover:bg-qrmory-purple-50 transition-colors border-t border-neutral-100"
            >
              <IconPlus size={16} />
              Manage Domains
              <IconExternalLink size={14} className="ml-auto" />
            </a>
          </div>
        </>
      )}

      {/* Preview URL */}
      {shortcode && (
        <p className="text-xs text-neutral-500 mt-1 truncate">
          {getDisplayURL(selectedDomain || null)}
        </p>
      )}
    </div>
  );
}
