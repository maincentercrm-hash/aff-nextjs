// src/components/dashboard/config/SliderConfig.tsx
import { useEffect, useState } from 'react';

import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { useConfig } from '@/action/config/useConfig';
import ImageUpload from './ImageUpload';
import { useImageUpload } from '@/action/config/useImageUpload';
import type { SliderItem, SliderConfig } from '@/types/typeConfig';

interface SliderConfigProps {
  config: SliderConfig;
}

// Convert SliderConfig (object) to SliderItem[] (array)
const objectToArray = (obj: SliderConfig): SliderItem[] => {
  return Object.entries(obj).sort(([a], [b]) => Number(a) - Number(b)).map(([, item]) => ({
    image: item.image || '',
    url: item.url || '',
    id: item.id || `slider_${Date.now()}`
  }));
};

// Convert SliderItem[] (array) to SliderConfig (object)
const arrayToObject = (items: SliderItem[]): SliderConfig => {
  return items.reduce<SliderConfig>((acc, item, index) => {
    acc[index.toString()] = {
      image: item.image,
      url: item.url,
      id: item.id || `slider_${index}`
    };

    return acc;
  }, {});
};

export default function SliderConfig({ config }: SliderConfigProps) {
  const { updateConfig } = useConfig();
  const { uploadImage } = useImageUpload();
  const initialSliders = objectToArray(config);

  const [localConfig, setLocalConfig] = useState<SliderItem[]>(initialSliders);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ index: number; url: string } | null>(null);

  useEffect(() => {
    setLocalConfig(objectToArray(config));
  }, [config]);

  const handleAddSlider = async () => {
    try {
      const newSlider: SliderItem = {
        image: '',
        url: '',
        id: `slider_${Date.now()}`
      };

      const newSliders = [...localConfig, newSlider];

      await updateConfig('slider', arrayToObject(newSliders));
      setLocalConfig(newSliders);
    } catch (error) {
      console.error('Failed to add slider:', error);
    }
  };

  const handleRemoveSlider = async (index: number) => {
    try {
      const newSliders = localConfig.filter((_, i) => i !== index);

      await updateConfig('slider', arrayToObject(newSliders));
      setLocalConfig(newSliders);
    } catch (error) {
      console.error('Failed to remove slider:', error);
    }
  };

  const handleImageChange = async (index: number, file: File) => {
    const sliderId = localConfig[index].id || `slider_${index}`;
    const updateId = `${sliderId}_image`;

    try {
      setUpdatingField(updateId);
      const imageUrl = await uploadImage(file);

      const newSliders = localConfig.map((slider, i) =>
        i === index ? { ...slider, image: imageUrl } : slider
      );

      await updateConfig('slider', arrayToObject(newSliders));
      setLocalConfig(newSliders);
    } catch (error) {
      console.error('Failed to update slider image:', error);
    } finally {
      setUpdatingField(null);
    }
  };

  const handleUrlChange = async (index: number, url: string) => {
    if (!url.trim()) {
      setEditingItem(null);

      return;
    }

    try {
      const newSliders = localConfig.map((slider, i) =>
        i === index ? { ...slider, url } : slider
      );

      await updateConfig('slider', arrayToObject(newSliders));
      setLocalConfig(newSliders);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to update slider URL:', error);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Slider Configuration
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddSlider}
          size="small"
        >
          ADD SLIDER
        </Button>
      </Box>

      <Stack spacing={2}>
        {localConfig.length === 0 ? (
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              border: '1px dashed rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography color="textSecondary">
              No sliders yet. Click ADD SLIDER to create one.
            </Typography>
          </Paper>
        ) : (
          localConfig.map((slider, index) => (
            <Paper
              key={slider.id || index}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Box sx={{ width: 200 }}>
                <ImageUpload
                  value={slider.image}
                  onChange={(file) => handleImageChange(index, file)}
                  disabled={updatingField === `${slider.id || `slider_${index}`}_image`}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                {editingItem?.index === index ? (
                  <TextField
                    fullWidth
                    size="small"
                    label="URL"
                    value={editingItem.url}
                    onChange={(e) => setEditingItem({ index, url: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleUrlChange(index, editingItem.url);
                      }
                    }}
                    onBlur={() => handleUrlChange(index, editingItem.url)}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    onClick={() => setEditingItem({ index, url: slider.url })}
                    sx={{
                      cursor: 'pointer',
                      p: 1,
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    {slider.url || 'Click to add URL'}
                  </Typography>
                )}
              </Box>

              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveSlider(index)}
                disabled={updatingField?.startsWith(slider.id || `slider_${index}`)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))
        )}
      </Stack>
    </Paper>
  );
}
