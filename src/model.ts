export class Position {
  row: number;
  column: number;

  constructor(row: number, column: number) {
    this.row = row;
    this.column = column;
  }
}

export class Syllable {
  text: string;
  currentPosition: Position;
  isCorrect: boolean;

  constructor(text: string, currentPosition: Position) {
    this.text = text;
    this.currentPosition = currentPosition;
    this.isCorrect = false;
  }

  updateCurrent(newPosition: Position): boolean {
    this.currentPosition = newPosition;
    return true;
  }
}

export class Record {
  currentS1: Syllable;
  currentS2: Syllable;
  prevS1: Position;
  prevS2: Position;

  constructor(currentS1: Syllable, currentS2: Syllable) {
    this.currentS1 = currentS1;
    this.currentS2 = currentS2;
    this.prevS1 = currentS1.currentPosition;
    this.prevS2 = currentS2.currentPosition;
  }

  format(): string {
    return `Swapped ${this.currentS1.text} at (${this.prevS1.row}, ${this.prevS1.column}) with ${this.currentS2.text} at (${this.prevS2.row}, ${this.prevS2.column})`;
  }
}

export class Puzzle {
  public board: Syllable[][];
  public swapRecord: Record[];
  private correctSequences: string[][];

  constructor(config: Config) {
    this.board = this.initializeBoard(config.initial);
    this.swapRecord = [];
    this.correctSequences = config.words.map((word) => word.split(","));
  }

  private initializeBoard(initial: string[][]): Syllable[][] {
    return initial.map((row, rowIndex) =>
      row.map(
        (text, colIndex) => new Syllable(text, new Position(rowIndex, colIndex))
      )
    );
  }

  private isCorrectSyllable(
    syllable: Syllable,
    colIndex: number,
    correctSeq: string[]
  ): boolean {
    return (
      colIndex < correctSeq.length && syllable.text === correctSeq[colIndex]
    );
  }

  private checkRowCorrectness(row: Syllable[]): number {
    let maxCorrectLength = 0;

    for (const correctSequence of this.correctSequences) {
      let correctLength = 0;
      let isMatching = true;

      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const syllable = row[colIndex];
        if (this.isCorrectSyllable(syllable, colIndex, correctSequence)) {
          syllable.isCorrect = true;
          correctLength++;
        } else {
          isMatching = false;
          break;
        }
      }
      maxCorrectLength = Math.max(maxCorrectLength, correctLength);
    }

    for (let i = maxCorrectLength; i < row.length; i++) {
      row[i].isCorrect = false;
    }

    return maxCorrectLength;
  }

  updateBoardCorrectness(): number {
    let totalScore = 0;
    this.board.forEach((row) => {
      totalScore += this.checkRowCorrectness(row);
    });

    return totalScore;
  }

  swapSyllable(
    syllable1: Syllable,
    syllable2: Syllable,
    recordSwap: boolean = true
  ): boolean {
    const tempPosition = syllable1.currentPosition;
    syllable1.updateCurrent(syllable2.currentPosition);
    syllable2.updateCurrent(tempPosition);

    this.board[syllable1.currentPosition.row][
      syllable1.currentPosition.column
    ] = syllable1;
    this.board[syllable2.currentPosition.row][
      syllable2.currentPosition.column
    ] = syllable2;

    if (recordSwap) this.swapRecord.push(new Record(syllable1, syllable2));

    this.updateBoardCorrectness();

    return true;
  }

  undo(): boolean {
    const lastRecord = this.swapRecord.pop();
    if (lastRecord) {
      this.swapSyllable(lastRecord.currentS1, lastRecord.currentS2, false);
      this.updateBoardCorrectness();
      return true;
    }
    return false;
  }

  resetBoard(config: Config): void {
    this.board = this.initializeBoard(config.initial);
    this.swapRecord = [];
    this.updateBoardCorrectness();
  }

  isComplete(): boolean {
    return this.board.flat().every((syllable) => syllable.isCorrect);
  }
}

// Model
type Config = {
  name: string;
  words: string[];
  initial: string[][];
};

export class Model {
  puzzle: Puzzle | null;
  score: number;
  numSwap: number;
  victory: boolean;
  currentConfig: Config | null;
  configs: Config[];

  constructor(configs: Config[]) {
    this.configs = configs;
    this.currentConfig = null;
    this.puzzle = null;
    this.score = 0;
    this.numSwap = 0;
    this.victory = false;
  }

  setConfig(config: Config): boolean {
    if (
      !config.name ||
      config.words.length === 0 ||
      config.initial.length === 0
    ) {
      return false;
    }
    this.currentConfig = config;
    return this.resetPuzzle();
  }

  resetPuzzle(): boolean {
    if (!this.currentConfig) {
      console.warn("No configuration selected to reset the puzzle.");
      return false;
    }

    try {
      this.puzzle = new Puzzle(this.currentConfig);
      this.score = 0;
      this.numSwap = 0;
      this.victory = false;
      return true;
    } catch (error) {
      console.error("Failed to initialize the puzzle:", error);
      this.puzzle = null;
      return false;
    }
  }

  checkVictory() {
    if (this.puzzle && this.puzzle.isComplete()) {
      this.victory = true;
      console.log("Puzzle completed!");
    }
  }
}
