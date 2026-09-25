import { Suspense } from "react";
import Spiner from "@/shared/components/Spiner";

export default function Fallback({ children }: { children: React.ReactElement }) {
  return <Suspense fallback={<Spiner />}>{children}</Suspense>;
}
