import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  CheckCircle2,
  RefreshCcw,
  Trophy,
  Loader2,
  X,
} from "lucide-react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { Dialog, DialogContent } from "@mui/material";

const difficulties = ["easy", "medium", "hard"];
const categories = ["general", "technical", "business", "medical"];

const Typing = () => {
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [nameDialogOpen, setNameDialogOpen] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState(0);

  // Game state variables
  const [currentWord, setCurrentWord] = useState("");
  const [inputText, setInputText] = useState("");
  const [wordList, setWordList] = useState([]);
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  // Fetch words from an API or generate them
  const fetchWords = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/typing/words", {
        difficulty,
        category,
      });
      setWordList(response.data.words);
      setCurrentWord(response.data.words[0]);
      setSetupComplete(true);
      setIsLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch words");
      setIsLoading(false);
      setSetupComplete(false);
    }
  }, [difficulty, category]);

  // Name submission handler
  const handleNameSubmit = () => {
    if (participantName.trim()) {
      setNameDialogOpen(false);
    } else {
      toast.error("Please enter your name");
    }
  };

  const handleGameSetup = () => {
    if (!difficulty || !category) {
      toast.error("Please select both difficulty and category");
      return;
    }
    setStartTime(Date.now()); // Set start time when game begins
    setWordsTyped(0); // Reset words typed
    setIncorrectWords(0); // Reset incorrect words
    fetchWords();
    startTimer();
  };

  const startTimer = useCallback(() => {
    setStartTime(Date.now());
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          endGame();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  }, []);

  const handleInputChange = (e) => {
    const typedText = e.target.value;
    setInputText(typedText);

    if (typedText.length === currentWord.length) {
      if (typedText === currentWord) {
        // Correct word
        setScore((prevScore) => prevScore + currentWord.length);
        setWordsTyped((prev) => prev + 1);
      } else {
        // Incorrect word but same length
        setScore((prevScore) => Math.max(0, prevScore - currentWord.length));
        setIncorrectWords((prev) => prev + 1);
      }

      // Move to next word
      const nextWordIndex = wordList.indexOf(currentWord) + 1;
      if (nextWordIndex < wordList.length) {
        setCurrentWord(wordList[nextWordIndex]);
        setInputText("");
      } else {
        fetchWords();
      }
    }
  };

  const endGame = useCallback(() => {
    setIsGameOver(true);
  }, [startTime, wordsTyped]);

  // Format time function
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const resetGame = () => {
    // Reset all game states
    setScore(0);
    setTimer(60);
    setIsGameOver(false);
    setInputText("");
    setWordsTyped(0);
    setIncorrectWords(0);
    setStartTime(null);
    setWordList([]); // Clear the word list
    setCurrentWord(""); // Clear current word

    // Reset game setup states
    setDifficulty("");
    setCategory("");
    setSetupComplete(false);

    // Reset participant name and show name dialog
    setParticipantName("");
    setNameDialogOpen(true);
  };

  return (
    <div
      className="flex items-center justify-center px-4 py-10 md:py-16"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      {/* Name Dialog */}
      <Dialog
        open={nameDialogOpen}
        PaperProps={{
          style: {
            backgroundColor: "#7f1d1d",
            borderRadius: "1rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxWidth: "400px",
            width: "100%",
          },
        }}
      >
        <DialogContent
          className="space-y-4"
          style={{ backgroundColor: "#7f1d1d" }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-white text-center">
            Typing Practice
          </h2>
          <p className="text-md md:text-lg text-red-200 text-center">
            Please enter your name to begin
          </p>
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            onClick={handleNameSubmit}
            className="w-full px-6 py-2 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
          >
            Start Typing
          </button>
        </DialogContent>
      </Dialog>

      {/* Setup Dialog */}
      <Dialog
        open={!nameDialogOpen && !setupComplete}
        PaperProps={{
          style: {
            backgroundColor: "#7f1d1d",
            borderRadius: "1rem",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            maxWidth: "400px",
            width: "100%",
          },
        }}
      >
        <DialogContent
          className="space-y-4"
          style={{ backgroundColor: "#7f1d1d" }}
        >
          <h2 className="text-xl md:text-2xl font-bold text-white text-center">
            Game Setup
          </h2>

          {/* Difficulty Selection */}
          <div className="space-y-2">
            <label className="text-white">Select Difficulty:</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
              style={{
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") no-repeat right 1rem center/1.5rem`,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <option value="" className="bg-red-900">
                Select Difficulty
              </option>
              {difficulties.map((diff) => (
                <option key={diff} value={diff} className="bg-red-900">
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-white">Select Category:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
              style={{
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E") no-repeat right 1rem center/1.5rem`,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <option value="" className="bg-red-900">
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-red-900">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGameSetup}
            disabled={isLoading}
            className="w-full px-6 py-2 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                Generating Words...
              </div>
            ) : (
              "Start Game"
            )}
          </button>
        </DialogContent>
      </Dialog>

      {/* Main Game Container */}
      {setupComplete && (
        <div className="w-full max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl space-y-6"
            >
              {isGameOver ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-8 space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <Trophy className="w-16 h-16 text-yellow-400 drop-shadow-glow" />
                  </motion.div>

                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl md:text-3xl font-bold text-white text-center"
                  >
                    Game Complete! 🎉
                  </motion.h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    {/* Score Cards */}
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-red-900/50 to-red-800/50 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <Trophy className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-red-200 text-sm">Final Score</p>
                          <p className="text-xl md:text-2xl font-bold text-white">
                            {score}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-red-900/50 to-red-800/50 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <Timer className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-red-200 text-sm">Typing Speed</p>
                          <p className="text-xl md:text-2xl font-bold text-white">
                            {wordsTyped} WPM
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-br from-red-900/50 to-red-800/50 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <CheckCircle2 className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-red-200 text-sm">Words Typed</p>
                          <p className="text-xl md:text-2xl font-bold text-white">
                            {wordsTyped}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="bg-gradient-to-br from-red-900/50 to-red-800/50 p-4 rounded-xl border border-red-500/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <X className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <p className="text-red-200 text-sm">
                            Incorrect Words
                          </p>
                          <p className="text-xl md:text-2xl font-bold text-white">
                            {incorrectWords}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Game Details */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap gap-4 justify-center mt-4"
                  >
                    <div className="px-4 py-2 bg-red-900/30 rounded-full border border-red-500/20">
                      <span className="text-red-200">
                        Category:{" "}
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-red-900/30 rounded-full border border-red-500/20">
                      <span className="text-red-200">
                        Difficulty:{" "}
                        {difficulty.charAt(0).toUpperCase() +
                          difficulty.slice(1)}
                      </span>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    onClick={resetGame}
                    className="text-md md:text-xl flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-all hover:scale-105 active:scale-95"
                  >
                    <RefreshCcw size={20} />
                    Play Again
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  {/* Timer and Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {" "}
                      {/* Increased gap for stop button */}
                      <div className="flex items-center gap-2 text-white">
                        <Timer size={20} className="text-red-400" />
                        <span className="font-medium">{formatTime(timer)}</span>
                      </div>
                      <button
                        onClick={endGame}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Stop
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Trophy size={20} className="text-red-400" />
                      <span className="font-medium">Score: {score}</span>
                    </div>
                  </div>

                  {/* Word to Type */}
                  <div className="text-center">
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-4">
                      Type this word:
                    </h2>
                    <p className="text-2xl md:text-4xl font-bold text-red-300 mb-6">
                      {currentWord}
                    </p>
                  </div>

                  {/* Input Area */}
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={inputText}
                      onChange={handleInputChange}
                      placeholder="Start typing..."
                      className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 
                        ${
                          inputText === currentWord
                            ? "border-green-400 focus:ring-green-400"
                            : "border-white/20 focus:ring-red-400"
                        }`}
                    />
                    {/* {inputText && inputText !== currentWord && (
                      <p className="text-red-400 text-center">
                        Incorrect! Try again.
                      </p>
                    )} */}
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Typing;
