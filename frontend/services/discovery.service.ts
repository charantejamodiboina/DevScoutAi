import { apiRequest } from "@/services/api";
import type { Opportunity } from "@/types/opportunity";


export type OpportunityType =
  | "job"
  | "certification"
  | "exam_voucher"
  | "hackathon"
  | "course";


export interface DiscoveryRunRequest {
  opportunity_type: OpportunityType;
  location?: string | null;
  query_count?: number;
  results_per_query?: number;
  max_age_hours?: number | null;
  strict_freshness?: boolean;
}


export interface DiscoveryResponse {
  cached: boolean;

  generated_at: string;

  opportunity_type: OpportunityType;

  generated_queries: string[];

  raw_results_count: number;

  unique_results_count: number;

  fresh_results_count: number;

  max_age_hours: number | null;

  strict_freshness: boolean;

  opportunities: Opportunity[];
}


export const discoveryService = {
  run(
    data: DiscoveryRunRequest
  ): Promise<DiscoveryResponse> {
    return apiRequest<DiscoveryResponse>(
      "/discovery/run",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  refresh(
    data: DiscoveryRunRequest
  ): Promise<{
    message: string;
  }> {
    return apiRequest(
      "/discovery/refresh",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};