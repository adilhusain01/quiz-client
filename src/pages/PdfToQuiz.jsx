import { useState, useContext, useRef, useEffect } from 'react';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Download,
  Copy,
  FileText,
  Users,
  HelpCircle,
  Trophy,
  Upload,
} from 'lucide-react';

const PdfToQuiz = () => {
  const { walletAddress } = useContext(WalletContext);
  const [formData, setFormData] = useState({
    creatorName: '',
    numParticipants: '',
    questionCount: '',
    rewardPerScore: '',
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
  const [quizCreated, setQuizCreated] = useState(false);
  const CONTRACT_ADDRESS = 'TNsLWvFRGGE5MQPqyMaURh1i3efiTC4PQL';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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

    const { creatorName, numParticipants, questionCount, rewardPerScore } =
      formData;

    if (
      !creatorName ||
      !numParticipants ||
      !questionCount ||
      !rewardPerScore ||
      !pdfFile
    ) {
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
      dataToSubmit.append('isPublic', false);

      setLoading(true);

      const response = await axios.post(`/api/quiz/create/pdf`, dataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setQuizCreated(true);

      const quizId = response.data.quizId;
      setQuizId(quizId);

      if (typeof window.tronWeb !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

        const budget = tronWeb
          .toBigNumber(tronWeb.toSun(totalCost))
          .integerValue();

        const tx = await contract
          .createQuiz(quizId, questionCount, rewardPerScore)
          .send({ callValue: budget, from: walletAddress });

        toast.success('Quiz successfully created.');
        loadAllQuizzes();

        setFormData({
          creatorName: '',
          numParticipants: '',
          questionCount: '',
          rewardPerScore: '',
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
      console.error(
        error.response?.data?.message ||
          'An error occurred while creating the quiz'
      );
      toast.error(
        error.response?.data?.message ||
          'An error occurred while creating the quiz'
      );
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
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
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
      console.log(error);
    }
  };

  const handleStopQuiz = async () => {
    setStartDisabled(true);
    try {
      await axios.put(`/api/quiz/update/${quizId}`, {
        isPublic: false,
        isFinished: true,
      });
      setIsPublic(false);
      setCloseDisabled(false);

      if (typeof window.tronWeb !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);

        const quizIndex = quizQids.indexOf(quizId);
        const plusoneindex = quizIndex + 1;
        await contract.endQuiz(plusoneindex).send({ from: walletAddress });

        toast.success('Quiz has ended');
        setOpen(false);
        setStartDisabled(false);
        setIsPublic(false);
        setCloseDisabled(true);
        setQuizCreated(false);
      } else {
        toast.error('Failed to End Quiz');
      }
    } catch (error) {
      toast.error('Failed to end the quiz');
      console.log(error);
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
    if (quizCreated && quizId) {
      fetchParticipants();
      const interval = setInterval(fetchParticipants, 1000);
      return () => clearInterval(interval);
    }
  }, [quizId, quizCreated]);

  const baseUrl = import.meta.env.VITE_CLIENT_URI;

  return (
    <div
      className='flex items-center justify-center'
      style={{ height: 'calc(100vh - 6rem)' }}
    >
      <div className='max-w-4xl mx-auto'>
        <div className='text-center space-y-4 mb-8'>
          <h1 className='text-2xl md:text-5xl font-bold text-white'>
            Create Quiz from
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400'>
              {' '}
              PDF{' '}
            </span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6 text-sm md:text-md'>
          <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl'>
            <div className='space-y-6'>
              {/* Creator Name Input */}
              <div className='space-y-2'>
                <label className='text-white text-sm font-medium'>
                  Creator Name
                </label>
                <input
                  type='text'
                  name='creatorName'
                  value={formData.creatorName}
                  onChange={handleChange}
                  className='w-full px-4 py-2 md:py-3  bg-white/10 border border-white/20 rounded-lg md:rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400'
                  placeholder='Enter your name'
                  required
                />
              </div>

              {/* Grid for numeric inputs */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <label className='text-white text-sm font-medium flex items-center gap-2'>
                    <Users size={16} />
                    Participants
                  </label>
                  <input
                    type='number'
                    name='numParticipants'
                    value={formData.numParticipants}
                    onChange={handleChange}
                    className='w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg md:rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400'
                    placeholder='Number of participants'
                    min='1'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-white text-sm font-medium flex items-center gap-2'>
                    <HelpCircle size={16} />
                    Questions
                  </label>
                  <input
                    type='number'
                    name='questionCount'
                    value={formData.questionCount}
                    onChange={handleChange}
                    className='w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg md:rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400'
                    placeholder='Number of questions'
                    min='1'
                    max='30'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-white text-sm font-medium flex items-center gap-2'>
                    <Trophy size={16} />
                    Reward
                  </label>
                  <input
                    type='number'
                    name='rewardPerScore'
                    value={formData.rewardPerScore}
                    onChange={handleChange}
                    className='w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg md:rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400'
                    placeholder='Reward per score'
                    min='0.0001'
                    required
                  />
                </div>
              </div>

              {/* PDF Upload Section */}
              <div className='space-y-2'>
                <label className='text-white text-sm font-medium flex items-center gap-2'>
                  <FileText size={16} />
                  PDF Document
                </label>
                <div className='relative'>
                  <input
                    id='pdf-upload'
                    type='file'
                    accept='application/pdf'
                    onChange={handleFileChange}
                    className='hidden'
                    required
                    ref={fileInputRef}
                  />
                  <label
                    htmlFor='pdf-upload'
                    className='w-full px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-lg md:rounded-xl text-white flex items-center justify-center gap-2 cursor-pointer hover:bg-white/20 transition-colors'
                  >
                    <Upload size={20} />
                    {pdfFile ? pdfFile.name : 'Choose PDF File'}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={loading}
                className='w-full px-6 py-3 md:py-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg md:rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50'
              >
                {loading ? (
                  <CircularProgress size={24} color='inherit' />
                ) : (
                  <>
                    <FileText size={20} />
                    Generate Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Dialog */}
        <Dialog
          open={open}
          onClose={(_, reason) =>
            reason === 'backdropClick' ? null : handleClose
          }
          maxWidth='md'
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: '#7f1d1d',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <DialogContent style={{ backgroundColor: '#7f1d1d' }}>
            <div className='grid md:grid-cols-2 gap-8'>
              {/* QR Code Section */}
              <div className='flex flex-col items-center gap-6' ref={qrRef}>
                <h2 className='text-xl md:text-2xl font-bold text-white'>
                  Quiz ID: <span className='text-red-400'>#{quizId}</span>
                </h2>
                <div className='bg-white p-4 rounded-xl'>
                  <QRCodeSVG
                    value={`${baseUrl}/quiz/${quizId}`}
                    className='w-48 h-48 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-72 lg:h-72'
                  />
                </div>
                <TextField
                  value={`${baseUrl}/quiz/${quizId}`}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton onClick={handleCopy}>
                          <Copy className='text-red-400' size={20} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                />
              </div>

              {/* Participants Section */}
              <div className='space-y-4'>
                <h2 className='text-xl md:text-2xl font-bold text-white text-center'>
                  Participants
                </h2>
                <div className='bg-white/10 rounded-xl p-4 max-h-[300px] overflow-y-auto'>
                  {participants.map((participant) => (
                    <div
                      key={participant.walletAddress}
                      className='flex justify-between items-center py-2 px-4 border-b border-white/10 text-white'
                    >
                      <span>{participant.participantName}</span>
                      <span className='font-mono'>
                        {participant.score !== null ? participant.score : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>

          <DialogActions
            className='p-4 bg-white/5'
            style={{ backgroundColor: '#7f1d1d' }}
          >
            <IconButton onClick={handleDownload} className='text-red-400'>
              <Download size={20} style={{ color: 'white' }} />
            </IconButton>
            <Button
              onClick={handleClose}
              disabled={closeDisabled}
              color='white'
            >
              Close
            </Button>
            <Button
              onClick={handleStartQuiz}
              disabled={isPublic || loading || startDisabled}
              color='white'
              className='bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg'
            >
              Start Quiz
            </Button>
            <Button
              onClick={handleStopQuiz}
              disabled={!isPublic || loading}
              color='white'
              className='bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg'
            >
              Stop Quiz
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PdfToQuiz;
