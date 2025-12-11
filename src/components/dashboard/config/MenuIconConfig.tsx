import { useEffect, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { useConfig } from '@/action/config/useConfig';
import ImageUpload from './ImageUpload';
import type { MenuIcon } from '@/types/typeConfig';
import { useImageUpload } from '@/action/config/useImageUpload';

interface MenuIconConfigProps {
  config: MenuIcon;
}

export default function MenuIconConfig({ config: initialConfig }: MenuIconConfigProps) {
  const { updateConfig } = useConfig();
  const { uploadImage } = useImageUpload();
  const [localConfig, setLocalConfig] = useState<MenuIcon>(initialConfig);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(initialConfig);
  }, [initialConfig]);

  const handleImageChange = async (section: keyof MenuIcon, file: File) => {
    try {
      setUpdatingField(section);
      const imageUrl = await uploadImage(file);

      // อัพเดท config ที่ server
      await updateConfig('menu_icon', {
        [section]: {
          icon: imageUrl
        }
      });

      // อัพเดท local state
      setLocalConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          icon: imageUrl
        }
      }));

    } catch (error) {
      console.error('Failed to update icon:', error);
    } finally {
      setUpdatingField(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Menu Icons Configuration
      </Typography>

      <Grid container spacing={3}>
        {Object.entries(localConfig).map(([key, value]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            <ImageUpload
              label={key.replace(/_/g, ' ').toUpperCase()}
              value={value.icon}
              onChange={(file) => handleImageChange(key as keyof MenuIcon, file)}
              disabled={updatingField === key}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
