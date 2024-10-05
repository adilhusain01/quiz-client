import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './style.css';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')).render(
    <>
      <Toaster />
      <App />
    </>
);