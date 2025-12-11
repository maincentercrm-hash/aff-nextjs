// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import ClientProviders from '@/components/clientProviders'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'CRM',
  description:
    'DEVELOP By WP PLUZ'
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (

    <html id='__next' lang='en' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <ClientProviders>
          <Providers direction={direction}>
            {children}


          </Providers>
        </ClientProviders>
      </body>
    </html>

  )
}

export default RootLayout
