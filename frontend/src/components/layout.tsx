import { Helmet } from 'react-helmet-async'
import { Outlet } from 'react-router-dom'
import { DefaultSidebar } from './sidebar'
import { Navbar, NavbarSection, NavbarSpacer } from './navbar'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

interface LayoutProps {
  title?: string
  description?: string
}

export function Layout({ title = 'BSKit', description = 'Event management platform' }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-900">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      <DefaultSidebar />
      <div className="flex flex-1 flex-col">
        <Navbar>
          <button
            type="button"
            className="lg:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-zinc-700 dark:text-zinc-300"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <NavbarSpacer />
          <NavbarSection>
            <div className="flex items-center gap-4">
              {/* Add user menu here if needed */}
            </div>
          </NavbarSection>
        </Navbar>
        <main className="flex-1 overflow-y-auto bg-white px-4 py-8 dark:bg-zinc-900 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-zinc-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setMobileMenuOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <DefaultSidebar />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}