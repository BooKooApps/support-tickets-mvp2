'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Star,
  Trophy,
  Settings2,
  Menu,
  X,
  HelpCircle,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { useWindowSize } from '@react-hook/window-size';

const NAV_ITEMS = [
  {
    adminLabel: 'All Tickets',
    customerLabel: 'Your Tickets',
    icon: Ticket,
    href: '/experiences/${experienceId}/customer?tab=TICKETS',
    accessLevel: 'admin',
  },
  {
    adminLabel: 'Current Whop Reviews',
    customerLabel: 'Current Whop Reviews',
    icon: Star,
    href: '/experiences/${experienceId}/customer?tab=REVIEWS',
    accessLevel: 'customer',
  },
  {
    adminLabel: 'General Whop Leadboard',
    customerLabel: 'General Whop Leadboard',
    icon: Trophy,
    href: '/experiences/${experienceId}/customer?tab=LEADBOARD',
    accessLevel: 'customer',
  },
  {
    adminLabel: 'BooKoo Apps Support',
    customerLabel: 'BooKoo Apps Support',
    icon: HelpCircle,
    href: '/experiences/${experienceId}/customer?tab=SUPPORT',
    accessLevel: 'customer',
  },
  {
    adminLabel: 'Admin Settings',
    customerLabel: 'Admin Settings',
    icon: Settings2,
    href: '/experiences/${experienceId}/customer?tab=SETTINGS',
    accessLevel: 'admin',
  },
];

const AppSidebar = ({
  experienceId,
  accessLevel,
}: {
  experienceId: string;
  accessLevel: 'admin' | 'customer';
}) => {
  const searchParams = useSearchParams();
  const [width, height] = useWindowSize();
  const isMobile = width && width < 768;
  const tab = searchParams.get('tab');

  if (!isMobile) {
    return (
      <header className='bg-background'>
        <div className='flex items-center justify-between px-6 py-2'>
          <div className='flex gap-2'>
            <Link href={`/experiences/${experienceId}/customer?tab=TICKETS`}>
              <Button
                disabled={tab === 'TICKETS'}
                variant={tab === 'TICKETS' ? 'default' : 'ghost'}
                className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
              >
                <Ticket className='h-4 w-4' />
                {accessLevel === 'admin' ? 'All Tickets' : 'Your Tickets'}
              </Button>
            </Link>
            <Link href={`/experiences/${experienceId}/customer?tab=REVIEWS`}>
              <Button
                disabled={tab === 'REVIEWS'}
                variant={tab === 'REVIEWS' ? 'default' : 'ghost'}
                className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
              >
                <Star className='h-4 w-4' />
                Current Whop Reviews
              </Button>
            </Link>
            <Link href={`/experiences/${experienceId}/customer?tab=LEADBOARD`}>
              <Button
                variant={tab === 'LEADBOARD' ? 'default' : 'ghost'}
                className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
              >
                <Trophy className='h-4 w-4' />
                General Whop Leadboard
              </Button>
            </Link>
            <Link
              href={`https://whop.com/bookoo-apps-developers/?a=lucasklemke`}
              target='_blank'
            >
              <Button className='flex items-center gap-2 px-3 py-2 text-sm font-medium'>
                <HelpCircle className='h-4 w-4' />
                BooKoo Apps Support
              </Button>
            </Link>
            {accessLevel === 'admin' && (
              <Link href={`/experiences/${experienceId}/customer?tab=SETTINGS`}>
                <Button
                  variant={tab === 'SETTINGS' ? 'default' : 'ghost'}
                  className='flex items-center gap-2 px-3 py-2 text-sm font-medium'
                >
                  <Settings2 className='h-4 w-4' />
                  Admin Settings
                </Button>
              </Link>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <MobileSidebar
      experienceId={experienceId}
      accessLevel={accessLevel}
      tab={tab}
    />
  );
};

const MobileSidebar = ({
  experienceId,
  accessLevel,
  tab,
}: {
  experienceId: string;
  accessLevel: 'admin' | 'customer';
  tab: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top bar with menu button */}
      <header className='flex items-center justify-between px-4 py-2 border-b'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsOpen(true)}
          aria-label='Open sidebar'
        >
          <Menu className='h-5 w-5' />
        </Button>
        <div>
          <ThemeToggle />
        </div>
      </header>
      {/* Sidebar Drawer */}
      {isOpen && (
        <div className='fixed inset-0 z-50 bg-black/40'>
          <nav className='fixed top-0 left-0 h-full w-64 bg-background shadow-lg flex flex-col z-50 animate-in slide-in-from-left duration-200'>
            <div className='flex items-center justify-between px-4 py-3 border-b'>
              <span className='font-bold text-lg'>Menu</span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setIsOpen(false)}
                aria-label='Close sidebar'
              >
                <X className='h-5 w-5' />
              </Button>
            </div>
            <div className='flex-1 flex flex-col gap-1 px-2 py-4'>
              <Link
                href={`/experiences/${experienceId}/customer?tab=TICKETS`}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={tab === 'TICKETS' || !tab ? 'default' : 'ghost'}
                  className='w-full flex items-center gap-2 px-3 py-2 text-sm font-medium justify-start'
                >
                  <Ticket className='h-4 w-4' />
                  {accessLevel === 'admin' ? 'All Tickets' : 'Your Tickets'}
                </Button>
              </Link>
              <Link
                href={`/experiences/${experienceId}/customer?tab=REVIEWS`}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={tab === 'REVIEWS' ? 'default' : 'ghost'}
                  className='w-full flex items-center gap-2 px-3 py-2 text-sm font-medium justify-start'
                >
                  <Star className='h-4 w-4' />
                  Current Whop Reviews
                </Button>
              </Link>
              <Link
                href={`/experiences/${experienceId}/customer?tab=LEADBOARD`}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={tab === 'LEADBOARD' ? 'default' : 'ghost'}
                  className='w-full flex items-center gap-2 px-3 py-2 text-sm font-medium justify-start'
                >
                  <Trophy className='h-4 w-4' />
                  General Whop Leadboard
                </Button>
              </Link>
              <Link
                href={`https://whop.com/bookoo-apps-developers/?a=lucasklemke`}
                target='_blank'
              >
                <Button className='w-full flex items-center gap-2 px-3 py-2 text-sm font-medium justify-start'>
                  <HelpCircle className='h-4 w-4' />
                  BooKoo Apps Support
                </Button>
              </Link>
              {accessLevel === 'admin' && (
                <Link
                  href={`/experiences/${experienceId}/customer?tab=SETTINGS`}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant={tab === 'SETTINGS' ? 'default' : 'ghost'}
                    className='w-full flex items-center gap-2 px-3 py-2 text-sm font-medium justify-start'
                  >
                    <Settings2 className='h-4 w-4' />
                    Admin Settings
                  </Button>
                </Link>
              )}
            </div>
          </nav>
          {/* Clickable overlay to close */}
          <div
            className='fixed inset-0 z-40'
            onClick={() => setIsOpen(false)}
            aria-label='Close sidebar overlay'
          />
        </div>
      )}
    </>
  );
};

export default AppSidebar;
