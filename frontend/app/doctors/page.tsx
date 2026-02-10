"use client";

import { Suspense } from "react";
import DoctorsPageClient from "./DoctorsPageClient";

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading search results...</div>}>
      <DoctorsPageClient />
    </Suspense>
  );
}
