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
  const navigate = useNavigate();

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

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await axios.post('/api/quiz/submit', {
        quizId: id,
        participantName,
        walletAddress,
        answers
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      toast.success('Quiz submitted successfully!');
      navigate(`/leaderboards/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred while submitting the quiz.');
    }
  };

  const handleNameSubmit = () => {
    if (!participantName) {
      toast.error('Please enter your name.');
      return;
    }
    setNameDialogOpen(false);
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