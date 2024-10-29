// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import toast from 'react-hot-toast';
// import axios from '../api/axios';
// import { CircularProgress, Typography } from '@mui/material';

// const LeaderBoards = () => {
//   const { id } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [quiz, setQuiz] = useState(null);
//   const [participants, setParticipants] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortOption, setSortOption] = useState('name');
//   const [allParticipants, setAllParticipants] = useState([]);

//   useEffect(() => {
//     const fetchLeaderBoards = async () => {      
//       try {
//         const response = await axios.get(`/api/quiz/leaderboards/${id}`);
        
//         setQuiz(response.data.quiz);
//         setParticipants(response.data.participants || []);
//         setAllParticipants(response.data.participants || []);
//         setLoading(false);
//       } catch (error) {
//         console.log(error);
//         toast.error('Failed to fetch leaderboard data');
//         setLoading(false);
//       }
//     };

//     fetchLeaderBoards();
//   }, [id]);

//   const handleSortChange = (e) => {
//     setSortOption(e.target.value);
//   };

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleSearch = () => {
//     if (searchTerm.trim() === '') {
//       setParticipants(allParticipants);
//     } else {
//       const filteredParticipants = allParticipants.filter(participant =>
//         participant.participantName.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setParticipants(filteredParticipants);
//     }
//   };

//   const sortedParticipants = [...participants].sort((a, b) => {
//     if (sortOption === 'name') {
//       return a.participantName.localeCompare(b.participantName);
//     } else if (sortOption === 'score') {
//       return b.score - a.score;
//     }
//     return 0;
//   });

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center bg-violet" style={{ height: 'calc(100vh - 5rem)' }}>
//         <CircularProgress sx={{color: 'white'}} />
//       </div>
//     )
//   }

//   if (!quiz) {
//     return (
//       <div className="flex justify-center items-center bg-violet" style={{ height: 'calc(100vh - 5rem)' }}>
//         <Typography variant="h4" className="text-white font-bold">
//           Quiz not found!
//         </Typography>
//       </div>
//     )
//   }

//   return (
//     <section 
//       className="py-[1rem] w-full flex items-start justify-center"
//       style={{ height: 'calc(100vh - 6rem)' }}
//       >
//        <span className='flex flex-col gap-[1rem]'>
//        <h2 className='text-[1.75rem] text-center font-semibold text-white'>Quiz <span className='text-purple-400'>#{quiz.quizId}</span></h2>
//       <div className="m-auto p-[1.5rem] flex flex-col items-center justify-center bg-purple-800 w-[40rem] gap-[2.5rem] rounded-lg shadow-2xl">
//         <div className='flex flex-row items-center justify-between w-full'>
//           <p className="text-[1.25rem] text-white font-bold">Questions: <span className='text-red-500'>{quiz.questions.length}</span></p>
//           <p className="text-[1.25rem] text-white font-bold">Status : <span className={`${quiz.isPublic ? 'text-green-500' : 'text-red-500'}`}>{quiz.isPublic ? 'Open' : 'Closed'}</span></p>
//         </div>

//         <div className='flex flex-row items-center justify-between w-full'>
//           <div>
//             <label htmlFor="sort" className="text-[1rem] text-white font-bold">Sort by: </label>
//             <select id="sort" value={sortOption} onChange={handleSortChange} className="px-[0.5rem] py-[0.25rem] text-[1rem] text-white bg-matte-dark focus:outline-none rounded-md custom-select">
//               <option value="name">Name</option>
//               <option value="score">Score</option>
//             </select>
//           </div>
//           <div className='flex flex-row items-center'>
//             <input 
//               type="text" 
//               placeholder="Search by name" 
//               value={searchTerm} 
//               onChange={handleSearchChange} 
//               className="px-[0.75rem] py-[0.25rem] text-[1rem] text-white placeholder-white focus:outline-none rounded-md"
//               style={{
//                 backgroundColor: '#9333ea',
//                 boxShadow: 'inset 10px 10px 20px #3b145e, inset -10px -10px 20px #eb52ff'
//               }}
//             />
//             <button 
//               onClick={handleSearch} 
//               className="ml-[0.5rem] px-[0.5rem] py-[0.25rem] text-[1rem] text-white bg-matte-dark hover:bg-matte-light rounded-md"
//             >
//               Search
//             </button>
//           </div>
//         </div>

//         <ul className="flex flex-col w-full gap-[0.5rem]">
//           {sortedParticipants.map((participant) => (
//             <li key={participant.walletAddress} className="py-[0.25rem] text-[1rem] text-white border border-transparent border-b-gray-300 flex flex-row items-center justify-between">
//               <span>
//                 {participant.participantName}
//               </span>
//               <span>
//                 {participant.score}
//               </span>
//             </li>
//           ))}
//         </ul>
//       </div>
//       </span>
//     </section>
//   );
// }

// export default LeaderBoards;


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { CircularProgress } from '@mui/material';
import { Search, Trophy, Users, HelpCircle, SortAsc } from 'lucide-react';

const LeaderBoards = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [allParticipants, setAllParticipants] = useState([]);

  useEffect(() => {
    const fetchLeaderBoards = async () => {      
      try {
        const response = await axios.get(`/api/quiz/leaderboards/${id}`);
        setQuiz(response.data.quiz);
        setParticipants(response.data.participants || []);
        setAllParticipants(response.data.participants || []);
        setLoading(false);

        console.log(response.data);
        
      } catch (error) {
        console.log(error);
        toast.error('Failed to fetch leaderboard data');
        setLoading(false);
      }
    };

    fetchLeaderBoards();
  }, [id]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === '') {
      setParticipants(allParticipants);
    } else {
      const filteredParticipants = allParticipants.filter(participant =>
        participant.participantName.toLowerCase().includes(e.target.value.toLowerCase())
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

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 6rem)' }}>
        <CircularProgress sx={{ color: 'white' }} />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 6rem)' }}>
        <h1 className="text-4xl font-bold text-white">Quiz not found!</h1>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 6rem)' }}>
      <div className="max-w-4xl w-full mx-auto px-4">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Quiz Leaderboard
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> #{id} </span>
          </h1>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl space-y-6">
          {/* Quiz Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white">
                <HelpCircle size={20} />
                <span className="text-sm font-medium">Questions</span>
              </div>
              <p className="text-2xl font-bold text-purple-400 mt-2">{quiz.questions.length}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white">
                <Users size={20} />
                <span className="text-sm font-medium">Participants</span>
              </div>
              <p className="text-2xl font-bold text-purple-400 mt-2">{participants.length}</p>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-white">
                <Trophy size={20} />
                <span className="text-sm font-medium">Status</span>
              </div>
              <p className={`text-2xl font-bold mt-2 ${quiz.isPublic ? 'text-green-400' : 'text-pink-400'}`}>
                {quiz.isPublic ? 'Open' : 'Closed'}
              </p>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full md:w-64 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 pl-10"
              />
              <Search className="absolute left-3 top-3.5 text-purple-400" size={20} />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <SortAsc size={20} className="text-purple-400" />
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="w-full md:w-auto px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 appearance-none cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="score">Sort by Score</option>
              </select>
            </div>
          </div>

          {/* Participants List */}
          <div className="space-y-2 mt-6">
            {sortedParticipants.map((participant, index) => (
              <div
                key={participant.walletAddress}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-purple-400 font-medium">{index + 1}</span>
                  <span className="text-white">{participant.participantName}</span>
                </div>
                <span className="text-pink-400 font-bold">{participant.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderBoards;