import { Anchor, Modal, Text } from "@mantine/core";
import { useEffect, useState } from "react";

function AboutModal({
  opened,
  setOpened,
}: {
  opened: boolean;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [info, setInfo] = useState<{
    version: string;
  } | null>(null);

  useEffect(() => {
    setInfo({ version: "0.0.1" });
  }, []);

  return (
    <Modal
      centered
      opened={opened}
      onClose={() => setOpened(false)}
      title="<APP NAME>"
    >
      <Text>Version: {info?.version}</Text>
      <Text> MORE INFO </Text>

      <br />

      <Anchor href="<APP NAME>" target="_blank" rel="noreferrer">
        WEBSITE LINK!
      </Anchor>
    </Modal>
  );
}

export default AboutModal;
