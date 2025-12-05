"use client"

import { useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle2, Sparkles, TrendingUp, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 overflow-hidden relative font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900">

      {/* Ambient Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-none">
            K
          </div>
        </div>

        {/* Top Right Purpose Text */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 rounded-full backdrop-blur-sm shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Next-Generation Financial Intelligence
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-sm font-medium border border-indigo-100 dark:border-indigo-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          v2.0 is now live
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white pb-2">
          Accounting reimagined <br /> for the AI era.
        </h1>

        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Experience the power of automated invoice processing, smart approvals, and real-time financial tracking without the complexity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={() => signIn("google")}
            className="h-12 px-8 rounded-full text-base bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-8 rounded-full text-base border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            View Demo
          </Button>
        </div>
      </main>

      {/* Pricing / Features Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10 border-b border-gray-100 dark:border-white/5 pb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pro Plan</h2>
              <p className="text-gray-500 dark:text-gray-400">Everything you need to scale your finance operations.</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-5xl font-bold tracking-tight">$0</span>
                <span className="text-gray-400 font-medium">/month</span>
              </div>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-full">
                Limited Time Offer
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            <FeatureItem text="Unlimited Invoice Parsing (OCR)" icon={<Sparkles className="w-5 h-5 text-purple-500" />} />
            <FeatureItem text="Multi-Currency Support" icon={<TrendingUp className="w-5 h-5 text-blue-500" />} />
            <FeatureItem text="Enterprise-grade Security" icon={<ShieldCheck className="w-5 h-5 text-green-500" />} />
            <FeatureItem text="Team Collaboration & Roles" icon={<CheckCircle2 className="w-5 h-5 text-gray-500" />} />
            <FeatureItem text="Custom Approval Workflows" icon={<CheckCircle2 className="w-5 h-5 text-gray-500" />} />
            <FeatureItem text="Real-time Financial Analytics" icon={<CheckCircle2 className="w-5 h-5 text-gray-500" />} />
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-sm text-gray-400">
              * No credit card required. Instant access to all premium features.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}

function FeatureItem({ text, icon }: { text: string, icon: any }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <span className="text-base font-medium text-gray-700 dark:text-gray-200">{text}</span>
    </div>
  )
}
