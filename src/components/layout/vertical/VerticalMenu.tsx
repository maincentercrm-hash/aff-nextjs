'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()

  // Vars
  const { transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
          className: 'bs-full overflow-y-auto overflow-x-hidden',
          onScroll: container => scrollMenu(container, false)
        }
        : {
          options: { wheelPropagation: false, suppressScrollX: true },
          onScrollY: container => scrollMenu(container, true)
        })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/dashboard' icon={<i className='tabler-smart-home' />}>
          แดชบอร์ด
        </MenuItem>

        <MenuSection label='ข้อมูล Users'>
          <MenuItem href='/dashboard/client' icon={<i className='tabler-user-heart' />}>
            ผู้ใช้งานทั้งหมด
          </MenuItem>
        </MenuSection>

        <MenuSection label='ระบบ Affiliate'>
          <MenuItem href='/dashboard/marketing' icon={<i className='tabler-image-in-picture' />}>
            Online Marketing
          </MenuItem>

          <MenuItem href='/dashboard/community' icon={<i className='tabler-users-group' />}>
            Community
          </MenuItem>

          <MenuItem href='/dashboard/mission' icon={<i className='tabler-award' />}>
            Mission
          </MenuItem>

          <MenuItem href='/dashboard/report' icon={<i className='tabler-report' />}>
            Report
          </MenuItem>

          <MenuItem href='/dashboard/point' icon={<i className='tabler-coin' />}>
            Point
          </MenuItem>

          <MenuItem href='/dashboard/setting' icon={<i className='tabler-user-cog' />}>
            Setting
          </MenuItem>

          <MenuItem href='/dashboard/support' icon={<i className='tabler-progress-help' />}>
            Support
          </MenuItem>
        </MenuSection>

        <MenuSection label='Campaign'>
          <MenuItem href='/dashboard/campaign' icon={<i className='tabler-adjustments-share' />}>
            แคมเปญ
          </MenuItem>
        </MenuSection>

        <MenuSection label='Files Store'>
          <MenuItem href='/dashboard/medias' icon={<i className='tabler-file-database' />}>
            จัดการไฟล์
          </MenuItem>
        </MenuSection>

        <MenuSection label='ตั้งค่าระบบ'>
          <MenuItem href='/dashboard/systems' icon={<i className='tabler-settings' />}>
            ตั้งค่าพื้นฐานระบบ
          </MenuItem>
        </MenuSection>


      </Menu>


      {/* <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
      </Menu> */}
    </ScrollWrapper >
  )
}

export default VerticalMenu
