"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAppSettings,
  updateAppSettings,
  type AppSettingsFormValues,
} from "@/app/actions/app-settings";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  allowedSignupEmails: z.array(z.string().email()),
  allowedSignupDomains: z.array(z.string().min(1)),
  restrictSignup: z.boolean(),
});

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");
  const [newDomain, setNewDomain] = useState("");

  const form = useForm<AppSettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      allowedSignupEmails: [],
      allowedSignupDomains: [],
      restrictSignup: false,
    },
  });

  // Fetch current settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["appSettings"],
    queryFn: async () => {
      const result = await getAppSettings();
      if (result.status === "success") {
        return result.data;
      }
      throw new Error(result.error);
    },
  });

  // Update form when data is loaded
  useEffect(() => {
    if (settingsData) {
      form.reset(settingsData);
    }
  }, [settingsData, form]);

  // Mutation for updating settings
  const mutation = useMutation({
    mutationFn: updateAppSettings,
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["appSettings"] });
        toast({
          title: "Settings updated",
          description: "App settings have been successfully updated.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: AppSettingsFormValues) => {
    mutation.mutate(values);
  };

  const addEmail = () => {
    if (!newEmail) return;

    // Validate email format
    try {
      z.string().email().parse(newEmail);
      const currentEmails = form.getValues("allowedSignupEmails");
      if (!currentEmails.includes(newEmail)) {
        form.setValue("allowedSignupEmails", [...currentEmails, newEmail]);
        setNewEmail("");
      } else {
        toast({
          title: "Duplicate",
          description: "This email is already in the list",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
    }
  };

  const removeEmail = (email: string) => {
    const currentEmails = form.getValues("allowedSignupEmails");
    form.setValue(
      "allowedSignupEmails",
      currentEmails.filter((e) => e !== email),
    );
  };

  const addDomain = () => {
    if (!newDomain) return;

    const currentDomains = form.getValues("allowedSignupDomains");
    const cleanDomain = newDomain.toLowerCase().trim();

    if (!currentDomains.includes(cleanDomain)) {
      form.setValue("allowedSignupDomains", [...currentDomains, cleanDomain]);
      setNewDomain("");
    } else {
      toast({
        title: "Duplicate",
        description: "This domain is already in the list",
        variant: "destructive",
      });
    }
  };

  const removeDomain = (domain: string) => {
    const currentDomains = form.getValues("allowedSignupDomains");
    form.setValue(
      "allowedSignupDomains",
      currentDomains.filter((d) => d !== domain),
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Admin Settings</h3>
        <p className="text-muted-foreground text-sm">
          Configure signup restrictions and other administrative settings.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="restrictSignup"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Restrict Signup Access
                  </FormLabel>
                  <FormDescription>
                    When enabled, only emails and domains in the allowed lists
                    can sign up.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowedSignupEmails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allowed Signup Emails</FormLabel>
                <FormDescription>
                  Specific email addresses that are allowed to sign up.
                </FormDescription>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEmail();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addEmail}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((email) => (
                    <Badge key={email} variant="secondary">
                      {email}
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="allowedSignupDomains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Allowed Signup Domains</FormLabel>
                <FormDescription>
                  Email domains that are allowed to sign up (e.g., company.com).
                  Anyone with an email from these domains can sign up.
                </FormDescription>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="example.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDomain();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addDomain}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((domain) => (
                    <Badge key={domain} variant="secondary">
                      {domain}
                      <button
                        type="button"
                        onClick={() => removeDomain(domain)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Save Settings
          </Button>
        </form>
      </Form>
    </div>
  );
}
