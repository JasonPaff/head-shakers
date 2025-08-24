'use client';

import { useUser } from '@clerk/nextjs';
import { Grid3X3Icon, HeartIcon, LogOutIcon, SettingsIcon, UsersIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

type TestLayoutProps = Readonly<Children>;

export const TestLayout = ({ children }: TestLayoutProps) => {
  const { isSignedIn } = useUser();

  return (
    <div className={'min-h-screen bg-gray-50'}>
      <div className={'flex'}>
        {/* Dashboard Sidebar */}
        {isSignedIn && (
          <aside className={'min-h-screen w-64 border-r border-gray-200 bg-white shadow-lg'}>
            <div className={'p-6'}>
              <h2 className={'mb-6 text-lg font-semibold text-gray-900'}>My Dashboard</h2>

              <nav className={'space-y-2'}>
                <a className={'flex items-center rounded-lg bg-gray-100 px-3 py-2 text-gray-900'} href={'#'}>
                  <Grid3X3Icon className={'mr-3 h-5 w-5'} />
                  My Collection
                </a>
                <a
                  className={
                    'flex items-center rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  href={'#'}
                >
                  <HeartIcon className={'mr-3 h-5 w-5'} />
                  Favorites
                </a>
                <a
                  className={
                    'flex items-center rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  href={'#'}
                >
                  <UsersIcon className={'mr-3 h-5 w-5'} />
                  Following
                </a>
                <a
                  className={
                    'flex items-center rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                  href={'#'}
                >
                  <SettingsIcon className={'mr-3 h-5 w-5'} />
                  Settings
                </a>
              </nav>

              <div className={'mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4'}>
                <h3 className={'mb-2 font-medium text-gray-900'}>Collection Stats</h3>
                <div className={'text-sm text-gray-600'}>
                  <div>Total Items: 47</div>
                  <div>Collections: 5</div>
                  <div>Followers: 23</div>
                </div>
              </div>
            </div>

            <div className={'absolute right-4 bottom-4 left-4'}>
              <Button
                className={'w-full justify-start text-gray-600 hover:text-gray-900'}
                size={'sm'}
                variant={'ghost'}
              >
                <LogOutIcon className={'mr-2 h-4 w-4'} />
                Sign Out
              </Button>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 p-8 ${isSignedIn ? 'ml-0' : ''}`}>
          <div className={'mx-auto max-w-6xl'}>{children}</div>
        </main>
      </div>
    </div>
  );
};
