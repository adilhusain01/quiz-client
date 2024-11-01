// import React, { useState, useEffect, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { WalletContext } from '../context/WalletContext';
// import toast from 'react-hot-toast';
// import axios from '../api/axios';
// import { Button, CircularProgress, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
// import { motion, AnimatePresence } from 'framer-motion';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// const Quiz = () => {
//   const { id } = useParams();
//   const { walletAddress, connectWallet } = useContext(WalletContext);
//   const [loading, setLoading] = useState(true);
//   const [quiz, setQuiz] = useState(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [participantName, setParticipantName] = useState('');
//   const [nameDialogOpen, setNameDialogOpen] = useState(true);
//   const [timer, setTimer] = useState(30);
//   const [quizStarted, setQuizStarted] = useState(false);
//   const [quizEnded, setQuizEnded] = useState(false);
//   const navigate = useNavigate();
//   const [quizIds, setQuizIds] = useState([]);
//   const [quizQids, setQuizQids] = useState([]);
//   const [error, setError] = useState('');

//   const CONTRACT_ADDRESS = 'TThMA5VAr88dk9Q2ZbA4qPtsecXc1LRfZN'

//   useEffect(() => {
//     const fetchQuiz = async () => {
//       if (!walletAddress) {
//         toast.error('Please connect your wallet first.');
//         await connectWallet();
//         return;
//       }

//       try {
//         const response = await axios.post(`/api/quiz/verify/${id}`, { walletAddress }, {
//           headers: {
//             'Content-Type': 'application/json'
//           }
//         });
        
//         setQuiz(response.data);
//         setQuizStarted(response.data.isPublic);
//         setQuizEnded(response.data.isFinished);
//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.error);
//         // toast.error(err.response?.data?.error || 'An error occurred while fetching the quiz.');
//         setLoading(false);
//       }
//     };

//     fetchQuiz();
//     loadAllQuizzes(); // Ensure loadAllQuizzes is awaited

//   }, [id, walletAddress, connectWallet]);

//   useEffect(() => {
//     let interval;
//     if (quizStarted) {
//       interval = setInterval(() => {
//         setTimer((prevTimer) => {
//           if (prevTimer <= 1) {
//             handleNextQuestion();
//             return 30;
//           }
//           return prevTimer - 1;
//         });
//       }, 1000);
//     }

//     return () => clearInterval(interval);
//   }, [quizStarted, currentQuestionIndex]);

//   const handleAnswerChange = (questionId, answer) => {
//     setAnswers({
//       ...answers,
//       [questionId]: answer
//     });
//   };

//   const handleNextQuestion = () => {
//     const currentQuestion = quiz.questions[currentQuestionIndex];
//     if (!answers[currentQuestion._id]) {
//       setAnswers({
//         ...answers,
//         [currentQuestion._id]: 'no_answer'
//       });
//     }
//     setTimer(30);
//     if (currentQuestionIndex < quiz.questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     } else {
//       handleSubmitQuiz();
//     }
//   };

//   const handleJoinQuiz = async () => {
//     try {
//       const response = await axios.post(`/api/quiz/join/${id}`, {
//         walletAddress,
//         participantName
//       }, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//       toast.success('Joined quiz successfully!');
//       setNameDialogOpen(false);
//       setQuizStarted(true); // Start the quiz and timer
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'An error occurred while joining the quiz.');
//     }
//   };

//   const handleSubmitQuiz = async () => {
//     try {
//       // Submit the quiz answers to the API first
//       const response = await axios.post('/api/quiz/submit', {
//         quizId: id,
//         walletAddress,
//         answers
//       }, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
  
//       // toast.success('Quiz submitted successfully to the API!');
  
//       // Load all quizzes first, ensuring it completes before proceeding
  
//       // After loadAllQuizzes completes, proceed with smart contract interaction
//       if (typeof window.tronLink !== 'undefined') {
//         const tronWeb = window.tronLink.tronWeb;
//         const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
  
//         const qid = response.data.quizId;
        
//         const quizIndex = quizQids.indexOf(qid); // Get quiz index based on QID
  
//         const plusoneindex = quizIndex + 1; // Assuming quizIndex starts at 0
  
//         const score = response.data.score * 1000000; // Adjust score as per contract needs
  
//         // Use the score from the API response to join the quiz on the contract
//         const tx = await contract.joinQuiz(
//           plusoneindex, // Use the correct quiz index
//           score         // Pass the score from API
//         ).send({ from: walletAddress });
  
//         toast.success('Quiz score submitted successfully to the smart contract!');
//       } else {
//         toast.error('TronLink not found. Please install TronLink.');
//       }
  
//       // Navigate to leaderboards after successful submissions
//       navigate(`/leaderboards/${id}`);
//     } catch (err) {
//       // Handle errors from either API or smart contract interaction
//       toast.error(err.response?.data?.error || 'An error occurred while submitting the quiz.');
//     }
//   };
  
