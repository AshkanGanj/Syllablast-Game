import { Model } from "./model";

export class Boundary {
  private model: Model;
  private setMessage: (msg: string) => void;
  private setScore: (score: number) => void;
  private setMoveHistory: (history: string[]) => void;
  private setIsComplete: (isComplete: boolean) => void;

  constructor(
    model: Model,
    setMessage: (msg: string) => void,
    setScore: (score: number) => void,
    setMoveHistory: (history: string[]) => void,
    setIsComplete: (isComplete: boolean) => void
  ) {
    this.model = model;
    this.setMessage = setMessage;
    this.setScore = setScore;
    this.setMoveHistory = setMoveHistory;
    this.setIsComplete = setIsComplete;
  }

  handleConfigSelect(config: any) {
    const success = this.model.setConfig(config);
    if (success) {
      this.setMessage(`Configuration ${config.name} loaded.`);
      this.updateScore();
      this.setIsComplete(false); 
      this.setMoveHistory([]);
    } else {
      this.setMessage("Failed to load configuration.");
    }
  }

  handleSwap(selectedSyllables: any[]) {
    if (this.model.puzzle && selectedSyllables.length === 2) {
      const [first, second] = selectedSyllables;
      const success = this.model.puzzle.swapSyllable(
        this.model.puzzle.board[first.row][first.col],
        this.model.puzzle.board[second.row][second.col]
      );

      if (success) {
        this.setMessage("Swapped successfully.");
        this.updateScore();
        this.setMoveHistory(this.model.puzzle.swapRecord.map((record) => record.format()));
        this.checkPuzzleCompletion();
      } else {
        this.setMessage("Swap failed.");
      }
    } else {
      this.setMessage("Please select two syllables to swap.");
    }
  }

  handleReset() {
    const success = this.model.resetPuzzle();
    if (success) {
      this.setMessage("Puzzle reset.");
      this.setScore(0);
      this.setMoveHistory([]);
      this.setIsComplete(false); // Reset completion
    } else {
      this.setMessage("Failed to reset the puzzle.");
    }
  }

  handleUndo() {
    if (this.model.puzzle && this.model.puzzle.undo()) {
      this.setMessage("Undo successful.");
      this.updateScore();
      this.setMoveHistory(this.model.puzzle.swapRecord.map((record) => record.format()));
      this.checkPuzzleCompletion();
    } else {
      this.setMessage("Nothing to undo.");
    }
  }

  updateScore() {
    const score = this.model.puzzle.updateBoardCorrectness();
    this.setScore(score);
  }

  checkPuzzleCompletion() {
    if (this.model.puzzle && this.model.puzzle.isComplete()) {
      this.setIsComplete(true);
      this.setMessage("Puzzle Complete! 🎉");
    }
  }
}
