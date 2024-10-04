import React, { useState, useContext } from 'react';
import { WalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';

const PromptToQuiz = () => {
  const { walletAddress } = useContext(WalletContext);
  const [formData, setFormData] = useState({
    creatorName: '',
    prompt: '',
    expiry: '',
    numParticipants: '',
    questionCount: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress) {
      toast.error('Please connect the wallet');
      return;
    }
    const { creatorName, prompt, expiry, numParticipants, questionCount } = formData;
    if (!creatorName || !prompt || !expiry || !numParticipants || !questionCount) {
      toast.error('All fields are required');
      return;
    }
    if (questionCount > 30) {
      toast.error('Question count cannot be more than 30');
      return;
    }
    const dataToSubmit = {
      ...formData,
      creatorWallet: walletAddress
    };
  };

  return (
    <section 
      className="w-full flex justify-center items-center"
      style={{ height: 'calc(100vh - 5rem)' }}
    >
         <span className='flex flex-col gap-[1rem]'>
         <h2 className='text-[1.75rem] text-center font-semibold text-white'>Prompt To Quiz</h2>
      <form 
        onSubmit={handleSubmit} 
        className="m-auto p-[1rem] flex flex-col items-center justify-center bg-white gap-[0.5rem] w-[20rem] rounded-md shadow-md"
      >
        <input 
          type="text" 
          name="creatorName" 
          placeholder="Creator Name" 
          value={formData.creatorName} 
          onChange={handleChange} 
          className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
          required
        />
        <textarea 
          name="prompt" 
          placeholder="Prompt" 
          value={formData.prompt} 
          onChange={handleChange} 
          className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
          required
        />
        <input 
          type="date" 
          name="expiry" 
          placeholder="Expiry Date" 
          value={formData.expiry} 
          onChange={handleChange} 
          className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
          required
        />
        <input 
          type="number" 
          name="numParticipants" 
          placeholder="Number of Participants" 
          value={formData.numParticipants} 
          onChange={handleChange} 
          className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
          required
        />
        <input 
          type="number" 
          name="questionCount" 
          placeholder="Number of Questions" 
          value={formData.questionCount} 
          onChange={handleChange} 
          className="px-[0.5rem] py-[0.25rem] text-[1.1rem] text-center text-black border border-black focus:outline-none w-full rounded-md" 
          required
          min="1"
          max="30"
        />
        <button 
          type="submit" 
          className="px-[0.5rem] py-[0.5rem] text-[1.1rem] text-white bg-matte-dark hover:bg-matte-light w-full rounded-md"
        >
          Create Quiz
        </button>
      </form>
      </span>
    </section>
  );
}

export default PromptToQuiz;