"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">

        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-400">
              DevScout AI Dashboard
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Find your next opportunity 🚀
            </h1>

            <p className="mt-3 max-w-2xl text-gray-400">
              Discover jobs, certifications, exam vouchers,
              hackathons, and courses tailored to your profile.
            </p>
          </div>

          <Link
            href="/discovery"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
          >
            Discover Opportunities →
          </Link>
        </div>


        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            href="/discovery"
            className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-blue-500"
          >
            <div className="text-3xl">
              🔎
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              AI Discovery
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Find personalized opportunities based on
              your skills and career preferences.
            </p>
          </Link>


          <Link
            href="/saved"
            className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-blue-500"
          >
            <div className="text-3xl">
              🔖
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Saved Opportunities
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Access opportunities you saved for later.
            </p>
          </Link>


          <Link
            href="/profile"
            className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-blue-500"
          >
            <div className="text-3xl">
              👤
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Your Profile
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Update your skills, interests, roles,
              locations, and opportunity preferences.
            </p>
          </Link>

        </section>


        <section className="mt-10 rounded-xl border border-gray-800 bg-gray-900 p-6">

          <h2 className="text-xl font-semibold">
            How DevScout AI works
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">

            <div>
              <span className="text-sm font-bold text-blue-400">
                01
              </span>

              <h3 className="mt-2 font-semibold">
                Build your profile
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Add your technical skills, experience,
                job roles, and preferred locations.
              </p>
            </div>

            <div>
              <span className="text-sm font-bold text-blue-400">
                02
              </span>

              <h3 className="mt-2 font-semibold">
                Discover opportunities
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                DevScout generates personalized searches
                and finds relevant opportunities.
              </p>
            </div>

            <div>
              <span className="text-sm font-bold text-blue-400">
                03
              </span>

              <h3 className="mt-2 font-semibold">
                Save what matters
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Save relevant opportunities and revisit
                them whenever you are ready to apply.
              </p>
            </div>

          </div>

        </section>

      </section>
    </main>
  );
}