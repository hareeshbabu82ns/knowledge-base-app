"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Icons } from "@/components/shared/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { signInEmail } from "@/lib/auth/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, InfoIcon, LockIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [magicEmail, setMagicEmail] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isSubmittingToken, setIsSubmittingToken] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsCredentialsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Authentication failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      } else if (result?.ok) {
        window.location.href = "/dashboard";
      }
    } catch (e) {
      console.error("Credentials sign-in error:", e);
      toast({
        title: "Error signing in",
        description: e instanceof Error ? e.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCredentialsLoading(false);
    }
  };

  const sendMagicLink = async () => {
    if (!magicEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSendingMagicLink(true);
    try {
      const result = await signInEmail(magicEmail);

      if (result.status === "success") {
        setEmailSent(true);
        toast({
          title: "Magic link sent! ✉️",
          description: result.message,
        });
      } else {
        toast({
          title: "Error sending magic link",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Magic link error:", e);
      toast({
        title: "Error sending magic link",
        description: e instanceof Error ? e.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleTokenSubmit = async () => {
    if (!magicEmail || !emailToken) {
      toast({
        title: "Missing information",
        description: "Please enter both email and token",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingToken(true);
    try {
      const result = await signIn("resend", {
        email: magicEmail,
        token: emailToken,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result && "error" in result && result.error) {
        toast({
          title: "Authentication failed",
          description:
            "Invalid or expired token. Please request a new magic link.",
          variant: "destructive",
        });
        setIsSubmittingToken(false);
      } else if (result && "url" in result) {
        window.location.href = result.url || "/dashboard";
      }
    } catch (e) {
      console.error("Token submit error:", e);
      toast({
        title: "Error signing in",
        description: "Please check your token and try again",
        variant: "destructive",
      });
      setIsSubmittingToken(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsOAuthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (e) {
      toast({
        title: "Error signing in",
        description: e instanceof Error ? e.message : "Please try again",
        variant: "destructive",
      });
      setIsOAuthLoading(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl border-2 shadow-lg">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-center pb-2">
          <div className="rounded-full bg-gradient-to-br from-primary to-primary/60 p-1">
            <Avatar className="size-16">
              <AvatarImage src="/icon-192.png" />
              <AvatarFallback>HK</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">
            Welcome to HKBase
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to access your financial knowledge base
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credentials">Email & Password</TabsTrigger>
            <TabsTrigger value="magic">Magic Link</TabsTrigger>
          </TabsList>

          <TabsContent value="credentials" className="space-y-4">
            <Alert>
              <InfoIcon className="size-4" />
              <AlertDescription>
                Sign in with your email and password
              </AlertDescription>
            </Alert>

            <form onSubmit={handleCredentialsSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isCredentialsLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isCredentialsLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isCredentialsLoading}
                size="lg"
              >
                {isCredentialsLoading ? (
                  <>
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Icons.login className="mr-2 size-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic" className="space-y-4">
            <Alert>
              <InfoIcon className="size-4" />
              <AlertDescription>
                Enter your email to receive a magic link. Click the link or
                paste the token here.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="magicEmail">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="magicEmail"
                    type="email"
                    placeholder="name@example.com"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    disabled={isSendingMagicLink}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSendingMagicLink)
                        sendMagicLink();
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMagicLink}
                    disabled={isSendingMagicLink || !magicEmail}
                    size="lg"
                  >
                    {isSendingMagicLink ? (
                      <Icons.spinner className="size-4 animate-spin" />
                    ) : (
                      <Icons.email className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {emailSent && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Magic link sent! Check your email inbox and spam folder.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="emailToken">Token (from email)</Label>
                <div className="flex gap-2">
                  <Input
                    id="emailToken"
                    type="text"
                    placeholder="Enter token from email"
                    value={emailToken}
                    onChange={(e) => setEmailToken(e.target.value)}
                    disabled={isSubmittingToken}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isSubmittingToken)
                        handleTokenSubmit();
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleTokenSubmit}
                    disabled={isSubmittingToken || !emailToken || !magicEmail}
                    size="lg"
                  >
                    {isSubmittingToken ? (
                      <Icons.spinner className="size-4 animate-spin" />
                    ) : (
                      <Icons.login className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isOAuthLoading !== null}
            size="lg"
            className="w-full"
          >
            {isOAuthLoading === "google" ? (
              <Icons.spinner className="mr-2 size-5 animate-spin" />
            ) : (
              <svg
                className="mr-2 size-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Google
          </Button>

          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn("github")}
            disabled={isOAuthLoading !== null}
            size="lg"
            className="w-full"
          >
            {isOAuthLoading === "github" ? (
              <Icons.spinner className="mr-2 size-5 animate-spin" />
            ) : (
              <Icons.gitHub className="mr-2 size-5" />
            )}
            GitHub
          </Button>
        </div>

        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
          <LockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Your data is encrypted and secure. We never share your information
            with third parties.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-muted-foreground">
            What you can do:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">
                Track expenses across accounts
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">
                Monitor loans and EMI schedules
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">
                Interactive charts and reports
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">
                Analyze spending patterns
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
