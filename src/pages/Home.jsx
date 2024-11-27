import { Link } from "react-router-dom";
import { Keyboard, Brain, Play } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import StatsSection from "../StatsSection";

const Home = () => {
  return (
    <div
      className="container mx-auto px-4 py-10 md:py-0"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      <div className="grid lg:grid-cols-2 justify-items-center items-center gap-8 md:mb-16">
        {/* Left Column - Hero Content */}
        <div className="max-w-xl space-y-8">
          <div className="text-center md:text-left space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              Learn Through
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
                Interactive Games
              </span>
            </h1>
          </div>

          {/* Main Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/quiz-options"
              className="group bg-white/10 backdrop-blur-lg rounded-xl p-10 border border-white/20 hover:bg-white/20 transition-all"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="text-white" size={24} />
                </div>
                <span className="text-lg font-semibold text-white">Quiz</span>
              </div>
            </Link>

            <Link
              to="/typing"
              className="group bg-white/10 backdrop-blur-lg rounded-xl p-10 border border-white/20 hover:bg-white/20 transition-all"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Keyboard className="text-white" size={24} />
                </div>
                <span className="text-lg font-semibold text-white">Typing</span>
              </div>
            </Link>

            <Link
              to="/memoryChallenge"
              className="group bg-white/10 backdrop-blur-lg rounded-xl p-10 border border-white/20 hover:bg-white/20 transition-all"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="text-white" size={24} />
                </div>
                <span className="text-lg font-semibold text-white">Memory</span>
              </div>
            </Link>
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
