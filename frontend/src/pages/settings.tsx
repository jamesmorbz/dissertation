import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navbar/navbar';
import { SidebarNav } from '@/components/settings/sidebar-nav';

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/settings',
  },
  {
    title: 'Analytics',
    href: '/settings/analytics',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
  },
  {
    title: 'Password',
    href: '/settings/password',
  },
];

export function Settings() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar />
      <div className="md:hidden">
        <img
          src="/examples/forms-light.png"
          width={1280}
          height={791}
          alt="Forms"
          className="block dark:hidden"
        />
        <img
          src="/examples/forms-dark.png"
          width={1280}
          height={791}
          alt="Forms"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden space-y-6 p-10 pb-16 md:block">
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
