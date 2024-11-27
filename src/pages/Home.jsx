import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WalletContext } from "../context/WalletContext";
import toast from "react-hot-toast";
import axios from "../api/axios";
import AnimatedBackground from "./AnimatedBackground";
import {
  Play,
  FileText,
  BookOpen,
  Link2,
  Video,
  Keyboard,
  Brain,
} from "lucide-react";
import StatsSection from "../StatsSection";

const Home = () => {
  const { walletAddress, connectWallet } = useContext(WalletContext);
  const [joinQuizCode, setJoinQuizCode] = useState("");
  const navigate = useNavigate();

  const handleJoinQuiz = async () => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first.");
      await connectWallet();
      return;
    }

    try {
      await axios.post(
        `/api/quiz/verify/${joinQuizCode}`,
        {
          walletAddress,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Redirecting ...");
      navigate(`/quiz/${joinQuizCode}`);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "An error occurred while joining the quiz."
      );
    }
  };

  return (
    <div
      className="container mx-auto px-2 md:px-4 py-10 md:py-0"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      <div className="grid lg:grid-cols-2 justify-items-center items-center gap-8 md:mb-16">
        {/* Left Column - Hero Content */}
        <div className="max-w-lg md:max-w-xl md:w-full space-y-8">
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-3xl md:text-6xl font-bold text-white">
              Create & Share <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
                Quizzes &nbsp;
              </span>
              Instantly
            </h1>
          </div>

          {/* Quiz Actions Section */}
          <div className="space-y-6">
            {/* Create Quiz Options */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300">
              <h2 className="text-xl md:text-4xl font-semibold text-white mb-4">
                Create a Quiz By
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Link
                  to="/pdfToQuiz"
                  className="group bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="text-white" size={24} />
                    </div>
                    <span className="text-md md:text-lg font-semibold text-white">
                      PDF
                    </span>
                  </div>
                </Link>

                <Link
                  to="/promptToQuiz"
                  className="group bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="text-white" size={24} />
                    </div>
                    <span className="text-md md:text-lg text-center font-semibold text-white">
                      Prompt
                    </span>
                  </div>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/urlToQuiz"
                  className="group bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Link2 className="text-white" size={24} />
                    </div>
                    <span className="text-md md:text-lg font-semibold text-white">
                      Website Url
                    </span>
                  </div>
                </Link>

                <Link
                  to="/videoToQuiz"
                  className="group bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="text-white" size={24} />
                    </div>
                    <span className="text-md md:text-lg font-semibold text-white">
                      Video
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Additional Features Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300">
              <h2 className="text-xl md:text-4xl font-semibold text-white mb-4">
                Additional Games
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/typing"
                  className="group bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Keyboard className="text-white" size={24} />
                    </div>
                    <span className="text-md md:text-lg font-semibold text-white">
                      Typing Challenge
                    </span>
                  </div>
                </Link>

                <Link
                  to="/memoryChallenge"
                  className="group bg-white/10 backdrop-blur-lg rounded-2xl p-3 md:p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Brain className="text-white" size={24} />
                    </div>
                    <span className="text-md md:text-lg font-semibold text-white">
                      Memory Challenge
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Join Quiz Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <h2 className="text-xl md:text-4xl font-semibold text-white mb-4">
                Join a Quiz
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinQuizCode}
                  onChange={(e) => setJoinQuizCode(e.target.value)}
                  placeholder="Enter quiz code"
                  className="flex-1 px-2 md:px-4 py-1 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  onClick={handleJoinQuiz}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Play size={20} />
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block relative h-[800px] w-full">
          <AnimatedBackground />
        </div>
      </div>
      <StatsSection />
    </div>
  );
};

export default Home;
