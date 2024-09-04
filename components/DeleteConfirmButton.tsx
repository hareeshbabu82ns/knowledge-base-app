import { toast } from "sonner";
import { Button, ButtonProps } from "./ui/button";
import { Icons } from "./shared/icons";

export interface DeleteConfirmButtonProps extends ButtonProps {
  toastId: number | string;
  toastLabel?: string;
}

export const DeleteConfirmButton = ({
  toastId,
  toastLabel,
  onClick,
  ...props
}: DeleteConfirmButtonProps) => {
  return (
    <Button
      {...props}
      onClick={() => {
        toast.warning(toastLabel || "Confirm Deletion?", {
          id: toastId,
          action: (
            <Button
              size="icon"
              variant="destructive"
              className="ml-auto"
              onClick={(e) => {
                onClick && onClick(e);
                toast.dismiss(toastId);
              }}
            >
              <Icons.trash className="size-4" />
            </Button>
          ),
        });
      }}
    />
  );
};
