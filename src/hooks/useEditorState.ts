import { useReducer } from "react";
import { IDENTITY_TWEAKS, DEFAULT_PRESET_ID } from "../presets/presets";
import type { AppliedFilters } from "../types/preset";
import type { AspectId, CropRect } from "../utils/crop";

export type EditorSnapshot = {
  selectedPresetId: string;
  intensity: number;
  tweaks: AppliedFilters;
  crops: Record<string, CropRect>;
  aspect: AspectId;
};

type EditorHistory = {
  present: EditorSnapshot;
  previous: EditorSnapshot | null;
};

type EditorAction =
  | { type: "checkpoint" }
  | { type: "update"; patch: Partial<EditorSnapshot> }
  | { type: "set-crop"; id: string; crop: CropRect }
  | { type: "undo" }
  | { type: "new-session"; crops: Record<string, CropRect> };

export const createEditorSnapshot = (crops: Record<string, CropRect> = {}): EditorSnapshot => ({
  selectedPresetId: DEFAULT_PRESET_ID,
  intensity: 50,
  tweaks: { ...IDENTITY_TWEAKS },
  crops,
  aspect: "free",
});

export function editorReducer(state: EditorHistory, action: EditorAction): EditorHistory {
  switch (action.type) {
    case "checkpoint":
      return { ...state, previous: state.present };
    case "update":
      return { ...state, present: { ...state.present, ...action.patch } };
    case "set-crop":
      return {
        ...state,
        present: {
          ...state.present,
          crops: { ...state.present.crops, [action.id]: action.crop },
        },
      };
    case "undo":
      return state.previous ? { present: state.previous, previous: null } : state;
    case "new-session":
      return { present: createEditorSnapshot(action.crops), previous: null };
  }
}

export function useEditorState() {
  const [history, dispatch] = useReducer(editorReducer, undefined, () => ({
    present: createEditorSnapshot(),
    previous: null,
  }));

  return {
    ...history.present,
    canUndo: history.previous !== null,
    checkpoint: () => dispatch({ type: "checkpoint" }),
    update: (patch: Partial<EditorSnapshot>) => dispatch({ type: "update", patch }),
    setCrop: (id: string, crop: CropRect) => dispatch({ type: "set-crop", id, crop }),
    undo: () => dispatch({ type: "undo" }),
    startSession: (crops: Record<string, CropRect>) => dispatch({ type: "new-session", crops }),
  };
}
