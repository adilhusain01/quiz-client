// import React, { useState, useContext, useRef, useEffect } from 'react';
// import { WalletContext } from '../context/WalletContext';
// import toast from 'react-hot-toast';
// import axios from '../api/axios';
// import { QRCodeSVG } from 'qrcode.react';
// import { Dialog, DialogContent, DialogActions, Button, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// const PromptToQuiz = () => {
//   const { walletAddress } = useContext(WalletContext);
//   const [formData, setFormData] = useState({
//     creatorName: '',
//     prompt: '',
//     numParticipants: '',
//     questionCount: '',
//     rewardPerScore: ''
//   });
//   const [quizId, setQuizId] = useState(null);
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isPublic, setIsPublic] = useState(false);
//   const [participants, setParticipants] = useState([]);
//   const [startDisabled, setStartDisabled] = useState(false);
//   const [closeDisabled, setCloseDisabled] = useState(true);
//   const qrRef = useRef();
//   const [quizIds, setQuizIds] = useState([]);
//   const [quizQids, setQuizQids] = useState([]);
//   const CONTRACT_ADDRESS = 'TThMA5VAr88dk9Q2ZbA4qPtsecXc1LRfZN'

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     // Ensure wallet is connected
//     if (!walletAddress) {
//       toast.error('Please connect the wallet');
//       return;
//     }
  
//     const { creatorName, prompt, numParticipants, questionCount, rewardPerScore } = formData;
  
//     // Validate form data
//     if (!creatorName || !prompt || !numParticipants || !questionCount || !rewardPerScore) {
//       toast.error('All fields are required');
//       return;
//     }
//     if (questionCount > 30) {
//       toast.error('Question count cannot be more than 30');
//       return;
//     }
  
//     const totalCost = rewardPerScore * numParticipants * questionCount * 1.1;
  
//     try {
//       // Submit data to the API first
//       const dataToSubmit = {
//         creatorName,
//         prompt,
//         numParticipants,
//         questionCount,
//         rewardPerScore,
//         creatorWallet: walletAddress,
//         totalCost
//       };

//       setLoading(true);
  
//       const response = await axios.post(`/api/quiz/create/prompt`, dataToSubmit, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
  
//       // Set quiz ID from API response
//       const quizId = response.data.quizId;
//       setQuizId(quizId);
  
//       // Now handle the transaction with the smart contract
//       if (typeof window.tronLink !== 'undefined') {
//         const tronWeb = window.tronLink.tronWeb;
//         const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
  
//         // Convert totalCost to Sun and handle floating-point precision
//         const budget = tronWeb.toBigNumber(tronWeb.toSun(totalCost)).integerValue();
  
//         // Call the smart contract to create the quiz
//         const tx = await contract.createQuiz(
//           quizId,              // Use the quizId received from the API
//           questionCount,
//           rewardPerScore
//         ).send({ callValue: budget, from: walletAddress });
  
//         // console.log('Transaction ID:', tx);
//         toast.success('Quiz successfully created');
//         loadAllQuizzes();
//         // Reset form data after successful creation
//         setFormData({
//           creatorName: '',
//           prompt: '',
//           numParticipants: '',
//           questionCount: '',
//           rewardPerScore: ''
//         });


//         // Optionally, open modal or perform any other action
//         setLoading(false);
//         setOpen(true);
//       } else {
//         toast.error('TronLink not found. Please install TronLink.');
//       }
//     } catch (error) {
//       console.log(error);
//       console.error(error.response?.data?.message || 'An error occurred while creating the quiz');
//       toast.error(error.response?.data?.message || 'An error occurred while creating the quiz');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleClose = () => {
//     setOpen(false);
//   };

//   const handleDownload = () => {
//     const svg = qrRef.current.querySelector('svg');
//     const svgData = new XMLSerializer().serializeToString(svg);
//     const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
//     const svgUrl = URL.createObjectURL(svgBlob);
//     const downloadLink = document.createElement('a');
//     downloadLink.href = svgUrl;
//     downloadLink.download = `quiz-${quizId}.svg`;
//     document.body.appendChild(downloadLink);
//     downloadLink.click();
//     document.body.removeChild(downloadLink);
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(`${baseUrl}/quiz/${quizId}`);
//     toast.success('Link copied to clipboard');
//   };

//   const handleStartQuiz = async () => {
//     try {
//       await axios.put(`/api/quiz/update/${quizId}`, { isPublic: true });
//       setIsPublic(true);
//       toast.success('Quiz has started');
//     } catch (error) {
//       toast.error('Failed to start the quiz');
//     }
//   };

//   const handleStopQuiz = async () => {
// setStartDisabled(true);
//     try {
//       await axios.put(`/api/quiz/update/${quizId}`, { isPublic: false, isFinished: true });
//       setIsPublic(false);
//       setCloseDisabled(false);
  
