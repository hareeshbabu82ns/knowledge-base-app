import { toast } from "sonner";
import { Button, buttonVariants } from "./ui/button";
import { cva, VariantProps } from "class-variance-authority";
// import { useToast } from "./ui/use-toast";
// import { ToastAction } from "./ui/toast";

export const toastVariants = cva(
  "group pointer-events-auto flex w-full items-center gap-2 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        success:
          "success group border-success bg-success text-success-foreground",
        warning:
          "warning group border-warning bg-warning text-warning-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface DeleteConfirmButtonProps extends React.ComponentProps<"button"> {
  toastId: number | string;
  toastLabel?: string;
}

export const DeleteConfirmButton = ( {
  toastId,
  toastLabel,
  variant,
  onClick,
  ...props
}: DeleteConfirmButtonProps &
  VariantProps<typeof buttonVariants> ) => {
  const toastVar = props.className?.includes( "text-destructive" )
    ? toast.error
    : toast.warning;
  // const { toast } = useToast();
  return (
    <Button
      {...props}
      variant={variant}
      onClick={() => {
        toastVar( toastLabel || "Confirm Deletion?", {
          id: toastId,
          // position: "top-center",
          duration: Infinity,
          closeButton: true,
          action: (
            <Button
              size="icon"
              variant={variant}
              className="ml-auto"
              onClick={( e ) => {
                onClick && onClick( e );
                toast.dismiss( toastId );
              }}
            >
              {/* <Icons.trash className="size-4" /> */}
              {props.children}
            </Button>
          ),
        } );
      }}
    />
  );
};
