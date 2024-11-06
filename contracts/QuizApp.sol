// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract QuizApp {
    address public owner;
    uint256 public quizIdCounter;

    struct Participant {
        address addr;
        uint256 score;
    }

    struct Quiz {
        uint256 id;               
        string qid;                
        address creator;          
        uint256 budget;           
        uint256 questionsCount;   
        uint256 participantCount; 
        uint256 rewardPerPoint;   
        uint256 totalScore;       
        bool active;              
        Participant[] participants; 
        mapping(address => bool) hasParticipated; 
        mapping(address => uint256) participantScores; 
    }

    mapping(uint256 => Quiz) public quizzes;

    modifier onlyQuizCreator(uint256 _quizId) {
        require(quizzes[_quizId].creator == msg.sender, "Only the quiz creator can perform this action");
        _;
    }

    modifier quizExists(uint256 _quizId) {
        require(quizzes[_quizId].creator != address(0), "Quiz does not exist");
        _;
    }

    modifier quizIsActive(uint256 _quizId) {
        require(quizzes[_quizId].active == true, "Quiz is not active");
        _;
    }

    event QuizCreated(uint256 quizId, string qid, address creator, uint256 budget, uint256 questionsCount);
    event ParticipantJoined(uint256 quizId, address participant, uint256 score);
    event QuizEnded(uint256 quizId, uint256 totalDistributed);

    constructor() {
        owner = msg.sender;
        quizIdCounter = 1;
    }

    // Create a new quiz and immediately transfer 10% of the budget to the contract owner
    function createQuiz(string calldata _qid, uint256 _questionsCount, uint256 _rewardPerPoint) external payable {
        require(msg.value > 0, "Budget must be greater than 0");
        require(_questionsCount > 0, "There must be at least one question");
        require(_rewardPerPoint > 0, "Reward per point must be greater than 0");

        // Calculate 10% of the budget accurately
        uint256 creatorFee = (msg.value * 8) / 100;

        // Transfer the 10% fee to the contract owner
        payable(owner).transfer(creatorFee);

        // The remaining 90% will be the quiz budget
        uint256 remainingBudget = msg.value - creatorFee;

        uint256 newQuizId = quizIdCounter;
        Quiz storage quiz = quizzes[newQuizId];
        quiz.id = newQuizId;
        quiz.qid = _qid; // Database quiz identifier
        quiz.creator = msg.sender;
        quiz.budget = remainingBudget;
        quiz.questionsCount = _questionsCount;
        quiz.rewardPerPoint = _rewardPerPoint;
        quiz.active = true;
        quiz.totalScore = 0;
        quiz.participantCount = 0;

        quizIdCounter++;

        emit QuizCreated(newQuizId, _qid, msg.sender, remainingBudget, _questionsCount);
    }

    // Participant joins the quiz with their score
    function joinQuiz(uint256 _quizId, uint256 _score) external quizExists(_quizId) quizIsActive(_quizId) {
        Quiz storage quiz = quizzes[_quizId];
        require(!quiz.hasParticipated[msg.sender], "Already participated");
        require(_score > 0, "Score must be greater than 0");

        quiz.participants.push(Participant(msg.sender, _score));
        quiz.hasParticipated[msg.sender] = true;
        quiz.participantScores[msg.sender] = _score;
        quiz.totalScore += _score;
        quiz.participantCount++;

        emit ParticipantJoined(_quizId, msg.sender, _score);
    }

    // Quiz creator ends the quiz and distributes the budget based on scores
    function endQuiz(uint256 _quizId) external onlyQuizCreator(_quizId) quizExists(_quizId) quizIsActive(_quizId) {
        Quiz storage quiz = quizzes[_quizId];
        require(quiz.participants.length > 0, "No participants to distribute");
        require(quiz.totalScore > 0, "Total score must be greater than 0");

        quiz.active = false;
        uint256 totalDistributed = 0;

        // Distribute rewards to participants
        for (uint256 i = 0; i < quiz.participants.length; i++) {
            Participant memory participant = quiz.participants[i];
            uint256 reward = participant.score * quiz.rewardPerPoint;
            totalDistributed += reward;
            payable(participant.addr).transfer(reward);
        }

        // Refund the remaining amount to the quiz creator
        uint256 remainingBudget = quiz.budget - totalDistributed;
        payable(quiz.creator).transfer(remainingBudget);

        emit QuizEnded(_quizId, totalDistributed);
    }

    // Get all quiz IDs and their corresponding QIDs
    function getAllQuizzes() external view returns (uint256[] memory, string[] memory) {
        uint256[] memory quizIds = new uint256[](quizIdCounter - 1);
        string[] memory quizQids = new string[](quizIdCounter - 1);

        for (uint256 i = 1; i < quizIdCounter; i++) {
            quizIds[i - 1] = quizzes[i].id;
            quizQids[i - 1] = quizzes[i].qid;
        }

        return (quizIds, quizQids);
    }

    // Get participants for a specific quiz
    function getParticipants(uint256 _quizId) external view quizExists(_quizId) returns (Participant[] memory) {
        return quizzes[_quizId].participants;
    }
}
