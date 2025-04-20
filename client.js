// client.js

// --- 1. Conexión Inicial a Socket.IO ---
// Establece la conexión con el servidor Socket.IO.
// Cambia la URL si tu servidor no está corriendo localmente en el puerto 3000.
console.log("Attempting to connect to Socket.IO server...");
const socket = io('http://localhost:10000'); // O la URL de tu servidor desplegado: 'https://your-backend-url.com'

// --- 2. Referencias a Elementos del DOM ---
// Obtiene referencias a los elementos HTML que necesitaremos manipular mediante JavaScript.
// Pantallas principales
const joinScreen = document.getElementById('join-screen');
const waitingRoomScreen = document.getElementById('waiting-room');
const gameScreen = document.getElementById('game-screen');
const podiumScreen = document.getElementById('podium-screen');

// Elementos de la pantalla de Unión (Join Screen)
const playerNameInput = document.getElementById('player-name');
const joinButton = document.getElementById('join-button');
const joinError = document.getElementById('join-error'); // Para mostrar errores al unirse

// Elementos de la Sala de Espera (Waiting Room)
const playerListUl = document.getElementById('player-list'); // Lista donde se mostrarán los jugadores conectados

// Elementos de la Pantalla de Juego (Game Screen)
const questionTextElement = document.getElementById('question-text'); // Párrafo para el texto de la pregunta
const optionsContainer = document.getElementById('options-container'); // Div donde se añadirán los botones de respuesta
const questionCounterElement = document.getElementById('question-counter'); // Span para mostrar "Pregunta X/Y"
const themeNameElement = document.getElementById('theme-name'); // Span para mostrar el tema actual
const timerElement = document.getElementById('timer'); // Div para mostrar el temporizador
const feedbackArea = document.getElementById('feedback-area'); // Div para mostrar "Correcto", "Incorrecto", etc.
const progressBarArea = document.getElementById('progress-bar-area'); // Div donde se mostrarán las puntuaciones/ranking

// Elementos de la Pantalla de Podio (Podium Screen)
// (Se acceden dentro de la función displayPodium)

// --- 3. Función para Cambiar Pantallas ---
/**
 * Oculta todas las pantallas y muestra solo la pantalla con el ID especificado.
 * @param {string} screenId - El ID del div de la pantalla a mostrar.
 */
function showScreen(screenId) {
    // Oculta todas las pantallas añadiendo/quitando la clase 'active-screen' definida en CSS.
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active-screen');
    });
    // Muestra la pantalla deseada.
    const screenToShow = document.getElementById(screenId);
    if (screenToShow) {
        screenToShow.classList.add('active-screen');
        console.log(`Switched to screen: ${screenId}`);
    } else {
        // Error si el ID de la pantalla no se encuentra en el HTML.
        console.error("Error: Screen with ID", screenId, "not found.");
    }
}

// --- 4. Variables de Estado del Cliente ---
// Almacena información relevante del lado del cliente durante la sesión.
let currentPlayerName = ''; // Guarda el nombre del jugador actual
let currentGameCode = 'EASTER123'; // Código del juego (podría hacerse dinámico)
let currentQuestionIndex = -1; // Índice de la pregunta actual que se está mostrando/respondiendo
let timerInterval = null; // Variable para guardar el intervalo del temporizador visual


