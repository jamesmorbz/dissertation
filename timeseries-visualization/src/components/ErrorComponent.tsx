import {
    Anchor,
    Button,
    Code,
    CopyButton,
    Group,
    Stack,
    Text,
    Title,
  } from "@mantine/core";
  import { useNavigate } from "@tanstack/react-router";
  
  export default function ErrorComponent({
    error,
  }: {
    error: unknown;
  }) {
    const navigate = useNavigate();
  
    return (
      <Stack p="md">
        <Title>An error occurred</Title>
        {error instanceof Error ? (
          <>
            <Text>
              <b>{error.name}:</b> {error.message}
            </Text>
            <Code>{error.stack}</Code>
            {error.cause}
          </>
        ) : (
          <Text>
            <b>Unexpected Error:</b> {JSON.stringify(error)}
          </Text>
        )}
        <Group>
          {error instanceof Error && (
            <CopyButton value={`${error.message}\n${error.stack}`}>
              {({ copied, copy }) => (
                <Button color={copied ? "teal" : undefined} onClick={copy}>
                  {copied ? "Copied" : "Copy stack strace"}
                </Button>
              )}
            </CopyButton>
          )}
          <Button
            onClick={() =>
              navigate({ to: "/" }).then(() => window.location.reload())
            }
          >
            Reload
          </Button>
        </Group>
  
        <Text>
          Please report this on{" "}
          <Anchor
            href="LINK TO REPORTING WEBSITE"
            target="_blank"
          >
            Github
          </Anchor>{" "}
          or on the{" "}
          <Anchor href="ALTERNATIVE LINK" target="_blank">
            ALTERNATIVE PLATFORM
          </Anchor>
        </Text>
      </Stack>
    );
  }