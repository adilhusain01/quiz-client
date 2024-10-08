import React, { useState, useContext, useRef, useEffect } from 'react';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import TronLink from 'tronlink-web-extension';

const PdfToQuiz = () => {
  const { walletAddress } = useContext(WalletContext);
  const [formData, setFormData] = useState({
    creatorName: '',
    numParticipants: '',
    questionCount: '',
    rewardPerScore: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [participants, setParticipants] = useState([]);
  const qrRef = useRef();
  const fileInputRef = useRef();
  const CONTRACT_ADDRESS = 'TRwnBXXUiD3jRokv7KuoRE1d6UecZXv9js'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      toast.error('Please select a valid PDF file');
      setPdfFile(null);
      return;
    }
    setPdfFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Ensure wallet is connected
    if (!walletAddress) {
      toast.error('Please connect the wallet');
      return;
    }
  
    const { creatorName, numParticipants, questionCount, rewardPerScore } = formData;
  
    // Validate form data
    if (!creatorName || !numParticipants || !questionCount || !rewardPerScore || !pdfFile) {
      toast.error('All fields are required');
      return;
    }
    if (questionCount > 30) {
      toast.error('Question count cannot be more than 30');
      return;
    }
    if (numParticipants < 0 || questionCount < 0 || rewardPerScore < 0) {
      toast.error('Numbers cannot be negative');
      return;
    }
  
    const totalCost = rewardPerScore * numParticipants * questionCount * 1.1;
  
    try {
      // Submit the form data to the API first
      const dataToSubmit = new FormData();
      dataToSubmit.append('creatorName', creatorName);
      dataToSubmit.append('creatorWallet', walletAddress);
      dataToSubmit.append('numParticipants', numParticipants);
      dataToSubmit.append('pdf', pdfFile);
      dataToSubmit.append('questionCount', questionCount);
      dataToSubmit.append('rewardPerScore', rewardPerScore);
      dataToSubmit.append('totalCost', totalCost);
  
      setLoading(true);
  
      // API submission (first step)
      const response = await axios.post(`/api/quiz/create/pdf`, dataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      // Set quiz ID and notify success from API submission
      const quizId = response.data.quizId;
      setQuizId(quizId);
      // toast.success(`Quiz successfully created and submitted to the API.`);
  
      // Now handle the transaction with the smart contract
      if (typeof window.tronWeb !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
  
        // Convert totalCost to Sun and handle floating-point precision
        const budget = tronWeb.toBigNumber(tronWeb.toSun(totalCost)).integerValue();
  
        // Call the smart contract to create the quiz with the quizId
        const tx = await contract.createQuiz(
          quizId,  // Use the quizId from API response
          questionCount,
          rewardPerScore
        ).send({ callValue: budget, from: walletAddress });
  
        console.log('Transaction ID:', tx);
        toast.success('Quiz successfully created.');
  
        // Reset form data after both API and smart contract submission
        setFormData({
          creatorName: '',
          numParticipants: '',
          questionCount: '',
          rewardPerScore: ''
        });
        setPdfFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
  
        // Optionally open a modal or perform other actions
        setOpen(true);
      } else {
        toast.error('TronLink not found. Please install TronLink.');
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
        <h2 className='text-[1.75rem] text-center font-semibold text-white'>Pdf To Quiz</h2>
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
            min="0"
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
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md"
            required
            ref={fileInputRef}
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
                  <IconButton onClick={handleDownload} sx={{ color: '#6b46c1' }}>
                    <FileDownloadIcon />
                  </IconButton>
                  <Button onClick={handleClose} sx={{
                    color: '#6b46c1'
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
                <ul className="h-full w-full px-[1rem] flex flex-col gap-[0.5rem]" style={{ overflowY: 'scroll', scrollbarWidth: 'thin' }}>
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
};

export default PdfToQuiz;
