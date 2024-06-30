import { AppShellSection, Stack, Tooltip } from '@mantine/core';
import {
  type Icon,
  IconChartHistogram,
  IconDatabase,
  IconDevices,
  IconCalendarClock,
  IconSettings,
  IconLogs,
} from '@tabler/icons-react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import cx from 'clsx';
import * as styles from './Sidebar.css';

interface NavbarLinkProps {
  icon: Icon;
  label: string;
  url: string;
  active?: boolean;
}

function NavbarLink({ url, icon: Icon, label }: NavbarLinkProps) {
  const matcesRoute = useMatchRoute();
  return (
    <Tooltip label={label} position="right">
      <Link
        to={url}
        className={cx(styles.link, {
          [styles.active]: matcesRoute({ to: url, fuzzy: true }),
        })}
      >
        <Icon size="2.5rem" stroke={1} />
      </Link>
    </Tooltip>
  );
}

const linksdata = [
  { icon: IconChartHistogram, label: 'Dashboard', url: '/dashboard' },
  { icon: IconDatabase, label: 'Data Explorer', url: '/data-explorer' },
  { icon: IconDevices, label: 'Devices', url: '/devices' },
  { icon: IconCalendarClock, label: 'Scheduler', url: '/scheduler' },
  { icon: IconLogs, label: 'Logs', url: '/logs' },
];

export function SideBar() {
  const links = linksdata.map((link) => (
    <NavbarLink {...link} label={`${link.label}`} key={link.label} />
  ));

  return (
    <>
      <AppShellSection grow>
        <Stack justify="center" gap={0}>
          {links}
        </Stack>
      </AppShellSection>
      <AppShellSection>
        <Stack justify="center" gap={0}>
          <NavbarLink icon={IconSettings} label="Settings" url="/settings" />
        </Stack>
      </AppShellSection>
    </>
  );
}