// --- 5. Lógica para Unirse al Juego ---
// Añade un listener al botón "Join / Unirse".
joinButton.addEventListener('click', () => {
    // Obtiene el nombre del jugador del input, quitando espacios extra.
    const playerName = playerNameInput.value.trim();

    // Validación simple: el nombre no puede estar vacío.
    if (playerName) {
        // Nombre válido: limpia errores, guarda el nombre y emite el evento al servidor.
        joinError.textContent = ''; // Limpia mensajes de error previos.
        currentPlayerName = playerName; // Guarda el nombre para uso futuro.

        console.log(`Player ${playerName} attempting to join game ${currentGameCode}`);
        // Envía el evento 'joinGame' al servidor con el código y nombre.
        socket.emit('joinGame', currentGameCode, playerName);

        // Cambia a la pantalla de sala de espera.
        showScreen('waiting-room');

        // Añade el propio nombre a la lista de espera inmediatamente para feedback visual.
        playerListUl.innerHTML = ''; // Limpia el placeholder "Esperando...".
        const myPlayerLi = document.createElement('li');
        myPlayerLi.textContent = `${playerName} (You / Tú)`; // Indica que eres tú.
        // Usa el ID del socket como ID temporal del elemento (puede cambiar si hay reconexión antes de recibir confirmación).
        myPlayerLi.id = `player-${socket.id}`;
        playerListUl.appendChild(myPlayerLi);

    } else {
        // Nombre inválido: muestra un mensaje de error.
        joinError.textContent = 'Please enter your name! / ¡Por favor ingresa tu nombre!';
    }
});

// --- 6. Listeners para Eventos Generales del Servidor ---

/**
 * Se ejecuta cuando la conexión con el servidor Socket.IO se establece con éxito.
 */
socket.on('connect', () => {
    console.log('Successfully connected to server! My Socket ID:', socket.id);
    // Aquí podrías implementar lógica de reconexión si fuera necesario.
});

/**
 * Se ejecuta cuando se pierde la conexión con el servidor.
 * @param {string} reason - La razón de la desconexión.
 */
socket.on('disconnect', (reason) => {
    console.log('Disconnected from server. Reason:', reason);
    // Informa al usuario y generalmente se requiere volver a unirse.
    alert('Connection lost to the server. Please refresh and rejoin. / Conexión perdida con el servidor. Por favor, refresca y únete de nuevo.');
    // Vuelve a la pantalla inicial.
    showScreen('join-screen');
    playerListUl.innerHTML = '<li>Esperando...</li>'; // Resetea la lista de espera visualmente.
});

/**
 * Se ejecuta si ocurre un error al intentar conectar con el servidor.
 * @param {Error} error - El objeto de error.
 */
socket.on('connect_error', (error) => {
    console.error('Connection Attempt Error:', error);
    // Muestra un error en la pantalla de unión si la conexión falla inicialmente.
    if (document.getElementById('join-screen').classList.contains('active-screen')) {
         joinError.textContent = 'Could not connect to the game server. Please try again later. / No se pudo conectar al servidor. Intenta más tarde.';
    }
});

/**
 * Se ejecuta cuando el servidor envía un error específico del juego.
 * @param {string} errorMessage - El mensaje de error enviado por el servidor.
 */
socket.on('gameError', (errorMessage) => {
    // Muestra errores como "Juego lleno", "Nombre inválido", etc.
    console.error('Game Error from server:', errorMessage);
    // Podrías mostrar el error en un área específica o con un alert.
    alert(`Game Error: ${errorMessage}`);
    // Si el error ocurre al unirse, muéstralo en la pantalla de join.
     if (document.getElementById('join-screen').classList.contains('active-screen')) {
         joinError.textContent = errorMessage;
     }
});


// --- 7. Listeners para Eventos de la Sala de Espera ---

/**
 * Se ejecuta cuando el servidor notifica que un nuevo jugador se ha unido a la sala.
 * @param {object} newPlayer - Información del nuevo jugador (ej: { id, playerName }).
 */
socket.on('playerJoined', (newPlayer) => {
    console.log('Server notified: Player joined -', newPlayer);
    // Añade el jugador a la lista visual, asegurándose de no añadirse a sí mismo
    // (ya lo hicimos al hacer clic en Join) y de no añadir duplicados.
    if (socket.id !== newPlayer.id && !document.getElementById(`player-${newPlayer.id}`)) {
        const playerLi = document.createElement('li');
        playerLi.textContent = newPlayer.playerName;
        playerLi.id = `player-${newPlayer.id}`; // Usa el ID proporcionado por el servidor.
        playerListUl.appendChild(playerLi);
    }
});

/**
 * Se ejecuta cuando el servidor envía la lista completa de jugadores actuales.
 * Útil al unirse o si hay reconexiones para sincronizar la lista.
 * @param {Array<object>} players - Array de jugadores (ej: [{ id, playerName }]).
 */
