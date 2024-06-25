import { style } from "@vanilla-extract/css";

export const icon = style({
  transition: "background-color 100ms ease",
  ":hover": {
    backgroundColor: "#373A40",
  },
});

export const close = style({
  transition: "background-color 100ms ease",
  ":hover": {
    backgroundColor: "#FF6B6B",
    color: "#FFFFFF",
  },
});
