"use client";

import { Mime } from "mime";
import Image from "next/image";
import { ChangeEvent, MouseEvent, useState } from "react";
import { Button } from "../ui/button";
import { Icons } from "./icons";
import { FileUploadProps } from "@/types/types";
import { toast } from "sonner";

const SingleFileUploadForm = ({
  allowedTypes = ["image"],
  showPreviews = true,
  label,
  onUploadSuccess,
}: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    if (!fileInput.files) {
      // alert("No file was chosen");
      toast.error("No file was chosen!", { id: "file-upload-error" });
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      // alert("Files list is empty");
      toast.error("Files list is empty!", { id: "file-upload-error" });
      return;
    }

    const file = fileInput.files[0];

    /** File validation */
    if (
      !allowedTypes.includes("all") &&
      allowedTypes.filter((t) => file.type.startsWith(t)).length === 0
    ) {
      // alert("Please select a valid file type");
      toast.error("Please select a valid file type!", {
        id: "file-upload-error",
      });
      return;
    }

    /** Setting file state */
    setFile(file);
    setPreviewUrl(
      file.type.startsWith("image")
        ? URL.createObjectURL(file)
        : "/assets/icons/file-generic.svg",
    );

    /** Reset file input */
    e.currentTarget.type = "text";
    e.currentTarget.type = "file";
  };

  const onCancelFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!previewUrl && !file) {
      return;
    }
    setFile(null);
    setPreviewUrl(null);
  };

  const onUploadFile = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!file) {
      return;
    }

    try {
      var formData = new FormData();
      formData.append("media", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const {
        data,
        error,
      }: {
        data: {
          url: string[];
        } | null;
        error: string | null;
      } = await res.json();

      if (error || !data) {
        // alert(error || "Sorry! something went wrong.");
        toast.error("File upload failed!", { id: "file-upload-error" });
        return;
      }

      onUploadSuccess && (await onUploadSuccess(data.url));
      // console.log("File was uploaded successfylly:", data);
    } catch (error) {
      // console.error(error);
      // alert("Sorry! something went wrong.");
      toast.error("File upload failed!", { id: "file-upload-error" });
    }
  };

  return (
    <form
      className="w-full p-3 border border-muted border-dashed"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col md:flex-row gap-1.5 md:py-4">
        <div className="flex-grow flex justify-center items-center">
          {showPreviews && previewUrl && (
            <div className="mx-auto w-80 space-y-1">
              <Image
                alt="file uploader preview"
                objectFit="cover"
                src={previewUrl}
                width={320}
                height={218}
                layout="fixed"
              />
              <p className="text-center text-xs text-muted-foreground">
                {file?.name}
              </p>
            </div>
          )}
          {!showPreviews && file && (
            <div className="mx-auto w-80">
              <p className="text-center">{file?.name}</p>
            </div>
          )}
          {!previewUrl && (
            <label className="flex flex-col items-center justify-center h-full py-3 transition-colors duration-150 cursor-pointer hover:text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                />
              </svg>
              <strong className="text-sm font-medium">
                {label || "Select a File"}
              </strong>
              <input
                className="block w-0 h-0"
                name="file"
                type="file"
                onChange={onFileUploadChange}
              />
            </label>
          )}
        </div>
        <div className="flex mt-4 md:mt-0 md:flex-col justify-center gap-1.5">
          <Button
            disabled={!previewUrl}
            onClick={onCancelFile}
            size="icon"
            variant="outline"
          >
            <Icons.close className="size-4" />
          </Button>
          <Button
            disabled={!previewUrl}
            onClick={onUploadFile}
            size="icon"
            variant="outline"
          >
            <Icons.upload className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SingleFileUploadForm;
