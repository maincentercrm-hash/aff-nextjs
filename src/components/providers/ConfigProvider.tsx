// components/providers/ConfigProvider.tsx
'use client'
import { type ReactNode } from 'react'


import type { Config } from '@/types/typeConfig'
import { ConfigContext } from '../contexts/ConfigContext';

interface ConfigProviderProps {
  children: ReactNode;
  config: Config | null;
  menuItems: Array<{
    title: string;
    img: string;
    url: string;
  }>;
}

export function ConfigProvider({ children, config, menuItems }: ConfigProviderProps) {
  return (
    <ConfigContext.Provider value={{ config, menuItems }}>
      {children}
    </ConfigContext.Provider>
  )
}
