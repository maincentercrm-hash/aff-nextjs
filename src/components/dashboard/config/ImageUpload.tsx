import { useCallback } from 'react';

import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useImageUpload } from '@/action/config/useImageUpload';

interface ImageUploadProps {
  value?: string;
  onChange: (file: File) => void;
  label?: string;
  disabled?: boolean;
}

export default function ImageUpload({ value, onChange, label, disabled }: ImageUploadProps) {
  const { uploading, error } = useImageUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    if (file.size > 5 * 1024 * 1024) {
      console.error('File size exceeds 5MB limit');

      return;
    }

    try {
      onChange(file);
    } catch (error) {
      console.error('Error handling file:', error);
    }
  }, [onChange, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false,
    disabled,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <Box>
      {label && (
        <Typography variant="subtitle1" gutterBottom>
          {label}
        </Typography>
      )}

      {value ? (

        // Preview mode with click to upload
        <Paper
          {...getRootProps()}
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: '150px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            '&:hover': {
              '& .overlay': {
                opacity: 1
              }
            }
          }}
        >
          <input {...getInputProps()} />
          <Box
            component="img"
            src={value}
            alt="Preview"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '150px',
              objectFit: 'contain',
              borderRadius: 1,
            }}
          />
          {/* Overlay for upload hint */}
          <Box
            className="overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
              borderRadius: 1,
              color: 'white'
            }}
          >
            {uploading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 20, mb: 0.5 }} />
                <Typography variant="caption">คลิกเพื่อเปลี่ยนรูปภาพ</Typography>
              </>
            )}
          </Box>
        </Paper>
      ) : (

        // Upload mode when no image
        <Paper
          {...getRootProps()}
          sx={{
            p: 2,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : disabled ? '#ccc' : '#999',
            borderRadius: 2,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
            width: '100%',
            maxWidth: '150px',
            backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: disabled ? '#ccc' : 'primary.main',
              backgroundColor: disabled ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          <input {...getInputProps()} />
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
          >
            {uploading ? (
              <CircularProgress size={24} />
            ) : (
              <CloudUploadIcon fontSize="medium" color={disabled ? "disabled" : "action"} />
            )}
            <Typography
              variant="caption"
              color={disabled ? "text.disabled" : "text.secondary"}
              textAlign="center"
            >
              คลิกเพื่ออัพโหลด
            </Typography>
          </Box>
        </Paper>
      )}

      {error && (
        <Typography
          color="error"
          variant="caption"
          sx={{
            mt: 1,
            textAlign: 'center',
            width: '100%'
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}
