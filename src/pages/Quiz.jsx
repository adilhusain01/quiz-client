import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { Button, CircularProgress, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

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
  const navigate = useNavigate();

  const CONTRACT_ADDRESS = 'TUGxDDicnoCEAVvQAXCv5nucEDnSneQL7z'

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
        setLoading(false);
      } catch (err) {
        toast.error(err.response?.data?.error || 'An error occurred while fetching the quiz.');
        setLoading(false);
      }
    };

    fetchQuiz();
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
  
      console.log(response.data.score);
      toast.success('Quiz submitted successfully to the API!');
  
      // After receiving the response from the API, interact with the smart contract
      if (typeof window.tronLink !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
  
        // Use the score received from the API response to join the quiz on the contract
        const tx = await contract.joinQuiz(
          1,  // Assuming '1' is the quiz ID or use the correct ID from your contract
          response.data.score  // Pass the score from the API
        ).send({ from: walletAddress });
  
        console.log('Transaction ID:', tx);
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
  

  const handleNameSubmit = () => {
    if (!participantName) {
      toast.error('Please enter your name.');
      return;
    }
    handleJoinQuiz();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-violet" style={{ height: 'calc(100vh - 5rem)' }}>
        <CircularProgress sx={{color: 'white'}} />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center bg-violet" style={{ height: 'calc(100vh - 5rem)' }}>
        <Typography variant="h4" className="text-white font-bold">
          Quiz not found!
        </Typography>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="flex justify-center items-center bg-violet" style={{ height: 'calc(100vh - 5rem)' }}>
      <Dialog open={nameDialogOpen} onClose={() => {}}>
        <DialogTitle>Enter Your Name</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter your name to start the quiz.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNameSubmit} color="primary">
            Start Quiz
          </Button>
        </DialogActions>
      </Dialog>
      <div className="relative p-6 h-4/5 w-4/5 max-h-3xl max-w-4xl flex flex-col bg-indigo gap-[0.5rem] rounded-lg shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col h-full"
          >
            <div className="flex flex-row items-center justify-between mb-4">
              <Typography variant="h5" className="text-xl text-white font-bold">
                {currentQuestion.question}
              </Typography>
              <Button
                variant="contained"
                onClick={handleNextQuestion}
                disabled={!answers[currentQuestion._id]}
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: answers[currentQuestion._id] ? '#6b46c1' : 'white',
                  color: answers[currentQuestion._id] ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor: answers[currentQuestion._id] ? 'gray' : 'white',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'white',
                    color: 'black',
                  },
                }}
              >
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next' : 'Submit'}
              </Button>
            </div>
            <div className="flex flex-col items-end justify-between mb-4">
              <Typography variant="h6" className="text-lg text-white font-bold max-w-fit">
                Time Left: {timer}s
              </Typography>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${(timer / 30) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
                className="h-2 bg-purple-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 h-full">
              {Object.entries(currentQuestion.options).map(([key, value], index) => (
                <div
                  key={key}
                  className={`flex justify-center items-center rounded-lg text-white font-bold text-lg cursor-pointer transition-transform transform hover:scale-105 p-4 option-box-${index} ${answers[currentQuestion._id] === key ? 'border-2 border-white' : ''}`}
                  onClick={() => handleAnswerChange(currentQuestion._id, key)}
                >
                  {value}
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;