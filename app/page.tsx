import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  PiggyBank,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HKBase</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Features
            </Link>
            <Link
              href="#benefits"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Benefits
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {session ? (
              <Button asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="hidden sm:inline-flex"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 sm:py-32 lg:py-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium">Your Financial Command Center</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Manage Your Finances with{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              HKBase is your all-in-one financial knowledge base application.
              Track expenses, manage loans, analyze transactions, and gain
              insights into your financial health—all in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {session ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Open Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link href="/sign-up">
                      Start Free Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 -bottom-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-bottom-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-primary/30 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Everything You Need to Manage Your Money
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to give you complete control over your
              financial data
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-2 rounded-lg bg-primary/10 p-3 w-fit">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Expense Tracking</CardTitle>
                <CardDescription>
                  Create and manage expense accounts and categories. Track every
                  transaction with detailed metadata and tags.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-2 rounded-lg bg-primary/10 p-3 w-fit">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Loan Management</CardTitle>
                <CardDescription>
                  Keep track of loans, recurring payments, and installments.
                  Never miss a payment deadline.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-2 rounded-lg bg-primary/10 p-3 w-fit">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>
                  Generate comprehensive reports and visualizations. Understand
                  your spending patterns at a glance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-2 rounded-lg bg-primary/10 p-3 w-fit">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Analytics</CardTitle>
                <CardDescription>
                  Advanced filtering and search capabilities. Find any
                  transaction or record in seconds.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-2 rounded-lg bg-primary/10 p-3 w-fit">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Role-based access control and secure authentication. Your
                  financial data is protected with enterprise-grade security.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="mb-2 rounded-lg bg-primary/10 p-3 w-fit">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Import & Export</CardTitle>
                <CardDescription>
                  Import data from multiple formats. Export your financial
                  records whenever you need them.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Take Control of Your Financial Future
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Comprehensive Dashboard
                    </h3>
                    <p className="text-muted-foreground">
                      Get a bird's-eye view of all your financial activities.
                      Monitor balances, track trends, and spot opportunities.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Actionable Insights</h3>
                    <p className="text-muted-foreground">
                      Make informed decisions with detailed analytics and
                      reports. Identify spending patterns and optimize your
                      budget.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Bank-Level Security</h3>
                    <p className="text-muted-foreground">
                      Your sensitive financial data is protected with
                      enterprise-grade encryption and security protocols.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 lg:p-12">
                <div className="absolute inset-0 rounded-2xl bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
                <div className="relative space-y-4">
                  <Card className="shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Balance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">$24,562.89</div>
                      <p className="text-xs text-success flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +12.5% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Recent Expenses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Groceries</span>
                        <span className="font-semibold">$245.80</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Utilities</span>
                        <span className="font-semibold">$128.50</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span>Entertainment</span>
                        <span className="font-semibold">$89.99</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to Take Control of Your Finances?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Join thousands of users who trust HKBase to manage their financial
              records securely and efficiently.
            </p>
            {session ? (
              <Button size="lg" variant="secondary" asChild>
                <Link href="/dashboard">
                  Go to Your Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/sign-up">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  asChild
                >
                  <Link href="/sign-in">Sign In to Your Account</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PiggyBank className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">HKBase</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted financial knowledge base application for managing
                expenses, loans, and transactions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-primary transition-colors"
                  >
                    Expense Tracking
                  </Link>
                </li>
                <li>
                  <Link
                    href="/loans"
                    className="hover:text-primary transition-colors"
                  >
                    Loan Management
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-primary transition-colors"
                  >
                    Reports & Analytics
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/settings"
                    className="hover:text-primary transition-colors"
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="hover:text-primary transition-colors"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Calgary, AB, Canada</li>
                <li>
                  <a
                    href="mailto:hareeshbabu82@gmail.com"
                    className="hover:text-primary transition-colors"
                  >
                    hareeshbabu82@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/hareeshbabu82ns/hexplorer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} HKBase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
