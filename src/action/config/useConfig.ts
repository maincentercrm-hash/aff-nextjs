import { useState, useCallback, useEffect } from 'react';

import {
  CONFIG_PATHS
} from '@/types/typeConfig';
import type {
  Config,
  ConfigPath,
  ConfigSection,
  ConfigResponse,
  UpdateConfigResponse,
  ConfigError
} from '@/types/typeConfig';

export const useConfig = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ConfigError | null>(null);
  const [config, setConfig] = useState<Config | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchConfig = useCallback(async (): Promise<Config | null> => {
    try {
      setLoading(true);
      clearError();

      const response = await fetch('/api/configs');
      const result: ConfigResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || result.error || 'Failed to fetch config');
      }

      // ตรวจสอบว่า config มีครบทุก section ไหม
      const isConfigComplete = CONFIG_PATHS.every(
        (path) => result.data && result.data[path] !== undefined
      );

      if (!isConfigComplete) {
        // ถ้า config ไม่ครบ ให้เรียก init
        const initResponse = await fetch('/api/configs/init');
        const initResult = await initResponse.json();

        if (!initResult.success) {
          throw new Error('Failed to initialize config');
        }

        // เรียก fetch อีกครั้งเพื่อดึงข้อมูลล่าสุด
        const newResponse = await fetch('/api/configs');
        const newResult: ConfigResponse = await newResponse.json();

        if (!newResult.success || !newResult.data) {
          throw new Error('Failed to fetch config after initialization');
        }

        setConfig(newResult.data);

        return newResult.data;
      }

      setConfig(result.data);

      return result.data;

    } catch (err) {
      setError({
        path: 'menu_icon',
        message: err instanceof Error ? err.message : 'Failed to fetch config'
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const updateConfig = useCallback(async <T extends ConfigPath>(
    path: T,
    data: Partial<ConfigSection<T>>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      // Fetch latest config first
      const currentConfig = await fetchConfig();

      if (!currentConfig) {
        throw new Error('No configuration loaded');
      }

      // Prepare update data
      // สำหรับ slider ใช้ data โดยตรง (replace ทั้งหมด) เพราะต้องลบ keys ที่ไม่ใช้
      // สำหรับ section อื่นๆ ยังคง merge กับ currentConfig
      const updateData = {
        [path]: path === 'slider' ? data : {
          ...currentConfig[path],
          ...data
        }
      };

      const response = await fetch('/api/configs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: updateData
        })
      });

      const result: UpdateConfigResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to update config');
      }

      // Update local state
      setConfig((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          [path]: {
            ...prev[path],
            ...data
          }
        };
      });

      return true;
    } catch (err) {
      console.error('Update error:', err);
      setError({
        path,
        message: err instanceof Error ? err.message : 'Failed to update config'
      });

      return false;
    } finally {
      setLoading(false);
    }
  }, [clearError, fetchConfig]);

  // Load config when component mounts
  useEffect(() => {
    if (!config) {
      fetchConfig();
    }
  }, [config, fetchConfig]);

  return {
    config,
    loading,
    error,
    clearError,
    fetchConfig,
    updateConfig
  };
};

export default useConfig;
