import {
  ActionIcon,
  Autocomplete,
  Input,
  MantineProvider,
  TextInput,
  Textarea,
  localStorageColorSchemeManager,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { getDefaultStore, useAtom, useAtomValue } from 'jotai';
import { ContextMenuProvider } from 'mantine-contextmenu';
import { nativeBarAtom } from './state/atoms';

import '@mantine/charts/styles.css';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';

import 'mantine-contextmenu/styles.css';
import 'mantine-datatable/styles.css';

import '@/styles/global.css';

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'mantine-color-scheme',
});

import ErrorComponent from '@/components/ErrorComponent';
import { routeTree } from './routeTree.gen';

export type Dirs = {
  documentDir: string;
};

const router = createRouter({
  routeTree,
  defaultErrorComponent: ErrorComponent,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  const isNative = useAtomValue(nativeBarAtom);

  return (
    <>
      <MantineProvider
        colorSchemeManager={colorSchemeManager}
        defaultColorScheme="dark"
      >
        <ContextMenuProvider>
          <Notifications />
          <RouterProvider router={router} />
        </ContextMenuProvider>
      </MantineProvider>
    </>
  );
}
