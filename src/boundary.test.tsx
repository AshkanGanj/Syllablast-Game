import { describe, expect, test, beforeEach, vi } from "vitest";
import { Model } from "./model";
import { Boundary } from "./boundary";
import { config1, config2, config3 } from "./puzzle";

describe("Boundary class with edge cases", () => {
  let model: Model;
  let boundary: Boundary;

  let mockSetMessage: any;
  let mockSetScore: any;
  let mockSetMoveHistory: any;
  let mockSetIsComplete: any;

  beforeEach(() => {
    model = new Model([config1, config2, config3]);
    mockSetMessage = vi.fn();
    mockSetScore = vi.fn();
    mockSetMoveHistory = vi.fn();
    mockSetIsComplete = vi.fn();

    boundary = new Boundary(
      model,
      mockSetMessage,
      mockSetScore,
      mockSetMoveHistory,
      mockSetIsComplete
    );
  });

  test("handleConfigSelect should set the correct config for config1 and update message", () => {
    boundary.handleConfigSelect(config1);
    expect(mockSetMessage).toHaveBeenCalledWith("Configuration #1 loaded.");
    expect(mockSetScore).toHaveBeenCalledWith(0);
  });

  test("handleConfigSelect should set the correct config for config2 and update message", () => {
    boundary.handleConfigSelect(config2);
    expect(mockSetMessage).toHaveBeenCalledWith("Configuration #2 loaded.");
  });

  test("handleSwap should fail when no syllables are selected", () => {
    boundary.handleSwap([]);
    expect(mockSetMessage).toHaveBeenCalledWith(
      "Please select two syllables to swap."
    );
  });

  test("handleSwap should fail when only one syllable is selected", () => {
    boundary.handleSwap([{ row: 0, col: 0 }]);
    expect(mockSetMessage).toHaveBeenCalledWith(
      "Please select two syllables to swap."
    );
  });

  test("handleSwap should fail if swapSyllable returns false", () => {
    model.puzzle = {
      ...model.puzzle,
      swapSyllable: vi.fn().mockReturnValue(false),
      board: [
        [
          { text: "ter", currentPosition: { row: 0, col: 0 } },
          { text: "ate", currentPosition: { row: 0, col: 1 } },
        ],
        [
          { text: "fil", currentPosition: { row: 1, col: 0 } },
          { text: "in", currentPosition: { row: 1, col: 1 } },
        ],
      ],
    };

    boundary.handleSwap([
      { row: 0, col: 0 },
      { row: 1, col: 1 },
    ]);
    expect(mockSetMessage).toHaveBeenCalledWith("Swap failed.");
  });

  test("handleReset should reset the puzzle and update message", () => {
    boundary.handleConfigSelect(config3);
    boundary.handleReset();
    expect(mockSetMessage).toHaveBeenCalledWith("Puzzle reset.");
    expect(mockSetScore).toHaveBeenCalledWith(0);
    expect(mockSetMoveHistory).toHaveBeenCalledWith([]);
    expect(mockSetIsComplete).toHaveBeenCalledWith(false);
  });

  test("handleUndo should fail when there is nothing to undo", () => {
    boundary.handleUndo();
    expect(mockSetMessage).toHaveBeenCalledWith("Nothing to undo.");
  });

  test("handleUndo should undo the last swap and update move history", () => {
    boundary.handleConfigSelect(config1);
    boundary.handleSwap([
      { row: 0, col: 0 },
      { row: 1, col: 1 },
    ]);

    boundary.handleUndo();
    expect(mockSetMessage).toHaveBeenCalledWith("Undo successful.");
    expect(mockSetMoveHistory).toHaveBeenCalledTimes(3); 
  });

  test("handleSwap should call checkPuzzleCompletion if swap is successful", () => {
    boundary.handleConfigSelect(config1);
    boundary.handleSwap([
      { row: 0, col: 0 },
      { row: 1, col: 1 },
    ]);
    expect(mockSetMessage).toHaveBeenCalledWith("Swapped successfully.");
  });

  test("handleConfigSelect should handle invalid config", () => {
    const invalidConfig = { name: "", words: [], initial: [] };
    boundary.handleConfigSelect(invalidConfig);
    expect(mockSetMessage).toHaveBeenCalledWith(
      "Failed to load configuration."
    );
  });

  test("handleUndo should not update move history if no swaps were made", () => {
    boundary.handleUndo();
    expect(mockSetMoveHistory).toHaveBeenCalledTimes(0); 
  });
});
