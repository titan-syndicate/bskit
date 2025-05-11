import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef } from 'react'
import { TouchTarget } from './button'
import { Link } from './link'
import { Link as RouterLink } from 'react-router-dom'

type AvatarProps = {
  src?: string | null
  square?: boolean
  initials?: string
  alt?: string
  className?: string
}

export function Avatar({
  src = null,
  square = false,
  initials,
  alt = '',
  className,
  ...props
}: AvatarProps & React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      data-slot="avatar"
      {...props}
      className={clsx(
        className,
        // Basic layout
        'inline-grid shrink-0 align-middle [--avatar-radius:20%] *:col-start-1 *:row-start-1',
        'outline -outline-offset-1 outline-black/10 dark:outline-white/10',
        // Border radius
        square ? 'rounded-[--avatar-radius] *:rounded-[--avatar-radius]' : 'rounded-full *:rounded-full'
      )}
    >
      {initials && (
        <svg
          className="size-full fill-current p-[5%] text-[24px] font-medium uppercase select-none"
          viewBox="0 0 100 100"
          aria-hidden={alt ? undefined : 'true'}
        >
          {alt && <title>{alt}</title>}
          <text x="50%" y="50%" alignmentBaseline="middle" dominantBaseline="middle" textAnchor="middle" dy=".125em">
            {initials}
          </text>
        </svg>
      )}
      {src && <img className={clsx('w-full h-full object-cover', className)} src={src} alt={alt} />}
    </span>
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
