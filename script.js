
const firebaseConfig = {
  // ВСТАВЬ СВОЙ FIREBASE CONFIG СЮДА
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const yesCountEl = document.getElementById("yesCount");
const noCountEl = document.getElementById("noCount");
const books = document.getElementById("books");
const discussBtn = document.getElementById("discussBtn");
const openseaBtn = document.getElementById("openseaBtn");

function updateCounts(snapshot) {
  const data = snapshot.val() || { yes: 0, no: 0 };
  yesCountEl.textContent = data.yes.toString().padStart(9, "0");
  noCountEl.textContent = data.no.toString().padStart(9, "0");
}

firebase.database().ref("votes").on("value", updateCounts);

function handleVote(type) {
  const ref = firebase.database().ref("votes");
  ref.transaction(current => {
    if (current === null) {
      current = { yes: 0, no: 0 };
    }
    current[type]++;
    return current;
  });

  yesBtn.style.display = "none";
  noBtn.style.display = "none";
  books.classList.remove("hidden");
}

yesBtn.onclick = () => handleVote("yes");
noBtn.onclick = () => handleVote("no");

discussBtn.onclick = () => {
  window.open("https://x.com/Waiss77Johann", "_blank");
};

openseaBtn.onclick = () => {
  window.open("https://opensea.io/account", "_blank");
};
