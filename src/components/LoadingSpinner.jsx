const LoadingSpinner = () => {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50'>
      <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl relative overflow-hidden'>
        {/* Ambient glow effect */}
        <div className='absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 animate-pulse' />

        <div className='relative'>
          {/* Main spinner container */}
          <div className='spinner-container w-24 h-24 relative'>
            {/* Outer ring */}
            <div
              className='absolute inset-0 rounded-full border-4 border-transparent border-t-rose-500 animate-spin'
              style={{ animationDuration: '1.5s' }}
            />

            {/* Middle ring */}
            <div
              className='absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 animate-spin'
              style={{
                animationDuration: '1.2s',
                animationDirection: 'reverse',
              }}
            />

            {/* Inner ring */}
            <div
              className='absolute inset-4 rounded-full border-4 border-transparent border-t-rose-400 animate-spin'
              style={{ animationDuration: '0.9s' }}
            />

            {/* Center dot */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-3 h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse' />
            </div>
          </div>
        </div>

        {/* Add styles for animations */}
        <style jsx>{`
          @keyframes bounce {
            0%,
            80%,
            100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-6px);
            }
          }

          .spinner-container::before {
            content: '';
            position: absolute;
            inset: -8px;
            border-radius: 50%;
            background: linear-gradient(to right, #f43f5e, #ec4899);
            -webkit-mask: linear-gradient(#fff 0 0) content-box,
              linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0.5;
            animation: glow 2s linear infinite;
          }

          @keyframes glow {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default LoadingSpinner;
