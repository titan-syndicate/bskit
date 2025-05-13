import {
  UserCircleIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/24/solid'
import { DropdownMenu, DropdownItem, DropdownLabel, DropdownDivider } from './dropdown'
import { useAuth } from '../contexts/auth-context'

export function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  const { isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return (
      <DropdownMenu className="min-w-64" anchor={anchor}>
        <DropdownItem to="/login" onClick={login}>
          <ArrowLeftStartOnRectangleIcon className="size-5" />
          <DropdownLabel>Sign in</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem to="/account">
        <UserCircleIcon className="size-5" />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem to="/privacy">
        <ShieldCheckIcon className="size-5" />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>
      <DropdownItem to="/feedback">
        <LightBulbIcon className="size-5" />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem to="/login" onClick={logout}>
        <ArrowRightStartOnRectangleIcon className="size-5" />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}