//       if (typeof window.tronWeb !== 'undefined') {
//         const tronWeb = window.tronLink.tronWeb;
//         const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
  
//         const quizIndex = quizQids.indexOf(quizId);
//         // console.log("Quiz Index",quizIndex);
//         const plusoneindex = quizIndex + 1;
//         // console.log("Plus One Index",plusoneindex);
//         const tx = await contract.endQuiz(plusoneindex).send({ from: walletAddress });
  
//         // console.log('Transaction ID:', tx);
//       } else {
//         toast.error("Failed to End Quiz");
//       }
//       toast.success('Quiz has ended');
//       setOpen(false);
//     } catch (error) {
//       toast.error('Failed to end the quiz');
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
//         // console.log("Result",result[0]);
//         // toast.success('Quizzes loaded successfully');
//       } else {
//         toast.error('Failed to load quizzes');
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to load quizzes');
//     }
//   }

//   const fetchParticipants = async () => {
//     try {
//       const response = await axios.get(`/api/quiz/leaderboards/${quizId}`);
//       setParticipants(response.data.participants || []);
//     } catch (error) {
//       console.error('Failed to fetch participants:', error);
//     }
//   };

//   useEffect(() => {
//     if (quizId) {
//       fetchParticipants();
//       const interval = setInterval(fetchParticipants, 1000);
//       return () => clearInterval(interval);
//     }
//   }, [quizId]);

//   const baseUrl = import.meta.env.VITE_CLIENT_URI;

//   return (
//     <section
//     className="w-full flex items-center justify-center"
//     style={{ height: 'calc(100vh - 6rem)' }}
//     >
//       <span className='flex flex-col gap-[1rem]'>
//       <h2 className='text-[3.125rem] text-center font-semibold text-white'>Prompt To Quiz</h2>

//         <form
//           onSubmit={handleSubmit}
//           className="m-auto p-[1.5rem] flex flex-col items-center justify-center bg-purple-800 gap-[0.75rem] w-[45rem] rounded-lg shadow-2xl"
//         >
//           <input
//             type="text"
//             name="creatorName"
//             placeholder="Creator Name"
//             value={formData.creatorName}
//             onChange={handleChange}
//             className="px-[1rem] py-[1.5rem] text-[1.1rem] text-white placeholder-white focus:outline-none w-full rounded-md"
//             required
//             style={{
//               backgroundColor: '#9333ea',
//               boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
//             }}
//             autoComplete='off'
//           />
//         <div className='grid grid-cols-3 gap-[0.5rem]'>

