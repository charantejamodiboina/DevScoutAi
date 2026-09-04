"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { profileService } from "@/services/profile.services";
import type { UserProfile } from "@/types/opportunity";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileService.get,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: UserProfile) =>
      profileService.update(profile),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
}