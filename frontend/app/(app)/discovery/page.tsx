"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";

import { type OpportunityType } from "@/services/discovery.service";

import { useDiscovery, useRefreshDiscovery } from "@/hooks/useDiscovery";
import { OpportunityList } from "@/components/opportunities/OpportunityList";

const opportunityTypes: {
  value: OpportunityType;
  label: string;
}[] = [
  {
    value: "job",
    label: "Jobs",
  },
  {
    value: "certification",
    label: "Certifications",
  },
  {
    value: "exam_voucher",
    label: "Exam Vouchers",
  },
  {
    value: "hackathon",
    label: "Hackathons",
  },
  {
    value: "course",
    label: "Courses",
  },
];

export default function Home() {
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const [opportunityType, setOpportunityType] =
    useState<OpportunityType>("job");

  const [location, setLocation] = useState("");

  const [maxAgeHours, setMaxAgeHours] = useState<number | null>(24);

  const { mutate, data, isPending, error } = useDiscovery();

  const { mutate: refresh, isPending: isRefreshing } = useRefreshDiscovery();

  useEffect(() => {
    if (!profile) {
      return;
    }

    const savedOpportunityType = profile.opportunity_types?.[0];

    if (
      savedOpportunityType &&
      opportunityTypes.some((type) => type.value === savedOpportunityType)
    ) {
      setOpportunityType(savedOpportunityType as OpportunityType);
    }

    const savedLocation = profile.preferred_locations?.[0];

    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, [profile]);

  function getDiscoveryRequest() {
    return {
      opportunity_type: opportunityType,
      location: location.trim() || null,
      query_count: 3,
      results_per_query: 10,
      max_age_hours: maxAgeHours,
      strict_freshness: opportunityType === "job",
    };
  }
  function handleDiscover() {
    mutate(getDiscoveryRequest());
  }

  function handleRefresh() {
    const request = getDiscoveryRequest();

    refresh(request, {
      onSuccess: () => {
        mutate(request);
      },
    });
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {isProfileLoading && (
        <p className="text-sm text-gray-500">Loading your preferences...</p>
      )}
      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Discover Opportunities
          </h1>

          <p className="mt-2 text-sm text-gray-400 sm:text-base">
            AI-powered opportunities personalized to your skills, interests, and
            experience.
          </p>
        </div>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-8">
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">
              Opportunity type
            </label>

            <div className="flex flex-wrap gap-2">
              {opportunityTypes.map((type) => {
                const isSelected = opportunityType === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setOpportunityType(type.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500 hover:bg-gray-700"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Bangalore, Chennai, Hyderabad..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm outline-none transition placeholder:text-gray-500 focus:border-blue-500"
              />

              {profile?.preferred_locations &&
                profile.preferred_locations.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.preferred_locations.map((savedLocation) => (
                      <button
                        key={savedLocation}
                        type="button"
                        onClick={() => setLocation(savedLocation)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${
                          location === savedLocation
                            ? "border-blue-500 bg-blue-500/10 text-blue-300"
                            : "border-gray-700 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                        {savedLocation}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Freshness
              </label>

              <select
                value={maxAgeHours === null ? "any" : String(maxAgeHours)}
                onChange={(event) => {
                  const value = event.target.value;

                  setMaxAgeHours(value === "any" ? null : Number(value));
                }}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              >
                <option value="1">Last hour</option>

                <option value="3">Last 3 hours</option>

                <option value="6">Last 6 hours</option>

                <option value="24">Last 24 hours</option>

                <option value="168">Last 7 days</option>

                <option value="any">Any time</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDiscover}
            disabled={isPending}
            className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isPending
              ? "Discovering opportunities..."
              : "Discover opportunities"}
          </button>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error.message}
          </div>
        )}

        {data && (
          <section className="mt-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Opportunities</h2>

                <p className="mt-1 text-sm text-gray-400">
                  Found {data.opportunities.length} opportunities
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {data.cached ? "Loaded from cache" : "Fresh discovery"}
                </span>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isPending}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRefreshing || isPending
                    ? "Refreshing..."
                    : "Refresh results"}
                </button>
              </div>
            </div>

            {data.opportunities.length > 0 ? (
              <OpportunityList opportunities={data.opportunities} />
            ) : (
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
                <h3 className="font-semibold">No opportunities found</h3>

                <p className="mt-2 text-sm text-gray-400">
                  Try changing the opportunity type, location, or freshness
                  filter.
                </p>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
