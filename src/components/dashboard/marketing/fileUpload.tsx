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
  resetFiles: boolean;
  defaultImage?: string; // เพิ่ม prop สำหรับ default image
}

const FileUpload = ({ id, label, onFileUpload, resetFiles, defaultImage }: uploadProps) => {
  // States
  const [files, setFiles] = useState<File[]>([])
  const [preview, setPreview] = useState<string>(defaultImage || '') // เพิ่ม state สำหรับ preview

  // Hooks
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"]
    },
    onDrop: (acceptedFiles: File[]) => {
      setFiles(acceptedFiles);
      setPreview(''); // เคลียร์ preview เมื่อมีการอัพโหลดไฟล์ใหม่
      onFileUpload(id, acceptedFiles[0]);
    }
  })

  useEffect(() => {
    // อัพเดท preview เมื่อ defaultImage เปลี่ยน
    if (defaultImage) {
      setPreview(defaultImage);
    }
  }, [defaultImage]);

  useEffect(() => {
    if (resetFiles) {
      handleResetFiles();
    }
  }, [resetFiles]);

  const handleResetFiles = () => {
    setFiles([]);
    setPreview(''); // เคลียร์ preview ด้วย
  };

  return (
    <Box {...getRootProps({ className: "dropzone border-2 border-dashed rounded-md p-2 h-auto max-h-full mb-4" })} {...((files.length || preview) && { sx: { height: 100 } })}>
      <input {...getInputProps()} />
      {files.length ? (
        files.map((file: FileProp) => (
          <img key={file.name} alt={file.name} className="single-file-image p-0 max-w-full max-h-[100%] flex m-auto" src={URL.createObjectURL(file as any)} />
        ))
      ) : preview ? (
        <img alt="Preview" className="single-file-image p-0 max-w-full max-h-[100%] flex m-auto" src={preview} />
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
  )
}

export default FileUpload
