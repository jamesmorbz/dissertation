import { style } from "@vanilla-extract/css";

export const card = style({
  ":hover": {
    backgroundColor: "#373A40",
  },
});

export const powerIcon = style({
  position: "absolute",
  bottom: "10px",
  left: "10px",
});

export const lastUpdated = style({
  textAlign: "right",
  color: "#6c757d",
  fontSize: "12px",
  marginTop: "4px",
  // position: "absolute",
  bottom: "10px",
  right: "10px",
});
