
const firebaseConfig = {
  apiKey: "AIzaSyD-bPKCgbgZxHvK94dqp9Zh2x_TcTnIdGc",
  authDomain: "tramaland2028.firebaseapp.com",
  databaseURL: "https://tramaland2028-default-rtdb.firebaseio.com",
  projectId: "tramaland2028",
  storageBucket: "tramaland2028.appspot.com",
  messagingSenderId: "574127419835",
  appId: "1:574127419835:web:cf5a4187de7636b5acb7a3"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const yesCount = document.getElementById("yesCount");
const noCount = document.getElementById("noCount");
const books = document.getElementById("books");

const votesRef = db.ref("votes");

votesRef.on("value", (snapshot) => {
    const data = snapshot.val();
    yesCount.textContent = "YES: " + (data?.yes || 0);
    noCount.textContent = "NO: " + (data?.no || 0);
});

function vote(option) {
    votesRef.child(option).transaction(current => (current || 0) + 1);
    yesBtn.style.display = "none";
    noBtn.style.display = "none";
    books.classList.remove("hidden");
}

yesBtn.addEventListener("click", () => vote("yes"));
noBtn.addEventListener("click", () => vote("no"));