socket.on('currentPlayers', (players) => {
    console.log('Received current player list:', players);
    playerListUl.innerHTML = ''; // Limpiar la lista actual antes de repoblarla.
    players.forEach(player => {
        const playerLi = document.createElement('li');
        // Marca "(You / Tú)" si el ID coincide con el del cliente actual.
        playerLi.textContent = player.playerName + (player.id === socket.id ? ' (You / Tú)' : '');
        playerLi.id = `player-${player.id}`;
        playerListUl.appendChild(playerLi);
    });
});

/**
 * Se ejecuta cuando el servidor notifica que un jugador ha abandonado la sala.
 * @param {object} playerInfo - Información del jugador que se fue (ej: { id, playerName }).
 */
socket.on('playerLeft', (playerInfo) => {
    console.log('Server notified: Player left -', playerInfo);
    // Encuentra el elemento <li> correspondiente al jugador y lo elimina de la lista.
    const playerLi = document.getElementById(`player-${playerInfo.id}`);
    if (playerLi) {
        playerLi.remove();
    }
    // Opcional: Mostrar un mensaje si la lista queda vacía.
    if (playerListUl.children.length === 0) {
        playerListUl.innerHTML = '<li>Waiting for players... / Esperando jugadores...</li>';
    }
});


// --- 8. Listeners para Eventos del Juego ---

/**
 * Se ejecuta cuando el servidor indica que el juego ha comenzado.
 * @param {object} startData - Datos iniciales del juego (puede incluir lista de jugadores).
 */
socket.on('gameStarted', (startData) => {
    console.log('Game is starting!', startData);
    // Cambia a la pantalla de juego.
    showScreen('game-screen');
    // Muestra un mensaje inicial breve.
    feedbackArea.textContent = "Get Ready! / ¡Preparaos!";
    progressBarArea.innerHTML = ''; // Limpia puntuaciones de partidas anteriores.
    // La primera pregunta llegará a través del evento 'nextQuestion'.
});

/**
 * Se ejecuta cuando el servidor envía la siguiente pregunta.
 * @param {object} questionData - Datos de la pregunta (index, totalQuestions, text, options, theme, timeLimit).
 */
socket.on('nextQuestion', (questionData) => {
    console.log('Next question received:', questionData);
    currentQuestionIndex = questionData.index; // Actualiza el índice de la pregunta actual.
    feedbackArea.innerHTML = ''; // Limpia el feedback de la pregunta anterior.
    enableAnswerButtons(); // Reactiva los botones de respuesta.
    displayQuestion(questionData); // Muestra la información de la nueva pregunta y opciones.
    startTimer(questionData.timeLimit); // Inicia el temporizador visual para esta pregunta.
    showScreen('game-screen'); // Asegura que la pantalla de juego esté visible.
});

/**
 * Se ejecuta cuando el servidor envía el resultado de la respuesta del jugador actual.
 * @param {object} resultData - Datos del resultado (isCorrect, correctAnswer, scoreEarned, currentScore, timeUp?).
 */
socket.on('answerResult', (resultData) => {
    console.log('Answer result received:', resultData);
    clearInterval(timerInterval); // Detiene el temporizador visual.

    // Muestra si la respuesta fue correcta, incorrecta o si se acabó el tiempo.
    if (resultData.timeUp) {
        feedbackArea.textContent = "Time's up! / ¡Se acabó el tiempo!";
    } else {
        feedbackArea.textContent = resultData.isCorrect ? 'Correct! / ¡Correcto!' : 'Incorrect! / ¡Incorrecto!';
        // Opcional: Resaltar visualmente las respuestas (requiere CSS).
        highlightAnswers(resultData.correctAnswer, resultData.chosenAnswer); // Necesita que el servidor envíe 'chosenAnswer'.
    }

    disableAnswerButtons(); // Deshabilita los botones después de responder/tiempo fuera.

    // Actualiza la puntuación visual si el servidor la envía con este evento.
    if (resultData.scores) {
        updateProgressBar(resultData.scores);
    }
});

