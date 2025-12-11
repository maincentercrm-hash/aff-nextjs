import { useEffect, useState } from 'react';

import { Grid, Paper, Typography } from '@mui/material';

import { useConfig } from '@/action/config/useConfig';
import ColorPicker from './ColorPicker';
import type { Mission } from '@/types/typeConfig';

interface MissionConfigProps {
  config: Mission;
}

type ColorFields = 'button_get_mission_color' |
  'button_has_mission_color' |
  'button_condition_mission_color' |
  'button_get_reward_color' |
  'pagination_color';

export default function MissionConfig({ config: initialConfig }: MissionConfigProps) {
  const { updateConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState<Mission>(initialConfig);
  const [updatingField, setUpdatingField] = useState<string | null>(null);

  useEffect(() => {
    setLocalConfig(initialConfig);
  }, [initialConfig]);

  const handleColorChange = async (field: ColorFields, color: string) => {
    if (updatingField === field) return;

    try {
      setUpdatingField(field);

      // อัพเดท config ที่ server
      await updateConfig('mission', {
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
        Mission Configuration
      </Typography>

      <Grid container spacing={3}>
        {/* Button Colors */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Button Colors
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={3}>
              <ColorPicker
                label="Get Mission Button"
                color={localConfig.button_get_mission_color}
                onChange={(color) => handleColorChange('button_get_mission_color', color)}
                disabled={updatingField === 'button_get_mission_color'}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ColorPicker
                label="Has Mission Button"
                color={localConfig.button_has_mission_color}
                onChange={(color) => handleColorChange('button_has_mission_color', color)}
                disabled={updatingField === 'button_has_mission_color'}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ColorPicker
                label="Condition Mission Button"
                color={localConfig.button_condition_mission_color}
                onChange={(color) => handleColorChange('button_condition_mission_color', color)}
                disabled={updatingField === 'button_condition_mission_color'}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ColorPicker
                label="Get Reward Button"
                color={localConfig.button_get_reward_color}
                onChange={(color) => handleColorChange('button_get_reward_color', color)}
                disabled={updatingField === 'button_get_reward_color'}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Pagination Color */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Pagination
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
