import { Link } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";

const BrokenLink = () => {
  return (
    <div
      className="container mx-auto px-4 py-10 md:py-0"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
            404
          </h1>
          <h2 className="text-2xl md:text-4xl font-semibold text-white">
            Page Not Found
          </h2>
          <p className="text-white/60 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          to="/"
          className="group bg-white/10 backdrop-blur-lg rounded-xl px-6 py-3 border border-white/20 hover:bg-white/20 transition-all inline-flex items-center space-x-2"
        >
          <HomeIcon className="text-white" size={20} />
          <span className="text-white font-semibold">Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default BrokenLink;
