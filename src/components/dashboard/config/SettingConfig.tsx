import { useEffect, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { useConfig } from '@/action/config/useConfig';
import ImageUpload from './ImageUpload';
import type { Setting } from '@/types/typeConfig';
import { useImageUpload } from '@/action/config/useImageUpload';

interface SettingConfigProps {
  config: Setting;
}

export default function SettingConfig({ config: initialConfig }: SettingConfigProps) {
  const { updateConfig } = useConfig();
  const { uploadImage } = useImageUpload();
  const [localConfig, setLocalConfig] = useState<Setting>(initialConfig);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(initialConfig);
  }, [initialConfig]);

  const handleImageChange = async (file: File) => {
    try {
      setUpdatingField('bg_image');
      const imageUrl = await uploadImage(file);

      // อัพเดท config ที่ server
      await updateConfig('setting', {
        bg_image: imageUrl
      });

      // อัพเดท local state
      setLocalConfig(prev => ({
        ...prev,
        bg_image: imageUrl
      }));

    } catch (error) {
      console.error('Failed to update background image:', error);
    } finally {
      setUpdatingField(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Setting Configuration
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ImageUpload
            label="Background Image"
            value={localConfig.bg_image}
            onChange={handleImageChange}
            disabled={updatingField === 'bg_image'}
          />
        </Grid>

        {/* สามารถเพิ่มส่วนการตั้งค่าอื่นๆ ที่นี่ */}
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            Additional settings can be added here as needed.
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