//   const loadAllQuizzes = async () => {
//     try {
//       if (typeof window.tronLink !== 'undefined') {
//         const tronWeb = window.tronLink.tronWeb;
//         const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

//         // Call the getAllQuizzes function
//         const result = await contract.getAllQuizzes().call();

//         // result will be an object with two arrays: quizIds and quizQids
//         setQuizIds(result[0]);
//         setQuizQids(result[1]);
//       } else {
//         toast.error('Failed to load quizzes');
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to load quizzes');
//     }
//   }

//   const handleNameSubmit = () => {
//     if (!participantName) {
//       toast.error('Please enter your name.');
//       return;
//     }
//     handleJoinQuiz();
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center bg-violet" style={{ height: 'calc(100vh - 5rem)' }}>
//         <CircularProgress sx={{color: 'white'}} />
//       </div>
//     )
//   }



//   if (quizEnded) {
//     return (
//       <div className="flex justify-center items-center bg-violet" style={{ height: 'calc(100vh - 5rem)' }}>
//         <Typography variant="h4" className="text-white font-bold">
//           The Quiz has Ended
//         </Typography>
//       </div>
//     );
//   }

//   if (!quizStarted) {
//     return (
//       <div className="flex flex-col justify-center items-center bg-violet gap-[1rem]" style={{ height: 'calc(100vh - 5rem)' }}>
//         <Typography variant="h4" className="text-white font-bold">
//           Quiz hasn't started yet
//         </Typography>
//         <Button onClick={() => window.location.reload()} sx={{
//           backgroundColor: '#333333',
//           color: 'white',
//           padding: '0.5rem 1rem',
//           borderRadius: '0.5rem',
//         }}>
//           Refresh
//         </Button>
//       </div>
//     );
//   }

//   const currentQuestion = quiz.questions[currentQuestionIndex];

//   return (
//     <div className="flex justify-center items-center" style={{ height: 'calc(100vh - 6rem)' }}>
//       <Dialog open={nameDialogOpen} onClose={() => {}}>
//         <DialogTitle>Enter Your Name</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Please enter your name to start the quiz.
//           </DialogContentText>
//           <TextField
//             autoFocus
//             margin="dense"
//             label="Name"
//             type="text"
//             fullWidth
//             value={participantName}
//             onChange={(e) => setParticipantName(e.target.value)}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleNameSubmit} color="primary">
//             Start Quiz
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <div className="relative p-6 h-4/5 w-4/5 max-h-3xl max-w-4xl flex flex-col bg-indigo gap-[0.5rem] rounded-lg shadow-xl">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentQuestionIndex}
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5 }}
//             className="flex flex-col h-full"
//           >
//             <div className="flex flex-row items-center justify-between mb-4">
//               <Typography variant="h5" className="text-xl text-white font-bold">
//                 {currentQuestion.question}
//               </Typography>
//               <Button
//                 variant="contained"
//                 onClick={handleNextQuestion}
//                 disabled={!answers[currentQuestion._id]}
//                 sx={{
//                   fontSize: '0.9rem',
//                   fontWeight: 'bold',
//                   backgroundColor: answers[currentQuestion._id] ? '#6b46c1' : 'white',
//                   color: answers[currentQuestion._id] ? 'white' : 'black',
//                   '&:hover': {
//                     backgroundColor: answers[currentQuestion._id] ? 'gray' : 'white',
//                   },
//                   '&.Mui-disabled': {
//                     backgroundColor: 'white',
//                     color: 'black',
//                   },
//                 }}
//               >
//                 {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Submit'}
//               </Button>
//             </div>
//             <div className="flex flex-col items-end justify-between mb-4">
//               <Typography variant="h6" className="text-lg text-white font-bold max-w-fit">
//                 Time Left: {timer}s
//               </Typography>
//               <motion.div
//                 initial={{ width: '100%' }}
//                 animate={{ width: `${(timer / 30) * 100}%` }}
//                 transition={{ duration: 1, ease: 'linear' }}
//                 className="h-2 bg-purple-600"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4 h-full">
//               {Object.entries(currentQuestion.options).map(([key, value], index) => (
//                 <div
//                   key={key}
//                   className={`relative flex justify-center items-center rounded-lg text-black font-bold text-lg cursor-pointer transition-transform transform hover:scale-105 p-4 option-box-${index} ${answers[currentQuestion._id] === key ? 'border-2 border-white' : ''}`}
//                   onClick={() => handleAnswerChange(currentQuestion._id, key)}
//                 >
//                   {value}
//                   {answers[currentQuestion._id] === key && (
//                     <CheckCircleIcon
//                       sx={{
//                         position: 'absolute',
//                         top: 8,
//                         right: 8,
//                         fontSize: '2rem',
//                         color: '#9333ea',
//                         backgroundColor: 'white',
//                         borderRadius: '50%',
//                       }}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };

// export default Quiz;



