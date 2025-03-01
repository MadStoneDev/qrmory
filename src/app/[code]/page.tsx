"use client";

import { useRouter } from "next/navigation";

export default async function CodeReroute({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code;
  const router = useRouter();

  // TODO: Check if code exists in database
  // TODO: If it does, redirect to the code page
  router.push(`https://ravenci.solutions`);
  // TODO: If it doesn't, redirect to the 404 page
}
