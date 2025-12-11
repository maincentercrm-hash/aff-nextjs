'use client'

import type { ReactNode } from 'react'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

type ClientProviders = {
  children: ReactNode
}

const ClientProviders = ({ children }: ClientProviders) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default ClientProviders