//           <input
//             type="number"
//             name="numParticipants"
//             placeholder="No. of Participants"
//             value={formData.numParticipants}
//             onChange={handleChange}
//             className="px-[1rem] py-[1.5rem] text-[1.1rem] text-white placeholder-white focus:outline-none w-full rounded-md"
//             required
//             min="1"
//             style={{
//               backgroundColor: '#9333ea',
//               boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
//             }}
//             autoComplete='off'
//           />
//           <input
//             type="number"
//             name="questionCount"
//             placeholder="No. of Questions"
//             value={formData.questionCount}
//             onChange={handleChange}
//             className="px-[1rem] py-[1.5rem] text-[1.1rem] text-white placeholder-white focus:outline-none w-full rounded-md"
//             required
//             min="1"
//             max="30"
//             style={{
//               backgroundColor: '#9333ea',
//               boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
//             }}
//             autoComplete='off'
//           />
//           <input
//             type="number"
//             name="rewardPerScore"
//             placeholder="Reward Per Score"
//             value={formData.rewardPerScore}
//             onChange={handleChange}
//             className="px-[1rem] py-[1.5rem] text-[1.1rem] text-white placeholder-white focus:outline-none w-full rounded-md"
//             required
//             min="1"
//             style={{
//               backgroundColor: '#9333ea',
//               boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
//             }}
//             autoComplete='off'
//           />
//           </div>
//           <textarea
//             name="prompt"
//             placeholder="Topic of Quiz"
//             value={formData.prompt}
//             onChange={handleChange}
//             className="px-[1rem] py-[1rem] text-[1.1rem] text-white placeholder-white focus:outline-none w-full rounded-md"
//             required
//             style={{
//               backgroundColor: '#9333ea',
//               boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
//             }}
//             autoComplete='off'
//           />
//           <button
//             type="submit"
//             className="px-[0.5rem] py-[1.25rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md flex items-center justify-center"
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Quiz'}
//           </button>
//         </form>
//         <Dialog open={open} onClose={(_, reason) => reason === 'backdropClick' ? null : handleClose} maxWidth="md" fullWidth >
//           <DialogContent>
//             <div className="flex flex-row gap-[2rem]">
//               <div className="flex flex-col items-center justify-center gap-[1rem]" ref={qrRef} style={{ flex: 1 }}>
//                 <h2 className="text-[1.25rem] text-center text-black">Quiz ID: <span className='text-[1.5rem] text-violet font-bold'>{quizId}</span></h2>
//                 <QRCodeSVG value={`${baseUrl}/quiz/${quizId}`} size={256}                />
//                 <TextField
//                   label="Quiz Link"
//                   value={`${baseUrl}/quiz/${quizId}`}
//                   InputProps={{
//                     readOnly: true,
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton onClick={handleCopy}>
//                           <ContentCopyIcon />
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   }}
//                   fullWidth
//                 />
//                 <DialogActions>
//                   <IconButton onClick={handleDownload} sx={{
//                     color: '#6b46c1'
//                   }}>
//                     <FileDownloadIcon />
//                   </IconButton>
//                   <Button onClick={handleClose} sx={{
//                     color: '#6b46c1'
//                   }} disabled={closeDisabled}>
//                     Close
//                   </Button>
//                   <Button
//                     variant="contained"
//                     onClick={handleStartQuiz}
//                     disabled={isPublic || loading || startDisabled}
//                     sx={{
//                       backgroundColor: '#6b46c1',
//                     }}
//                   >
//                     Start Quiz
//                   </Button>
//                   <Button
//                     variant="contained"
//                     onClick={handleStopQuiz}
//                     disabled={!isPublic || loading}
//                     sx={{
//                       backgroundColor: '#6b46c1',
//                     }}
//                   >
//                     Stop Quiz
//                   </Button>
//                 </DialogActions>
//               </div>
//               <div className="flex flex-col items-center justify-center gap-[1rem]" style={{ flex: 1 }}>
//                 <h2 className="text-[1.25rem] text-center text-black">Participants</h2>
//                 <ul className="h-full w-full px-[1rem] flex flex-col gap-[0.5rem]" style={{ overflowY: 'scroll', scrollbarWidth: 'thin' }}>
//                   {participants.map((participant) => (
//                     <li key={participant.walletAddress} className="text-[1rem] text-black border border-transparent border-b-gray-300 flex flex-row items-center justify-between">
//                       <span>
//                         {participant.participantName}
//                       </span>
//                       <span>
//                         {participant.score !== null ? participant.score : 'N/A'}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </span>
//     </section>
//   );
// }

// export default PromptToQuiz;

import React, { useState, useContext, useRef, useEffect } from 'react';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogActions, Button, IconButton, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { Download, Copy, Wand2, Users, HelpCircle, Trophy } from 'lucide-react';

