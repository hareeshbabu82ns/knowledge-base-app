import React, { useState } from "react";
import { Button, ButtonGroup } from "@mui/material";
import { UploadFileOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useFileUploadMutation } from "state/api";

const FileUploader = ({
  uploadingItem = "File Contents",
  prompt = "Choose a file...",
  accept = ".csv,.json",
  onFileUpload,
}) => {
  const [selectedFile, setselectedFile] = useState(undefined);
  const [fileUpload] = useFileUploadMutation();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setselectedFile(file);
  };

  const handleUpload = async () => {
    // prepare file for upload
    const data = new FormData();
    data.append("file", selectedFile);

    const toastId = toast.loading(`Uploading ${uploadingItem}...`, {
      toastId: `file-upl-action-${uploadingItem}`,
    });

    try {
      if (onFileUpload) {
        // send file to server
        const res = await fileUpload(data).unwrap();
        // console.log(res);

        // console.log(data.get("file"), selectedFile);
        const resUpload = await onFileUpload(res);
        // console.log(resUpload);
      }

      setselectedFile(undefined);
      toast.update(toastId, {
        render: `${uploadingItem} Uploaded`,
        type: "success",
        isLoading: false,
        autoClose: true,
      });
    } catch (e) {
      toast.update(toastId, {
        render: `${uploadingItem} Upload failed`,
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    }
  };

  return (
    <ButtonGroup variant="contained" aria-label="upload file">
      <Button component="label" disabled={!onFileUpload}>
        <input
          hidden
          accept={accept}
          name="file"
          type="file"
          onChange={handleFileChange}
        />
        {selectedFile?.name || prompt}
      </Button>
      <Button onClick={handleUpload} disabled={!selectedFile || !onFileUpload}>
        <UploadFileOutlined />
      </Button>
    </ButtonGroup>
  );
};

export default FileUploader;
