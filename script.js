
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const yesDisplay = document.getElementById("yesDisplay");
const noDisplay = document.getElementById("noDisplay");
const downloadButtons = document.getElementById("download-buttons");

let yesVotes = 0;
let noVotes = 0;

function updateVotes() {
  yesDisplay.textContent = `YES: ${yesVotes}`;
  noDisplay.textContent = `NO: ${noVotes}`;
}

function showDownloads() {
  downloadButtons.classList.remove("hidden");
}

function triggerDownload(fileName) {
  const a = document.createElement("a");
  a.href = fileName;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

yesBtn.addEventListener("click", () => {
  yesVotes++;
  updateVotes();
  yesBtn.style.display = "none";
  noBtn.style.display = "none";
  showDownloads();
});

noBtn.addEventListener("click", () => {
  noVotes++;
  updateVotes();
  yesBtn.style.display = "none";
  noBtn.style.display = "none";
  showDownloads();
});

const downloadLinks = downloadButtons.querySelectorAll("a");
downloadLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const href = link.getAttribute("href");
    triggerDownload(href);
    link.remove();
  });
});
