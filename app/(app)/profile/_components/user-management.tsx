"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  setUserPassword,
} from "@/app/actions/profile-actions";
import { toast } from "sonner";
import { useState } from "react";
import {
  MoreVertical,
  Shield,
  ShieldOff,
  Trash2,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatDistance } from "date-fns";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<{
    id: string;
    name: string | null;
  } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await getAllUsers();
      if (result.status === "error") {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  const roleUpdateMutation = useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: "USER" | "ADMIN";
    }) => updateUserRole(userId, role),
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User role updated successfully");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      console.error("Role update error:", error);
      toast.error("Failed to update user role");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (data) => {
      if (data.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User deleted successfully");
        setDeleteUserId(null);
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      console.error("Delete user error:", error);
      toast.error("Failed to delete user");
    },
  });

  const passwordResetMutation = useMutation({
    mutationFn: setUserPassword,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success("Password set successfully");
        setPasswordResetUser(null);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error);
      }
    },
    onError: (error: Error) => {
      console.error("Password reset error:", error);
      toast.error("Failed to set password");
    },
  });

  const handleToggleRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    roleUpdateMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = () => {
    if (deleteUserId) {
      deleteMutation.mutate(deleteUserId);
    }
  };

  const handleSetPassword = () => {
    if (!passwordResetUser) return;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    passwordResetMutation.mutate({
      userId: passwordResetUser.id,
      newPassword,
      confirmPassword,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-destructive text-center">
            Error loading users: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts and permissions. You can promote users to
            admin, set passwords, or remove user accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {user.name || "Unnamed User"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email || "No email"}</TableCell>
                    <TableCell>
                      {user.role === "ADMIN" ? (
                        <Badge variant="default">
                          <Shield className="mr-1 size-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDistance(new Date(user.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleRole(user.id, user.role)}
                            disabled={roleUpdateMutation.isPending}
                          >
                            {user.role === "ADMIN" ? (
                              <>
                                <ShieldOff className="mr-2 size-4" />
                                Remove Admin
                              </>
                            ) : (
                              <>
                                <Shield className="mr-2 size-4" />
                                Make Admin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setPasswordResetUser({
                                id: user.id,
                                name: user.name,
                              })
                            }
                          >
                            <KeyRound className="mr-2 size-4" />
                            Set Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteUserId(user.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data?.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <Dialog
        open={!!passwordResetUser}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordResetUser(null);
            setNewPassword("");
            setConfirmPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Set Password for {passwordResetUser?.name}
            </DialogTitle>
            <DialogDescription>
              Set a new password for this user. They can use this password to
              sign in with email and password.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="adminNewPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="adminNewPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                Must be at least 8 characters with uppercase, lowercase, and
                numbers
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="adminConfirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="adminConfirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordResetUser(null);
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetPassword}
              disabled={passwordResetMutation.isPending}
            >
              {passwordResetMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Set Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
