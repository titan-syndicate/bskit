'use client'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { LayoutGroup, motion } from 'framer-motion'
import React, { forwardRef, useId } from 'react'
import { TouchTarget } from './button'
import { Link } from './link'
import { Avatar } from './avatar'
import { Dropdown, DropdownButton } from './dropdown'
import { AccountDropdownMenu } from './account-dropdown-menu'

interface NavbarProps {
  children: React.ReactNode
}

interface NavbarSectionProps {
  children: React.ReactNode
}

export function Navbar({ children }: NavbarProps) {
  return <nav className="flex flex-1 items-center gap-4 py-2.5">{children}</nav>
}

export function NavbarSection({ children }: NavbarSectionProps) {
  let id = useId()
  return (
    <LayoutGroup id={id}>
      <div className="flex items-center gap-3">{children}</div>
    </LayoutGroup>
  )
}

export function NavbarDivider({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div aria-hidden="true" {...props} className={clsx(className, 'h-6 w-px bg-zinc-950/10 dark:bg-white/10')} />
}

export function NavbarSpacer({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div aria-hidden="true" {...props} className={clsx(className, '-ml-4 flex-1')} />
}

export const NavbarItem = forwardRef(function NavbarItem(
  {
    current,
    className,
    children,
    ...props
  }: { current?: boolean; className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, 'as' | 'className'>
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>
  ),
  ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>
) {
  let classes = clsx(
    // Base
    'relative flex min-w-0 items-center gap-3 rounded-lg p-2 text-left text-base/6 font-medium text-zinc-950 sm:text-sm/5',
    // Leading icon/icon-only
    '*:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:fill-zinc-500 sm:*:data-[slot=icon]:size-5',
    // Trailing icon (down chevron or similar)
    '*:not-nth-2:last:data-[slot=icon]:ml-auto *:not-nth-2:last:data-[slot=icon]:size-5 sm:*:not-nth-2:last:data-[slot=icon]:size-4',
    // Avatar
    '[&>span[data-slot=avatar]]:!w-6 [&>span[data-slot=avatar]]:!h-6',
    // Hover
    'data-hover:bg-zinc-950/5 data-hover:*:data-[slot=icon]:fill-zinc-950',
    // Active
    'data-active:bg-zinc-950/5 data-active:*:data-[slot=icon]:fill-zinc-950',
    // Dark mode
    'dark:text-white dark:*:data-[slot=icon]:fill-zinc-400',
    'dark:data-hover:bg-white/5 dark:data-hover:*:data-[slot=icon]:fill-white',
    'dark:data-active:bg-white/5 dark:data-active:*:data-[slot=icon]:fill-white'
  )

  return (
    <span className={clsx(className, 'relative')}>
      {current && (
        <motion.span
          layoutId="current-indicator"
          className="absolute inset-x-2 -bottom-2.5 h-0.5 rounded-full bg-zinc-950 dark:bg-white"
        />
      )}
      {'to' in props ? (
        <Link
          {...props}
          className={classes}
          data-current={current ? 'true' : undefined}
        >
          <TouchTarget>{children}</TouchTarget>
        </Link>
      ) : (
        <Headless.Button
          {...props}
          className={clsx('cursor-default', classes)}
          data-current={current ? 'true' : undefined}
          ref={ref}
        >
          <TouchTarget>{children}</TouchTarget>
        </Headless.Button>
      )}
    </span>
  )
})

export function NavbarLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'truncate')} />
}

export function UserNavbar({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {children}
      <Dropdown>
        <DropdownButton as={NavbarItem}>
          <Avatar src="/users/erica.jpg" square data-slot="avatar" />
        </DropdownButton>
        <AccountDropdownMenu anchor="bottom end" />
      </Dropdown>
    </div>
  )
}
