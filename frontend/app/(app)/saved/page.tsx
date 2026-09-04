"use client";

"use client";

import {
  useDeleteSavedOpportunity,
  useSavedOpportunities,
} from "@/hooks/useSavedOpportunities";

export default function SavedPage() {
  const {
    data,
    isLoading,
    error,
  } = useSavedOpportunities();

  const {
    mutate: deleteOpportunity,
    isPending: isDeleting,
  } = useDeleteSavedOpportunity();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        Loading saved opportunities...
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-red-400">
        {error.message}
      </main>
    );
  }

  const opportunities = data?.opportunities ?? [];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Saved Opportunities
          </h1>

          <p className="mt-2 text-gray-400">
            {opportunities.length} saved opportunities
          </p>
        </div>

        {opportunities.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-xl text-gray-300">
              No saved opportunities yet.
            </p>

            <p className="mt-2 text-gray-500">
              Go to Discover and save opportunities you like.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opportunity) => (
              <article
                key={opportunity._id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-blue-950 px-3 py-1 text-sm text-blue-300">
                    {opportunity.category}
                  </span>

                  <span className="font-bold text-green-400">
                    {opportunity.relevance_score}%
                  </span>
                </div>

                <h2 className="mt-4 text-xl font-bold">
                  {opportunity.title}
                </h2>

                <p className="mt-2 text-gray-400">
                  {opportunity.organization}
                </p>

                <p className="mt-4 text-sm leading-6 text-gray-300">
                  {opportunity.summary}
                </p>

                <div className="mt-6 flex justify-between gap-4">
                  <a
                    href={opportunity.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    View →
                  </a>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      if (opportunity._id) {
                        deleteOpportunity(opportunity._id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    {isDeleting
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}