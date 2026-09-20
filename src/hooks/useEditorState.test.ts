import { describe, expect, it } from "vitest";
import { createEditorSnapshot, editorReducer } from "./useEditorState";

describe("editor history", () => {
  it("restores the state captured before an edit", () => {
    const initial = { present: createEditorSnapshot(), previous: null };
    const checkpointed = editorReducer(initial, { type: "checkpoint" });
    const edited = editorReducer(checkpointed, { type: "update", patch: { intensity: 80 } });
    const undone = editorReducer(edited, { type: "undo" });

    expect(edited.present.intensity).toBe(80);
    expect(undone.present.intensity).toBe(50);
    expect(undone.previous).toBeNull();
  });

  it("clears history when a new image session begins", () => {
    const initial = editorReducer(
      { present: createEditorSnapshot(), previous: null },
      { type: "checkpoint" },
    );
    const next = editorReducer(initial, { type: "new-session", crops: {} });

    expect(next.previous).toBeNull();
    expect(next.present.intensity).toBe(50);
  });
});
