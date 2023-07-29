// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, set, ref, onValue } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDM2oOGBVEpW0xeqNlZGjOn2TBSbDG8Tow",
  authDomain: "ichat-70e65.firebaseapp.com",
  databaseURL: "https://ichat-70e65-default-rtdb.firebaseio.com",
  projectId: "ichat-70e65",
  storageBucket: "ichat-70e65.appspot.com",
  messagingSenderId: "897708561792",
  appId: "1:897708561792:web:40a15e74e2ffee83dc9d65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
const db = getDatabase();


// Função para obter o nome do jogador pelo seu UID
function getPlayerNameByUid(playerUid) {
    return new Promise((resolve) => {
      // Crie uma referência para o nó do jogador no banco de dados usando o UID
      const playerRef = ref(database, 'users/' + playerUid + '/dataPlayer/name');
  
      // Use a função onValue para escutar as alterações no nome do jogador
      onValue(playerRef, (snapshot) => {
        const playerName = snapshot.val();
        // Resolva a promise com o nome do jogador
        resolve(playerName);
      });
    });
  }

document.addEventListener("DOMContentLoaded", () => {
    const playerUUID = localStorage.getItem('uuidVirtualSchool');



    // Atualiza o status do jogador para online ao entrar na página
    const statusRef = ref(db, 'users/' + playerUUID + '/status');
    set(statusRef, 'online');
  
    onValue(ref(db, 'users/' + playerUUID), (snapshot) => {
      const dataPlayer = snapshot.val().dataPlayer;
  
      // Exiba apenas o nome do personagem na div apropriada
      showCharacterName(dataPlayer.name);
    });

    
    // Listener para monitorar mudanças nos dados dos outros jogadores
    onValue(ref(db, 'users'), (snapshot) => {
        const allPlayers = snapshot.val();
        for (const playerUid in allPlayers) {
          if (playerUid !== playerUUID) {
            const playerData = allPlayers[playerUid];
            if (playerData.status === 'online') {
              // O jogador está online, então crie ou atualize o personagem na tela
              updateOtherCharacterPosition(playerUid, playerData.position);
            } else {
              // O jogador está offline, remova o personagem da tela, se existir
              removeOtherCharacter(playerUid);
            }
          }
        }
      });

      // Função para remover o personagem do jogador offline da tela
    function removeOtherCharacter(playerUid) {
        const otherCharacterDiv = document.getElementById(playerUid);
        if (otherCharacterDiv) {
        otherCharacterDiv.remove();
        }
    }
  });
  
  // Atualiza a posição do personagem do outro jogador na tela
  function updateOtherCharacterPosition(playerUid, position) {
    if (position && typeof position.x === 'number' && typeof position.y === 'number') {
      const otherCharacterDiv = document.getElementById(playerUid);
      if (otherCharacterDiv) {
        otherCharacterDiv.style.left = `${position.x}px`;
        otherCharacterDiv.style.top = `${position.y}px`;
      } else {
        // Se o personagem ainda não existe na tela, crie-o
        createOtherCharacter(playerUid, position);
      }

    // Crie ou atualize o elemento para exibir o nome do jogador
    updateOtherCharacterName(playerUid, position);


    } else {
      console.error(`Erro: posição inválida para o jogador com UUID ${playerUid}`);
    }
  }

// Cria ou atualiza o elemento para exibir o nome do jogador acima do personagem
async function updateOtherCharacterName(playerUid, position) {
    const playerNameDivId = playerUid + '-name';
    let playerNameDiv = document.getElementById(playerNameDivId);
  
    // Obtenha o nome do jogador usando a função getPlayerNameByUid
    const playerName = await getPlayerNameByUid(playerUid);
  
    // Verifique se o jogador está offline antes de exibir o nome
    const playerStatusRef = ref(database, 'users/' + playerUid + '/status');
    onValue(playerStatusRef, (snapshot) => {
      const playerStatus = snapshot.val();
      if (playerStatus === 'offline') {
        // O jogador está offline, remova o elemento do nome do jogador, se existir
        if (playerNameDiv) {
          playerNameDiv.remove();
        }
      } else {
        // O jogador está online, crie ou atualize o elemento para exibir o nome
        if (!playerNameDiv) {
          playerNameDiv = document.createElement('div');
          playerNameDiv.id = playerNameDivId;
          playerNameDiv.className = 'player-name'; // Defina a classe CSS para estilização
          document.body.appendChild(playerNameDiv);
        }
  
        // Atualize a posição do nome do jogador acima do personagem
        playerNameDiv.style.left = `${position.x}px`;
        playerNameDiv.style.top = `${position.y - 20}px`; // Ajuste a posição para que o nome fique acima do personagem
  
        // Exiba o nome do jogador no elemento
        playerNameDiv.textContent = playerName;
      }
    });
  }
  
  // Cria o personagem do outro jogador na tela
  function createOtherCharacter(playerUid, position) {
    const otherCharacterDiv = document.createElement('div');
    otherCharacterDiv.id = playerUid;
    otherCharacterDiv.className = 'character-box other-character';
    document.body.appendChild(otherCharacterDiv);
    updateOtherCharacterPosition(playerUid, position);
  }


  function showCharacterName(name) {
    const characterNameDiv = document.getElementById('characterName');
    characterNameDiv.textContent = name;
  }

      // Função para atualizar a posição do jogador no banco de dados
      function updatePlayerPosition(position) {
        const playerUUID = localStorage.getItem('uuidVirtualSchool');
        const positionRef = ref(db, 'users/' + playerUUID + '/position');
        set(positionRef, position);
    }


let playerPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // Posição inicial do jogador (centro da tela)
// Atualiza a posição do personagem na tela
function updateCharacterPosition() {
    const characterDiv = document.getElementById('character-box');
    characterDiv.style.left = `${playerPosition.x}px`;
    characterDiv.style.top = `${playerPosition.y}px`;
  
    // Atualiza a posição do jogador no banco de dados
    updatePlayerPosition(playerPosition);
  }
  
  // Função para movimentar o jogador
  function moveCharacter(keyCode) {
    const step = 5; // Quantidade de pixels para mover o jogador
  
    switch (keyCode) {
      case 87: // Tecla W (para cima)
        playerPosition.y -= step;
        break;
      case 83: // Tecla S (para baixo)
        playerPosition.y += step;
        break;
      case 65: // Tecla A (para a esquerda)
        playerPosition.x -= step;
        break;
      case 68: // Tecla D (para a direita)
        playerPosition.x += step;
        break;
    }
  
    updateCharacterPosition();
  }
  
  // Event listener para detectar quando uma tecla é pressionada
  document.addEventListener("keydown", (event) => {
    moveCharacter(event.keyCode);
  });

  

//Define o player offline
window.addEventListener("beforeunload", () => {
    const playerUUID = localStorage.getItem('uuidVirtualSchool');
  
    // Atualiza o status do jogador para offline ao sair da página
    const statusRef = ref(db, 'users/' + playerUUID + '/status');
    set(statusRef, 'offline');
  });

