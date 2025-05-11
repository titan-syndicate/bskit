import {
  UserCircleIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/solid'
import { DropdownMenu, DropdownItem, DropdownLabel, DropdownDivider } from './dropdown'

export function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
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
      <DropdownItem to="/login">
        <ArrowRightStartOnRectangleIcon className="size-5" />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}