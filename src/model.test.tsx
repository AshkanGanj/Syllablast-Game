import { describe, expect, test, beforeEach } from 'vitest';
import { Model } from './model';
import { config1, config2, config3 } from './puzzle';

describe('Model class with pre-existing configurations and edge cases', () => {
  let model: Model;

  beforeEach(() => {
    model = new Model([config1, config2, config3]);
  });

  test('setConfig should initialize puzzle for config1 correctly', () => {
    expect(model.setConfig(config1)).toBe(true);
    expect(model.puzzle).not.toBeNull();
    expect(model.puzzle?.board[0][0].text).toBe('ter'); // Check the first syllable
    expect(model.puzzle?.board.length).toBe(4); // Ensure board size is correct
  });

  test('setConfig should return false for invalid config', () => {
    const invalidConfig = { name: '', words: [], initial: [] };
    expect(model.setConfig(invalidConfig)).toBe(false);
    expect(model.puzzle).toBeNull();
  });

  test('resetPuzzle should reset the puzzle board for config3', () => {
    model.setConfig(config3);
    expect(model.puzzle?.board[0][0].text).toBe('al'); // Check the first syllable of config3

    // Perform some operations
    model.puzzle?.swapSyllable(model.puzzle.board[0][0], model.puzzle.board[1][1]);
    expect(model.puzzle?.swapRecord.length).toBe(1);

    // Reset
    model.resetPuzzle();
    expect(model.puzzle?.board[0][0].text).toBe('al'); // Check the board resets to config3 initial
    expect(model.puzzle?.swapRecord.length).toBe(0); // Ensure swaps are reset
  });

  test('resetPuzzle should fail when no current configuration is selected', () => {
    model.currentConfig = null;
    const result = model.resetPuzzle();
    expect(result).toBe(false);
    expect(model.puzzle).toBeNull();
  });

  test('Victory condition should be false at the start', () => {
    model.setConfig(config1);
    expect(model.victory).toBe(false); // The puzzle is not completed initially
  });

  test('Victory condition should return true when puzzle is complete', () => {
    model.setConfig(config1);
    // Simulate victory condition by marking all syllables correct
    model.puzzle?.board.forEach((row) => row.forEach((syllable) => (syllable.isCorrect = true)));
    model.checkVictory();
    expect(model.victory).toBe(true);
  });

  test('checkVictory should return false if puzzle is incomplete', () => {
    model.setConfig(config2);
    model.checkVictory();
    expect(model.victory).toBe(false); // Still incomplete
  });
});
