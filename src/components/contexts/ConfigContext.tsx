// contexts/ConfigContext.tsx
'use client'
import { createContext, useContext } from 'react'

import type { Config } from '@/types/typeConfig'

type ConfigContextType = {
  config: Config | null;
  menuItems: Array<{
    title: string;
    img: string;
    url: string;
  }>;
}

export const ConfigContext = createContext<ConfigContextType | null>(null)

export function useSiteConfig() {
  const context = useContext(ConfigContext)

  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }


  return context
}
