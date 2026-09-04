"use client";

import { useMutation } from "@tanstack/react-query";

import {
  discoveryService,
  type DiscoveryRunRequest,
} from "@/services/discovery.service";


export function useDiscovery() {
  return useMutation({
    mutationFn: (
      data: DiscoveryRunRequest
    ) => discoveryService.run(data),
  });
}


export function useRefreshDiscovery() {
  return useMutation({
    mutationFn: (
      data: DiscoveryRunRequest
    ) => discoveryService.refresh(data),
  });
}