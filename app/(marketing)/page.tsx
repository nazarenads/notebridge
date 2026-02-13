"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";

const features = [
  {
    title: "Rephrase & Clean Up",
    description:
      "Turn messy meeting notes, lecture scribbles, and brainstorm dumps into clean, polished text — concise, formal, or as action items. One click.",
    color: "#FB7185",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    title: "Research & Expand",
    description:
      "Highlight an unfamiliar term, a new topic, or a half-formed idea. AI defines it, adds context, and connects it to what you already know.",
    color: "#FBBF24",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.467.89 6.064 2.346m0-14.304a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.346m0-14.304v14.304" />
      </svg>
    ),
  },
  {
    title: "Generate Questions",
    description:
      "Generate smart questions from your notes — perfect for exam prep, interview practice, or surfacing follow-ups after a meeting.",
    color: "#60A5FA",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    title: "Create Diagrams",
    description:
      "Turn your notes into visual flowcharts, process maps, and concept diagrams — see workflows and relationships at a glance.",
    color: "#34D399",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: "01",
    title: "Capture",
    description: "Jot down anything — meetings, lectures, brainstorms, research — in a rich text editor.",
  },
  {
    number: "02",
    title: "Select",
    description: "Highlight any text to reveal AI-powered actions tailored to your content.",
  },
  {
    number: "03",
    title: "Transform",
    description: "AI cleans up, researches, and organizes your thinking — accept suggestions inline or chat for more.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-zinc-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0D0D0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight">
            <span className="text-white">Note</span>
            <span className="text-[#7B61FF]">Bridge</span>
          </div>
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="rounded-lg px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg bg-[#7B61FF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6B51EF]">
                Sign up
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-24 pt-32">
        {/* Radial gradient glow */}
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="h-[500px] w-[800px] rounded-full bg-[#7B61FF]/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <motion.h1
            className="font-[family-name:var(--font-fraunces)] text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Notes that think{" "}
            <span className="text-[#7B61FF]">with you</span>
          </motion.h1>
          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg text-zinc-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            The AI-powered notebook that turns scattered thoughts into clear,
            structured knowledge. Select any text to rephrase, research,
            question, and visualize — instantly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-[#7B61FF] px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-[#7B61FF]/25 transition-all hover:bg-[#6B51EF] hover:shadow-[#7B61FF]/40">
                Get started free
              </button>
            </SignUpButton>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-white sm:text-4xl">
              AI that works the way you think
            </h2>
            <p className="mt-4 text-zinc-400">
              Every feature is one text selection away.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group rounded-xl border border-[#2A2A34] bg-[#16161A] p-6 transition-colors hover:border-[#5C5B60]"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-white sm:text-4xl">
              How it works
            </h2>
          </div>
          <div className="grid gap-12 sm:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                className="text-center"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#2A2A34] font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#7B61FF]">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-white sm:text-4xl">
            Think better, not just faster
          </h2>
          <p className="mt-4 text-zinc-400">
            Your notes deserve more than storage. Give them an AI thinking partner.
          </p>
          <div className="mt-10">
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-[#7B61FF] px-8 py-3.5 text-base font-medium text-white shadow-lg shadow-[#7B61FF]/25 transition-all hover:bg-[#6B51EF] hover:shadow-[#7B61FF]/40">
                Get started free
              </button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="font-[family-name:var(--font-fraunces)] text-sm text-zinc-500">
            <span className="text-zinc-400">Note</span>
            <span className="text-[#7B61FF]/60">Bridge</span>
          </div>
          <p className="text-sm text-zinc-600">
            Built with coffee and Claude
          </p>
          <div className="flex gap-6 text-sm text-zinc-600">
            <a href="#" className="transition-colors hover:text-zinc-400">Privacy</a>
            <a href="#" className="transition-colors hover:text-zinc-400">Terms</a>
            <a href="#" className="transition-colors hover:text-zinc-400">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
