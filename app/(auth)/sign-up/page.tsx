"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LockKeyholeIcon,
  ShieldCheckIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserSignupSchema } from "@/lib/validations/user";
import { signUp } from "@/lib/auth/actions";
import { Icons } from "@/components/shared/icons";
import { setupTOTP, enableTOTP } from "@/app/actions/totp-actions";

type SignupFormValues = z.infer<typeof UserSignupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"signup" | "totp-setup" | "totp-verify">(
    "signup",
  );
  const [totpData, setTotpData] = useState<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [credentials, setCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(UserSignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSignup = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp(values);

      // Check if result is defined
      if (!result) {
        throw new Error("Signup failed - no response from server");
      }

      if (result.status === "error") {
        setError(result.error);
        toast({
          title: "Signup Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "Now let's set up two-factor authentication",
        });

        // Store credentials for later sign-in after TOTP setup
        setCredentials({
          email: values.email,
          password: values.password,
        });

        // Store the userId from the signup result
        setUserId(result.userId);

        // Generate TOTP secret and QR code using the userId
        const totpSetup = await setupTOTP(result.userId);

        // Check if totpSetup is defined
        if (!totpSetup) {
          throw new Error("Failed to setup TOTP - no response from server");
        }

        if (totpSetup.status === "success") {
          setTotpData(totpSetup.data);
          setStep("totp-setup");
        } else {
          throw new Error(totpSetup.error);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTotpVerify = async () => {
    if (!totpCode || totpCode.length !== 6 || !totpData || !userId) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await enableTOTP({
        secret: totpData.secret,
        token: totpCode,
        backupCodes: totpData.backupCodes,
        userId: userId, // Pass the userId to enable TOTP
      });

      // Check if result is defined
      if (!result) {
        throw new Error("Failed to enable TOTP - no response from server");
      }

      if (result.status === "success") {
        toast({
          title: "Two-Factor Authentication Enabled!",
          description: "Your account is now secured with 2FA",
        });
        setStep("totp-verify");
      } else {
        toast({
          title: "Verification Failed",
          description: result.error,
          variant: "destructive",
        });
        setTotpCode("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (totpData) {
      const codesText = totpData.backupCodes.join("\n");
      navigator.clipboard.writeText(codesText);
      setCopiedCodes(true);
      toast({
        title: "Copied!",
        description: "Backup codes copied to clipboard",
      });
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const completeTotpSetup = () => {
    toast({
      title: "Setup Complete!",
      description: "Please sign in with your authenticator code",
    });
    router.push("/sign-in");
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsOAuthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to sign in with ${provider}`,
        variant: "destructive",
      });
    } finally {
      setIsOAuthLoading(null);
    }
  };

  return (
    <Card className="min-w-lg m-auto rounded-lg p-2 md:min-w-[500px]">
      <CardHeader>
        <div className="flex items-center justify-center pb-2">
          <Avatar className="size-16">
            <AvatarImage src="/icon-192.png" />
            <AvatarFallback>Logo</AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="text-xl">
          {step === "signup" && "Sign Up"}
          {step === "totp-setup" && "Set Up Two-Factor Authentication"}
          {step === "totp-verify" && "Save Your Backup Codes"}
        </CardTitle>
        <CardDescription>
          {step === "signup" &&
            "Enter your information to create an account. If you previously signed up with Google, you can add a password here."}
          {step === "totp-setup" &&
            "Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code"}
          {step === "totp-verify" &&
            "Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "signup" && (
          <form onSubmit={form.handleSubmit(handleSignup)}>
            <div className="grid gap-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...form.register("name")}
                  disabled={isLoading}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...form.register("email")}
                  disabled={isLoading}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...form.register("password")}
                  disabled={isLoading}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create an account"
                )}
              </Button>

              {/* divider */}
              <div className="flex w-full items-center py-4">
                <div className="bg-primary h-px flex-1" />
                <span className="text-primary px-2 text-sm">
                  <LockKeyholeIcon className="size-4" />
                </span>
                <div className="bg-primary h-px flex-1" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isOAuthLoading === "google" || isLoading}
              >
                {isOAuthLoading === "google" ? (
                  <>
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Sign up with Google"
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "totp-setup" && totpData && (
          <div className="grid gap-4">
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
              <ShieldCheckIcon className="size-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Two-factor authentication adds an extra layer of security to
                your account
              </AlertDescription>
            </Alert>

            <div className="flex flex-col items-center gap-4">
              <div className="rounded-lg border-2 border-border bg-white p-4">
                <img
                  src={totpData.qrCode}
                  alt="TOTP QR Code"
                  className="size-64"
                />
              </div>

              <div className="w-full space-y-2">
                <Label>Manual Entry Code</Label>
                <div className="rounded bg-muted p-3">
                  <code className="text-sm font-mono break-all">
                    {totpData.secret}
                  </code>
                </div>
              </div>

              <div className="w-full space-y-2">
                <Label htmlFor="totpCode">
                  Enter 6-digit code from your app
                </Label>
                <Input
                  id="totpCode"
                  type="text"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={isLoading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleTotpVerify}
                className="w-full"
                disabled={isLoading || totpCode.length !== 6}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="mr-2 size-4" />
                    Verify & Continue
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "totp-verify" && totpData && (
          <div className="grid gap-4">
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
              <ShieldCheckIcon className="size-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                Save these backup codes! You&apos;ll need them if you lose
                access to your authenticator app.
              </AlertDescription>
            </Alert>

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {totpData.backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="rounded bg-background p-2 text-center"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={copyBackupCodes}
              variant="outline"
              className="w-full"
            >
              {copiedCodes ? (
                <>
                  <CheckIcon className="mr-2 size-4" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="mr-2 size-4" />
                  Copy All Codes
                </>
              )}
            </Button>

            <Button onClick={completeTotpSetup} className="w-full" size="lg">
              I&apos;ve Saved My Backup Codes
            </Button>
          </div>
        )}

        {step === "signup" && (
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline">
              Sign in
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
