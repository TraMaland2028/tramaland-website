
// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyDv4736rT_yRzpT2iNcE0ptjBl7evoL8zA",
  authDomain: "tramaland2028.firebaseapp.com",
  databaseURL: "https://tramaland2028-default-rtdb.firebaseio.com",
  projectId: "tramaland2028",
  storageBucket: "tramaland2028.appspot.com",
  messagingSenderId: "163224729043",
  appId: "1:163224729043:web:d9f04156e931021a482b26",
  measurementId: "G-4YPET2Q0DD"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Элементы
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const yesCount = document.getElementById("yes-count");
const noCount = document.getElementById("no-count");
const downloadButtons = document.getElementById("download-buttons");

// Обновление счётчиков
function updateCounts() {
  db.ref("votes").once("value", snapshot => {
    const data = snapshot.val() || { yes: 0, no: 0 };
    yesCount.textContent = data.yes.toString().padStart(9, "0");
    noCount.textContent = data.no.toString().padStart(9, "0");
  });
}

// Голосование
function vote(option) {
  db.ref("votes").transaction(current => {
    if (current === null) {
      current = { yes: 0, no: 0 };
    }
    current[option]++;
    return current;
  }).then(() => {
    yesBtn.style.display = "none";
    noBtn.style.display = "none";
    downloadButtons.style.display = "block";
    updateCounts();
  });
}

// Обработчики
yesBtn.onclick = () => vote("yes");
noBtn.onclick = () => vote("no");

// Загрузка при старте
updateCounts();
