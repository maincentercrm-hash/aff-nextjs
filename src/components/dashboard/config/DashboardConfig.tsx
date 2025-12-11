import { useEffect, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { useConfig } from '@/action/config/useConfig';
import ImageUpload from './ImageUpload';
import ColorPicker from './ColorPicker';
import type { Dashboard } from '@/types/typeConfig';
import { useImageUpload } from '@/action/config/useImageUpload';

interface DashboardConfigProps {
  config: Dashboard;
}

export default function DashboardConfig({ config: initialConfig }: DashboardConfigProps) {
  const { updateConfig } = useConfig();
  const { uploadImage } = useImageUpload();
  const [localConfig, setLocalConfig] = useState<Dashboard>(initialConfig);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(initialConfig);
  }, [initialConfig]);

  // ฟังก์ชันจัดการอัพโหลดรูปภาพ
  const handleImageChange = async (section: 'section_cover', file: File) => {
    try {
      setUpdatingField('image');
      const imageUrl = await uploadImage(file);

      await updateConfig('dashboard', {
        [section]: {
          ...localConfig[section],
          bg_image: imageUrl
        }
      });

      setLocalConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          bg_image: imageUrl
        }
      }));
    } catch (error) {
      console.error('Failed to update image:', error);
    } finally {
      setUpdatingField(null);
    }
  };

  // ฟังก์ชันจัดการเปลี่ยนสี
  const handleColorChange = async (section: keyof Dashboard, field: string, color: string) => {
    const updateId = `${section}.${field}`;

    if (updatingField === updateId) return;

    try {
      setUpdatingField(updateId);

      const newConfig = {
        [section]: {
          ...localConfig[section],
          [field]: color
        }
      };

      const success = await updateConfig('dashboard', newConfig);

      if (success) {
        setLocalConfig(prev => ({
          ...prev,
          [section]: {
            ...prev[section],
            [field]: color
          }
        }));
      }
    } catch (error) {
      console.error('Failed to update color:', error);
    } finally {
      setUpdatingField(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Dashboard Configuration
      </Typography>

      <Grid container spacing={3}>
        {/* Section Cover */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Section Cover
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ImageUpload
                label="Background Image"
                value={localConfig.section_cover.bg_image}
                onChange={(file) => handleImageChange('section_cover', file)}
                disabled={updatingField === 'image'}
              />

            </Grid>
            <Grid item xs={12} md={6}>
              <ColorPicker
                label="Text Color"
                color={localConfig.section_cover.text_color}
                onChange={(color) => handleColorChange('section_cover', 'text_color', color)}
                disabled={updatingField === 'section_cover.text_color'}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Section URL */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Section URL
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <ColorPicker
                label="Background Color"
                color={localConfig.section_url.bg}
                onChange={(color) => handleColorChange('section_url', 'bg', color)}
                disabled={updatingField === 'section_url.bg'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ColorPicker
                label="Button Color"
                color={localConfig.section_url.button_color}
                onChange={(color) => handleColorChange('section_url', 'button_color', color)}
                disabled={updatingField === 'section_url.button_color'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ColorPicker
                label="Button Text Color"
                color={localConfig.section_url.button_text_color}
                onChange={(color) => handleColorChange('section_url', 'button_text_color', color)}
                disabled={updatingField === 'section_url.button_text_color'}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}
