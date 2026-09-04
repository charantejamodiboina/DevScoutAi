"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      router.replace(
        `/login?next=${encodeURIComponent(pathname)}`
      );
    }
  }, [pathname, router]);

  return <>{children}</>;
}