const PromptToQuiz = () => {
  // Keep all your existing state and functions
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
  const [startDisabled, setStartDisabled] = useState(false);
  const [closeDisabled, setCloseDisabled] = useState(true);
  const qrRef = useRef();
  const [quizIds, setQuizIds] = useState([]);
  const [quizQids, setQuizQids] = useState([]);
  const CONTRACT_ADDRESS = 'TThMA5VAr88dk9Q2ZbA4qPtsecXc1LRfZN';
  const baseUrl = import.meta.env.VITE_CLIENT_URI;

  // Keep all your existing handlers and effects
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Ensure wallet is connected
    if (!walletAddress) {
      toast.error('Please connect the wallet');
      return;
    }
  
    const { creatorName, prompt, numParticipants, questionCount, rewardPerScore } = formData;
  
    // Validate form data
    if (!creatorName || !prompt || !numParticipants || !questionCount || !rewardPerScore) {
      toast.error('All fields are required');
      return;
    }
    if (questionCount > 30) {
      toast.error('Question count cannot be more than 30');
      return;
    }
  
    const totalCost = rewardPerScore * numParticipants * questionCount * 1.1;
  
    try {
      // Submit data to the API first
      const dataToSubmit = {
        creatorName,
        prompt,
        numParticipants,
        questionCount,
        rewardPerScore,
        creatorWallet: walletAddress,
        totalCost
      };

      setLoading(true);
  
      const response = await axios.post(`/api/quiz/create/prompt`, dataToSubmit, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Set quiz ID from API response
      const quizId = response.data.quizId;
      setQuizId(quizId);
  
      // Now handle the transaction with the smart contract
      if (typeof window.tronLink !== 'undefined') {
        const tronWeb = window.tronLink.tronWeb;
        const contract = await tronWeb.contract().at(CONTRACT_ADDRESS);
  
        // Convert totalCost to Sun and handle floating-point precision
        const budget = tronWeb.toBigNumber(tronWeb.toSun(totalCost)).integerValue();
  
        // Call the smart contract to create the quiz
        const tx = await contract.createQuiz(
          quizId,              // Use the quizId received from the API
          questionCount,
          rewardPerScore
        ).send({ callValue: budget, from: walletAddress });
  
        // console.log('Transaction ID:', tx);
        toast.success('Quiz successfully created');
        loadAllQuizzes();
        // Reset form data after successful creation
        setFormData({
          creatorName: '',
          prompt: '',
          numParticipants: '',
          questionCount: '',
          rewardPerScore: ''
        });


        // Optionally, open modal or perform any other action
        setLoading(false);
        setOpen(true);
      } else {
        toast.error('TronLink not found. Please install TronLink.');
      }
    } catch (error) {
      console.log(error);
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
        // console.log("Quiz Index",quizIndex);
        const plusoneindex = quizIndex + 1;
        // console.log("Plus One Index",plusoneindex);
        const tx = await contract.endQuiz(plusoneindex).send({ from: walletAddress });
  
        // console.log('Transaction ID:', tx);
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

        // Call the getAllQuizzes function
        const result = await contract.getAllQuizzes().call();

        // result will be an object with two arrays: quizIds and quizQids
        setQuizIds(result[0]);
        setQuizQids(result[1]);
        // console.log("Result",result[0]);
        // toast.success('Quizzes loaded successfully');
      } else {
        toast.error('Failed to load quizzes');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load quizzes');
    }
  }

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


  return (
    <div className="flex items-center justify-center"
    style={{ height: 'calc(100vh - 6rem)' }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Create Quiz from
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Prompt </span>
          </h1>
          {/* <p className="text-lg text-purple-100">
            Generate an AI-powered quiz instantly from your topic description
          </p> */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
            {/* Creator Name Input */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Creator Name</label>
                <input
                  type="text"
                  name="creatorName"
                  value={formData.creatorName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Grid for numeric inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium flex items-center gap-2">
                    <Users size={16} />
                    Participants
                  </label>
                  <input
                    type="number"
                    name="numParticipants"
                    value={formData.numParticipants}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Number of participants"
                    min="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white text-sm font-medium flex items-center gap-2">
                    <HelpCircle size={16} />
                    Questions
                  </label>
                  <input
                    type="number"
                    name="questionCount"
                    value={formData.questionCount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Number of questions"
                    min="1"
                    max="30"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-white text-sm font-medium flex items-center gap-2">
                    <Trophy size={16} />
                    Reward
                  </label>
                  <input
                    type="number"
                    name="rewardPerScore"
                    value={formData.rewardPerScore}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Reward per score"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Topic/Prompt Textarea */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium flex items-center gap-2">
                  <Wand2 size={16} />
                  Quiz Topic
                </label>
                <textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[100px]"
                  placeholder="Describe your quiz topic in detail..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    <Wand2 size={20} />
                    Generate Quiz
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Dialog - Keep your existing Dialog component but with updated styles */}
        <Dialog 
          open={open} 
          onClose={(_, reason) => reason === 'backdropClick' ? null : handleClose}
          maxWidth="md" 
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: '#1a103d',
              backgroundImage: 'linear-gradient(to bottom right, rgba(147, 51, 234, 0.1), rgba(79, 70, 229, 0.1))',
              borderRadius: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <DialogContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* QR Code Section */}
              <div className="flex flex-col items-center gap-6" ref={qrRef}>
                <h2 className="text-2xl font-bold text-white">
                  Quiz ID: <span className="text-purple-400">{quizId}</span>
                </h2>
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG value={`${baseUrl}/quiz/${quizId}`} size={256} />
                </div>
                <TextField
                  value={`${baseUrl}/quiz/${quizId}`}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleCopy}>
                          <Copy className="text-purple-400" size={20} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      color: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                />
              </div>

              {/* Participants Section */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white text-center">Participants</h2>
                <div className="bg-white/10 rounded-xl p-4 max-h-[300px] overflow-y-auto">
                  {participants.map((participant) => (
                    <div 
                      key={participant.walletAddress}
                      className="flex justify-between items-center py-2 px-4 border-b border-white/10 text-white"
                    >
                      <span>{participant.participantName}</span>
                      <span className="font-mono">
                        {participant.score !== null ? participant.score : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>

          <DialogActions className="p-4 bg-white/5">
            <IconButton onClick={handleDownload} className="text-purple-400">
              <Download size={20} />
            </IconButton>
            <Button 
              onClick={handleClose} 
              disabled={closeDisabled}
              className="text-purple-400"
            >
              Close
            </Button>
            <Button
              onClick={handleStartQuiz}
              disabled={isPublic || loading || startDisabled}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg"
            >
              Start Quiz
            </Button>
            <Button
              onClick={handleStopQuiz}
              disabled={!isPublic || loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg"
            >
              Stop Quiz
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default PromptToQuiz;