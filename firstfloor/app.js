// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, set, ref, onValue, get, child, push } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";


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
  
        // Verifica se o jogador está em um left maior que 1390
        if (position.x > 1390) {
          // Se estiver em um left entre 1650 e 1735
          if (position.x >= 1650 && position.x <= 1735 && position.y < 323) {
            // Verifica se o jogador está com top menor que 323
            if (position.y < 323) {
              position.y = 323; // Define o top mínimo para 323
            }
  
            // Reduz o tamanho do jogador quando ele está entre 1650 e 1735
            otherCharacterDiv.style.transform = 'scale(0.8)';
  
            // Muda o zIndex para que o jogador fique por trás dos outros quando está nessa posição
            otherCharacterDiv.style.zIndex = '3';
          } else {
            // Se não estiver entre 1650 e 1735, garanta que o top não seja menor que 323
            if (position.y < 323) {
              position.y = 323; // Define o top mínimo para 323
            }
  
            // Restaura o tamanho original do jogador quando não está entre 1650 e 1735
            otherCharacterDiv.style.transform = 'scale(1)';
  
            // Restaura o zIndex original do jogador quando não está nessa posição
            otherCharacterDiv.style.zIndex = '6';
          }
        }
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
  
    // Cria o balão de fala e adiciona-o à character-box
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble';
    speechBubble.style.display = 'none';
    otherCharacterDiv.appendChild(speechBubble);
  
    document.body.appendChild(otherCharacterDiv);
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


let playerPosition = { x: 235.5, y: 333.5 }; // Posição inicial do jogador

