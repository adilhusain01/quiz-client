import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../api/axios";
import { CircularProgress } from "@mui/material";
import { Search, Trophy, Users, HelpCircle, SortAsc } from "lucide-react";

const LeaderBoards = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [allParticipants, setAllParticipants] = useState([]);
  const [nftData, setNftData] = useState({});
  const [nftLoading, setNftLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState(null);

  const fetchNFTData = async (participant) => {
    try {
      const tronWeb = window.tronLink.tronWeb;
      const nftContract = await tronWeb
        .contract()
        .at("TTgJKEbKmznmG6XtT9nHG6hQXHQ4geeGSx");

      console.log(nftContract);

      // Ensure nftTokenId is a valid number
      const tokenId = participant.nftTokenId;
      if (!tokenId || isNaN(tokenId)) {
        throw new Error("Invalid nftTokenId");
      }

      // Fetch NFT metadata using the correct method
      const metadata = await nftContract.getTokenDetails(tokenId).call();
      return metadata;
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      return null;
    }
  };

  const loadNFTData = async () => {
    const nftDataMap = {};
    for (const participant of participants) {
      if (participant.nftTokenId) {
        const data = await fetchNFTData(participant);
        if (data) {
          nftDataMap[participant.walletAddress] = data;
        }
      }
    }
    setNftData(nftDataMap);
  };

  useEffect(() => {
    if (participants.length > 0) {
      loadNFTData();
    }
  }, [participants]);

  useEffect(() => {
    const fetchLeaderBoards = async () => {
      try {
        const response = await axios.get(`/api/quiz/leaderboards/${id}`);
        setQuiz(response.data.quiz);
        setParticipants(response.data.participants || []);
        setAllParticipants(response.data.participants || []);
        setLoading(false);

        console.log(response.data);
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch leaderboard data");
        setLoading(false);
      }
    };

    fetchLeaderBoards();
  }, [id]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setParticipants(allParticipants);
    } else {
      const filteredParticipants = allParticipants.filter((participant) =>
        participant.participantName
          .toLowerCase()
          .includes(e.target.value.toLowerCase())
      );
      setParticipants(filteredParticipants);
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    if (sortOption === "name") {
      return a.participantName.localeCompare(b.participantName);
    } else if (sortOption === "score") {
      return b.score - a.score;
    }
    return 0;
  });

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "calc(100vh - 6rem)" }}
      >
        <CircularProgress sx={{ color: "white" }} />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ height: "calc(100vh - 6rem)" }}
      >
        <h1 className="text-2xl md:text-4xl font-bold text-white">
          Quiz not found!
        </h1>
      </div>
    );
  }

  const NFTModal = ({ nft, participant, onClose }) => {
    if (!nft) return null;

    const tronScanUrl = `https://nile.tronscan.org/#/contract/TTgJKEbKmznmG6XtT9nHG6hQXHQ4geeGSx/code`; // Replace with your contract address
    const ipfsUrl = nft?.imageUrl;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-lg w-full mx-4">
          <div className="space-y-4">
            <img
              src={nft?.imageUrl}
              alt="NFT"
              className="w-full md:h-128 object-cover rounded-xl"
            />
            <div className="space-y-2 text-white">
              <h3 className="text-lg md:text-xl font-bold">NFT Details</h3>
              <div className="flex flex-row  items-center justify-between">
                <p>
                  <span className="text-red-400">Participant:</span>{" "}
                  {nft?.participantName}
                </p>
                <p>
                  <span className="text-red-400">Quiz Creator:</span>{" "}
                  {nft?.quizCreatorName}
                </p>
              </div>
              <div className="flex flex-row items-center justify-between">
                <p>
                  <span className="text-red-400">Quiz Name:</span>{" "}
                  {nft?.quizName}
                </p>
                <p>
                  <span className="text-red-400">Token ID:</span>{" "}
                  {participant?.nftTokenId}
                </p>
              </div>
              {/* Verification Links */}
              <div className="space-y-2 mt-4">
                <h4 className="text-lg md:text-lg font-semibold">
                  Verify Ownership
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={tronScanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-1 md:py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <span className="text-sm md:text-md">Contract</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>

                  <a
                    href={ipfsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-4 py-1 md:py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <span className="text-sm md:text-md">See on IPFS</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                  <button
                    onClick={onClose}
                    className="text-sm md:text-md w-full py-1 md:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ height: "calc(100vh - 6rem)" }}
    >
      <div className="max-w-4xl w-full mx-auto px-4">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-2xl md:text-5xl font-bold text-white">
            Quiz Leaderboard &nbsp;
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
              #{id}
            </span>
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-white/20 shadow-xl space-y-6">
          {/* Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-row md:flex-col items-center justify-between md:items-start md:justify-start bg-white/5 p-3 md:p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white">
                <HelpCircle size={20} />
                <span className="text-sm font-medium">Questions</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-red-400 md:mt-2">
                {quiz.questions.length}
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center justify-between md:items-start md:justify-start bg-white/5 p-3 md:p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white">
                <Users size={20} />
                <span className="text-sm font-medium">Participants</span>
              </div>
              <p className="text-2xl md:text-2xl font-bold text-red-400 md:mt-2">
                {participants.length}
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center justify-between md:items-start md:justify-start bg-white/5 p-3 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white">
                <Trophy size={20} />
                <span className="text-sm font-medium">Status</span>
              </div>
              <p
                className={`text-lg md:text-2xl font-bold md:mt-2 ${
                  quiz.isPublic ? "text-green-400" : "text-pink-400"
                }`}
              >
                {quiz.isPublic ? "Open" : "Closed"}
              </p>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="hidden md:flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full md:w-64 px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 pl-10"
              />
              <Search
                className="absolute left-3 top-3.5 text-red-400"
                size={20}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <SortAsc size={20} className="text-red-400" />
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="w-full md:w-auto px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-400 appearance-none cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="score">Sort by Score</option>
              </select>
            </div>
          </div>

          {/* Participants List */}
          <div className="space-y-2 mt-6">
            {sortedParticipants.map((participant, index) => (
              <div
                key={participant.walletAddress}
                className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-red-400 font-medium">{index + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white">
                      {participant.participantName}
                    </span>
                  </div>
                </div>
                <button
                  className="text-pink-400 font-bold"
                  onClick={() =>
                    setSelectedNFT(nftData[participant.walletAddress])
                  }
                >
                  View NFT
                </button>
                <span className="text-pink-400 font-bold">
                  {participant.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedNFT && (
        <NFTModal
          nft={selectedNFT}
          participant={participants.find(
            (p) => nftData[p.walletAddress] === selectedNFT
          )}
          onClose={() => setSelectedNFT(null)}
        />
      )}
    </div>
  );
};

export default LeaderBoards;
