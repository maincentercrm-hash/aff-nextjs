import React, { useState } from 'react';

import { Box, IconButton, Popover, TextField, Button } from '@mui/material';
import ColorLensIcon from '@mui/icons-material/ColorLens';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function ColorPicker({ color, onChange, label, disabled }: ColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tempColor, setTempColor] = useState(color);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setTempColor(color);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setTempColor(color); // Reset to original color on close
  };

  const handleChange = (newColor: string) => {
    setTempColor(newColor);
  };

  const handleSave = () => {
    onChange(tempColor);
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1}>
        {label && <span>{label}</span>}
        <Box
          sx={{
            width: 36,
            height: 36,
            backgroundColor: color,
            borderRadius: 1,
            border: '2px solid #ddd',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.7 : 1,
            '&:hover': {
              opacity: disabled ? 0.7 : 0.8
            }
          }}
          onClick={disabled ? undefined : handleClick}
        />
        <TextField
          size="small"
          value={color}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          sx={{ width: 120 }}
        />
        <IconButton
          onClick={handleClick}
          size="small"
          disabled={disabled}
        >
          <ColorLensIcon />
        </IconButton>
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box p={2}>
          <Box mb={2}>
            <input
              type="color"
              value={tempColor}
              onChange={(e) => handleChange(e.target.value)}
              style={{
                width: '200px',
                height: '100px',
                padding: 0,
                border: 'none'
              }}
            />
          </Box>
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              size="small"
              onClick={handleClose}
            >
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              disabled={tempColor === color}
            >
              บันทึก
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
}
