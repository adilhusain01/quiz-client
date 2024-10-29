const LoadingSpinner = () => {
    return (
      <section className='bg-gray-800 flex items-center justify-center w-full h-screen'>
        <div className='dot-spinner'>
          <div className='dot-spinner__dot'></div>
          <div className='dot-spinner__dot'></div>
          <div className='dot-spinner__dot'></div>
          <div className='dot-spinner__dot'></div>
          <div className='dot-spinner__dot'></div>
          <div className='dot-spinner__dot'></div>
          <div className='dot-spinner__dot'></div>
          <div className='dot-spinner__dot'></div>
        </div>
      </section>
    );
  };
  
  export default LoadingSpinner;