"use client";

import React, { useState } from "react";
import Link from "next/link";
import { WordReveal } from "@/components/motion/word-reveal";
import { CountUp } from "@/components/motion/count-up";
import { Float } from "@/components/motion/float";
import { BillingLoop } from "@/components/motion/billing-loop";
import { LifecycleLine } from "@/components/motion/lifecycle-line";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { usePlans } from "@/hooks/useProducts";
import { useRunBillingJob, useBillingJobStatus } from "@/hooks/useBillingJob";
import { formatINR } from "@/lib/utils";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Receipt,
  Scales,
  ShieldCheck,
  CreditCard,
  Lightning,
  Sparkle,
} from "@phosphor-icons/react";

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [demoJobId, setDemoJobId] = useState<string | null>(null);

  const { data: plans } = usePlans();
  const runBillingMutation = useRunBillingJob();
  const billingJobQuery = useBillingJobStatus(demoJobId);

  const handleRunDemoBilling = async () => {
    const res = await runBillingMutation.mutateAsync();
    setDemoJobId(res.job_id);
  };

  const planList = Array.isArray(plans) ? plans : [];
  const filteredPlans = planList.filter(
    (p) => p.period === billingPeriod
  );

  return (
    <div className="min-h-screen bg-paper flex flex-col selection:bg-sand selection:text-ink">
      {/* Top Navigation */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-leaf bg-primary flex items-center justify-center text-surface font-bold text-lg">
            B
          </div>
          <span className="font-bold text-xl tracking-tight text-ink">
            Brightloop
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <a href="#lifecycle" className="hover:text-ink transition-colors">
            Lifecycle
          </a>
          <a href="#engine" className="hover:text-ink transition-colors">
            Billing Engine
          </a>
          <a href="#plans" className="hover:text-ink transition-colors">
            Plans & Pricing
          </a>
          <a href="#faq" className="hover:text-ink transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm">
              Launch Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section with Arch Shape */}
      <section className="px-4 sm:px-6 pt-4 pb-16">
        <div className="max-w-6xl mx-auto bg-surface border border-border shape-arch px-6 sm:px-12 pt-16 sm:pt-24 pb-16 relative overflow-hidden flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-leaf bg-sand/60 border border-border text-xs font-medium text-ink mb-6">
            <span className="w-2 h-2 rounded-full bg-status-active animate-pulse" />
            <span>Built for Indian SaaS &bull; GST Ready</span>
          </div>

          {/* Heading with WordReveal */}
          <WordReveal
            text="Automated recurring billing built for Indian SaaS"
            as="h1"
            className="text-3xl sm:text-5xl lg:text-6xl font-bold font-[var(--font-bricolage)] text-ink max-w-4xl tracking-tight leading-[1.1] mb-6"
          />

          <p className="text-base sm:text-lg text-muted max-w-2xl leading-relaxed mb-8">
            Manage your subscription revenue from initial quotation to automated GST invoicing,
            UPI payment reconciliation, and real-time finance ledgers.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <Link href="/login">
              <Button variant="primary" size="lg" className="gap-2">
                <span>Start Free Pilot</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
            <a href="#engine">
              <Button variant="secondary" size="lg" className="gap-2">
                <Play size={16} weight="fill" className="text-accent" />
                <span>Test Live Billing Engine</span>
              </Button>
            </a>
          </div>

          {/* Central Hero Animation Graphic */}
          <div className="relative w-full max-w-md h-72 flex items-center justify-center">
            {/* Dashed Circle Billing Loop */}
            <BillingLoop size={240} />

            {/* Center Recurring Revenue Card */}
            <div className="absolute z-10 bg-surface border border-border shape-leaf p-5 text-center shadow-none">
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider block">
                Recurring Volume
              </span>
              <span className="text-2xl font-bold font-mono-tabular text-ink block mt-0.5">
                ₹84,500<span className="text-xs text-muted font-normal"> / mo</span>
              </span>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-leaf bg-[#EAF3EC] text-status-active text-[11px] font-medium border border-[#B8D8BF]">
                <CheckCircle size={12} weight="fill" />
                <span>GST Compliant</span>
              </div>
            </div>

            {/* Floating Card 1: Left */}
            <Float amplitude={10} duration={3.5} className="absolute -left-4 top-4 hidden sm:block">
              <div className="bg-paper border border-border shape-leaf p-3 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-tabular text-xs font-semibold text-ink">
                    INV-2026-0841
                  </span>
                  <Chip status="Paid" />
                </div>
                <span className="font-mono-tabular text-xs font-bold text-primary block">
                  ₹14,990.00
                </span>
                <span className="text-[10px] text-muted">Via UPI AutoPay</span>
              </div>
            </Float>

            {/* Floating Card 2: Right */}
            <Float amplitude={-12} duration={4} delay={0.5} className="absolute -right-4 bottom-4 hidden sm:block">
              <div className="bg-paper border border-border shape-leaf p-3 text-left">
                <span className="text-[10px] text-muted uppercase tracking-wider block">
                  Intra-State GST
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono-tabular text-xs font-semibold text-ink">
                    CGST 9% + SGST 9%
                  </span>
                </div>
                <span className="text-[10px] text-status-active font-medium block">
                  Auto-calculated
                </span>
              </div>
            </Float>
          </div>
        </div>
      </section>

      {/* Stat Band Section with CountUp */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="bg-surface border border-border shape-leaf p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="flex flex-col items-center pt-4 lg:pt-0">
            <span className="text-3xl sm:text-4xl font-bold font-mono-tabular text-ink">
              ₹<CountUp value={48} suffix=" Cr+" />
            </span>
            <span className="text-xs text-muted mt-1 font-medium">
              ARR Managed under Ledger
            </span>
          </div>

          <div className="flex flex-col items-center pt-4 lg:pt-0">
            <span className="text-3xl sm:text-4xl font-bold font-mono-tabular text-primary">
              <CountUp value={12000} suffix="+" />
            </span>
            <span className="text-xs text-muted mt-1 font-medium">
              Recurring Invoices / Mo
            </span>
          </div>

          <div className="flex flex-col items-center pt-4 lg:pt-0">
            <span className="text-3xl sm:text-4xl font-bold font-mono-tabular text-ink">
              <CountUp value={99} suffix=".8%" />
            </span>
            <span className="text-xs text-muted mt-1 font-medium">
              Collection Success Rate
            </span>
          </div>

          <div className="flex flex-col items-center pt-4 lg:pt-0">
            <span className="text-3xl sm:text-4xl font-bold font-mono-tabular text-accent">
              &lt; <CountUp value={2} suffix="s" />
            </span>
            <span className="text-xs text-muted mt-1 font-medium">
              Billing Day Run Time
            </span>
          </div>
        </div>
      </section>

      {/* Subscription Lifecycle Line Section */}
      <section id="lifecycle" className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-16 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-4xl font-bold font-[var(--font-bricolage)] text-ink">
            From Draft Quote to Cash in Bank
          </h2>
          <p className="text-sm text-muted">
            The full lifecycle draws itself as customers transition across contract milestones.
          </p>
        </div>

        {/* ScrollTrigger Animated Lifecycle Line */}
        <div className="bg-surface border border-border shape-leaf p-8 sm:p-12 overflow-x-auto">
          <LifecycleLine steps={["Draft", "Quotation", "Confirmed", "Active", "Closed"]} />
        </div>

        {/* 4 Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-surface border border-border shape-leaf space-y-2">
            <Receipt size={24} className="text-primary" />
            <h3 className="font-semibold text-sm text-ink">1. Quotation Templates</h3>
            <p className="text-xs text-muted leading-relaxed">
              Standardize deals with pre-set software lines, seat minimums, and discount packages.
            </p>
          </div>
          <div className="p-5 bg-surface border border-border shape-leaf space-y-2">
            <Scales size={24} className="text-primary" />
            <h3 className="font-semibold text-sm text-ink">2. Statutory GST Engine</h3>
            <p className="text-xs text-muted leading-relaxed">
              Automatic state-to-state taxation logic. Intra-state CGST+SGST, inter-state IGST.
            </p>
          </div>
          <div className="p-5 bg-surface border border-border shape-leaf space-y-2">
            <Lightning size={24} className="text-accent" />
            <h3 className="font-semibold text-sm text-ink">3. Idempotent Billing Days</h3>
            <p className="text-xs text-muted leading-relaxed">
              Run cycles anytime without fear of double-charging. Already billed subscriptions skip automatically.
            </p>
          </div>
          <div className="p-5 bg-surface border border-border shape-leaf space-y-2">
            <CreditCard size={24} className="text-status-active" />
            <h3 className="font-semibold text-sm text-ink">4. Unified Indian Rails</h3>
            <p className="text-xs text-muted leading-relaxed">
              Accept UPI AutoPay, Net Banking mandates, and corporate cards with instant reconciliation.
            </p>
          </div>
        </div>
      </section>

      {/* Live Billing Engine Interactive Demo */}
      <section id="engine" className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border shape-leaf p-8 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-medium text-accent uppercase tracking-wider block">
                Interactive Capability
              </span>
              <h2 className="text-2xl font-bold font-[var(--font-bricolage)] text-ink mt-0.5">
                Simulate a Recurring Billing Day Run
              </h2>
            </div>

            <Button
              variant="accent"
              size="md"
              loading={runBillingMutation.isPending}
              onClick={handleRunDemoBilling}
              className="gap-2 shrink-0"
            >
              <Play size={16} weight="fill" />
              <span>Execute Billing Cycle</span>
            </Button>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            This demo communicates with the live backend engine. Notice how the first execution generates invoices,
            and clicking it a second time marks all items as <strong className="text-ink">Skipped (Already billed)</strong>, proving mathematical idempotency.
          </p>

          {demoJobId && (
            <div className="p-5 bg-paper border border-border rounded-leaf space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink font-mono-tabular">
                  Job #{demoJobId.slice(0, 10)}
                </span>
                <span className="font-mono-tabular capitalize text-primary font-medium">
                  {billingJobQuery.data?.status || "Processing..."}
                </span>
              </div>

              {billingJobQuery.data && (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-surface border border-border rounded-leaf">
                    <span className="text-xs text-muted block">Invoices Generated</span>
                    <span className="text-2xl font-bold font-mono-tabular text-status-active">
                      {billingJobQuery.data.created}
                    </span>
                  </div>
                  <div className="p-4 bg-surface border border-border rounded-leaf">
                    <span className="text-xs text-muted block">Skipped (Idempotent)</span>
                    <span className="text-2xl font-bold font-mono-tabular text-muted">
                      {billingJobQuery.data.skipped}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Plans Comparison Section */}
      <section id="plans" className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-16 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-4xl font-bold font-[var(--font-bricolage)] text-ink">
              Transparent Catalog Plans
            </h2>
            <p className="text-sm text-muted">
              Synchronized directly with your live product database
            </p>
          </div>

          {/* Period Switcher */}
          <div className="flex border border-border rounded-leaf p-1 bg-surface">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-1.5 rounded-leaf text-xs font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-primary text-surface"
                  : "text-muted hover:text-ink"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-1.5 rounded-leaf text-xs font-medium transition-colors ${
                billingPeriod === "yearly"
                  ? "bg-primary text-surface"
                  : "text-muted hover:text-ink"
              }`}
            >
              Yearly (15% Savings)
            </button>
          </div>
        </div>

        {/* Plans Comparison Table (No three-tier cards!) */}
        <div className="bg-surface border border-border shape-leaf overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-sand/30 border-b border-border text-muted font-medium">
                <tr>
                  <th className="p-4">Plan Name</th>
                  <th className="p-4">Cadence</th>
                  <th className="p-4">Minimum Seats</th>
                  <th className="p-4">Pausable & Closable</th>
                  <th className="p-4 text-right">Recurring Fee</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-sand/15 transition-colors">
                    <td className="p-4 font-semibold text-ink text-sm">
                      {plan.name}
                    </td>
                    <td className="p-4 capitalize text-muted">
                      {plan.period}
                    </td>
                    <td className="p-4 font-mono-tabular text-ink">
                      {plan.minQty} minimum
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-status-active font-medium">
                        <CheckCircle size={14} weight="fill" />
                        <span>Self-Service Supported</span>
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono-tabular font-bold text-base text-primary">
                      {formatINR(plan.price)}
                    </td>
                    <td className="p-4 text-right">
                      <Link href="/login">
                        <Button variant="secondary" size="sm">
                          Select Plan
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-16 space-y-6">
        <h2 className="text-2xl font-bold font-[var(--font-bricolage)] text-ink text-center mb-8">
          Frequently Answered Inquiries
        </h2>

        <div className="space-y-4">
          <div className="p-5 bg-surface border border-border shape-leaf space-y-2">
            <h3 className="font-semibold text-sm text-ink">
              How does Brightloop calculate GST for multi-state operations?
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Brightloop checks the origin warehouse/company state (e.g. Maharashtra) against the customer billing state. If both match, equal CGST (9%) and SGST (9%) are applied. If the customer is in another Indian state, integrated IGST (18%) is automatically calculated.
            </p>
          </div>

          <div className="p-5 bg-surface border border-border shape-leaf space-y-2">
            <h3 className="font-semibold text-sm text-ink">
              What does idempotency mean for recurring billing runs?
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Our billing engine generates a unique deterministic billing key for each subscription and period. If a staff member or automated job executes the billing day twice, all previously invoiced subscriptions are skipped. Customers are guaranteed never to be billed twice.
            </p>
          </div>

          <div className="p-5 bg-surface border border-border shape-leaf space-y-2">
            <h3 className="font-semibold text-sm text-ink">
              Can we integrate custom product variants like Odoo modules?
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Yes. The Product Catalog supports variant delta pricing. For example, selecting the Odoo Enterprise connector adds ₹560 per seat onto the base SaaS software plan.
            </p>
          </div>
        </div>
      </section>

      {/* One-line Footer per AGENTS.md */}
      <footer className="mt-auto border-t border-border py-8 text-center text-xs text-muted">
        Brightloop &bull; Unified subscription management and recurring billing platform for Indian software enterprises.
      </footer>
    </div>
  );
}
