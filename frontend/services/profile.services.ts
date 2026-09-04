import { apiRequest } from "@/services/api";

import type {
  UpdateProfileResponse,
  UserProfile,
} from "@/types/opportunity";


export const profileService = {
  get(): Promise<UserProfile | null> {
    return apiRequest<UserProfile | null>(
      "/profile"
    );
  },


  update(
    profile: UserProfile
  ): Promise<UpdateProfileResponse> {
    return apiRequest<UpdateProfileResponse>(
      "/profile",
      {
        method: "PUT",
        body: JSON.stringify(profile),
      }
    );
  },
};