import { Suspense } from "react";
import Home from "@shared/shimmer/Home";
import Spiner from "@/shared/ui/Spiner";

export default function Fallback({ children }: { children: React.ReactElement }) {
  return <Suspense fallback={<Spiner />}>{children}</Suspense>;
}
