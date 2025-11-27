import { Suspense } from "react";
import Spiner from "@/shared/ui/Spiner";

export default function Fallback({ children }: { children: React.ReactElement }) {
  return <Suspense fallback={<Spiner />}>{children}</Suspense>;
}
