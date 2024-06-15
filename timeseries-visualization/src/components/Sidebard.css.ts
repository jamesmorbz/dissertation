import { style } from "@vanilla-extract/css";

export const link = style({
  width: "3rem",
  height: "3rem",
  display: "flex",
  alignItems: "center",
  borderLeft: "3px solid transparent",
  borderRight: "3px solid transparent",
  justifyContent: "center",
  color: "#373A40",

  ":hover": {
      color: "#373A40",
  }
});

export const active = style({
  borderLeftColor: "#373A40",
  color: "#373A40",
});