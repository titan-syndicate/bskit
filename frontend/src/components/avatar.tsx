import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'
import { TouchTarget } from './button'
import { Link } from './link'
import { Link as RouterLink } from 'react-router-dom'

type AvatarProps = {
  src?: string
  square?: boolean
  initials?: string
  alt?: string
  className?: string
}

export function Avatar({ className, src, ...props }: AvatarProps) {
  return (
    <img
      src={src || undefined}
      className={clsx(
        'size-8 rounded-full bg-zinc-100 object-cover dark:bg-zinc-800',
        className
      )}
      {...props}
    />
  )
}

type ButtonProps = Omit<Headless.ButtonProps, 'as' | 'className'>
type LinkProps = Omit<React.ComponentPropsWithoutRef<typeof RouterLink>, 'className'>

export const AvatarButton = forwardRef(function AvatarButton(
  {
    src,
    square = false,
    initials,
    alt,
    className,
    ...props
  }: AvatarProps & (ButtonProps | LinkProps),
  ref: React.ForwardedRef<HTMLElement>
) {
  let classes = clsx(
    className,
    square ? 'rounded-[20%]' : 'rounded-full',
    'relative inline-grid focus:not-data-focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500'
  )

  const avatar = <Avatar src={src} square={square} initials={initials} alt={alt} />

  if ('to' in props) {
    const { to, ...linkProps } = props as LinkProps
    return (
      <Link to={to} {...linkProps} className={classes}>
        <TouchTarget>{avatar}</TouchTarget>
      </Link>
    )
  }

  return (
    <Headless.Button {...(props as ButtonProps)} className={classes} ref={ref}>
      <TouchTarget>{avatar}</TouchTarget>
    </Headless.Button>
  )
})
