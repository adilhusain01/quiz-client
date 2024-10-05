import React, { useState, useContext, useRef } from 'react';
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
    expiry: '',
    numParticipants: '',
    questionCount: ''
  });
  const [quizId, setQuizId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const qrRef = useRef();

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
    const { creatorName, prompt, expiry, numParticipants, questionCount } = formData;
    if (!creatorName || !prompt || !expiry || !numParticipants || !questionCount) {
      toast.error('All fields are required');
      return;
    }
    if (questionCount > 30) {
      toast.error('Question count cannot be more than 30');
      return;
    }

    const dataToSubmit = {
      creatorName,
      prompt,
      expiry,
      numParticipants,
      questionCount,
      creatorWallet: walletAddress
    };

    setLoading(true);

    try {
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
        expiry: '',
        numParticipants: '',
        questionCount: ''
      });
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

  const baseUrl = import.meta.env.VITE_CLIENT_URI;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
          <textarea 
            name="prompt" 
            placeholder="Title" 
            value={formData.prompt} 
            onChange={handleChange} 
            className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
            required
          />
          <input 
            type="date" 
            name="expiry" 
            placeholder="Expiry Date" 
            value={formData.expiry} 
            onChange={handleChange} 
            className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
            required
            min={minDate} // Set the minimum date to tomorrow
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
          <button 
            type="submit" 
            className="px-[0.5rem] py-[0.5rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Quiz'}
          </button>
        </form>
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>Quiz Created!</DialogTitle>
          <DialogContent>
            <div className="flex flex-col items-center justify-center gap-[1rem]" ref={qrRef}>
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
            </div>
          </DialogContent>
          <DialogActions>
            <IconButton onClick={handleDownload} color="primary">
              <FileDownloadIcon />
            </IconButton>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </span>
    </section>
  );
}

export default PromptToQuiz;