/**
 * Se ejecuta cuando el servidor envía una actualización de las puntuaciones de todos los jugadores.
 * Suele ocurrir después de que todos responden o se acaba el tiempo de una pregunta.
 * @param {Array<object>} scoreData - Array de jugadores con sus puntuaciones, ordenado por el servidor.
 */
socket.on('updateScores', (scoreData) => {
    console.log('Scores updated:', scoreData);
    // Llama a la función que actualiza la tabla/barra de puntuaciones visible en pantalla.
    updateProgressBar(scoreData);
});

/**
 * Se ejecuta cuando el servidor declara que el juego ha terminado.
 * @param {Array<object>} finalResults - Array de jugadores con sus puntuaciones finales, ordenado por el servidor.
 */
socket.on('gameOver', (finalResults) => {
    console.log('Game Over! Final results:', finalResults);
    // Llama a la función que muestra el podio final.
    displayPodium(finalResults);
    // Cambia a la pantalla de podio.
    showScreen('podium-screen');
});


// --- 9. Funciones para Actualizar la Interfaz de Usuario (UI) ---

/**
 * Actualiza la pantalla con la información de la pregunta actual.
 * Crea dinámicamente los botones de respuesta.
 * @param {object} questionData - Objeto con los datos de la pregunta.
 */
function displayQuestion(questionData) {
    console.log("Displaying question:", questionData.index);
    // Actualiza los textos en pantalla.
    questionTextElement.textContent = questionData.text; // Asume texto en el idioma preferido.
    questionCounterElement.textContent = `Question ${questionData.index + 1}/${questionData.totalQuestions}`;
    themeNameElement.textContent = questionData.theme;

    // Limpia los botones de opciones de la pregunta anterior.
    optionsContainer.innerHTML = '';
    // Crea un nuevo botón para cada opción recibida.
    questionData.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-button'); // Clase para estilos generales.
        // Guarda el identificador de la opción (A, B, C, D) en el dataset para usarlo al hacer clic.
        button.dataset.optionId = option.id;
        button.textContent = `${option.id}. ${option.text}`; // Texto del botón.
        button.onclick = handleAnswerClick; // Asigna la función que maneja el clic.
        optionsContainer.appendChild(button); // Añade el botón al contenedor.
    });
}

/**
 * Manejador de evento para cuando se hace clic en un botón de respuesta.
 * @param {Event} event - El objeto del evento de clic.
 */
function handleAnswerClick(event) {
    // Obtiene la ID de la opción elegida ('A', 'B', etc.) desde el dataset del botón.
    const chosenOptionId = event.target.dataset.optionId;
    console.log(`Answer button clicked: ${chosenOptionId}`);

    // Deshabilita todos los botones de opción inmediatamente para evitar múltiples respuestas.
    disableAnswerButtons();
    // Muestra un feedback inmediato al usuario.
    feedbackArea.textContent = "Processing... / Procesando...";
    // Detiene el temporizador visual.
    clearInterval(timerInterval);

    // Envía la respuesta elegida al servidor.
    socket.emit('submitAnswer', {
        answerId: chosenOptionId
        // podrías incluir questionIndex si el backend lo requiere: questionIndex: currentQuestionIndex
    });
}

/**
 * Deshabilita todos los botones de opción.
 */
function disableAnswerButtons() {
    optionsContainer.querySelectorAll('.option-button').forEach(button => {
        button.disabled = true;
        // Añade una clase CSS para dar estilo visual a los botones deshabilitados.
        button.classList.add('disabled');
    });
}

/**
 * Habilita todos los botones de opción y limpia estilos de respuesta anterior.
 */
function enableAnswerButtons() {
    optionsContainer.querySelectorAll('.option-button').forEach(button => {
        button.disabled = false;
        // Quita clases de estado (deshabilitado, correcto, incorrecto).
        button.classList.remove('disabled', 'correct', 'incorrect');
        // Reasigna el manejador de clic por si se había quitado.
        button.onclick = handleAnswerClick;
    });
}

