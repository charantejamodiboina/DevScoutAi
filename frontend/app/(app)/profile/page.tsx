"use client";

import { FormEvent, useEffect, useState } from "react";

import {
  useProfile,
  useUpdateProfile,
} from "@/hooks/useProfile";

import type { UserProfile } from "@/types/opportunity";

const initialProfile: UserProfile = {
  name: "",
  skills: [],
  interests: [],
  experience_years: 0,
  preferred_locations: [],
  opportunity_types: [],
};

const opportunityTypes = [
  "job",
  "certification",
  "exam_voucher",
  "hackathon",
  "course",
];

function stringToArray(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayToString(value: string[]): string {
  return value.join(", ");
}

export default function ProfilePage() {
  const { data, isLoading } = useProfile();
  const {
    mutate,
    isPending,
    error,
    isSuccess,
  } = useUpdateProfile();

  const [profile, setProfile] =
    useState<UserProfile>(initialProfile);

  const [skillsInput, setSkillsInput] =
    useState("");

  const [interestsInput, setInterestsInput] =
    useState("");

  const [locationsInput, setLocationsInput] =
    useState("");

  useEffect(() => {
    if (!data) {
      return;
    }

    setProfile({
      ...initialProfile,
      ...data,
    });

    setSkillsInput(
      arrayToString(data.skills || [])
    );

    setInterestsInput(
      arrayToString(data.interests || [])
    );

    setLocationsInput(
      arrayToString(
        data.preferred_locations || []
      )
    );
  }, [data]);

  function toggleOpportunityType(type: string) {
    setProfile((current) => {
      const exists =
        current.opportunity_types.includes(
          type
        );

      return {
        ...current,
        opportunity_types: exists
          ? current.opportunity_types.filter(
              (item) => item !== type
            )
          : [
              ...current.opportunity_types,
              type,
            ],
      };
    });
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    mutate({
      ...profile,
      skills: stringToArray(skillsInput),
      interests: stringToArray(interestsInput),
      preferred_locations: stringToArray(
        locationsInput
      ),
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-gray-400">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Your Profile
        </h1>

        <p className="mt-2 text-sm text-gray-400 sm:text-base">
          Help DevScout AI find opportunities
          relevant to your skills and goals.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-8">
          <h2 className="text-lg font-semibold sm:text-xl">
            Professional Information
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Name
              </label>

              <input
                value={profile.name}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    name: event.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Years of experience
              </label>

              <input
                type="number"
                min="0"
                value={profile.experience_years}
                onChange={(event) =>
                  setProfile({
                    ...profile,
                    experience_years: Number(
                      event.target.value
                    ),
                  })
                }
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-8">
          <h2 className="text-lg font-semibold sm:text-xl">
            Skills and Interests
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Skills
              </label>

              <textarea
                value={skillsInput}
                onChange={(event) =>
                  setSkillsInput(event.target.value)
                }
                placeholder="React, Python, AWS"
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                Separate items with commas.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">
                Interests
              </label>

              <textarea
                value={interestsInput}
                onChange={(event) =>
                  setInterestsInput(
                    event.target.value
                  )
                }
                placeholder="AI, Cloud, DevOps"
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                Separate items with commas.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-8">
          <h2 className="text-lg font-semibold sm:text-xl">
            Discovery Preferences
          </h2>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-gray-300">
              Preferred locations
            </label>

            <input
              value={locationsInput}
              onChange={(event) =>
                setLocationsInput(event.target.value)
              }
              placeholder="Hyderabad, Bangalore, Remote"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
            />

            <p className="mt-2 text-xs text-gray-500">
              Separate locations with commas.
            </p>
          </div>

          <div className="mt-6">
            <label className="mb-3 block text-sm text-gray-300">
              Opportunity types
            </label>

            <div className="flex flex-wrap gap-2">
              {opportunityTypes.map((type) => {
                const selected =
                  profile.opportunity_types.includes(
                    type
                  );

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      toggleOpportunityType(type)
                    }
                    className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
                      selected
                        ? "border-blue-500 bg-blue-500/15 text-blue-400"
                        : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    {type.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
            Profile saved successfully.
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isPending
            ? "Saving profile..."
            : "Save Profile"}
        </button>
      </form>
    </section>
  );
}