"use client";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Icons } from "@/components/shared/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { signInEmail } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, LockIcon, MailIcon } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [emailToken, setEmailToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendEmailToken = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInEmail(email);
      toast({
        title: "Magic link sent! ✉️",
        description:
          "Check your email for the login link. If not received in 15 minutes, please contact Admin.",
      });
    } catch (e) {
      toast({
        title: "Error sending email",
        description: e instanceof Error ? e.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (e) {
      toast({
        title: "Error signing in",
        description: e instanceof Error ? e.message : "Please try again",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (e) {
      toast({
        title: "Error signing in",
        description: e instanceof Error ? e.message : "Please try again",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg border-2 shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-center pb-2">
          <div className="rounded-full bg-gradient-to-br from-primary to-primary/60 p-1">
            <Avatar className="size-16">
              <AvatarImage src="/icon-192.png" />
              <AvatarFallback>HK</AvatarFallback>
            </Avatar>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">HKBase</CardTitle>
          <CardDescription className="text-base">
            Sign in to access your financial knowledge base
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Alert */}
        <Alert>
          <InfoIcon className="size-4" />
          <AlertDescription>
            Email login is currently only supported on web browsers
          </AlertDescription>
        </Alert>

        {/* Email Magic Link Section */}
        <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <MailIcon className="size-4 text-primary" />
            <h3 className="font-semibold">Email Magic Link</h3>
          </div>

          <div className="flex flex-row gap-2">
            <div className="grid grow gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendEmailToken();
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label className="opacity-0">Send</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={sendEmailToken}
                    disabled={isLoading || !email}
                    title="Send Magic Link"
                  >
                    <Icons.email className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send magic link to email</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <div className="grid grow gap-2">
              <Label htmlFor="emailToken">Token (if received)</Label>
              <Input
                id="emailToken"
                type="text"
                placeholder="Enter token from email"
                value={emailToken}
                onChange={(e) => setEmailToken(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label className="opacity-0">Login</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    title="Login with Token"
                    href={
                      emailToken && email
                        ? `/api/auth/callback/resend?callbackUrl=/dashboard&token=${emailToken}&email=${email}`
                        : "#"
                    }
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "icon" }),
                      (!emailToken || !email) &&
                        "pointer-events-none opacity-50",
                    )}
                  >
                    <Icons.login className="size-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Login with token</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex w-full items-center py-2">
          <div className="h-px flex-1 bg-border" />
          <span className="px-4 text-sm text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Google Sign In */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            size="lg"
          >
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
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            size="lg"
          >
            <Icons.gitHub className="mr-2 size-5" />
            Continue with GitHub
          </Button>
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
          <LockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Your data is encrypted and secure. We never share your information
            with third parties.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