/**
 * (Opcional) Resalta visualmente la respuesta correcta y/o la elegida por el usuario.
 * Requiere añadir clases CSS '.correct' e '.incorrect'.
 * @param {string} correctId - La ID de la opción correcta (ej: 'B').
 * @param {string} chosenId - La ID de la opción elegida por el usuario (ej: 'A').
 */
function highlightAnswers(correctId, chosenId) {
     // Verifica que los IDs existan antes de proceder
    if (!correctId) return;

    optionsContainer.querySelectorAll('.option-button').forEach(button => {
        const optionId = button.dataset.optionId;
        // Resalta la respuesta correcta.
        if (optionId === correctId) {
            button.classList.add('correct'); // Necesita CSS: .correct { background-color: lightgreen; }
        }
        // Si el usuario eligió una opción y NO era la correcta, la resalta como incorrecta.
        else if (optionId === chosenId) {
             button.classList.add('incorrect'); // Necesita CSS: .incorrect { background-color: lightcoral; }
        }
        // Podrías añadir otros estilos, como opacidad para las no elegidas.
    });
}


/**
 * Inicia y actualiza el temporizador visual en pantalla.
 * @param {number} seconds - El número de segundos para la cuenta atrás.
 */
function startTimer(seconds) {
    clearInterval(timerInterval); // Limpia cualquier intervalo de timer anterior.
    let timeLeft = seconds;
    timerElement.textContent = formatTime(timeLeft); // Muestra el tiempo inicial.
    timerElement.style.color = 'black'; // Resetea el color del texto del timer.

    // Crea un intervalo que se ejecuta cada segundo.
    timerInterval = setInterval(() => {
        timeLeft--; // Decrementa el tiempo restante.
        timerElement.textContent = formatTime(timeLeft); // Actualiza el texto del timer.

        // Cambia el color del texto si queda poco tiempo como alerta visual.
        if (timeLeft <= 5 && timeLeft > 3) {
            timerElement.style.color = 'orange';
        } else if (timeLeft <= 3 && timeLeft > 0) {
             timerElement.style.color = 'red';
        }
        // Si el tiempo llega a cero.
        else if (timeLeft <= 0) {
            timerElement.style.color = 'darkred'; // Color final
            clearInterval(timerInterval); // Detiene el intervalo.
            // La lógica de qué pasa al agotarse el tiempo la maneja principalmente el servidor,
            // pero podemos mostrar un mensaje aquí y deshabilitar botones.
            // feedbackArea.textContent = "Time's up! / ¡Se acabó el tiempo!";
            // disableAnswerButtons();
        }
    }, 1000); // 1000 milisegundos = 1 segundo.
}

/**
 * Formatea un número de segundos en formato MM:SS.
 * @param {number} seconds - El total de segundos.
 * @returns {string} - El tiempo formateado como "MM:SS".
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    // padStart asegura que siempre haya dos dígitos (ej: 05 en vez de 5).
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}


/**
 * Actualiza el área de la interfaz que muestra las puntuaciones/ranking.
 * @param {Array<object>} scoreData - Array de jugadores ordenado por puntuación.
 */
function updateProgressBar(scoreData) {
    // Limpia el área y añade un título.
    progressBarArea.innerHTML = '<h3>Scores / Puntuaciones:</h3>';
    const list = document.createElement('ul');
    list.style.listStyle = 'none'; // Sin viñetas.
    list.style.padding = '0';
    list.style.marginTop = '10px';

    // Crea un elemento de lista para cada jugador en los datos recibidos.
    scoreData.forEach((player, index) => {
        const item = document.createElement('li');
        // Estilos básicos para cada item de la lista.
        item.style.margin = '5px 0';
        item.style.padding = '8px';
        item.style.backgroundColor = '#f0f0f0';
        item.style.borderRadius = '4px';
        item.style.display = 'flex'; // Usa flexbox para alinear nombre y score.
        item.style.justifyContent = 'space-between';
        item.style.alignItems = 'center';

        // Span para el nombre del jugador (y posición).
        const nameSpan = document.createElement('span');
        // Añade "(You / Tú)" si el ID coincide con el del cliente actual.
        nameSpan.textContent = `${index + 1}. ${player.playerName}` + (player.playerId === socket.id ? ' (You / Tú)' : '');
        // Pone en negrita tu propio nombre.
        nameSpan.style.fontWeight = (player.playerId === socket.id ? 'bold' : 'normal');

        // Span para la puntuación.
        const scoreSpan = document.createElement('span');
        scoreSpan.textContent = `${player.score} pts`;
        scoreSpan.style.fontWeight = 'bold'; // Puntuación en negrita.

        // Añade nombre y score al item de la lista.
        item.appendChild(nameSpan);
        item.appendChild(scoreSpan);

        // (Aquí podrías añadir una barra de progreso visual si quisieras)

        // Añade el item completo a la lista.
        list.appendChild(item);
    });
    // Añade la lista completa al div del área de progreso.
    progressBarArea.appendChild(list);
}


