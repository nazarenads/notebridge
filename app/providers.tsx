"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud"
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        variables: {
          colorPrimary: "#a1a1aa",
          colorBackground: "#18181b",
          colorInputBackground: "#27272a",
          colorText: "#f4f4f5",
          colorTextOnPrimaryBackground: "#18181b",
        },
        elements: {
          socialButtonsBlockButton: {
            backgroundColor: "#f4f4f5",
            color: "#18181b",
            borderColor: "#3f3f46",
          },
          socialButtonsBlockButtonText: {
            color: "#18181b",
          },
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
