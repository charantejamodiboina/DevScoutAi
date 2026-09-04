"use client";

import { useSavedOpportunities } from "@/hooks/useSavedOpportunities";
import { useSaveOpportunity } from "@/hooks/useSavedOpportunities";
import type { Opportunity } from "@/types/opportunity";

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export function OpportunityCard({
  opportunity,
}: OpportunityCardProps) {
  const { data: savedData } =
    useSavedOpportunities();

  const {
    mutate: saveOpportunity,
    isPending,
  } = useSaveOpportunity();

  const savedOpportunity =
    savedData?.opportunities.find(
      (item) => item.url === opportunity.url
    );

  const isSaved = Boolean(savedOpportunity);

  const handleSave = () => {
    if (isSaved) {
      return;
    }

    saveOpportunity(opportunity);
  };

  return (
    <article className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-blue-950 px-3 py-1 text-sm text-blue-300">
          {opportunity.category}
        </span>

        <span className="font-bold text-green-400">
          {opportunity.relevance_score}%
        </span>
      </div>

      <h2 className="mt-4 text-xl font-bold">
        {opportunity.title}
      </h2>

      <p className="mt-2 text-gray-400">
        {opportunity.organization}
      </p>

      <p className="mt-4 text-sm leading-6 text-gray-300">
        {opportunity.summary}
      </p>

      <div className="mt-5 space-y-2 text-sm text-gray-400">
        <p>📅 Deadline: {opportunity.deadline}</p>
        <p>💰 Cost: {opportunity.cost}</p>
        <p>📍 Location: {opportunity.location}</p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {opportunity.skills.map((skill) => (
          <span
            key={skill}
            className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || isSaved}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : isSaved
              ? "Saved ✓"
              : "Save"}
        </button>

        <a
          href={opportunity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          View Opportunity →
        </a>
      </div>
    </article>
  );
}