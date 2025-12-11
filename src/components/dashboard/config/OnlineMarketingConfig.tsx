import { useEffect, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { useConfig } from '@/action/config/useConfig';
import ImageUpload from './ImageUpload';
import ColorPicker from './ColorPicker';
import type { OnlineMarketing } from '@/types/typeConfig';
import { useImageUpload } from '@/action/config/useImageUpload';

interface OnlineMarketingConfigProps {
  config: OnlineMarketing;
}

export default function OnlineMarketingConfig({ config: initialConfig }: OnlineMarketingConfigProps) {
  const { updateConfig } = useConfig();
  const { uploadImage } = useImageUpload();
  const [localConfig, setLocalConfig] = useState<OnlineMarketing>(initialConfig);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(initialConfig);
  }, [initialConfig]);

  const handleImageChange = async (field: 'bg_image' | 'icon_image', file: File) => {
    try {
      setUpdatingField(field);
      const imageUrl = await uploadImage(file);

      // อัพเดท config ที่ server
      await updateConfig('online_marketing', {
        [field]: imageUrl
      });

      // อัพเดท local state
      setLocalConfig(prev => ({
        ...prev,
        [field]: imageUrl
      }));

    } catch (error) {
      console.error('Failed to update image:', error);
    } finally {
      setUpdatingField(null);
    }
  };

  const handleColorChange = async (field: 'text_color' | 'pagination_color', color: string) => {
    if (updatingField === field) return;

    try {
      setUpdatingField(field);

      // อัพเดท config ที่ server
      await updateConfig('online_marketing', {
        [field]: color
      });

      // อัพเดท local state
      setLocalConfig(prev => ({
        ...prev,
        [field]: color
      }));

    } catch (error) {
      console.error('Failed to update color:', error);
    } finally {
      setUpdatingField(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Online Marketing Configuration
      </Typography>

      <Grid container spacing={3}>
        {/* Background Image */}
        <Grid item xs={12} md={6}>
          <ImageUpload
            label="Background Image"
            value={localConfig.bg_image}
            onChange={(file) => handleImageChange('bg_image', file)}
            disabled={updatingField === 'bg_image'}
          />
        </Grid>

        {/* Icon Image */}
        <Grid item xs={12} md={6}>
          <ImageUpload
            label="Icon Image"
            value={localConfig.icon_image}
            onChange={(file) => handleImageChange('icon_image', file)}
            disabled={updatingField === 'icon_image'}
          />
        </Grid>

        {/* Text Color */}
        <Grid item xs={12} md={6}>
          <ColorPicker
            label="Text Color"
            color={localConfig.text_color}
            onChange={(color) => handleColorChange('text_color', color)}
            disabled={updatingField === 'text_color'}
          />
        </Grid>

        {/* Pagination Color */}
        <Grid item xs={12} md={6}>
          <ColorPicker
            label="Pagination Color"
            color={localConfig.pagination_color}
            onChange={(color) => handleColorChange('pagination_color', color)}
            disabled={updatingField === 'pagination_color'}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
