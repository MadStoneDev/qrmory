// app/poll/[code]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface PollOption {
  id: string;
  text: string;
}

interface PollData {
  question: string;
  description: string;
  options: PollOption[];
  allowMultiple: boolean;
  startDate: string;
  endDate: string;
  showResults: boolean;
  requireName: boolean;
  ts: number;
}

interface PollVote {
  optionIds: string[];
  voterName?: string;
  timestamp: number;
  id: string;
}

interface Props {
  params: Promise<{
    code: string;
  }>;
}

function decodeData(encoded: string): PollData | null {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode poll data:", error);
    return null;
  }
}

export default function PollViewer({ params }: Props) {
  const { code } = use(params);
  const [data, setData] = useState<PollData | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [voterName, setVoterName] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [votes, setVotes] = useState<PollVote[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const pollData = decodeData(code);
    if (pollData) {
      setData(pollData);
      // Load existing votes from localStorage
      const existingVotes = localStorage.getItem(`poll_votes_${code}`);
      if (existingVotes) {
        try {
          const parsedVotes = JSON.parse(existingVotes);
          setVotes(parsedVotes);
        } catch (error) {
          console.error("Failed to load votes:", error);
        }
      }

      // Check if user has already voted
      const userVote = localStorage.getItem(`poll_vote_${code}`);
      if (userVote) {
        setHasVoted(true);
        if (pollData.showResults) {
          setShowResults(true);
        }
      }
    }
  }, [code]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Poll Not Found
          </h1>
          <p className="text-gray-600">
            This poll may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  // Check if poll is active
  const now = new Date();
  const startDate = data.startDate ? new Date(data.startDate) : null;
  const endDate = data.endDate ? new Date(data.endDate) : null;

  const isBeforeStart = startDate && now < startDate;
  const isAfterEnd = endDate && now > endDate;
  const isPollActive = !isBeforeStart && !isAfterEnd;

  const handleOptionToggle = (optionId: string) => {
    if (hasVoted || !isPollActive) return;

    if (data.allowMultiple) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId],
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0 || hasVoted || !isPollActive) return;

    if (data.requireName && !voterName.trim()) {
      alert("Please enter your name to vote.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newVote: PollVote = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        optionIds: selectedOptions,
        voterName: data.requireName ? voterName.trim() : undefined,
        timestamp: Date.now(),
      };

      const updatedVotes = [...votes, newVote];
      setVotes(updatedVotes);

      // Save to localStorage
      localStorage.setItem(
        `poll_votes_${code}`,
        JSON.stringify(updatedVotes),
      );
      localStorage.setItem(`poll_vote_${code}`, JSON.stringify(newVote));

      setHasVoted(true);

      if (data.showResults) {
        setShowResults(true);
      }
    } catch (error) {
      console.error("Failed to submit vote:", error);
      alert("Failed to submit vote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate results
  const getResults = () => {
    const results = data.options.map((option) => ({
      ...option,
      count: votes.filter((vote) => vote.optionIds.includes(option.id)).length,
    }));

    const totalVotes = votes.length;

    return results.map((result) => ({
      ...result,
      percentage:
        totalVotes > 0 ? Math.round((result.count / totalVotes) * 100) : 0,
    }));
  };

  const results = getResults();
  const totalVotes = votes.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Poll Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {data.question}
            </h1>
            {data.description && (
              <p className="text-gray-600">{data.description}</p>
            )}
          </div>

          {/* Poll Status */}
          {isBeforeStart && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">
                This poll will start on {startDate?.toLocaleDateString()} at{" "}
                {startDate?.toLocaleTimeString()}
              </p>
            </div>
          )}

          {isAfterEnd && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                This poll ended on {endDate?.toLocaleDateString()} at{" "}
                {endDate?.toLocaleTimeString()}
              </p>
            </div>
          )}

          {hasVoted && !showResults && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                Thank you for voting! Your response has been recorded.
              </p>
            </div>
          )}

          {/* Voting Form */}
          {!hasVoted && isPollActive && (
            <div className="space-y-4 mb-6">
              {data.requireName && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                    maxLength={50}
                  />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {data.allowMultiple
                    ? "Select all that apply:"
                    : "Select one option:"}
                </p>

                {data.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type={data.allowMultiple ? "checkbox" : "radio"}
                      name="poll-option"
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionToggle(option.id)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700">{option.text}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  selectedOptions.length === 0 ||
                  isSubmitting ||
                  (data.requireName && !voterName.trim())
                }
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Vote"}
              </button>
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Results</h3>
                <span className="text-sm text-gray-600">
                  {totalVotes} votes
                </span>
              </div>

              {results.map((result) => (
                <div key={result.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">{result.text}</span>
                    <span className="text-sm font-medium text-gray-600">
                      {result.count} ({result.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${result.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Poll Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div>
                {data.allowMultiple
                  ? "Multiple selections allowed"
                  : "Single selection only"}
                {data.requireName && " • Name required"}
              </div>
              <div>{endDate && `Ends: ${endDate.toLocaleDateString()}`}</div>
            </div>
          </div>
        </div>

        {/* QRmory branding */}
        <div className="text-center mt-8">
          <a
            href="https://qrmory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Powered by QRmory
          </a>
        </div>
      </div>
    </div>
  );
}
