import { useEffect, useState } from "react";
import { useBib } from "@/lib/bib/store";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useBib.persist.onFinishHydration(() => setHydrated(true));
    void useBib.persist.rehydrate();
    return unsub;
  }, []);

  return hydrated;
}
