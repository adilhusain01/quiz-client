import React, { useState, useEffect, useRef } from 'react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link } from 'react-router-dom';

const Home = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [joinQuizCode, setJoinQuizCode] = useState('');
  const [leaderboardsCode, setLeaderboardsCode] = useState('');

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

  return (
    <>
      <section 
        className="w-full grid grid-cols-2"
        style={{ height: 'calc(100vh - 5rem)' }}
      >
        <div className='flex flex-col items-center justify-center gap-[2.5rem]'>
          <div className="p-[1rem] flex flex-col items-center justify-center bg-white gap-[0.5rem] w-[20rem] rounded-md shadow-md">
            <input 
              type="text" 
              value={joinQuizCode} 
              onChange={(e) => setJoinQuizCode(e.target.value)} 
              placeholder="Enter Code" 
              className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
            />
            <Link to={'/'} className="px-[0.5rem] py-[0.5rem] text-[1.1rem] text-white text-center bg-matte-dark hover:bg-matte-light w-full rounded-md">Join Quiz</Link>
          </div>
          <h2 className='text-[1.5rem] text-white font-bold'>Or</h2>
          <div className="p-[1rem] flex flex-col items-center justify-center bg-white gap-[0.5rem] w-[20rem] rounded-md shadow-md">
            <input 
              type="text" 
              value={leaderboardsCode} 
              onChange={(e) => setLeaderboardsCode(e.target.value)} 
              placeholder="Enter Code" 
              className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
            />
            <Link to={`/leaderboards/${leaderboardsCode}`} className="px-[0.5rem] py-[0.5rem] text-[1.1rem] text-white text-center bg-matte-dark hover:bg-matte-light w-full rounded-md">Leaderboards</Link>
          </div>
        </div>
       
        <div ref={dropdownRef} className="m-auto p-[1rem] flex flex-col items-center justify-center bg-white gap-[0.5rem] w-[20rem] rounded-md shadow-md relative">
          <button 
            onClick={toggleDropdown} 
            className="px-[0.5rem] py-[0.5rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md"
          >
            Create a Quiz
            <ArrowDropDownIcon />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-md">
              <Link to={'/pdfToQuiz'} className="block px-[0.5rem] py-[0.5rem] text-[1.1rem] text-black hover:bg-gray-200 w-full rounded-md cursor-pointer">Pdf to Quiz</Link>
              <Link to={'/promptToQuiz'} className="block px-[0.5rem] py-[0.5rem] text-[1.1rem] text-black hover:bg-gray-200 w-full rounded-md cursor-pointer">Prompt to Quiz</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;