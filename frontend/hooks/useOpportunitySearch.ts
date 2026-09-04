import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { SEARCH_HISTORY_QUERY_KEY } from "@/hooks/useSearchHistory";
import { opportunityService } from "@/services/opportunity.service";
import type { SearchRequest } from "@/types/opportunity";


export function useOpportunitySearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: SearchRequest
    ) => opportunityService.searchAndAnalyze(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SEARCH_HISTORY_QUERY_KEY,
      });
    },
  });
}