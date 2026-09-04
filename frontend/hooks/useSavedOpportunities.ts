import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { opportunityService } from "@/services/opportunity.service";
import type { Opportunity } from "@/types/opportunity";


const SAVED_OPPORTUNITIES_QUERY_KEY = [
  "saved-opportunities",
];


export function useSavedOpportunities() {
  return useQuery({
    queryKey: SAVED_OPPORTUNITIES_QUERY_KEY,
    queryFn: opportunityService.getSaved,
  });
}


export function useSaveOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opportunity: Opportunity) =>
      opportunityService.save(opportunity),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SAVED_OPPORTUNITIES_QUERY_KEY,
      });
    },
  });
}


export function useDeleteSavedOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (opportunityId: string) =>
      opportunityService.deleteSaved(opportunityId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SAVED_OPPORTUNITIES_QUERY_KEY,
      });
    },
  });
}