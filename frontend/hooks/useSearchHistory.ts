import { useQuery } from "@tanstack/react-query";

import { opportunityService } from "@/services/opportunity.service";

export const SEARCH_HISTORY_QUERY_KEY = [
  "search-history",
];

export function useSearchHistory() {
  return useQuery({
    queryKey: SEARCH_HISTORY_QUERY_KEY,
    queryFn: opportunityService.getHistory,
  });
}