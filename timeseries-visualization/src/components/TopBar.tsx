import { ActionIcon, Box, Button, Center, Group, Image, Menu, Text } from "@mantine/core";
import * as classes from "./TopBar.css";
import { IconRefresh } from "@tabler/icons-react";
import { useColorScheme } from "@mantine/hooks";

type MenuAction = {
    label: string;
    shortcut?: string;
    action?: () => void;
};

type MenuGroup = {
    label: string;
    options: MenuAction[];
};

function TopBar({ menuActions }: { menuActions: MenuGroup[] }) {
    const colorScheme = useColorScheme();

    return (
        <>
            <Group>
                <Box style={{ flexGrow: 1 }}>
                    <Group data-tauri-drag-region gap="xs" px="sm">
                        <Box h="1.5rem" w="1.5rem">
                            <Image src="/logo.png" fit="fill" />
                        </Box>
                        <Group gap={0}>
                            {menuActions.map((action) => (
                                <Menu
                                    key={action.label}
                                    shadow="md"
                                    width={200}
                                    position="bottom-start"
                                    transitionProps={{ duration: 0 }}
                                >
                                    <Menu.Target>
                                        <Button
                                            style={{
                                                ":active": {
                                                    transform: "none",
                                                },
                                            }}
                                            fz="sm"
                                            variant="subtle"
                                            color={colorScheme === "dark" ? "gray" : "dark"}
                                            size="compact-md"
                                        >
                                            {action.label}
                                        </Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        {action.options.map((option, i) =>
                                            option.label === "divider" ? (
                                                <Menu.Divider key={i} />
                                            ) : (
                                                <Menu.Item
                                                    key={option.label}
                                                    rightSection={
                                                        option.shortcut && (
                                                            <Text size="xs" c="dimmed">
                                                                {option.shortcut}
                                                            </Text>
                                                        )
                                                    }
                                                    onClick={option.action}
                                                >
                                                    {option.label}
                                                </Menu.Item>
                                            ),
                                        )}
                                    </Menu.Dropdown>
                                </Menu>
                            ))}
                        </Group>
                    </Group>
                </Box>
                <Box h={35}>
                    <Group gap={0} data-tauri-drag-region>
                        <Center
                            h={35}
                            w={45}
                            //   onClick={() => appWindow.minimize()}
                            className={classes.icon}
                        >
                            <ActionIcon onClick={() => console.log("Refresh whole DOM")}>
                                <IconRefresh/>
                            </ActionIcon>
                           
                            {/* You might want to put something in the top right. Replace the above if you do */}
                        </Center>
                    </Group>
                </Box>
            </Group>
        </>
    );
}

export default TopBar;