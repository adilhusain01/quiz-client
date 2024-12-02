import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WalletContext } from "../context/WalletContext";
import toast from "react-hot-toast";
import axios from "../api/axios";
import { Play, FileText, BookOpen, Link2, Video } from "lucide-react";

const QuizOptions = () => {
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
      await axios.post(`/api/quiz/verify/${joinQuizCode}`, {
        walletAddress,
      });
      toast.success("Redirecting ...");
      navigate(`/quiz/${joinQuizCode}`);
    } catch (err) {
      toast.error(
        err.response?.data?.error || "An error occurred while joining the quiz."
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <h1 className="text-4xl font-bold text-white text-center mb-12">
        Quiz Options
      </h1>

      <div className="max-w-xl mx-auto space-y-8">
        {/* Create Quiz Options */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Create a Quiz By
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { path: "/pdfToQuiz", icon: FileText, label: "PDF" },
              { path: "/promptToQuiz", icon: BookOpen, label: "Prompt" },
              { path: "/urlToQuiz", icon: Link2, label: "Website URL" },
              { path: "/videoToQuiz", icon: Video, label: "Video" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="text-white" size={24} />
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Join Quiz Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Join a Quiz
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={joinQuizCode}
              onChange={(e) => setJoinQuizCode(e.target.value)}
              placeholder="Enter quiz code"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              onClick={handleJoinQuiz}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Play size={20} />
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizOptions;
