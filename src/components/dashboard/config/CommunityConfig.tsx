import { useEffect, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { useConfig } from '@/action/config/useConfig';
import ImageUpload from './ImageUpload';
import ColorPicker from './ColorPicker';
import type { Community } from '@/types/typeConfig';
import { useImageUpload } from '@/action/config/useImageUpload';

interface CommunityConfigProps {
  config: Community;
}

export default function CommunityConfig({ config: initialConfig }: CommunityConfigProps) {
  const { updateConfig } = useConfig();
  const { uploadImage } = useImageUpload();
  const [localConfig, setLocalConfig] = useState<Community>(initialConfig);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(initialConfig);
  }, [initialConfig]);

  // ฟังก์ชันจัดการอัพโหลดรูปภาพ
  const handleImageChange = async (field: 'bg_image' | 'icon_image', file: File) => {
    try {
      setUpdatingField(field);
      const imageUrl = await uploadImage(file);

      // อัพเดท config ที่ server
      await updateConfig('community', {
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

  // ฟังก์ชันจัดการเปลี่ยนสี
  const handleColorChange = async (
    field: 'button_save_color' | 'button_link_color' | 'pagination_color',
    color: string
  ) => {
    if (updatingField === field) return;

    try {
      setUpdatingField(field);

      // อัพเดท config ที่ server
      await updateConfig('community', {
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
        Community Configuration
      </Typography>

      <Grid container spacing={3}>
        {/* Images Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Images
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ImageUpload
                label="Background Image"
                value={localConfig.bg_image}
                onChange={(file) => handleImageChange('bg_image', file)}
                disabled={updatingField === 'bg_image'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ImageUpload
                label="Icon Image"
                value={localConfig.icon_image}
                onChange={(file) => handleImageChange('icon_image', file)}
                disabled={updatingField === 'icon_image'}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Colors Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Colors
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <ColorPicker
                label="Save Button Color"
                color={localConfig.button_save_color}
                onChange={(color) => handleColorChange('button_save_color', color)}
                disabled={updatingField === 'button_save_color'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ColorPicker
                label="Link Button Color"
                color={localConfig.button_link_color}
                onChange={(color) => handleColorChange('button_link_color', color)}
                disabled={updatingField === 'button_link_color'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ColorPicker
                label="Pagination Color"
                color={localConfig.pagination_color}
                onChange={(color) => handleColorChange('pagination_color', color)}
                disabled={updatingField === 'pagination_color'}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
