'use client'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { LayoutGroup, motion } from 'framer-motion'
import React, { forwardRef, useId } from 'react'
import { TouchTarget } from './button'
import { Link } from './link'
import { useLocation } from 'react-router-dom'
import {
  HomeIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  CommandLineIcon,
  KeyIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/solid'
import { Avatar } from './avatar'
import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from './dropdown'
import { AccountDropdownMenu } from './account-dropdown-menu'
import { useAuth } from '../contexts/auth-context'

export function Sidebar({ className, ...props }: React.ComponentPropsWithoutRef<'nav'>) {
  // return <nav {...props} className={clsx(className, 'flex h-full min-h-0 flex-col bg-white dark:bg-zinc-900')} />
  return <nav {...props} className={clsx(className, 'flex h-full min-h-0 flex-col ')} />
}

export function SidebarHeader({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-col border-b border-zinc-950/5 p-4 dark:border-white/5 [&>[data-slot=section]+[data-slot=section]]:mt-2.5'
      )}
    />
  )
}

export function SidebarBody({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-1 flex-col overflow-y-auto p-4 [&>[data-slot=section]+[data-slot=section]]:mt-8'
      )}
    />
  )
}

export function SidebarFooter({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'flex flex-col border-t border-zinc-950/5 p-4 dark:border-white/5 [&>[data-slot=section]+[data-slot=section]]:mt-2.5'
      )}
    />
  )
}

export function SidebarSection({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  let id = useId()

  return (
    <LayoutGroup id={id}>
      <div {...props} data-slot="section" className={clsx(className, 'flex flex-col gap-0.5')} />
    </LayoutGroup>
  )
}

export function SidebarDivider({ className, ...props }: React.ComponentPropsWithoutRef<'hr'>) {
  return <hr {...props} className={clsx(className, 'my-4 border-t border-zinc-950/5 lg:-mx-4 dark:border-white/5')} />
}

export function SidebarSpacer({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  return <div aria-hidden="true" {...props} className={clsx(className, 'mt-8 flex-1')} />
}

export function SidebarHeading({ className, ...props }: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3 {...props} className={clsx(className, 'mb-1 px-2 text-xs/6 font-medium text-zinc-500 dark:text-zinc-400')} />
  )
}

export const SidebarItem = forwardRef(function SidebarItem(
  {
    current,
    className,
    children,
    ...props
  }: { current?: boolean; className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, 'as' | 'className'>
    | Omit<Headless.ButtonProps<typeof Link>, 'as' | 'className'>
  ),
  ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>
) {
  let classes = clsx(
    // Base
    'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-zinc-950 sm:py-2 sm:text-sm/5 dark:text-white',
    // Grid layout
    'grid grid-cols-[auto_1fr_auto] items-center',
    // Leading icon/icon-only
    '*:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:fill-zinc-500 sm:*:data-[slot=icon]:size-5',
    // Trailing icon (down chevron or similar)
    '*:last:data-[slot=icon]:size-3 sm:*:last:data-[slot=icon]:size-2',
    // Avatar
    '*:data-[slot=avatar]:-m-0.5 *:data-[slot=avatar]:size-7 sm:*:data-[slot=avatar]:size-6',
    // Hover
    'data-hover:bg-zinc-950/5 data-hover:*:data-[slot=icon]:fill-zinc-950',
    // Active
    'data-active:bg-zinc-950/5 data-active:*:data-[slot=icon]:fill-zinc-950',
    // Current
    'data-current:*:data-[slot=icon]:fill-zinc-950',
    // Dark mode
    'dark:*:data-[slot=icon]:fill-zinc-400',
    'dark:data-hover:bg-white/5 dark:data-hover:*:data-[slot=icon]:fill-white',
    'dark:data-active:bg-white/5 dark:data-active:*:data-[slot=icon]:fill-white',
    'dark:data-current:*:data-[slot=icon]:fill-white'
  )

  return (
    <span className={clsx(className, 'relative')}>
      {current && (
        <motion.span
          layoutId="current-indicator"
          className="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-zinc-950 dark:bg-white"
        />
      )}
      {'to' in props ? (
        <Headless.CloseButton
          as={Link}
          {...props}
          className={classes}
          data-current={current ? 'true' : undefined}
          ref={ref}
        >
          <TouchTarget>{children}</TouchTarget>
        </Headless.CloseButton>
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

export function SidebarLabel({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className={clsx(className, 'truncate')} />
}

export function DefaultSidebar() {
  const location = useLocation()
  const { isAuthenticated, userInfo } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader>
        <Dropdown>
          <DropdownButton as={SidebarItem}>
            <Avatar src="/logos/appicon.png" className="size-6" data-slot="avatar" />
            <SidebarLabel>bskit</SidebarLabel>
            <ChevronDownIcon className="size-4" data-slot="icon" />
          </DropdownButton>
          <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
            <DropdownItem to="/settings">
              <Cog6ToothIcon className="size-5" />
              <DropdownLabel>Settings</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem to="#">
              <Avatar src="/logos/appicon.png" className="size-6" data-slot="avatar" />
              <DropdownLabel>bskit</DropdownLabel>
            </DropdownItem>
            <DropdownItem to="#">
              <Avatar initials="BE" className="size-6 bg-purple-500 text-white" data-slot="avatar" />
              <DropdownLabel>Big Events</DropdownLabel>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem to="#">
              <PlusIcon className="size-5" />
              <DropdownLabel>New team&hellip;</DropdownLabel>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem to="/repos" current={location.pathname === '/'}>
            <HomeIcon className="size-5" />
            <SidebarLabel>Home</SidebarLabel>
          </SidebarItem>
          <SidebarItem to="/repos" current={location.pathname.startsWith('/repos')}>
            <CodeBracketIcon className="size-5" />
            <SidebarLabel>Repositories</SidebarLabel>
          </SidebarItem>
          <SidebarItem to="/build" current={location.pathname.startsWith('/terminal')}>
            <CommandLineIcon className="size-5" />
            <SidebarLabel>Build</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
        <SidebarItem to="/settings" current={location.pathname === '/settings'}>
          <Cog6ToothIcon className="size-5" />
          <SidebarLabel>Settings</SidebarLabel>
        </SidebarItem>
        <SidebarSpacer />
        <SidebarSection>
          <SidebarItem to="/login" current={location.pathname === '/login'}>
            <KeyIcon className="size-5" />
            <SidebarLabel>Sign In</SidebarLabel>
          </SidebarItem>
          <SidebarItem to="#">
            <QuestionMarkCircleIcon className="size-5" />
            <SidebarLabel>Support</SidebarLabel>
          </SidebarItem>
          <SidebarItem to="#">
            <SparklesIcon className="size-5" />
            <SidebarLabel>Changelog</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter className="max-lg:hidden">
        <Dropdown>
          <DropdownButton as={SidebarItem}>
            <span className="flex min-w-0 items-center gap-3">
              <Avatar
                src={isAuthenticated && userInfo ? userInfo.avatar_url : "/users/placeholder.svg"}
                className="size-10"
                square
                alt=""
              />
              <span className="min-w-0">
                <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                  {isAuthenticated && userInfo ? userInfo.name || userInfo.login : "Guest"}
                </span>
                <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                  {isAuthenticated && userInfo ? userInfo.email : "Sign in to continue"}
                </span>
              </span>
            </span>
            <ChevronUpIcon className="size-4" data-slot="icon" />
          </DropdownButton>
          <AccountDropdownMenu anchor="bottom end" />
        </Dropdown>
      </SidebarFooter>
    </Sidebar>
  )
}