// Atualiza a posição do personagem na tela
function updateCharacterPosition() {
    const characterDiv = document.getElementById('character-box');
    characterDiv.style.left = `${playerPosition.x}px`;
    characterDiv.style.top = `${playerPosition.y}px`;
  
    // Atualiza a posição do jogador no banco de dados
    updatePlayerPosition(playerPosition);

  }
  
  // Função para movimentar o jogador

        //Posição do Elevador
        const doorRef = ref(db, 'elevator/door/state')

        const left = document.getElementById('left-door');
        left.style.transform = 'translate(0px, -300px)'

        const right = document.getElementById('right-door')
        right.style.transform = 'translate(0px, -300px)'

        onValue(doorRef, (snapshot) => {
            const data = snapshot.val()
            if(data == 'open'){
                left.style.animation = 'leftDoorElevator 2s ease-in';
                right.style.animation = 'rightDoorElevator 2s ease-in';
                setTimeout(() => {
                  left.style.transform = 'translate(-105px, -300px)';
                  right.style.transform = 'translate(105px, -300px)';
                }, 1000 * 1.8);
            }else{
                left.style.animation = 'leftDoorElevatorClose 2s ease-in';
                right.style.animation = 'rightDoorElevatorClose 2s ease-in';
                setTimeout(() => {
                  left.style.transform = 'translate(0px, -300px)';
                  right.style.transform = 'translate(0px, -300px)';
                }, 1000 * 1.8);
            }
        });
        
        // Referência para a porta esquerda do elevador no banco de dados
        const leftDoorRef = ref(db, 'elevators/doors/left');
        // Referência para a porta direita do elevador no banco de dados
        const rightDoorRef = ref(db, 'elevators/doors/right');

  function moveCharacter(keyCode) {
    const step = 5; // Quantidade de pixels para mover o jogador

          //Abrir elevador

              // Verifica se a tecla pressionada é a barra de espaço (keyCode 32)
              if (keyCode === 32) {
                // Verifica se o jogador está na posição e altura corretas para acionar o código
                if (
                  playerPosition.x >= 1775 &&
                  playerPosition.x <= 1870 &&
                  playerPosition.y < 333
                ) {

                  if (left.style.transform == 'translate(0px, -300px)') {
                    set(doorRef, 'open')
                  } else {
                    set(doorRef, 'closed')
                  }
                }
              }
              if (keyCode === 32) {
                // Verifica se o jogador está na posição e altura corretas para acionar o código
                if (
                  playerPosition.x >= 1650 &&
                  playerPosition.x <= 1735 &&
                  playerPosition.y < 320
                ) {

                  if (left.style.transform == 'translate(0px, -300px)') {
                    set(doorRef, 'open')
                  } else {
                    set(doorRef, 'closed')
                  }
                }
              }

          //---------

                    // Verifica se o jogador está em um left maior que 1390
                    if (playerPosition.x > 1390) {
                      // Se estiver em um left entre 1650 e 1735
                      if (playerPosition.x >= 1650 && playerPosition.x <= 1735 && playerPosition.y < 320 && left.style.transform == 'translate(-105px, -300px)' ) {
                        // Verifica se o jogador está com top menor que 323
                        if (playerPosition.y < 310) {
                          playerPosition.y = 310; // Define o top mínimo para 323
                        }
                              // Reduz o tamanho do jogador quando ele está entre 1650 e 1735
                              const characterDiv = document.getElementById('character-box');
                              characterDiv.style.transform = 'scale(0.8)';

                              // Muda o zIndex para que o jogador fique por trás dos outros quando está nessa posição
                              characterDiv.style.zIndex = '3';
                      } else {
                        // Se não estiver entre 1650 e 1735, garanta que o top não seja menor que 323
                        if (playerPosition.y < 323) {
                          playerPosition.y = 323; // Define o top mínimo para 323
                        }
                              // Restaura o tamanho original do jogador quando não está entre 1650 e 1735
                              const characterDiv = document.getElementById('character-box');
                              characterDiv.style.transform = 'scale(1)';

                              // Restaura o zIndex original do jogador quando não está nessa posição
                              characterDiv.style.zIndex = '6';
                      }
                    }

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

    // Função para controlar o scrollX da página
    function controlScroll(event) {
        // Obter a posição horizontal atual do mouse
        const mouseX = event.clientX;
  
        // Definir a quantidade de deslocamento horizontal (pode ajustar o valor para uma rolagem mais rápida ou lenta)
        const scrollSpeed = 4;
  
        // Ajustar o scrollX da página de acordo com o movimento do mouse
        window.scrollBy(mouseX > window.innerWidth / 2 ? scrollSpeed : -scrollSpeed, 0);
      }
  
      // Adicionar o ouvinte de eventos ao movimento do mouse
      document.addEventListener('mousemove', controlScroll);

//Sistema de fala

const speechBubble = document.getElementById('speechBubble');
const playerSay = document.getElementById('player-say');
const playerUUID = localStorage.getItem('uuidVirtualSchool');

// Referência para a coleção de mensagens no Firebase
const messagesRef = ref(database, 'messages');

// Função para enviar a mensagem do jogador para o Firebase
function sendMessage(message) {
  set(push(messagesRef), { sender: playerUUID, text: message });
}


// Função para criar e gerenciar o balão de fala de um jogador
function createSpeechBubble(playerUid) {
  const speechBubbleId = playerUid + '-speechBubble';
  let speechBubble = document.getElementById(speechBubbleId);

  if (!speechBubble) {
    // Cria o balão de fala se ainda não existir
    speechBubble = document.createElement('div');
    speechBubble.id = speechBubbleId;
    speechBubble.className = 'speech-bubble';
    document.getElementById('character-box').appendChild(speechBubble);
  }

  // Esconde o balão de fala inicialmente
  speechBubble.style.display = 'none';

  return speechBubble;
}

// Função para exibir o balão de fala com a frase recebida
function showSpeechBubble(playerUid, text) {
  const speechBubble = createSpeechBubble(playerUid);
  speechBubble.textContent = text;
  speechBubble.style.display = 'block';

  // Obtém a character-box do jogador pelo ID
  const characterBox = document.getElementById(playerUid);
  if (characterBox) {
    characterBox.appendChild(speechBubble);
  }

  setTimeout(() => {
    hideSpeechBubble(playerUid);
  }, 10000);
}

// Função para esconder o balão de fala
function hideSpeechBubble(playerUid) {
  const speechBubble = document.getElementById(playerUid + '-speechBubble');
  if (speechBubble) {
    speechBubble.style.display = 'none';

    // Remove o balão de fala da character-box
    const characterBox = document.getElementById(playerUid);
    if (characterBox) {
      characterBox.removeChild(speechBubble);
    }
  }
}

// Evento de escuta para detectar quando o jogador pressiona a tecla "Enter"
playerSay.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    // Verifica se a tecla pressionada é "Enter" (código 13)
    const text = playerSay.value.trim();
    if (text !== '') {
      showSpeechBubble(playerUUID, text); // Exibe o balão de fala acima da cabeça do jogador
      sendMessage(text); // Envia a mensagem para o Firebase quando o jogador pressiona "Enter"
      playerSay.value = ''; // Limpa o textarea após enviar a mensagem
    }
    event.preventDefault(); // Impede a quebra de linha no textarea
  }
});

// Evento de escuta para receber as mensagens de outros players
onValue(messagesRef, (snapshot) => {
  const messages = snapshot.val();
  for (const key in messages) {
    const message = messages[key];
    if (message.sender !== playerUUID) {
      // Exibe o balão de fala acima da cabeça do jogador que enviou a mensagem
      showSpeechBubble(message.sender, message.text);
    }
  }
});

