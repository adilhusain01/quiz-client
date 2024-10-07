import React, { useState, useContext, useRef, useEffect } from 'react';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const PromptToQuiz = () => {
  const { walletAddress } = useContext(WalletContext);
  const [formData, setFormData] = useState({
    creatorName: '',
    prompt: '',
    numParticipants: '',
    questionCount: '',
    rewardPerScore: ''
  });
  const [quizId, setQuizId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [participants, setParticipants] = useState([]);
  const qrRef = useRef();
  const CONTRACT_ADDRESS = 'TUGxDDicnoCEAVvQAXCv5nucEDnSneQL7z'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      toast.error('Please connect the wallet');
      return;
    }
    const { creatorName, prompt, numParticipants, questionCount, rewardPerScore } = formData;
    if (!creatorName || !prompt || !numParticipants || !questionCount || !rewardPerScore) {
      toast.error('All fields are required');
      return;
    }
    if (questionCount > 30) {
      toast.error('Question count cannot be more than 30');
      return;
    }

    const totalCost = rewardPerScore * numParticipants * questionCount * 1.1;

    const dataToSubmit = {
      creatorName,
      prompt,
      numParticipants,
      questionCount,
      rewardPerScore,
      creatorWallet: walletAddress,
      totalCost
    };

      const response = await axios.post(`/api/quiz/create/prompt`, dataToSubmit, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setQuizId(response.data.quizId);
      setOpen(true);
      toast.success(`Quiz created successfully`);

      setFormData({
        creatorName: '',
        prompt: '',
        numParticipants: '',
        questionCount: '',
        rewardPerScore: ''
      });

    } else {
      toast.error('TronLink not found. Please install TronLink')
    }
    } catch (error) {
      console.error(error.response?.data?.message || 'An error occurred while creating the quiz');
      toast.error(error.response?.data?.message || 'An error occurred while creating the quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDownload = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `quiz-${quizId}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${baseUrl}/quiz/${quizId}`);
    toast.success('Link copied to clipboard');
  };

  const handleStartQuiz = async () => {
    try {
      await axios.put(`/api/quiz/update/${quizId}`, { isPublic: true });
      setIsPublic(true);
      toast.success('Quiz has started');
    } catch (error) {
      toast.error('Failed to start the quiz');
    }
  };

  const handleStopQuiz = async () => {
    try {
      await axios.put(`/api/quiz/update/${quizId}`, { isPublic: false });
      setIsPublic(false);
      toast.success('Quiz has ended');
    } catch (error) {
      toast.error('Failed to end the quiz');
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await axios.get(`/api/quiz/leaderboards/${quizId}`);
      setParticipants(response.data.participants || []);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchParticipants();
      const interval = setInterval(fetchParticipants, 1000);
      return () => clearInterval(interval);
    }
  }, [quizId]);

  const baseUrl = import.meta.env.VITE_CLIENT_URI;

  return (
    <section 
      className="w-full flex justify-center items-center"
      style={{ height: 'calc(100vh - 5rem)' }}
    >
      <span className='flex flex-col gap-[1rem]'>
        <h2 className='text-[1.75rem] text-center font-semibold text-white'>Prompt To Quiz</h2>
        <form 
          onSubmit={handleSubmit} 
          className="m-auto p-[1rem] flex flex-col items-center justify-center bg-white gap-[0.5rem] w-[20rem] rounded-md shadow-md"
        >
          <input 
            type="text" 
            name="creatorName" 
            placeholder="Creator Name" 
            value={formData.creatorName} 
            onChange={handleChange} 
            className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
            required
          />
          <input 
            type="number" 
            name="numParticipants" 
            placeholder="Number of Participants" 
            value={formData.numParticipants} 
            onChange={handleChange} 
            className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
            required
          />
          <input 
            type="number" 
            name="questionCount" 
            placeholder="Number of Questions" 
            value={formData.questionCount} 
            onChange={handleChange} 
            className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
            required
            min="1"
            max="30"
          />
          <input 
            type="text" 
            name="rewardPerScore" 
            placeholder="Reward Per Score" 
            value={formData.rewardPerScore} 
            onChange={handleChange} 
            className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
            required
            pattern="^\d+(\.\d{1,2})?$"
          />
          <textarea 
            name="prompt" 
            placeholder="Topic" 
            value={formData.prompt} 
            onChange={handleChange} 
            className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
            required
          />
          <button 
            type="submit" 
            className="px-[0.5rem] py-[0.5rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Quiz'}
          </button>
        </form>
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth >
            <DialogContent>
            <div className="flex flex-row gap-[2rem]">
              <div className="flex flex-col items-center justify-center gap-[1rem]" ref={qrRef} style={{ flex: 1 }}>
                <h2 className="text-[1.25rem] text-center text-black">Quiz ID: <span className='text-[1.5rem] text-violet font-bold'>{quizId}</span></h2>
                <QRCodeSVG value={`${baseUrl}/quiz/${quizId}`} size={256} />
                <TextField
                  label="Quiz Link"
                  value={`${baseUrl}/quiz/${quizId}`}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleCopy}>
                          <ContentCopyIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
            <DialogActions>
              <IconButton onClick={handleDownload}  sx={{
                    color : '#6b46c1'
                  }}>
                <FileDownloadIcon />
              </IconButton>
              <Button onClick={handleClose} sx={{
                    color : '#6b46c1'
                  }}>
                Close
              </Button>
              <Button 
                variant="contained" 
                onClick={handleStartQuiz} 
                disabled={isPublic || loading}
                sx={{
                  backgroundColor: '#6b46c1',
                }}
              >
                Start Quiz
              </Button>
              <Button 
                variant="contained" 
                onClick={handleStopQuiz} 
                disabled={!isPublic || loading}
                sx={{
                  backgroundColor: '#6b46c1',
                }}
              >
                Stop Quiz
              </Button>
            </DialogActions>
            </div>
            <div className="flex flex-col items-center justify-center gap-[1rem]" style={{ flex: 1 }}>
            <h2 className="text-[1.25rem] text-center text-black">Participants</h2>
            <ul className="h-full w-full px-[1rem] flex flex-col gap-[0.5rem]" style={{overflowY: 'scroll', scrollbarWidth: 'thin'}}>
              {participants.map((participant) => (
                <li key={participant.walletAddress} className="text-[1rem] text-black border border-transparent border-b-gray-300 flex flex-row items-center justify-between">
                  <span>
                    {participant.participantName}
                  </span>
                  <span>
                    {participant.score !== null ? participant.score : 'N/A'}
                  </span>
                </li>
              ))}
            </ul>
            </div>
            </div>
            </DialogContent>
        </Dialog>
      </span>
    </section>
  );
}

export default PromptToQuiz;