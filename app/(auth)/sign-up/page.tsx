"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyholeIcon } from "lucide-react";
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

type SignupFormValues = z.infer<typeof UserSignupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      if (result.status === "error") {
        setError(result.error);
        toast({
          title: "Signup Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: result.message,
        });
        // Redirect to dashboard after successful signup
        router.push("/dashboard");
        router.refresh();
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
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account. If you previously signed
          up with Google, you can add a password here.
        </CardDescription>
      </CardHeader>
      <CardContent>
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

        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/sign-in" className="underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
