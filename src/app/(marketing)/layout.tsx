

import type { ChildrenType } from '@core/types'


const Layout = async ({ children }: ChildrenType) => {

  return (


    <div className='w-full max-w-[430px] min-h-screen overflow-y-auto mx-auto bg-white'>
      {children}
    </div>

  )
}

export default Layout