/**
 * Muestra los resultados finales en la pantalla del podio.
 * @param {Array<object>} finalResults - Array de jugadores ordenado por puntuación final.
 */
function displayPodium(finalResults) {
    // Mapea los ID de los divs del podio a los jugadores correspondientes según su ranking.
    const podiumPlaces = {
        'podium-1st': finalResults[0], // Primer lugar
        'podium-2nd': finalResults[1], // Segundo lugar
        'podium-3rd': finalResults[2], // Tercer lugar
        'podium-4th': finalResults[3]  // Cuarto lugar (puede no existir)
    };

    // Itera sobre los puestos del podio definidos en el HTML.
    for (const podiumId in podiumPlaces) {
        const placeDiv = document.getElementById(podiumId); // Encuentra el div del puesto.
        const player = podiumPlaces[podiumId]; // Obtiene el jugador para ese puesto (si existe).

        // Si el div del puesto existe en el HTML.
        if (placeDiv) {
            // Si hay un jugador para ese puesto.
            if (player) {
                placeDiv.style.visibility = 'visible'; // Asegura que el puesto sea visible.
                // Actualiza el nombre del jugador en el elemento correspondiente.
                placeDiv.querySelector('.player-name').textContent = player.playerName;
                // Actualiza la puntuación (si el elemento existe para ese puesto).
                const scoreElement = placeDiv.querySelector('.player-score');
                if (scoreElement) { // 1ro, 2do, 3ro tienen .player-score
                    scoreElement.textContent = `Score: ${player.score}`;
                } else if (podiumId === 'podium-4th') { // El 4to lugar tiene el score en el mismo <p>
                    placeDiv.querySelector('p.player-name').textContent = `${player.playerName} - Score: ${player.score}`;
                }
                // Resalta tu propia posición en el podio.
                if (player.playerId === socket.id) {
                    placeDiv.querySelector('.player-name').textContent += ' (You / Tú)';
                    placeDiv.style.border = '3px solid gold'; // Añade un borde dorado.
                    placeDiv.style.transform = 'scale(1.05)'; // Lo hace un poco más grande.
                } else {
                    // Quita estilos especiales si no eres tú.
                    placeDiv.style.border = 'none';
                    placeDiv.style.transform = 'none';
                }
            } else {
                // Si no hay jugador para ese puesto (ej: solo 3 jugadores), oculta el div.
                placeDiv.style.visibility = 'hidden';
            }
        }
    }

    // Añade funcionalidad al botón "Play Again".
    const playAgainButton = document.getElementById('play-again-button');
    if (playAgainButton) {
        playAgainButton.onclick = () => {
            // La forma más simple de reiniciar es recargar la página.
            // Esto crea una nueva sesión y conexión.
            window.location.reload();
        };
    }
}

// --- 10. Inicialización ---
// Al cargar la página, asegúrate de que solo la pantalla de 'Join' esté visible inicialmente.
// La clase 'active-screen' debe estar puesta en el div 'join-screen' en el HTML
// o puedes llamarlo aquí explícitamente:
showScreen('join-screen');
console.log("Client script initialized. Waiting for player input.");
