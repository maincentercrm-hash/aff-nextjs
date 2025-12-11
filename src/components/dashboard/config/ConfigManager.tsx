import { useEffect, useState } from 'react';

import { Box, Tab, Tabs, Alert, CircularProgress } from '@mui/material';

import { useConfig } from '@/action/config/useConfig';


// Import components
import MenuIconConfig from './MenuIconConfig';
import DashboardConfig from './DashboardConfig';
import SliderConfig from './SliderConfig';
import OnlineMarketingConfig from './OnlineMarketingConfig';
import CommunityConfig from './CommunityConfig';
import MissionConfig from './MissionConfig';
import SettingConfig from './SettingConfig';
import SupportConfig from './SupportConfig';
import PointConfig from './PointConfig';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConfigManager() {
  const [tabIndex, setTabIndex] = useState(0);
  const { config, loading, error, fetchConfig } = useConfig();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        await fetchConfig();
      } catch (error) {
        console.error('Failed to load config:', error);
      }
    };

    loadConfig();
  }, [fetchConfig]); // เอา initConfig ออกจาก dependency

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error.message || 'An error occurred loading configuration'}
      </Alert>
    );
  }

  if (!config) {
    return <Alert severity="info">Loading configuration...</Alert>;
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Menu Icons" />
        <Tab label="Dashboard" />
        <Tab label="Slider" />
        <Tab label="Online Marketing" />
        <Tab label="Community" />
        <Tab label="Mission" />
        <Tab label="Setting" />
        <Tab label="Support" />
        <Tab label="Point" />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <MenuIconConfig config={config.menu_icon} />
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <DashboardConfig config={config.dashboard} />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <SliderConfig config={config.slider} />
      </TabPanel>
      <TabPanel value={tabIndex} index={3}>
        <OnlineMarketingConfig config={config.online_marketing} />
      </TabPanel>
      <TabPanel value={tabIndex} index={4}>
        <CommunityConfig config={config.community} />
      </TabPanel>
      <TabPanel value={tabIndex} index={5}>
        <MissionConfig config={config.mission} />
      </TabPanel>
      <TabPanel value={tabIndex} index={6}>
        <SettingConfig config={config.setting} />
      </TabPanel>
      <TabPanel value={tabIndex} index={7}>
        <SupportConfig config={config.support} />
      </TabPanel>
      <TabPanel value={tabIndex} index={8}>
        <PointConfig config={config.point} />
      </TabPanel>
    </Box>
  );
}
