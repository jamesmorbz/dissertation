import { style } from "@vanilla-extract/css";

export const diff = style({
  lineHeight: 1,
  display: "flex",
  alignItems: "center",
});

export const progressLabel = style({
  lineHeight: 1,
  fontSize: "1rem",
});

export const card = style({
    ":hover": {
        backgroundColor: "#373A40",
      },
});

export const label = style({
  fontWeight: "bold",
  lineHeight: 1,
});

export const lead = style({
  fontWeight: 700,
  fontSize: 22,
  lineHeight: 1,
});

export const accordion = style({
    ":hover": {
        backgroundColor: "#373A40",
      },
});