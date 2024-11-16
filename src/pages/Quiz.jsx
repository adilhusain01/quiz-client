import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { Dialog, DialogContent } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer,
  ArrowRight,
  CheckCircle2,
  RefreshCcw,
  Trophy,
  Loader2,
} from 'lucide-react';

const Quiz = () => {
  const { id } = useParams();
  const { walletAddress, connectWallet } = useContext(WalletContext);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [participantName, setParticipantName] = useState('');
  const [nameDialogOpen, setNameDialogOpen] = useState(true);
  const [timer, setTimer] = useState(30);
  const [userJoined, setUserJoined] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [quizIds, setQuizIds] = useState([]);
  const [quizQids, setQuizQids] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [metadata, setMetadata] = useState({});

  const CONTRACT_ADDRESS = 'TNsLWvFRGGE5MQPqyMaURh1i3efiTC4PQL';

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!walletAddress) {
        toast.error('Please connect your wallet first.');
        await connectWallet();
        return;
      }

      try {
        const response = await axios.post(
          `/api/quiz/verify/${id}`,
          { walletAddress },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        setQuiz(response.data);
        setQuizStarted(response.data.isPublic);
        setQuizEnded(response.data.isFinished);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error);
        console.log(err);

        if (err.response?.status === 404) setMessage('Quiz not found');
        setLoading(false);

        toast.error(
          err.response?.data?.error ||
            'An error occurred while fetching the quiz.'
        );
      }
    };

    fetchQuiz();
    loadAllQuizzes(); // Ensure loadAllQuizzes is awaited
  }, [id, walletAddress, connectWallet]);

  useEffect(() => {
    let interval;
    if (quizStarted && !isSubmitting && !quizEnded && userJoined) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            handleNextQuestion();
            return 30;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [quizStarted, currentQuestionIndex, isSubmitting, quizEnded, userJoined]);

  const handleAnswerChange = (questionId, answer) => {
    if (isSubmitting || !userJoined) return; // Prevent answer changes during submission
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleNextQuestion = () => {
    if (isSubmitting || !userJoined) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!answers[currentQuestion._id]) {
      setAnswers({
        ...answers,
        [currentQuestion._id]: 'no_answer',
      });
    }
    setTimer(30);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleJoinQuiz = async () => {
    try {
      await axios.post(
        `/api/quiz/join/${id}`,
        {
          walletAddress,
          participantName,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Joined quiz successfully!');
      await loadAllQuizzes();
      setNameDialogOpen(false);
      setUserJoined(true);
      setTimer(30);
      setQuizStarted(true); // Start the quiz and timer
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'An error occurred while joining the quiz.'
      );
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      // Submit the quiz answers to the API first
      const response = await axios.post(
        '/api/quiz/submit',
        {
          quizId: id,
          walletAddress,
          answers,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // toast.success('Quiz submitted successfully to the API!');

      // Load all quizzes first, ensuring it completes before proceeding

      // After loadAllQuizzes completes, proceed with smart contract interaction
      if (typeof window.tronLink !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

        const qid = response.data.quizId;
        const quizIndex = quizQids.indexOf(qid); // Get quiz index based on QID
        const plusoneindex = quizIndex + 1; // Assuming quizIndex starts at 0
        console.log('Plus one index:  ', plusoneindex);
        const score = response.data.score * 1000000; // Adjust score as per contract needs

        // Use the score from the API response to join the quiz on the contract
        await contract
          .joinQuiz(
            plusoneindex, // Use the correct quiz index
            score,
            participantName // Pass the score from API
          )
          .send({ from: walletAddress });

        toast.success(
          'Quiz score submitted successfully to the smart contract!'
        );
        navigate(`/leaderboards/${id}`);
        // const responsemetadata = await fetchNFTMetadata(1);
        // setMetadata(responsemetadata);
        // console.log(responsemetadata)
      } else {
        toast.error('TronLink not found. Please install TronLink.');
        setIsSubmitting(false);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          'An error occurred while submitting the quiz.'
      );
      console.log(err);
      setIsSubmitting(false);
    }
  };

  const fetchNFTMetadata = async (nftId) => {
    try {
      if (typeof window.tronLink !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

        // Fetch the NFT data by calling the `nfts` function
        const nftData = await contract.nfts(nftId).call();

        // Extract the metadataURI
        const metadataURI = nftData.metadataURI;

        // Parse the JSON metadataURI
        const metadata = JSON.parse(metadataURI);

        return metadata; // Return the parsed metadata object
      } else {
        toast.error('TronLink wallet not found!');
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch NFT metadata:', error);
      toast.error('Error fetching NFT metadata');
      return null;
    }
  };

  const loadAllQuizzes = async () => {
    try {
      if (typeof window.tronLink !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

        // Call the getAllQuizzes function
        const result = await contract.getAllQuizzes().call();

        // result will be an object with two arrays: quizIds and quizQids
        setQuizIds(result[0]);
        setQuizQids(result[1]);
      } else {
        toast.error('Failed to load quizzes');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load quizzes');
    }
  };

  const handleNameSubmit = () => {
    if (!participantName) {
      toast.error('Please enter your name.');
      return;
    }
    handleJoinQuiz();
  };

  if (loading) {
    return (
      <div
        className='flex items-center justify-center'
        style={{ height: 'calc(100vh - 6rem)' }}
      >
        <Loader2 className='w-6 md:w-8 h-6 md:h-8 text-red-400 animate-spin' />
      </div>
    );
  }

  if (quizEnded) {
    return (
      <div
        className='flex items-center justify-center'
        style={{ height: 'calc(100vh - 6rem)' }}
      >
        <div className='text-center space-y-4'>
          <Trophy className='w-12 md:w-16 h-12 md:h-16 text-red-400 mx-auto' />
          <h1 className='text-2xl md:text-4xl font-bold text-white'>
            Quiz has ended
          </h1>
          <p className='text-red-200'>
            Check the leaderboard to see the results
          </p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div
        className='flex items-center justify-center'
        style={{ height: 'calc(100vh - 6rem)' }}
      >
        <div className='text-center flex flex-col items-center justify-center space-y-6'>
          <h1 className='text-2xl md:text-4xl font-bold text-white'>
            {message.length > 0 ? message : "Quiz hasn't started yet"}
          </h1>
          <p className='text-md md:text-lg text-red-200'>
            {message.length > 0 ? '' : 'Please wait for the quiz to begin'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='text-md md:text-lg flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity'
          >
            <RefreshCcw size={20} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div
      className='flex items-center justify-center px-4'
      style={{ height: 'calc(100vh - 6rem)' }}
    >
      {/* Name Dialog remains the same */}
      <Dialog
        open={nameDialogOpen}
        PaperProps={{
          style: {
            backgroundColor: '#7f1d1d',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '400px',
            width: '100%',
          },
        }}
      >
        <DialogContent
          className='space-y-4'
          style={{ backgroundColor: '#7f1d1d' }}
        >
          <h2 className='text-xl md:text-2xl font-bold text-white text-center'>
            Welcome to the Quiz
          </h2>
          <p className='text-md md:text-lg text-red-200 text-center'>
            Please enter your name to begin
          </p>
          <input
            type='text'
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder='Enter your name'
            className='w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400'
          />
          <button
            onClick={handleNameSubmit}
            className='w-full px-6 py-2 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity'
          >
            Start Quiz
          </button>
        </DialogContent>
      </Dialog>

      {/* Main Quiz Container */}
      {userJoined ? (
        <div className='w-full max-w-4xl'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl space-y-6'
            >
              {/* Timer and Progress - Only show if not submitting */}
              {!isSubmitting && (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-red-200'>
                      Question {currentQuestionIndex + 1} of{' '}
                      {quiz?.questions?.length}
                    </span>
                    <div className='flex items-center gap-2 text-white'>
                      <Timer size={20} className='text-red-400' />
                      <span className='font-medium'>{timer}s</span>
                    </div>
                  </div>
                  <div className='relative h-2 bg-white/10 rounded-full overflow-hidden'>
                    <motion.div
                      initial={{ width: '100%' }}
                      animate={{ width: `${(timer / 30) * 100}%` }}
                      transition={{ duration: 1, ease: 'linear' }}
                      className='absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-pink-500'
                    />
                  </div>
                </div>
              )}

              {/* Show loading state during submission */}
              {isSubmitting ? (
                <div className='flex flex-col items-center justify-center py-8 space-y-4'>
                  <Loader2 className='w-12 h-12 text-red-400 animate-spin' />
                  <p className='text-white text-xl font-medium'>
                    Submitting Quiz...
                  </p>
                  <p className='text-red-200 text-center'>
                    Please wait while we process your submission
                  </p>
                </div>
              ) : (
                <>
                  {/* Question */}
                  <h2 className='text-lg md:text-2xl font-bold text-white'>
                    {currentQuestion.question}
                  </h2>

                  {/* Options Grid */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {Object.entries(currentQuestion.options).map(
                      ([key, value]) => (
                        <motion.button
                          key={key}
                          onClick={() =>
                            handleAnswerChange(currentQuestion._id, key)
                          }
                          className={`relative p-3 md:p-6 text-md md:text-lg text-left rounded-lg md:rounded-xl border transition-all ${
                            answers[currentQuestion._id] === key
                              ? 'bg-red-500/20 border-red-400'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className='text-white font-medium'>
                            {value}
                          </span>
                          {answers[currentQuestion._id] === key && (
                            <CheckCircle2
                              className='absolute top-4 right-4 text-red-400'
                              size={24}
                            />
                          )}
                        </motion.button>
                      )
                    )}
                  </div>

                  {/* Navigation */}
                  <div className='flex justify-end'>
                    <button
                      onClick={handleNextQuestion}
                      disabled={!answers[currentQuestion._id]}
                      className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-medium transition-all ${
                        answers[currentQuestion._id]
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90'
                          : 'bg-white/10 text-white/50 cursor-not-allowed'
                      }`}
                    >
                      {currentQuestionIndex < quiz.questions.length - 1
                        ? 'Next Question'
                        : 'Submit Quiz'}
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className='text-center space-y-4'>
          <h2 className='text-2xl font-bold text-white'>
            Please enter your name to start the quiz
          </h2>
          <p className='text-red-200'>Your timer will begin after you join</p>
        </div>
      )}
    </div>
  );
};

export default Quiz;
