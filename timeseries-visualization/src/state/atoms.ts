import { type PrimitiveAtom, atom } from "jotai";
import {
  atomFamily,
  atomWithStorage,
  createJSONStorage,
  loadable,
} from "jotai/utils";
import type { AtomFamily } from "jotai/vanilla/utils/atomFamily";
import type { SyncStorage } from "jotai/vanilla/utils/atomWithStorage";

export const nativeBarAtom = atomWithStorage<boolean>("native-bar", false);