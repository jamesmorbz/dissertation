import { globalStyle } from "@vanilla-extract/css";

globalStyle("cg-board square.selected", {
  background:
    "color-mix(in srgb, var(--mantine-primary-color-5) 50%, transparent)",
});

globalStyle("cg-board square.move-dest", {
  background: "radial-gradient(rgba(0, 0, 0, 0.3) 25%, rgba(0, 0, 0, 0) 0)",
});

globalStyle("cg-board square.move-dest:hover", {
  background:
    "color-mix(in srgb, var(--mantine-primary-color-5) 60%, transparent) !important",
  borderRadius: 0,
  padding: 0,
});

globalStyle("cg-board square.oc.move-dest", {
  background: "none",
  border: "5px solid rgba(0, 0, 0, 0.3)",
  borderRadius: 0,
});

globalStyle("cg-board square.oc.move-dest:hover", {
  background:
    "color-mix(in srgb, var(--mantine-primary-color-5) 60%, transparent)",
  borderRadius: 0,
});
