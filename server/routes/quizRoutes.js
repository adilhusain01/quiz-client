const express = require('express');
const multer = require('multer');
const router = express.Router();
const { getQuiz, createQuizByPrompt, createQuizByPdf, joinQuiz, submitQuiz, getLeaderBoards, updateQuiz } = require('../controllers/quizController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/leaderboards/:quizId', getLeaderBoards);
router.post('/verify/:quizId', getQuiz);
router.post('/create/prompt', createQuizByPrompt);
router.post('/create/pdf', upload.single('pdf'), createQuizByPdf);
router.post('/join/:quizId', joinQuiz);
router.post('/submit', submitQuiz);
router.put('/update/:quizId', updateQuiz);

module.exports = router;