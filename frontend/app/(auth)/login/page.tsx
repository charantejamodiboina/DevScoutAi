"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authService } from "@/services/auth.service";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setError("");
      setIsLoading(true);

      const data = await authService.login({
        email,
        password,
      });

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      const nextPath =
        searchParams.get("next") || "/";

      router.replace(nextPath);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Welcome back 👋
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Sign in to discover new opportunities
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}

          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
          Loading...
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}