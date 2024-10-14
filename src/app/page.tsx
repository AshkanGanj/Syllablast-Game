"use client";

import React, { useState, useEffect } from "react";
import { config1, config2, config3 } from "../puzzle"; 
import { Model } from "../model"; 
import { Boundary } from "../boundary"; 

type ConfigType = {
  name: string;
  words: string[];
  initial: string[][];
};

export default function Home() {
  const [model] = useState<Model>(new Model([config1, config2, config3]));
  const [selectedConfig, setSelectedConfig] = useState<ConfigType | null>(null);
  const [message, setMessage] = useState<string>("");
  const [selectedSyllables, setSelectedSyllables] = useState<any[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const boundary = new Boundary(model, setMessage, setScore, setMoveHistory, setIsComplete);

  useEffect(() => {
    if (model.puzzle) {
      console.log("Puzzle initialized:", model.puzzle);
    }
  }, [model.puzzle]);

// -------------Controllers------------
  const handleTileSelect = (row: number, col: number) => {
    if (isComplete) {
      setMessage("Puzzle is complete! No more moves allowed.");
      return;
    }

    if (!model.puzzle) return;

    const tile = model.puzzle.board[row][col];
    const selectedTile = { row, col, tile };

    const isAlreadySelected = selectedSyllables.find((s) => s.row === row && s.col === col);
    if (isAlreadySelected) {
      setSelectedSyllables((prev) => prev.filter((s) => !(s.row === row && s.col === col)));
    } else {
      setSelectedSyllables((prev) => [...prev, selectedTile]);
    }
  };

  const handleSwapClick = () => {
    if (selectedSyllables.length === 2) {
      boundary.handleSwap(selectedSyllables);
      setSelectedSyllables([]); // Clear selection after swap
    } else {
      setMessage("Please select two syllables to swap.");
    }
  };

  const handleResetClick = () => {
    boundary.handleReset();
    setSelectedSyllables([])
  };

  const handleUndoClick = () => {
    boundary.handleUndo();
  };

  const handleConfigSelect = (config: ConfigType) => {
    boundary.handleConfigSelect(config);
    setSelectedConfig(config);
  };

  // ----------------------------

  return (
    <div className="flex flex-col items-center p-5 bg-neutral-100">
      <header className="text-3xl font-bold mb-5">Syllablast</header>
      <div className="flex flex-row gap-10">
        {/* Board Section */}
        <div className="flex flex-col">
          {selectedConfig && (
            <h2 className="font-semibold mb-2">
              Selected Board {selectedConfig.name}
            </h2>
          )}
          <div className="py-5">
            {model.puzzle ? (
              <table className="table-fixed border-collapse border border-gray-400">
                <tbody>
                  {model.puzzle.board.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border">
                      {row.map((syllable, colIndex) => (
                        <td
                          key={colIndex}
                          className={`w-16 h-16 border border-gray-400 text-center align-middle cursor-pointer ${
                            selectedSyllables.some((s) => s.row === rowIndex && s.col === colIndex)
                              ? "bg-blue-300"
                              : syllable.isCorrect
                              ? "bg-green-300"
                              : "bg-white"
                          }`}
                          onClick={() => handleTileSelect(rowIndex, colIndex)}
                        >
                          {syllable.text}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
              >
                <span className="block sm:inline">
                  Select a configuration to display the board.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 w-64">
          <div className="border p-4 rounded bg-white shadow-sm">
            <h3 className="font-semibold mb-2">Game Info</h3>
            <p>Score: {score}</p>
            <p>Swaps: {model.puzzle ? model.puzzle.swapRecord.length : 0}</p>
          </div>

          <div className="flex flex-col gap-2 bg-white p-4 rounded shadow-sm">
            <h3 className="font-semibold mb-2">Actions</h3>
            <button
              className="bg-green-500 text-white py-2 rounded hover:bg-green-600"
              onClick={handleSwapClick} 
              disabled={isComplete} 
            >
              Swap
            </button>
            <button
              className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
              onClick={handleUndoClick} 
              disabled={isComplete}
            >
              Undo
            </button>
            <button
              className="bg-red-500 text-white py-2 rounded hover:bg-red-600"
              onClick={handleResetClick}
            >
              Reset
            </button>
          </div>

          <div className="flex flex-col gap-2 bg-white p-4 rounded shadow-sm">
            <h3 className="font-semibold mb-2">Select Configuration</h3>
            <button
              className="bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              onClick={() => handleConfigSelect(config1)}
            >
              {config1.name}
            </button>
            <button
              className="bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              onClick={() => handleConfigSelect(config2)}
            >
              {config2.name}
            </button>
            <button
              className="bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              onClick={() => handleConfigSelect(config3)}
            >
              {config3.name}
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow-sm h-40 overflow-y-auto">
            <h3 className="font-semibold mb-2">Move History</h3>
            <ul>
              {moveHistory.length === 0 ? (
                <li className="text-gray-500">No moves yet.</li>
              ) : (
                moveHistory.map((move, index) => (
                  <li key={index} className="text-sm">
                    {move}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <p className="mt-4 text-lg">{message}</p>

      {isComplete && <p className="text-green-500 text-xl font-bold">🎉 Puzzle Complete! 🎉</p>}
    </div>
  );
}
