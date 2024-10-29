// import React, { useState, useEffect, useRef, useContext } from 'react';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
// import { Link, useNavigate } from 'react-router-dom';
// import { WalletContext } from '../context/WalletContext';
// import toast from 'react-hot-toast';
// import axios from '../api/axios';
// import AnimatedBackground from './AnimatedBackground';

// const Home = () => {
//   const { walletAddress, connectWallet } = useContext(WalletContext);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const [joinQuizCode, setJoinQuizCode] = useState('');
//   const [leaderboardsCode, setLeaderboardsCode] = useState('');
//   const navigate = useNavigate();

//   const toggleDropdown = () => {
//     setDropdownOpen(!dropdownOpen);
//   };

//   const handleClickOutside = (event) => {
//     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//       setDropdownOpen(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const handleJoinQuiz = async () => {
//     if (!walletAddress) {
//       toast.error('Please connect your wallet first.');
//       await connectWallet();
//       return;
//     }

//     try {
//       const response = await axios.post(`/api/quiz/verify/${joinQuizCode}`, {
//         walletAddress
//       }, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//       toast.success('Redirecting ...');
//       navigate(`/quiz/${joinQuizCode}`);
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'An error occurred while joining the quiz.');
//     }
//   };

//   return (
//       <section
//         className="mt-[-6rem] grid grid-cols-2"
//         style={{ height: 'calc(100vh - 5rem)' }}
//       >
//           <div className='flex flex-col items-center justify-center gap-[2rem]'>
//             <div className="p-[1rem] flex flex-col items-center justify-center bg-purple-800 gap-[0.5rem] w-[20rem] rounded-lg shadow-2xl">
//               <input 
//                 type="text" 
//                 value={joinQuizCode} 
//                 onChange={(e) => setJoinQuizCode(e.target.value)} 
//                 placeholder="Enter Code" 
//                 className="px-[1em] py-[1.5rem] text-[1.1rem] text-center text-white placeholder-white focus:outline-none w-full rounded-md" 
//                 style={{
//                   backgroundColor: '#9333ea',
//                   boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
//                 }}
//               />
//               <button 
//                 onClick={handleJoinQuiz} 
//                 className="px-[0.5rem] py-[1rem] text-[1.1rem] text-white text-center bg-matte-dark hover:bg-matte-light w-full rounded-md"
//               >
//                 Join Quiz
//               </button>
//             </div>
//             <h2 className='text-[1.5rem] text-center text-white'>Or</h2>
//             <div ref={dropdownRef} className="p-[1rem] flex flex-col items-center justify-center bg-purple-800 gap-[0.5rem] w-[20rem] rounded-lg shadow-2xl relative">
//               <button 
//                 onClick={toggleDropdown} 
//                 className="px-[0.5rem] py-[1rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md"
//               >
//                 Create a Quiz
//                 <ArrowDropDownIcon />
//               </button>
//               {dropdownOpen && (
//                 <div className="absolute top-full mt-2 w-full bg-purple-800 rounded-md shadow-md">
//                   <Link to={'/pdfToQuiz'} className="block p-[1rem] text-[1.1rem] text-white bg-purple-800 hover:bg-purple-900 w-full rounded-md cursor-pointer">Pdf to Quiz</Link>
//                   <Link to={'/promptToQuiz'} className="block p-[1rem] text-[1.1rem] text-white bg-purple-800 hover:bg-purple-900 w-full rounded-md cursor-pointer">Prompt to Quiz</Link>
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="relative mt-[6rem] w-full h-full">
//             <AnimatedBackground />
//           </div>
//       </section>
//   );
// }

// export default Home;

import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import AnimatedBackground from './AnimatedBackground';
import { Play, ChevronDown, FileText, BookOpen } from 'react-feather';

const Home = () => {
  const { walletAddress, connectWallet } = useContext(WalletContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [joinQuizCode, setJoinQuizCode] = useState('');
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleJoinQuiz = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first.');
      await connectWallet();
      return;
    }

    try {
      const response = await axios.post(`/api/quiz/verify/${joinQuizCode}`, {
        walletAddress
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      toast.success('Redirecting ...');
      navigate(`/quiz/${joinQuizCode}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred while joining the quiz.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900"
    style={{ height: 'calc(100vh - 6rem)' }}
    >
        <div className="grid lg:grid-cols-2 gap-[10rem] items-center">
          {/* Left Column - Hero Content */}
          <div className="max-w-xl space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Create & Share
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> Interactive Quizzes </span>
                Instantly
              </h1>
              {/* <p className="text-lg md:text-xl text-purple-100 max-w-2xl">
                Transform your content into engaging quizzes. Perfect for educators, trainers, and anyone who wants to make learning fun.
              </p> */}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Join Quiz Card */}
              <div className="flex-1 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Join a Quiz</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinQuizCode}
                      onChange={(e) => setJoinQuizCode(e.target.value)}
                      placeholder="Enter quiz code"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <button
                      onClick={handleJoinQuiz}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Play size={20} />
                      Join
                    </button>
                  </div>
                </div>
              </div>

              {/* Create Quiz Dropdown */}
              <div className="flex-1" ref={dropdownRef}>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Create a Quiz</h3>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-between"
                  >
                    <span>Choose</span>
                    <ChevronDown size={20} className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute mt-2 w-[calc(100%-3rem)] bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
                      <Link to="/pdfToQuiz" className="flex items-center gap-3 px-6 py-4 text-white hover:bg-white/10 transition-colors">
                        <FileText size={20} />
                        <span>PDF to Quiz</span>
                      </Link>
                      <Link to="/promptToQuiz" className="flex items-center gap-3 px-6 py-4 text-white hover:bg-white/10 transition-colors">
                        <BookOpen size={20} />
                        <span>Prompt to Quiz</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features/Stats Section */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {[
                { label: 'Active Users', value: '1K+' },
                { label: 'Quizzes Created', value: '0.2K+' },
                { label: 'Questions Answered', value: '1K+' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-purple-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[800px]">
            <AnimatedBackground />
          </div>
        </div>
    </div>
  );
};

export default Home;