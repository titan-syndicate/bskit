import {
  UserCircleIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowLeftStartOnRectangleIcon,
} from '@heroicons/react/24/solid'
import { DropdownMenu, DropdownItem, DropdownLabel, DropdownDivider } from './dropdown'
import { useAuth } from '../contexts/auth-context'
import { useNavigate } from 'react-router-dom'

export function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate('/login')
  }

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return (
      <DropdownMenu className="min-w-64" anchor={anchor}>
        <DropdownItem onClick={handleSignIn}>
          <ArrowLeftStartOnRectangleIcon className="size-5" />
          <DropdownLabel>Sign in</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem onClick={() => navigate('/account')}>
        <UserCircleIcon className="size-5" />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={() => navigate('/privacy')}>
        <ShieldCheckIcon className="size-5" />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>
      <DropdownItem onClick={() => navigate('/feedback')}>
        <LightBulbIcon className="size-5" />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={handleSignOut}>
        <ArrowRightStartOnRectangleIcon className="size-5" />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}