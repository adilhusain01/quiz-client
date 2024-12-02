import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Timer,
  RefreshCcw,
  CheckCircle2,
  Trophy,
  Brain,
  Loader2,
  Sparkles,
  Grid,
} from "lucide-react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { Dialog, DialogContent } from "@mui/material";

const MemoryChallenge = () => {
  const [challenge, setChallenge] = useState(null);
  const [stage, setStage] = useState("setup");
  const [timer, setTimer] = useState(0);
  const [userSequence, setUserSequence] = useState([]);
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [participantName, setParticipantName] = useState("");
  const [nameDialogOpen, setNameDialogOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [jumbledSequence, setJumbledSequence] = useState([]);

  // New state to handle sequence display mode
  const [sequenceDisplayMode, setSequenceDisplayMode] = useState("grid");

  const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  const calculateChallengeParams = (sequence, difficulty) => {
    const sequenceLength = sequence.length;

    // Determine display mode based on sequence length
    let displayMode = "grid";
    if (sequenceLength > 0) {
      displayMode = "list";
    }

    // Calculate time limit
    const baseTime = sequenceLength * 2; // 2 seconds per item
    let timeLimit;
    switch (difficulty) {
      case "easy":
        timeLimit = baseTime + 5;
        break;
      case "medium":
        timeLimit = baseTime + 3;
        break;
      case "hard":
        timeLimit = Math.max(baseTime, 20); // Minimum 20 seconds for hard mode
        break;
      default:
        timeLimit = baseTime;
    }

    return { timeLimit, displayMode };
  };

  // Full Reset Function
  const fullReset = () => {
    setChallenge(null);
    setStage("setup");
    setTimer(0);
    setUserSequence([]);
    setScore(0);
    setDifficulty("medium");
    setParticipantName("");
    setNameDialogOpen(true);
    setIsLoading(false);
    setJumbledSequence([]);
  };

  const fetchChallenge = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/memory-challenge/challenge", {
        difficulty,
      });

      const challengeData = response.data.challenge;

      // Calculate dynamic time limit and display mode
      const { timeLimit, displayMode } = calculateChallengeParams(
        challengeData.sequence,
        difficulty
      );

      setChallenge({
        ...challengeData,
        timeLimit: timeLimit,
      });

      // Set display mode
      setSequenceDisplayMode(displayMode);

      // Shuffle sequence for recall stage
      setJumbledSequence(shuffleArray(challengeData.sequence));

      setStage("preview");
      setTimer(timeLimit);
      setUserSequence([]);
      setIsLoading(false);
      setNameDialogOpen(false);
    } catch (error) {
      toast.error("Failed to generate challenge");
      setIsLoading(false);
    }
  }, [difficulty]);

  useEffect(() => {
    if (stage === "preview" && challenge) {
      const previewTimer = setTimeout(() => {
        setStage("recall");
        startRecallTimer();
      }, (challenge.timeLimit + 2) * 1000);

      return () => clearTimeout(previewTimer);
    }
  }, [stage, challenge]);

  const startRecallTimer = useCallback(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          evaluateChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const evaluateChallenge = useCallback(() => {
    if (!challenge) return;

    const correctSequence = challenge.sequence;
    const userCorrectCount = userSequence.reduce((acc, item, index) => {
      return item === correctSequence[index] ? acc + 1 : acc;
    }, 0);

    const calculatedScore = Math.round(
      (userCorrectCount / correctSequence.length) * 100
    );

    setScore(calculatedScore);

    // Automatically move to result stage if not already there
    if (stage !== "result") {
      setStage("result");
    }
  }, [challenge, userSequence, stage]);

  // User Interaction Handlers
  const handleItemSelection = (item) => {
    if (stage === "recall" && userSequence.length < challenge.sequence.length) {
      setUserSequence((prev) => [...prev, item]);

      // Automatically evaluate if all items are selected
      if (userSequence.length + 1 === challenge.sequence.length) {
        evaluateChallenge();
      }
    }
  };

  // Name submission handler
  const handleNameSubmit = () => {
    if (participantName.trim()) {
      setNameDialogOpen(false);
    } else {
      toast.error("Please enter your name");
    }
  };

  const renderPreviewStage = () => (
    <div className="text-center space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-white flex items-center justify-center gap-2">
        <Eye size={24} /> Memorize the Sequence
      </h2>

      {sequenceDisplayMode === "grid" ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {challenge.sequence.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white/10 p-4 rounded-xl text-white truncate"
              title={item}
            >
              {item}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-2">
          {challenge.sequence.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 p-3 rounded-xl text-white text-left"
              title={item}
            >
              {index + 1}. {item}
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-red-200 flex items-center justify-center gap-2">
        <Timer size={20} /> Memorize for {timer} seconds
      </p>
    </div>
  );

  const renderRecallStage = () => (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
        <Grid size={24} /> Recall the Sequence
      </h2>

      {sequenceDisplayMode === "grid" ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {jumbledSequence.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => handleItemSelection(item)}
              className={`bg-white/10 p-4 rounded-xl text-white truncate 
                ${
                  userSequence.includes(item)
                    ? "border-2 border-green-400"
                    : "hover:bg-white/20"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={userSequence.includes(item)}
              title={item}
            >
              {item}
              {userSequence.includes(item) && (
                <CheckCircle2 className="ml-2 text-green-400" size={16} />
              )}
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-2">
          {jumbledSequence.map((item, index) => (
            <motion.button
              key={index}
              onClick={() => handleItemSelection(item)}
              className={`w-full bg-white/10 p-3 rounded-xl text-white text-left 
                ${
                  userSequence.includes(item)
                    ? "border-2 border-green-400"
                    : "hover:bg-white/20"
                }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={userSequence.includes(item)}
              title={item}
            >
              {index + 1}. {item}
              {userSequence.includes(item) && (
                <CheckCircle2 className="ml-2 text-green-400" size={16} />
              )}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex justify-center space-x-2">
        <p className="text-red-200 flex items-center gap-2">
          <Timer size={20} /> Time Remaining: {timer} seconds
        </p>
        <p className="text-white">
          ({userSequence.length}/{challenge.sequence.length} selected)
        </p>
      </div>
    </div>
  );

  const renderResultStage = () => (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold text-white">Challenge Complete</h2>
      <div className="flex justify-center items-center space-x-4">
        <Trophy className="w-16 h-16 text-yellow-400" />
        <div>
          <p className="text-xl text-white">Score: {score}%</p>
          <p className="text-red-200">Difficulty: {difficulty.toUpperCase()}</p>
        </div>
      </div>
      <button
        onClick={fullReset}
        className="flex items-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white"
      >
        <RefreshCcw size={20} /> Play Again
      </button>
    </div>
  );

  return (
    <div
      className="flex items-center justify-center px-4 py-10 md:py-16"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      {/* Name Dialog - Shown initially and can be reopened */}
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
        <DialogContent className="space-y-4">
          <h2 className="text-2xl md:text-2xl font-bold text-white text-center">
            Memory Challenge
          </h2>
          <div className="flex justify-center">
            <Brain className="w-16 h-16 text-red-300" />
          </div>
          <p className="text-md md:text-lg text-red-200 text-center">
            Test your memory skills!
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
            Start Challenge
          </button>
        </DialogContent>
      </Dialog>

      {/* Main Game Container */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl"
        >
          {stage === "setup" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <Brain className="w-16 h-16 text-red-300 mx-auto" />
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Memory Challenge
                </h1>
                <p className="text-red-200">Challenge your memory limits!</p>
              </div>

              <div className="space-y-4">
                <label className="text-white block">Select Difficulty:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="easy" className="bg-red-900">
                    Easy
                  </option>
                  <option value="medium" className="bg-red-900">
                    Medium
                  </option>
                  <option value="hard" className="bg-red-900">
                    Hard
                  </option>
                </select>
              </div>

              <button
                onClick={fetchChallenge}
                disabled={isLoading}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Generating Challenge...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles size={20} />
                    Start Challenge
                  </div>
                )}
              </button>
            </motion.div>
          )}

          {stage === "preview" && renderPreviewStage()}
          {stage === "recall" && renderRecallStage()}
          {stage === "result" && renderResultStage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MemoryChallenge;
