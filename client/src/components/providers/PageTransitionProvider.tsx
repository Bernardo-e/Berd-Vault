"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const TransitionContext = createContext({
  setLoading: (val: boolean) => {},
});

export const useTransition = () => useContext(TransitionContext);

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Trigger loading on path or search change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Minimum sync time for the premium feel
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <TransitionContext.Provider value={{ setLoading: setIsLoading }}>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="global-loader" />}
      </AnimatePresence>
      {children}
    </TransitionContext.Provider>
  );
}
