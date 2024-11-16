import { motion } from 'framer-motion';
import {
  Users,
  BookCheck,
  BrainCircuit,
  Trophy,
  Target,
  Zap,
} from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      label: 'Active Users',
      value: '1K+',
      icon: Users,
      description: 'Growing community of learners',
      color: 'from-red-500 to-pink-500',
    },
    {
      label: 'Quizzes Created',
      value: '0.2K+',
      icon: BookCheck,
      description: 'Diverse learning materials',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'Questions Answered',
      value: '1K+',
      icon: BrainCircuit,
      description: 'Knowledge shared',
      color: 'from-blue-500 to-purple-500',
    },
    {
      label: 'Success Rate',
      value: '85%',
      icon: Trophy,
      description: 'Average completion rate',
      color: 'from-green-500 to-teal-500',
    },
    {
      label: 'Daily Quizzes',
      value: '50+',
      icon: Target,
      description: 'New content every day',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      label: 'Avg. Response Time',
      value: '2s',
      icon: Zap,
      description: 'Lightning-fast experience',
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  return (
    <div className='w-full py-8 md:py-16 px-4 mt-16'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='text-center mb-12'
      >
        <h2 className='text-3xl md:text-5xl font-bold text-white mb-4'>
          Platform Statistics
        </h2>
        <p className='text-lg md:text-xl text-red-200'>
          Empowering learning through interactive quizzes
        </p>
      </motion.div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl'
            >
              <div className='flex flex-col items-center space-y-4'>
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}
                >
                  <Icon className='text-white' size={32} />
                </div>
                <h3 className='text-2xl md:text-4xl font-bold text-white'>
                  {stat.value}
                </h3>
                <div className='space-y-2 text-center'>
                  <p className='text-lg md:text-xl font-semibold text-white'>
                    {stat.label}
                  </p>
                  <p className='text-red-200'>{stat.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsSection;
