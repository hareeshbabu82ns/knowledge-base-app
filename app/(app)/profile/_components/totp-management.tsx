"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  ShieldCheckIcon,
  ShieldOffIcon,
  RefreshCwIcon,
  CopyIcon,
  CheckIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { Icons } from "@/components/shared/icons";
import {
  getTOTPStatus,
  setupTOTP,
  enableTOTP,
  disableTOTP,
  regenerateBackupCodes,
} from "@/app/actions/totp-actions";

export default function TotpManagement() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [totpStatus, setTotpStatus] = useState<{
    enabled: boolean;
    backupCodesCount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [totpData, setTotpData] = useState<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    loadTotpStatus();
  }, []);

  const loadTotpStatus = async () => {
    const result = await getTOTPStatus();
    if (result.status === "success") {
      setTotpStatus(result.data);
    }
  };

  const handleSetupStart = async () => {
    setIsLoading(true);
    setTotpCode(""); // Clear previous input
    try {
      const result = await setupTOTP();
      if (result.status === "success") {
        setTotpData(result.data);
        setShowSetupDialog(true);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup TOTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = async () => {
    if (!totpCode || totpCode.length !== 6 || !totpData) {
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
      });

      if (result.status === "success") {
        setBackupCodes(result.data.backupCodes);
        setShowSetupDialog(false);
        setShowBackupCodesDialog(true);
        await loadTotpStatus();
        toast({
          title: "Success!",
          description: "Two-factor authentication has been enabled",
        });
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
        description: "Failed to enable TOTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!password && !totpCode) {
      toast({
        title: "Verification Required",
        description: "Please enter your password or TOTP code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await disableTOTP({
        password: password || undefined,
        token: totpCode || undefined,
      });

      if (result.status === "success") {
        setShowDisableDialog(false);
        setPassword("");
        setTotpCode("");
        await loadTotpStatus();
        toast({
          title: "Success!",
          description: "Two-factor authentication has been disabled",
        });
      } else {
        toast({
          title: "Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable TOTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await regenerateBackupCodes({ token: totpCode });

      if (result.status === "success") {
        setBackupCodes(result.data.backupCodes);
        setShowRegenerateDialog(false);
        setShowBackupCodesDialog(true);
        setTotpCode("");
        await loadTotpStatus();
        toast({
          title: "Success!",
          description: "New backup codes have been generated",
        });
      } else {
        toast({
          title: "Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate backup codes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (backupCodes.length > 0) {
      const codesText = backupCodes.join("\n");
      navigator.clipboard.writeText(codesText);
      setCopiedCodes(true);
      toast({
        title: "Copied!",
        description: "Backup codes copied to clipboard",
      });
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="size-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with time-based
            one-time passwords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {totpStatus && (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium">
                    Status: {totpStatus.enabled ? "Enabled" : "Disabled"}
                  </p>
                  {totpStatus.enabled && (
                    <p className="text-sm text-muted-foreground">
                      {totpStatus.backupCodesCount} backup codes remaining
                    </p>
                  )}
                </div>
                {totpStatus.enabled ? (
                  <ShieldCheckIcon className="size-8 text-green-600" />
                ) : (
                  <ShieldOffIcon className="size-8 text-muted-foreground" />
                )}
              </div>

              {!totpStatus.enabled ? (
                <Button
                  onClick={handleSetupStart}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 size-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="mr-2 size-4" />
                      Enable Two-Factor Authentication
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setTotpCode("");
                      setPassword("");
                      setShowDisableDialog(true);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <ShieldOffIcon className="mr-2 size-4" />
                    Disable 2FA
                  </Button>
                  <Button
                    onClick={() => {
                      setTotpCode("");
                      setShowRegenerateDialog(true);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCwIcon className="mr-2 size-4" />
                    Regenerate Codes
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          {totpData && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-lg border-2 bg-white p-4">
                  <img
                    src={totpData.qrCode}
                    alt="TOTP QR Code"
                    className="size-64"
                  />
                </div>
                <div className="w-full space-y-2">
                  <Label>Manual Entry Code</Label>
                  <div className="rounded bg-muted p-2">
                    <code className="text-xs font-mono break-all">
                      {totpData.secret}
                    </code>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setup-totp-code">Enter 6-digit code</Label>
                <Input
                  id="setup-totp-code"
                  type="text"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) =>
                    setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSetupDialog(false);
                setTotpCode("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetupComplete}
              disabled={isLoading || totpCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Enable"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password or current TOTP code to disable 2FA
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTriangleIcon className="size-4" />
            <AlertDescription>
              Disabling 2FA will make your account less secure
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">OR</div>
            <div className="space-y-2">
              <Label htmlFor="disable-totp-code">TOTP Code</Label>
              <Input
                id="disable-totp-code"
                type="text"
                placeholder="000000"
                value={totpCode}
                onChange={(e) =>
                  setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                className="text-center text-xl tracking-widest"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDisableDialog(false);
                setPassword("");
                setTotpCode("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={isLoading || (!password && !totpCode)}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable 2FA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog
        open={showRegenerateDialog}
        onOpenChange={setShowRegenerateDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Backup Codes</DialogTitle>
            <DialogDescription>
              Enter your current TOTP code to generate new backup codes
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <AlertTriangleIcon className="size-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              This will invalidate all existing backup codes!
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="regenerate-totp-code">TOTP Code</Label>
            <Input
              id="regenerate-totp-code"
              type="text"
              placeholder="000000"
              value={totpCode}
              onChange={(e) =>
                setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              className="text-center text-xl tracking-widest"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRegenerateDialog(false);
                setTotpCode("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegenerateBackupCodes}
              disabled={isLoading || totpCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate New Codes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Display Dialog */}
      <Dialog
        open={showBackupCodesDialog}
        onOpenChange={setShowBackupCodesDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Backup Codes</DialogTitle>
            <DialogDescription>
              Save these codes in a safe place. You can use them to access your
              account if you lose your authenticator device.
            </DialogDescription>
          </DialogHeader>
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <AlertTriangleIcon className="size-4 text-amber-600" />
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Each backup code can only be used once!
            </AlertDescription>
          </Alert>
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="rounded bg-background p-2 text-center"
                >
                  {code}
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={copyBackupCodes}
              variant="outline"
              className="flex-1"
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
            <Button
              onClick={() => setShowBackupCodesDialog(false)}
              className="flex-1"
            >
              I&apos;ve Saved My Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
