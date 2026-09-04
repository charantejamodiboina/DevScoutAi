export interface Opportunity {
  _id?: string;
  title: string;
  organization: string;
  category: string;
  deadline: string;
  cost: string;
  location: string;
  skills: string[];
  summary: string;
  relevance_score: number;
  url: string;
}

export interface SearchResponse {
  query: string;
  source: string;
  analysis_cached: boolean;
  opportunities: Opportunity[];
}

export interface SearchRequest {
  query: string;
  num_results: number;
}

export interface SaveOpportunityResponse {
  message: string;
  saved: boolean;
  id: string;
}

export interface SavedOpportunitiesResponse {
  count: number;
  opportunities: Opportunity[];
}

export interface SearchHistoryItem {
  _id: string;
  query: string;
  num_results: number;
  searched_at: string;
}

export interface SearchHistoryResponse {
  count: number;
  history: SearchHistoryItem[];
}

export interface UserProfile {
  _id?: string;
  name: string;
  skills: string[];
  interests: string[];
  experience_years: number;
  preferred_locations: string[];
  opportunity_types: string[];
}

export interface UpdateProfileResponse {
  message: string;
}