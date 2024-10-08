import React, { useState, useContext, useRef, useEffect } from 'react';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogActions, Button, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

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
  const [startDisabled, setStartDisabled] = useState(false);
  const [closeDisabled, setCloseDisabled] = useState(true);
  const qrRef = useRef();
  const fileInputRef = useRef();
  const [quizIds, setQuizIds] = useState([]);
  const [quizQids, setQuizQids] = useState([]);
  const CONTRACT_ADDRESS = 'TThMA5VAr88dk9Q2ZbA4qPtsecXc1LRfZN';

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

    if (!walletAddress) {
      toast.error('Please connect the wallet');
      return;
    }

    const { creatorName, numParticipants, questionCount, rewardPerScore } = formData;

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
      const dataToSubmit = new FormData();
      dataToSubmit.append('creatorName', creatorName);
      dataToSubmit.append('creatorWallet', walletAddress);
      dataToSubmit.append('numParticipants', numParticipants);
      dataToSubmit.append('pdf', pdfFile);
      dataToSubmit.append('questionCount', questionCount);
      dataToSubmit.append('rewardPerScore', rewardPerScore);
      dataToSubmit.append('totalCost', totalCost);

      setLoading(true);

      const response = await axios.post(`/api/quiz/create/pdf`, dataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const quizId = response.data.quizId;
      setQuizId(quizId);

      if (typeof window.tronWeb !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

        const budget = tronWeb.toBigNumber(tronWeb.toSun(totalCost)).integerValue();

        const tx = await contract.createQuiz(
          quizId,
          questionCount,
          rewardPerScore
        ).send({ callValue: budget, from: walletAddress });

        toast.success('Quiz successfully created.');
        loadAllQuizzes();

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

        setLoading(false);
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
setStartDisabled(true);
    try {
      await axios.put(`/api/quiz/update/${quizId}`, { isPublic: false, isFinished: true });
      setIsPublic(false);
      setCloseDisabled(false);

      if (typeof window.tronWeb !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

        const quizIndex = quizQids.indexOf(quizId);
        const plusoneindex = quizIndex + 1;
        const tx = await contract.endQuiz(plusoneindex).send({ from: walletAddress });
      } else {
        toast.error("Failed to End Quiz");
      }
      toast.success('Quiz has ended');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to end the quiz');
    }
  };

  const loadAllQuizzes = async () => {
    try {
      if (typeof window.tronLink !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

        const result = await contract.getAllQuizzes().call();

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
      className="mt-[-5rem] w-full flex items-center justify-center"
      style={{ height: 'calc(100vh - 5rem)' }}
    >
      <span className='flex flex-col gap-[1rem]'>
        <h2 className='text-[3.125rem] text-center font-semibold text-white'>Pdf To Quiz</h2>

        <form
          onSubmit={handleSubmit}
          className="m-auto p-[1.5rem] flex flex-col items-center justify-center bg-purple-800 gap-[0.75rem] w-[45rem] rounded-lg shadow-2xl"
        >
          <input
            type="text"
            name="creatorName"
            placeholder="Creator Name"
            value={formData.creatorName}
            onChange={handleChange}
            className="px-[1rem] py-[1.5rem] text-[1.1rem] text-white placeholder-white focus:outline-none w-full rounded-md"
            required
            style={{
              backgroundColor: '#9333ea',
              boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
            }}
            autoComplete='off'
          />
          <div className='grid grid-cols-3 gap-[0.5rem]'>
            <input
              type="number"
              name="numParticipants"
              placeholder="No. of Participants"
              value={formData.numParticipants}
              onChange={handleChange}
              className="px-[1rem] py-[1.5rem] text-[1.1rem] text-white placeholder-white focus:outline-none w-full rounded-md"
              required
              min="1"
              style={{
                backgroundColor: '#9333ea',
                boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
              }}
              autoComplete='off'
            />
            <input
              type="number"
              name="questionCount"
              placeholder="No. of Questions"
              value={formData.questionCount}
              onChange={handleChange}
              className="px-[1rem] py-[1.5rem] text-[1.1rem] text-white placeholder-white focus:outline-none w-full rounded-md"
              required
              min="1"
              max="30"
              style={{
                backgroundColor: '#9333ea',
                boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
              }}
              autoComplete='off'
            />
            <input
              type="number"
              name="rewardPerScore"
              placeholder="Reward Per Score"
              value={formData.rewardPerScore}
              onChange={handleChange}
              className="px-[1rem] py-[1.5rem] text-[1.1rem] text-white placeholder-white focus:outline-none w-full rounded-md"
              required
              min="1"
              style={{
                backgroundColor: '#9333ea',
                boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
              }}
              autoComplete='off'
            />
          </div>
          <div className="flex items-center gap-[0.5rem] w-full">
            <label htmlFor="pdf-upload" className="px-[0.5rem] py-[0.5rem] text-[1.1rem] text-center flex items-center justify-center text-white bg-matte-dark hover:bg-matte-light max-w-fit rounded-md cursor-pointer">
              Choose Pdf
            </label>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              required
              ref={fileInputRef}
            />
            {pdfFile && (
              <div className="flex items-center gap-[0.5rem]">
                <PictureAsPdfIcon style={{ color: 'red' }} />
                <span className="text-white">{pdfFile.name}</span>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-[0.5rem] py-[1.25rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Quiz'}
          </button>
        </form>
        <Dialog open={open} onClose={(_, reason) => reason === 'backdropClick' ? null : handleClose} maxWidth="md" fullWidth >
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
                  }} disabled={closeDisabled}>
                    Close
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleStartQuiz}
                    disabled={isPublic || loading || startDisabled}
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