// app/(liff)/layout.tsx
import type { Metadata } from 'next'

import { getConfig } from '@/action/config/getConfig'
import VerifyProfile from '@/components/liffLogin/VerifyProfile'
import { ConfigProvider } from '@/components/providers/ConfigProvider'
import type { ChildrenType } from '@core/types'

export const metadata: Metadata = {
  title: 'Lottwin88 Affiliate',
  description: 'Lottwin88 Affiliate',
}

const Layout = async ({ children }: ChildrenType) => {
  const { config, menuItems } = await getConfig()



  return (
    <ConfigProvider config={config} menuItems={menuItems}>
      <VerifyProfile>
        <div className='w-full max-w-[430px] min-h-screen overflow-y-auto mx-auto bg-white'>
          {children}
        </div>
      </VerifyProfile>
    </ConfigProvider>
  )
}

export default Layout
