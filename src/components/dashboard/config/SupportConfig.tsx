import { useEffect, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { useConfig } from '@/action/config/useConfig';
import ImageUpload from './ImageUpload';
import ColorPicker from './ColorPicker';
import type { Support } from '@/types/typeConfig';
import { useImageUpload } from '@/action/config/useImageUpload';

interface SupportConfigProps {
  config: Support;
}

export default function SupportConfig({ config: initialConfig }: SupportConfigProps) {
  const { updateConfig } = useConfig();
  const { uploadImage } = useImageUpload();
  const [localConfig, setLocalConfig] = useState<Support>(initialConfig);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(initialConfig);
  }, [initialConfig]);

  const handleImageChange = async (file: File) => {
    try {
      setUpdatingField('bg_image');
      const imageUrl = await uploadImage(file);

      // อัพเดท config ที่ server
      await updateConfig('support', {
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

  const handleColorChange = async (
    field: 'button_link_color' | 'pagination_color',
    color: string
  ) => {
    if (updatingField === field) return;

    try {
      setUpdatingField(field);

      // อัพเดท config ที่ server
      await updateConfig('support', {
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
        Support Configuration
      </Typography>

      <Grid container spacing={3}>
        {/* Background Image */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Background
          </Typography>
          <ImageUpload
            label="Background Image"
            value={localConfig.bg_image}
            onChange={handleImageChange}
            disabled={updatingField === 'bg_image'}
          />
        </Grid>

        {/* Colors Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Colors
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ColorPicker
                label="Link Button Color"
                color={localConfig.button_link_color}
                onChange={(color) => handleColorChange('button_link_color', color)}
                disabled={updatingField === 'button_link_color'}
              />
            </Grid>
            <Grid item xs={12}>
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
