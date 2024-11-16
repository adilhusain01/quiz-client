const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    sId: {type: Number},
    quizId: { type: String, required: true, unique: true },
    creatorName: { type: String, required: true },
    creatorWallet: { type: String, required: true },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: String,
    }],
    numParticipants: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    questionCount: { type: Number, required: true },
    rewardPerScore : {type: Number, required: true},
    isPublic: {type: Boolean, default: false},
    isFinished: {type: Boolean, default: false},
});

module.exports = mongoose.model('Quiz', quizSchema);
