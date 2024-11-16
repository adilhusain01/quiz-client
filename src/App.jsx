import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WalletProvider from './context/WalletContext';

const Layout = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));
const PdfToQuiz = lazy(() => import('./pages/PdfToQuiz'));
const PromptToQuiz = lazy(() => import('./pages/PromptToQuiz'));
const LeaderBoards = lazy(() => import('./pages/LeaderBoards'));
const Quiz = lazy(() => import('./pages/Quiz'));
const URLToQuiz = lazy(() => import('./pages/URLToQuiz'));
import LoadingSpinner from './components/LoadingSpinner';
const VideoToQuiz = lazy(() => import('./pages/VideoToQuiz'));

const App = () => {
  return (
    <WalletProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path='/' element={<Home />} />
              <Route path='/pdfToQuiz' element={<PdfToQuiz />} />
              <Route path='/promptToQuiz' element={<PromptToQuiz />} />
              <Route path='/urlToQuiz' element={<URLToQuiz />} />
              <Route path='/videoToQuiz' element={<VideoToQuiz />} />
              <Route path='/quiz/:id' element={<Quiz />} />
              <Route path='/leaderboards/:id' element={<LeaderBoards />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </WalletProvider>
  );
};

export default App;
