"use client";

import Image from "next/image";
import { ChangeEvent, MouseEvent, useState } from "react";
import { Button } from "../ui/button";
import { Icons } from "./icons";
import { FileUploadProps } from "@/types/types";
import { toast } from "sonner";

const MultipleFileUploadForm = ({
  allowedTypes = ["all"],
  label,
  onUploadSuccess,
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[] | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const onFilesUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    if (!fileInput.files) {
      // alert("No files were chosen");
      toast.error("No files were chosen!", {
        id: "file-upload-error",
      });
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      // alert("Files list is empty");
      toast.error("Files list is empty!", {
        id: "file-upload-error",
      });
      return;
    }

    /** Files validation */
    const validFiles: File[] = [];
    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];

      if (
        !allowedTypes.includes("all") &&
        allowedTypes.filter((t) => file.type.startsWith(t)).length === 0
      ) {
        // alert(`File with idx: ${i} is invalid`);
        toast.error(`File with idx: ${i} is invalid!`, {
          id: "file-upload-error",
        });
        return;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      // alert("No valid files were chosen");
      toast.error("No valid files were chosen!", {
        id: "file-upload-error",
      });
      return;
    }

    setFiles(validFiles);
    setPreviewUrls(
      validFiles
        // .filter((f) => f.type.startsWith("image"))
        .map((validFile) =>
          validFile.type.startsWith("image")
            ? URL.createObjectURL(validFile)
            : "/assets/icons/file-generic.svg",
        ),
    );

    /** Reset file input */
    fileInput.type = "text";
    fileInput.type = "file";
  };

  const onUploadFile = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!files) {
      return;
    }

    /** Uploading files to the server */
    try {
      var formData = new FormData();
      files.forEach((file) => formData.append("media", file));

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
        toast.error("Sorry! something went wrong.", {
          id: "file-upload-error",
        });
        return;
      }

      onUploadSuccess && (await onUploadSuccess(data.url));
      // console.log("Files were uploaded successfylly:", data);
    } catch (error) {
      console.error(error);
      // alert("Sorry! something went wrong.");
      toast.error("Sorry! something went wrong.", {
        id: "file-upload-error",
      });
    }
  };

  return (
    <form
      className="w-full p-3 border border-gray-500 border-dashed"
      onSubmit={(e) => e.preventDefault()}
    >
      {files && files.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between items-center">
            <Button
              onClick={() => {
                setPreviewUrls([]);
                setFiles(null);
              }}
              size="icon"
              variant="outline"
            >
              <Icons.close className="size-4" />
            </Button>
            <p className="text-sm font-medium">{`${files?.length} files selected`}</p>
            <Button onClick={onUploadFile} size="icon" variant="outline">
              <Icons.upload className="size-4" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-start">
            {previewUrls.map((previewUrl, idx) => (
              <div key={idx} className="w-full p-1.5 md:w-1/2 space-y-1">
                <Image
                  alt="file uploader preview"
                  objectFit="cover"
                  src={previewUrl}
                  width={320}
                  height={218}
                  layout="responsive"
                />
                <p className="text-center text-xs text-muted-foreground">
                  {files[idx]?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-full py-8 transition-colors duration-150 cursor-pointer hover:text-gray-600">
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
            {label || "Select Files"}
          </strong>
          <input
            className="block w-0 h-0"
            name="file"
            type="file"
            onChange={onFilesUploadChange}
            multiple
          />
        </label>
      )}
    </form>
  );
};

export default MultipleFileUploadForm;
