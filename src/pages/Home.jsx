import React, { useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Home = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <>
      <section 
        className="w-full grid grid-cols-2"
        style={{ height: 'calc(100vh - 5rem)' }}
      >
        <div className="m-auto p-[1rem] flex flex-col items-center justify-center bg-white gap-[0.5rem] w-[20rem] rounded-md shadow-md">
          <input type="text" placeholder="Enter Code" className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" />
          <button className="px-[0.5rem] py-[0.5rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md">Join Quiz</button>
        </div>
        <div className="m-auto p-[1rem] flex flex-col items-center justify-center bg-white gap-[0.5rem] w-[20rem] rounded-md shadow-md relative">
          <button 
            onClick={toggleDropdown} 
            className="px-[0.5rem] py-[0.5rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md"
          >
            Create a Quiz
            <ArrowDropDownIcon />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-md">
              <a href="/pdfToQuiz" className="block px-[0.5rem] py-[0.5rem] text-[1.1rem] text-black hover:bg-gray-200 w-full rounded-md">Pdf to Quiz</a>
              <a href="/promptToQuiz" className="block px-[0.5rem] py-[0.5rem] text-[1.1rem] text-black hover:bg-gray-200 w-full rounded-md">Prompt to Quiz</a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;