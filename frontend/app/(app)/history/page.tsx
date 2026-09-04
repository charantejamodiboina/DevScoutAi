"use client";

import Link from "next/link";

import { useSearchHistory } from "@/hooks/useSearchHistory";

export default function HistoryPage() {
  const {
    data,
    isLoading,
    error,
  } = useSearchHistory();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        Loading search history...
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

  const history = data?.history ?? [];

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Search History
          </h1>

          <p className="mt-2 text-gray-400">
            {history.length} previous searches
          </p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-xl text-gray-300">
              No search history yet.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block text-blue-400 hover:text-blue-300"
            >
              Start discovering opportunities →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <article
                key={item._id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5"
              >
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h2 className="font-semibold">
                      {item.query}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      {item.num_results} results
                    </p>
                  </div>

                  <time className="text-sm text-gray-500">
                    {new Date(
                      item.searched_at
                    ).toLocaleString()}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}