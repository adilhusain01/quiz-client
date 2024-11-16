const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    quizId: { type: String, required: true },
    participantName: { type: String, required: true },
    walletAddress: { type: String, required: true },
    score: { type: Number, default: null },
});

module.exports = mongoose.model('Participant', participantSchema);
