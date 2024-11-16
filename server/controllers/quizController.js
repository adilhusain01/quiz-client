const Quiz = require('../models/Quiz');
const Participant = require('../models/Participant');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const pdfParse = require('pdf-parse');

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1', // Replace with your region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const bedrock = new AWS.Bedrock();
const bedrockRuntime = new AWS.BedrockRuntime();

const modelId = process.env.MODEL_ID;

// Robust Question Extraction Function (unchanged)
const extractQuestions = (responseText) => {
  // Multiple regex patterns to handle different possible formats
  const patterns = [
    // Pattern 1: Markdown-style with double asterisks
    /\*\*Question (\d+):\*\* (.*?)\n\nA\) (.*?)\nB\) (.*?)\nC\) (.*?)\nD\) (.*?)\n\n\*\*Correct Answer: (\w)\*\*/g,

    // Pattern 2: Simple numbered format
    /Question (\d+): (.*?)\nA\) (.*?)\nB\) (.*?)\nC\) (.*?)\nD\) (.*?)\nCorrect Answer: (\w)/g,

    // Pattern 3: More flexible format with potential extra whitespace
    /(?:Q(?:uestion)?\.?\s*)?(\d+)[\.:]\s*(.*?)\s*(?:Choices|Options)?:?\s*\n\s*[Aa]\)\s*(.*?)\s*\n\s*[Bb]\)\s*(.*?)\s*\n\s*[Cc]\)\s*(.*?)\s*\n\s*[Dd]\)\s*(.*?)\s*\n\s*(?:Correct\s*(?:Answer)?:?\s*|\[Answer\]\s*:?\s*)(\w)/g,
  ];

  const questions = [];

  // Try each pattern
  for (const pattern of patterns) {
    let match;
    // Reset lastIndex to ensure we start from the beginning
    pattern.lastIndex = 0;

    while ((match = pattern.exec(responseText)) !== null) {
      // Ensure we have a valid match with 7 capture groups
      if (match.length === 8) {
        const question = {
          question: match[2].trim(),
          options: [
            `A) ${match[3].trim()}`,
            `B) ${match[4].trim()}`,
            `C) ${match[5].trim()}`,
            `D) ${match[6].trim()}`,
          ],
          correctAnswer: match[7].trim().toUpperCase(),
        };

        // Validate the question
        if (
          question.question &&
          question.options.length === 4 &&
          ['A', 'B', 'C', 'D'].includes(question.correctAnswer)
        ) {
          questions.push(question);
        }
      }
    }

    // If we found questions, break the loop
    if (questions.length > 0) {
      break;
    }
  }

  return questions;
};

exports.createQuizByPrompt = async (req, res) => {
  const {
    creatorName,
    creatorWallet,
    prompt,
    numParticipants,
    questionCount,
    rewardPerScore,
    isPublic,
  } = req.body;

  try {
    const params = {
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Generate a quiz with exactly ${questionCount} multiple-choice questions about "${prompt}". 

IMPORTANT FORMATTING INSTRUCTIONS:
- Each question must have EXACTLY 4 options: A, B, C, and D
- Clearly mark the correct answer
- Follow this EXACT format:

Question 1: [Question Text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]

Question 2: [Next Question Text]
...and so on.`,
          },
        ],
      }),
    };

    const response = await bedrockRuntime.invokeModel(params).promise();
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const questions = extractQuestions(result.content[0].text);

    // Rest of the code remains the same
    const totalCost = rewardPerScore * numParticipants * 1.1;
    const quizId = Math.random().toString(36).substring(2, 7);

    const quiz = new Quiz({
      quizId,
      creatorName,
      creatorWallet,
      questions,
      numParticipants,
      totalCost,
      questionCount,
      rewardPerScore,
      isPublic,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

exports.createQuizByPdf = async (req, res) => {
  const {
    creatorName,
    creatorWallet,
    numParticipants,
    questionCount,
    rewardPerScore,
    isPublic,
    totalCost,
  } = req.body;
  const pdfFile = req.file;

  if (!pdfFile) {
    return res.status(400).json({ error: 'No PDF file uploaded.' });
  }

  try {
    // Extract text from PDF
    const pdfData = await pdfParse(pdfFile.buffer);
    const pdfText = pdfData.text;

    const params = {
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `The following is the content of a PDF document:

${pdfText}

Based on this content, generate a quiz with exactly ${questionCount} multiple-choice questions.

IMPORTANT FORMATTING INSTRUCTIONS:
- Each question must have EXACTLY 4 options: A, B, C, and D
- Clearly mark the correct answer
- Follow this EXACT format:

Question 1: [Question Text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]

Question 2: [Next Question Text]
...and so on.`,
          },
        ],
      }),
    };

    const response = await bedrockRuntime.invokeModel(params).promise();
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const questions = extractQuestions(result.content[0].text);

    const quizId = Math.random().toString(36).substring(2, 7);

    const quiz = new Quiz({
      quizId,
      creatorName,
      creatorWallet,
      questions,
      numParticipants,
      totalCost,
      questionCount,
      rewardPerScore,
      isPublic,
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateQuiz = async (req, res) => {
  const data = req.body;

  console.log(data);

  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findOne({ quizId });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    Object.keys(data).forEach((key) => {
      quiz[key] = data[key];
    });

    await quiz.save();
    res.status(200).json(quiz);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

exports.getQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { walletAddress } = req.body;

  try {
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (!quiz.isPublic) {
      return res.status(403).json({ error: 'This quiz is private.' });
    }

    const existingParticipant = await Participant.findOne({
      quizId,
      walletAddress,
    });
    if (existingParticipant) {
      return res
        .status(403)
        .json({ error: 'You have already participated in this quiz.' });
    }

    const participantCount = await Participant.countDocuments({ quizId });
    if (participantCount >= quiz.numParticipants) {
      return res.status(403).json({
        error: 'The number of participants for this quiz has been reached.',
      });
    }

    res.status(200).json(quiz);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

exports.joinQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { walletAddress, participantName } = req.body;

  try {
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (!quiz.isPublic) {
      return res.status(403).json({ error: 'This quiz is private.' });
    }

    const existingParticipant = await Participant.findOne({
      quizId,
      walletAddress,
    });
    if (existingParticipant) {
      return res
        .status(403)
        .json({ error: 'You have already participated in this quiz.' });
    }

    const participantCount = await Participant.countDocuments({ quizId });
    if (participantCount >= quiz.numParticipants) {
      return res.status(403).json({
        error: 'The number of participants for this quiz has been reached.',
      });
    }

    const participant = new Participant({
      quizId,
      participantName,
      walletAddress,
    });
    await participant.save();

    res.status(200).json(participant);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

exports.getLeaderBoards = async (req, res) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const participants = await Participant.find({ quizId });

    res.status(200).json({ quiz, participants });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  const { quizId, walletAddress, answers } = req.body;

  try {
    const quiz = await Quiz.findOne({ quizId });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const participant = await Participant.findOne({ quizId, walletAddress });
    if (!participant) {
      return res.status(403).json({ error: 'You have not joined this quiz.' });
    }

    let score = 0;

    const indexToLetter = ['A', 'B', 'C', 'D'];

    quiz.questions.forEach((question) => {
      const userAnswerIndex = answers[question._id];
      if (userAnswerIndex !== 'no_answer') {
        const userAnswerLetter = indexToLetter[userAnswerIndex];
        if (userAnswerLetter === question.correctAnswer) {
          score++;
        }
      }
    });

    participant.score = score;
    await participant.save();

    res.status(200).json(participant);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};
