import AboutModal from "@/components/About";
import { SideBar } from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { AppShell } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { nativeBarAtom } from "@/state/atoms";
import { Outlet, createRootRoute, useNavigate } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";

type MenuGroup = {
  label: string;
  options: MenuAction[];
};

type MenuAction = {
  id?: string;
  label: string;
  shortcut?: string;
  action?: () => void;
};

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const isNative = useAtomValue(nativeBarAtom);
  const navigate = useNavigate();

  const [opened, setOpened] = useState(false);

  const menuActions: MenuGroup[] = [
    {
      label: "Docs",
      options: [
        {
          label: "Docs",
          id: "docs",
          action: () => setOpened(true),
        },
      ],
    },
    {
      label: "Help",
      options: [
        {
          label: "About",
          id: "about",
          action: () => setOpened(true),
        },
      ],
    },
  ];

  return (
    <AppShell
      navbar={{
        width: "3rem",
        breakpoint: 0,
      }}
      header={{ height: "2.5rem" }}
      styles={{
        main: {
          height: "100vh",
          userSelect: "none",
        },
      }}
    >
      <AboutModal opened={opened} setOpened={setOpened} />
      <AppShell.Header>
        <TopBar menuActions={menuActions} />
      </AppShell.Header>
      <AppShell.Navbar>
        <SideBar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
