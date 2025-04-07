
let yesCount = 0;
let noCount = 0;
let hasVoted = localStorage.getItem('hasVoted') === 'true';

const yesBtn = document.getElementById('yes-button');
const noBtn = document.getElementById('no-button');
const yesCountDisplay = document.getElementById('yes-count');
const noCountDisplay = document.getElementById('no-count');
const afterVote = document.getElementById('after-vote');

function formatCount(n) {
  return n.toString().padStart(9, '0');
}

function vote(choice) {
  hasVoted = true;
  localStorage.setItem('hasVoted', 'true');
  if (choice === 'yes') {
    yesCount++;
    yesCountDisplay.textContent = formatCount(yesCount);
  } else {
    noCount++;
    noCountDisplay.textContent = formatCount(noCount);
  }

  yesBtn.style.display = 'none';
  noBtn.style.display = 'none';
  afterVote.classList.add('show');
}

yesBtn.onclick = () => vote('yes');
noBtn.onclick = () => vote('no');