import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { Button, CircularProgress, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Timer, ArrowRight, CheckCircle2, RefreshCcw, Trophy, Loader2 } from 'lucide-react';

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
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const navigate = useNavigate();
  const [quizIds, setQuizIds] = useState([]);
  const [quizQids, setQuizQids] = useState([]);
  const [error, setError] = useState('');

  const CONTRACT_ADDRESS = 'TThMA5VAr88dk9Q2ZbA4qPtsecXc1LRfZN'

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!walletAddress) {
        toast.error('Please connect your wallet first.');
        await connectWallet();
        return;
      }

      try {
        const response = await axios.post(`/api/quiz/verify/${id}`, { walletAddress }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(response.data);
        setQuiz(response.data);
        setQuizStarted(response.data.isPublic);
        setQuizEnded(response.data.isFinished);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error);
        // toast.error(err.response?.data?.error || 'An error occurred while fetching the quiz.');
        setLoading(false);
      }
    };

    fetchQuiz();
    loadAllQuizzes(); // Ensure loadAllQuizzes is awaited

  }, [id, walletAddress, connectWallet]);

  useEffect(() => {
    let interval;
    if (quizStarted) {
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
  }, [quizStarted, currentQuestionIndex]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNextQuestion = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!answers[currentQuestion._id]) {
      setAnswers({
        ...answers,
        [currentQuestion._id]: 'no_answer'
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
      const response = await axios.post(`/api/quiz/join/${id}`, {
        walletAddress,
        participantName
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      toast.success('Joined quiz successfully!');
      setNameDialogOpen(false);
      setQuizStarted(true); // Start the quiz and timer
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred while joining the quiz.');
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      // Submit the quiz answers to the API first
      const response = await axios.post('/api/quiz/submit', {
        quizId: id,
        walletAddress,
        answers
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // toast.success('Quiz submitted successfully to the API!');
  
      // Load all quizzes first, ensuring it completes before proceeding
  
      // After loadAllQuizzes completes, proceed with smart contract interaction
      if (typeof window.tronLink !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
  
        const qid = response.data.quizId;
        
        const quizIndex = quizQids.indexOf(qid); // Get quiz index based on QID
  
        const plusoneindex = quizIndex + 1; // Assuming quizIndex starts at 0
  
        const score = response.data.score * 1000000; // Adjust score as per contract needs
  
        // Use the score from the API response to join the quiz on the contract
        const tx = await contract.joinQuiz(
          plusoneindex, // Use the correct quiz index
          score         // Pass the score from API
        ).send({ from: walletAddress });
  
        toast.success('Quiz score submitted successfully to the smart contract!');
      } else {
        toast.error('TronLink not found. Please install TronLink.');
      }
  
      // Navigate to leaderboards after successful submissions
      navigate(`/leaderboards/${id}`);
    } catch (err) {
      // Handle errors from either API or smart contract interaction
      toast.error(err.response?.data?.error || 'An error occurred while submitting the quiz.');
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
  }

  const handleNameSubmit = () => {
    if (!participantName) {
      toast.error('Please enter your name.');
      return;
    }
    handleJoinQuiz();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 6rem)' }}>
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (quizEnded) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 6rem)' }}>
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 text-purple-400 mx-auto" />
          <h1 className="text-4xl font-bold text-white">Quiz has ended</h1>
          <p className="text-purple-200">Check the leaderboard to see the results</p>
        </div>
      </div>
    );
  }


  if (!quizStarted) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 6rem)' }}>
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-white">
            Quiz hasn't started yet
          </h1>
          <p className="text-purple-200">Please wait for the quiz to begin</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
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
    <div className="flex items-center justify-center px-4" style={{ height: 'calc(100vh - 6rem)' }}>
      {/* Name Dialog */}
      <Dialog 
        open={nameDialogOpen}
        PaperProps={{
          style: {
            backgroundColor: '#1a103d',
            backgroundImage: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.1), rgba(79, 70, 229, 0.1))',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '400px',
            width: '100%',
          }
        }}
      >
        <DialogContent className="space-y-4">
          <h2 className="text-2xl font-bold text-white text-center">Welcome to the Quiz</h2>
          <p className="text-purple-200 text-center">Please enter your name to begin</p>
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={handleNameSubmit}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
          >
            Start Quiz
          </button>
        </DialogContent>
      </Dialog>

      {/* Main Quiz Container */}
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl space-y-6"
          >
            {/* Timer and Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-purple-200">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
                </span>
                <div className="flex items-center gap-2 text-white">
                  <Timer size={20} className="text-purple-400" />
                  <span className="font-medium">{timer}s</span>
                </div>
              </div>
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timer / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-white">{currentQuestion.question}</h2>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <motion.button
                  key={key}
                  onClick={() => handleAnswerChange(currentQuestion._id, key)}
                  className={`relative p-6 text-left rounded-xl border transition-all ${
                    answers[currentQuestion._id] === key
                      ? 'bg-purple-500/20 border-purple-400'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-white font-medium">{value}</span>
                  {answers[currentQuestion._id] === key && (
                    <CheckCircle2 className="absolute top-4 right-4 text-purple-400" size={24} />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion._id]}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  answers[currentQuestion._id]
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;
