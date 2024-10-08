import React, { useState, useEffect, useRef, useContext } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link, useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const Home = () => {
  const { walletAddress, connectWallet } = useContext(WalletContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [joinQuizCode, setJoinQuizCode] = useState('');
  const [leaderboardsCode, setLeaderboardsCode] = useState('');
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
    <>
      <section 
        className="mt-[-5rem] flex flex-col items-start justify-center gap-[5rem]"
        style={{ height: 'calc(100vh - 5rem)' }}
      >
        <span>
        <h2 className='px-[20rem] text-[7.5rem] font-bold text-white'>Vibe with<span className='mx-[2rem] text-purple-600'>{'Web <3!'}</span></h2>

        </span>
       
        <section className='h-full max-h-fit w-full grid grid-cols-2'>
        <div className='flex flex-col items-center justify-center gap-[2.5rem]'>
          <div className="p-[1rem] flex flex-col items-center justify-center bg-purple-800 gap-[0.5rem] w-[20rem] rounded-lg shadow-2xl">
            <input 
              type="text" 
              value={joinQuizCode} 
              onChange={(e) => setJoinQuizCode(e.target.value)} 
              placeholder="Enter Code" 
              className="px-[1em] py-[1.5rem] text-[1.1rem] text-center text-white placeholder-white focus:outline-none w-full rounded-md" 
              style={{
                backgroundColor: '#9333ea',
                boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
              }}
            />
            <button 
              onClick={handleJoinQuiz} 
              className="px-[0.5rem] py-[1rem] text-[1.1rem] text-white text-center bg-matte-dark hover:bg-matte-light w-full rounded-md"
            >
              Join Quiz
            </button>
          </div>
        </div>
       
        <div ref={dropdownRef} className="m-auto p-[1rem] flex flex-col items-center justify-center bg-purple-800 gap-[0.5rem] w-[20rem] rounded-lg shadow-2xl relative">
          <button 
            onClick={toggleDropdown} 
            className="px-[0.5rem] py-[1rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md"
          >
            Create a Quiz
            <ArrowDropDownIcon />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full mt-2 w-full bg-purple-800 rounded-md shadow-md">
              <Link to={'/pdfToQuiz'} className="block p-[1rem] text-[1.1rem] text-white bg-purple-800 hover:bg-purple-900 w-full rounded-md cursor-pointer">Pdf to Quiz</Link>
              <Link to={'/promptToQuiz'} className="block p-[1rem] text-[1.1rem] text-white bg-purple-800 hover:bg-purple-900 w-full rounded-md cursor-pointer">Prompt to Quiz</Link>
            </div>
          )}
        </div>
      </section>
      </section>
    </>
  );
}

export default Home;