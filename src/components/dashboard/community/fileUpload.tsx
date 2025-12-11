// React Imports
import { useEffect, useState } from "react"

// MUI Imports
import Box from "@mui/material/Box"
import Avatar from "@mui/material/Avatar"
import Typography from "@mui/material/Typography"

// Third-party Imports
import { useDropzone } from "react-dropzone"

type FileProp = {
  name: string
  type: string
  size: number
}

interface uploadProps {
  id: string;
  label: string;
  onFileUpload: (id: string, file: File) => void;
  resetFiles: boolean; // Add resetFiles function
}

const FileUpload = ({ id, label, onFileUpload, resetFiles }: uploadProps) => {

  // States
  const [files, setFiles] = useState<File[]>([])

  // Hooks
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"]
    },
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      onFileUpload(id, acceptedFiles[0]); // Send the first file to the parent component
    }
  })




  const img = files.map((file: FileProp) => (
    <img key={file.name} alt={file.name} className="single-file-image p-0 max-w-full max-h-[100%] flex m-auto" src={URL.createObjectURL(file as any)} />
  ))

  const handleResetFiles = () => {
    setFiles([]); // Reset files state to an empty array
  };

  useEffect(() => {

    if (resetFiles) {
      handleResetFiles();
    }

  }, [resetFiles]);

  return (
    <>

      <Box {...getRootProps({ className: "dropzone border-2 border-dashed rounded-md p-2 h-auto max-h-full mb-4" })} {...(files.length && { sx: { height: 100 } })}>
        <input {...getInputProps()} />
        {files.length ? (
          img
        ) : (
          <div className="flex items-center flex-col">
            <Avatar variant="rounded" className="bs-12 is-12 mbe-2">
              <i className="tabler-upload" />
            </Avatar>

            <Typography>
              <a href="/" onClick={e => e.preventDefault()} className="text-textPrimary no-underline">
                อัพโหลด{label}
              </a>
            </Typography>

          </div>
        )}

      </Box>

    </>
  )
}

export default FileUpload
