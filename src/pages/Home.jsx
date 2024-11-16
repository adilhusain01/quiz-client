import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import AnimatedBackground from './AnimatedBackground';
import { Play, FileText, BookOpen } from 'react-feather';

const Home = () => {
  const { walletAddress, connectWallet } = useContext(WalletContext);
  const [joinQuizCode, setJoinQuizCode] = useState('');
  const navigate = useNavigate();

  const handleJoinQuiz = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first.');
      await connectWallet();
      return;
    }

    try {
      await axios.post(
        `/api/quiz/verify/${joinQuizCode}`,
        {
          walletAddress,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Redirecting ...');
      navigate(`/quiz/${joinQuizCode}`);
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'An error occurred while joining the quiz.'
      );
    }
  };

  return (
    <div
      className='w-full flex flex-col items-center justify-center'
      style={{ height: 'calc(100vh - 6rem)' }}
    >
      <div className='grid lg:grid-cols-2 gap-[10rem] items-center'>
        {/* Left Column - Hero Content */}
        <div className='max-w-xl space-y-8'>
          <div className='space-y-4'>
            <h1 className='text-4xl md:text-6xl font-bold text-white'>
              Create & Share
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400'>
                {' '}
                Interactive Quizzes{' '}
              </span>
              Instantly
            </h1>
          </div>

          {/* Quiz Actions Section */}
          <div className='space-y-6'>
            {/* Create Quiz Options */}
            <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300'>
              <h2 className='text-4xl font-semibold text-white mb-4'>
                Create a Quiz
              </h2>
              <div className='grid grid-cols-2 gap-4 '>
                <Link
                  to='/pdfToQuiz'
                  className='group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300'
                >
                  <div className='flex flex-col items-center space-y-3'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform'>
                      <FileText size={24} className='text-white' />
                    </div>
                    <span className='text-lg font-semibold text-white'>
                      PDF to Quiz
                    </span>
                  </div>
                </Link>

                <Link
                  to='/promptToQuiz'
                  className='group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300'
                >
                  <div className='flex flex-col items-center space-y-3'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform'>
                      <BookOpen size={24} className='text-white' />
                    </div>
                    <span className='text-lg font-semibold text-white'>
                      Prompt to Quiz
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Join Quiz Card */}
            <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl'>
              <h2 className='text-4xl font-semibold text-white mb-4'>
                Join a Quiz
              </h2>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={joinQuizCode}
                  onChange={(e) => setJoinQuizCode(e.target.value)}
                  placeholder='Enter quiz code'
                  className='flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-red-200 focus:outline-none focus:ring-2 focus:ring-red-400'
                />
                <button
                  onClick={handleJoinQuiz}
                  className='px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2'
                >
                  <Play size={20} />
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Features/Stats Section */}
          <div className='grid grid-cols-3 gap-6 pt-8'>
            {[
              { label: 'Active Users', value: '1K+' },
              { label: 'Quizzes Created', value: '0.2K+' },
              { label: 'Questions Answered', value: '1K+' },
            ].map((stat, index) => (
              <div key={index} className='text-center'>
                <div className='text-2xl font-bold text-white'>
                  {stat.value}
                </div>
                <div className='text-red-200'>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className='relative h-[800px]'>
          <AnimatedBackground />
        </div>
      </div>
    </div>
  );
};

export default Home;
