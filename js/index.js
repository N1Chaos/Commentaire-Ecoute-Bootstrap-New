// ==================== CONSTANTES ====================
const PAGES = {
  page1: "Styles",
  page2: "Effectif",
  page3: "Instruments",
  page4: "Voix",
  page5: "Timbre",
  page6: "Forme",
  page7: "Harmonie",
  page8: "Procédé",
  page9: "Tempo",
  page10: "Rythme",
  page11: "Genre",
  page12: "Dynamique",
  page13: "Langues",
  page14: "Adjectifs"
};

// ==================== FONCTIONS UTILITAIRES ====================
function getPageName() {
  return window.location.pathname.split('/').pop().replace('.html', '');
}

function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

// ==================== GESTION DES MOTS ====================
function deleteWord(page, word) {
  const words = loadFromLocalStorage(`selectedWords_${page}`);
  saveToLocalStorage(`selectedWords_${page}`, words.filter(w => w !== word));
  displayWordsForPage(page);
}

function displayWordsForPage(page) {
  const container = document.querySelector(`.selected-words-container[data-page="${page}"]`);
  if (!container) return;

  const words = loadFromLocalStorage(`selectedWords_${page}`);
  container.innerHTML = words.length > 0 
    ? words.map(word => `<span class="tag">${word}</span>`).join(' ')
    : "<span class='empty'>Aucun mot sélectionné</span>";
}

// ==================== LECTEUR YOUTUBE ====================
function extractVideoID(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  return url.match(regex)?.[1];
}

function loadVideo() {
  const videoID = extractVideoID(document.getElementById('videoUrl').value);
  if (!videoID) return alert('URL YouTube invalide');

  const player = document.getElementById('youtubePlayer');
  player.src = `https://www.youtube.com/embed/${videoID}`;
  localStorage.setItem('youtubeVideoID', videoID);
}

// ==================== ENREGISTREMENT AUDIO ====================
async function setupAudioRecorder() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    let audioChunks = [];
    const recorder = new MediaRecorder(stream);

    recorder.ondataavailable = e => audioChunks.push(e.data);
    recorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      document.getElementById('audioPlayback').src = audioUrl;
      window.audioBlob = audioBlob; // Stocke le blob globalement
    };

    document.getElementById('recordButton').onclick = () => {
      if (recorder.state === 'inactive') {
        audioChunks = [];
        recorder.start();
        this.textContent = "Arrêter";
      } else {
        recorder.stop();
        this.textContent = "Démarrer";
      }
    };
  } catch (error) {
    console.error("Erreur microphone:", error);
  }
}

// ==================== GESTION AUDIO UTILISATEUR ====================
function setupAudioPlayer() {
  const player = document.getElementById('audioPlayer');
  const source = document.getElementById('audioSource');
  const fileInput = document.getElementById('audioFile');

  // Restaurer l'audio sauvegardé
  const savedAudio = localStorage.getItem('userAudioBase64');
  if (savedAudio) {
    source.src = savedAudio;
    player.load();
    player.currentTime = parseFloat(localStorage.getItem('userAudioTime') || 0);
  }

  // Sauvegarder la position
  player.addEventListener('timeupdate', () => {
    localStorage.setItem('userAudioTime', player.currentTime);
  });

  // Gérer les nouveaux fichiers
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      source.src = e.target.result;
      player.load();
      localStorage.setItem('userAudioBase64', e.target.result);
      localStorage.setItem('userAudioTime', '0');
    };
    reader.readAsDataURL(file);
  });
}

// ==================== GÉNÉRATION FICHIER TEXTE ====================
function generateTextFile() {
  const text = document.getElementById('commentText').value.trim();
  if (!text) return alert('Veuillez écrire un commentaire');

  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'commentaire.txt';
  link.click();
}

// ==================== INITIALISATION ====================
document.addEventListener("DOMContentLoaded", () => {
  // Afficher les mots pour toutes les pages
  Object.keys(PAGES).forEach(displayWordsForPage);

  // Restaurer la vidéo YouTube
  const savedVideoID = localStorage.getItem('youtubeVideoID');
  if (savedVideoID) {
    document.getElementById('youtubePlayer').src = `https://www.youtube.com/embed/${savedVideoID}`;
    document.getElementById('videoUrl').value = `https://youtu.be/${savedVideoID}`;
  }

  // Configurer les fonctionnalités
  setupAudioRecorder();
  setupAudioPlayer();

  // Bouton téléchargement audio
  document.getElementById('downloadButton').onclick = () => {
    if (!window.audioBlob) return alert('Aucun enregistrement disponible');
    const fileName = document.getElementById('fileName').value || 'enregistrement';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(window.audioBlob);
    link.download = `${fileName}.wav`;
    link.click();
  };
});