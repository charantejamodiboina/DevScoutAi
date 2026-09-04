import type {
  Opportunity,
  SavedOpportunitiesResponse,
  SaveOpportunityResponse,
  SearchHistoryResponse,
  SearchRequest,
  SearchResponse,
} from "@/types/opportunity";

import { apiRequest } from "@/services/api";


export const opportunityService = {
  searchAndAnalyze(
    data: SearchRequest
  ): Promise<SearchResponse> {
    return apiRequest(
      "/search/analyze",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },


  save(
    opportunity: Opportunity
  ): Promise<SaveOpportunityResponse> {
    return apiRequest(
      "/opportunities/save",
      {
        method: "POST",
        body: JSON.stringify(opportunity),
      }
    );
  },


  getSaved(): Promise<SavedOpportunitiesResponse> {
    return apiRequest(
      "/opportunities/saved"
    );
  },


  getHistory(): Promise<SearchHistoryResponse> {
    return apiRequest("/history");
  },


  deleteSaved(
    opportunityId: string
  ): Promise<void> {
    return apiRequest(
      `/opportunities/saved/${opportunityId}`,
      {
        method: "DELETE",
      }
    );
  },
};