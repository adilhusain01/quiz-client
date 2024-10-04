import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeaderBoards = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [allParticipants, setAllParticipants] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // const quizResponse = await axios.get(`/api/quizzes/${quizId}`);
        // setQuiz(quizResponse.data);

        // Dummy data for quiz
        setQuiz({
          quizId: '12345',
          creatorName: 'John Doe',
          creatorWallet: '0x1234567890abcdef',
          questions: [],
          expiry: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          numQuestions: 5,
          totalCost: 100
        });
      } catch (error) {
        toast.error('Failed to fetch quiz');
      }
    };

    const fetchParticipants = async () => {
      try {
        // const participantResponse = await axios.get(`/api/participants/${quizId}`);
        // setParticipants(participantResponse.data);

        // Dummy data for participants
        const dummyParticipants = [
          { quizId: '12345', participantName: 'Alice', walletAddress: '0xabcdef1234567890', score: 2 },
          { quizId: '12345', participantName: 'Bob', walletAddress: '0xabcdef1234567891', score: 3 },
          { quizId: '12345', participantName: 'Charlie', walletAddress: '0xabcdef1234567892', score: 4 },
          { quizId: '12345', participantName: 'David', walletAddress: '0xabcdef1234567893', score: 1 },
          { quizId: '12345', participantName: 'Eve', walletAddress: '0xabcdef1234567894', score: 5 }
        ];
        setParticipants(dummyParticipants);
        setAllParticipants(dummyParticipants);
      } catch (error) {
        toast.error('Failed to fetch participants');
      }
    };

    fetchQuiz();
    fetchParticipants();
  }, [quizId]);

  const getRemainingTime = (expiry) => {
    const now = new Date();
    const expiryDate = new Date(expiry);
    const remainingTime = expiryDate - now;
    if (remainingTime <= 0) {
      return 'Closed';
    }
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setParticipants(allParticipants);
    } else {
      const filteredParticipants = allParticipants.filter(participant =>
        participant.participantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setParticipants(filteredParticipants);
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    if (sortOption === 'name') {
      return a.participantName.localeCompare(b.participantName);
    } else if (sortOption === 'score') {
      return b.score - a.score;
    }
    return 0;
  });

  if (!quiz) {
    return <p>Loading...</p>;
  }

  return (
    <section 
      className="py-[1rem] w-full flex items-start justify-center"
      style={{ height: 'calc(100vh - 5rem)' }}
      >
       <span className='flex flex-col gap-[1rem]'>
       <h2 className='text-[1.75rem] text-center font-semibold text-white'>Quiz #{quiz.quizId}</h2>
      <div className="m-auto p-[1rem] flex flex-col items-center justify-center bg-white w-[40rem] gap-[2.5rem] rounded-md shadow-md">
        <div className='flex flex-row items-center justify-between w-full'>
          <p className="text-[1.25rem] font-medium text-black">Questions: <span className='text-red-500'>{quiz.numQuestions}</span></p>
          <p className="text-[1.25rem] font-medium text-black">CountDown : <span className='text-green-500'>{getRemainingTime(quiz.expiry)}</span></p>
        </div>

        <div className='flex flex-row items-center justify-between w-full'>
          <div>
            <label htmlFor="sort" className="text-[1rem] text-black">Sort by: </label>
            <select id="sort" value={sortOption} onChange={handleSortChange} className="px-[0.5rem] py-[0.25rem] text-[1rem] text-black border border-black rounded-md">
              <option value="name">Name</option>
              <option value="score">Score</option>
            </select>
          </div>
          <div className='flex flex-row items-center'>
            <input 
              type="text" 
              placeholder="Search by name" 
              value={searchTerm} 
              onChange={handleSearchChange} 
              className="px-[0.5rem] py-[0.25rem] text-[1rem] text-black border border-black rounded-md"
            />
            <button 
              onClick={handleSearch} 
              className="ml-[0.5rem] px-[0.5rem] py-[0.25rem] text-[1rem] text-white bg-matte-dark hover:bg-matte-light rounded-md"
            >
              Search
            </button>
          </div>
        </div>

        <ul className="flex flex-col w-full gap-[0.5rem]">
          {sortedParticipants.map((participant) => (
            <li key={participant.walletAddress} className="text-[1rem] text-black border border-transparent border-b-gray-300 flex flex-row items-center justify-between">
              <span>
                {participant.participantName}
              </span>
              <span>
                {participant.score}
              </span>
            </li>
          ))}
        </ul>
      </div>
      </span>
    </section>
  );
}

export default LeaderBoards;