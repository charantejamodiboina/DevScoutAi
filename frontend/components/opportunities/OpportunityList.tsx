import type { Opportunity } from "@/types/opportunity";

import { OpportunityCard } from "./OpportunityCard";

interface OpportunityListProps {
  opportunities: Opportunity[];
}

export function OpportunityList({
  opportunities,
}: OpportunityListProps) {
  if (!opportunities.length) {
    return null;
  }

  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {opportunities.map((opportunity, index) => (
        <OpportunityCard
          key={`${opportunity.url}-${index}`}
          opportunity={opportunity}
        />
      ))}
    </div>
  );
}