// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // ¡Ajusta esto en producción por seguridad!
    methods: ["GET", "POST"]
  }
});

// --- Datos del Juego (Preguntas) ---
// Vamos a agrupar las preguntas por tema. Usaremos algunas de las que creamos.
const gameThemes = {
    'Tradiciones': [
        { text_en: "Where does the Easter Bunny tradition supposedly originate?", text_es: "¿De dónde se supone que se origina la tradición del Conejo de Pascua?", options: [{id: 'A', text: 'USA'}, {id: 'B', text: 'Germany / Alemania'}, {id: 'C', text: 'Mexico'}, {id: 'D', text: 'Australia'}], correct: 'B', points: 1000 },
        { text_en: "What food is traditionally avoided on Good Friday in many Catholic countries?", text_es: "¿Qué comida se evita tradicionalmente el Viernes Santo en muchos países católicos?", options: [{id: 'A', text: 'Bread / Pan'}, {id: 'B', text: 'Vegetables / Verduras'}, {id: 'C', text: 'Meat / Carne'}, {id: 'D', text: 'Eggs / Huevos'}], correct: 'C', points: 1000 },
        {  text_en: "Where does a famous annual Easter Egg Roll take place on Easter Monday?",
            text_es: "¿Dónde tiene lugar una famosa 'Carrera de Huevos de Pascua' anual el Lunes de Pascua?",
            options: [
                {id: 'A', text: 'Buckingham Palace'},
                {id: 'B', text: 'The White House / La Casa Blanca'},
                {id: 'C', text: 'The Vatican / El Vaticano'},
                {id: 'D', text: 'Disneyland'}
            ],
            correct: 'B',
            points: 1000
        },
        {
            text_en: "What sweet, spiced buns marked with a cross are traditional in the UK and other countries at Easter?",
            text_es: "¿Qué panecillos dulces y especiados, marcados con una cruz, son tradicionales en el Reino Unido y otros países en Pascua?",
            options: [
                {id: 'A', text: 'Pretzels'},
                {id: 'B', text: 'Croissants'},
                {id: 'C', text: 'Hot Cross Buns'},
                {id: 'D', text: 'Scones'}
            ],
            correct: 'C',
            points: 1100
        },
        // ... añadir más preguntas de este tema ...
    ],
    'Naturaleza Primaveral': [
        { text_en: "What process allows plants to make food using sunlight?", text_es: "¿Qué proceso permite a las plantas fabricar alimento usando la luz solar?", options: [{id: 'A', text: 'Pollination / Polinización'}, {id: 'B', text: 'Photosynthesis / Fotosíntesis'}, {id: 'C', text: 'Germination / Germinación'}, {id: 'D', text: 'Respiration / Respiración'}], correct: 'B', points: 1000 },
        { text_en: "What is a baby sheep called?", text_es: "¿Cómo se llama una cría de oveja?", options: [{id: 'A', text: 'Calf / Ternero'}, {id: 'B', text: 'Foal / Potro'}, {id: 'C', text: 'Lamb / Cordero'}, {id: 'D', text: 'Chick / Pollito'}], correct: 'C', points: 1000 },
        {
            text_en: "Rabbits are often associated with Easter and Spring because they are ancient symbols of...?",
            text_es: "Los conejos se asocian a menudo con Pascua y la Primavera porque son símbolos antiguos de...?",
            options: [
                {id: 'A', text: 'Sleep / El Sueño'},
                {id: 'B', text: 'Winter / El Invierno'},
                {id: 'C', text: 'Fertility / La Fertilidad'},
                {id: 'D', text: 'Hunting / La Caza'}
            ],
            correct: 'C',
            points: 1000
        },
        {
            text_en: "What country is famous for its Cherry Blossom ('Sakura') festivals in Spring?",
            text_es: "¿Qué país es famoso por sus festivales de Cerezos en Flor ('Sakura') en Primavera?",
            options: [
                {id: 'A', text: 'Brazil / Brasil'},
                {id: 'B', text: 'Egypt / Egipto'},
                {id: 'C', text: 'Canada / Canadá'},
                {id: 'D', text: 'Japan / Japón'}
            ],
            correct: 'D',
            points: 1000
        },
        // ... añadir más preguntas de este tema ...
    ],
    'Dulces de Pascua': [
       { text_en: "What marshmallow candies shaped like chicks are famous in the US?", text_es: "¿Qué dulces de malvavisco con forma de pollitos son famosos en EE.UU.?", options: [{id: 'A', text: 'Jelly Beans'}, {id: 'B', text: 'Peeps'}, {id: 'C', text: 'Cadbury Eggs'}, {id: 'D', text: 'M&Ms'}], correct: 'B', points: 1000 },
       { text_en: "Which country is often associated with high-quality chocolate?", text_es: "¿Qué país se asocia con el chocolate de alta calidad?", options: [{id: 'A', text: 'USA / EE.UU.'}, {id: 'B', text: 'Mexico / México'}, {id: 'C', text: 'Switzerland / Suiza'}, {id: 'D', text: 'Japan / Japón'}], correct: 'C', points: 1000 },
       {
        text_en: "What Easter candy often comes in fruit flavors and bean shapes?",
        text_es: "¿Qué dulce de Pascua suele venir en sabores de frutas y con forma de judía/frijol?",
        options: [
            {id: 'A', text: 'Chocolate Eggs / Huevos de Chocolate'},
            {id: 'B', text: 'Peeps'},
            {id: 'C', text: 'Jelly Beans'},
            {id: 'D', text: 'Lollipops / Piruletas'}
        ],
        correct: 'C',
        points: 900
    },
       // ... añadir más preguntas de este tema ...
    ],
     // --- Añade los otros temas y preguntas aquí ---
    'Acertijos Ovoides': [
        { text_en: "Unscramble: G G E", text_es: "Ordena: G G E", options: [{id: 'A', text: 'EGG'}, {id: 'B', text: 'GEG'}, {id: 'C', text: 'GGE'}], correct: 'A', points: 800 },
        { text_en: "If it takes 5 min to boil one egg, how long for three eggs together?", text_es: "Si tardas 5 min en hervir un huevo, ¿cuánto tardas con tres a la vez?", options: [{id: 'A', text: '15 min'}, {id: 'B', text: '10 min'}, {id: 'C', text: '5 min'}, {id: 'D', text: '3 min'}], correct: 'C', points: 1200 },
        {
            text_en: "I wear a coat in summer and appear in spring. I have many eyes but cannot see a thing. What am I?",
            text_es: "Llevo abrigo en verano y aparezco en primavera. Tengo muchos ojos pero no puedo ver nada. ¿Qué soy?",
            options: [
                {id: 'A', text: 'A Rabbit / Un Conejo'},
                {id: 'B', text: 'A Potato / Una Patata'},
                {id: 'C', text: 'An Egg / Un Huevo'},
                {id: 'D', text: 'A Tree / Un Árbol'}
            ],
            correct: 'B',
            points: 1200
        },
        {
            text_en: "If 3 bunnies have 2 baskets each, and each basket has 4 eggs, how many eggs are there in total?",
            text_es: "Si 3 conejos tienen 2 canastas cada uno, y cada canasta tiene 4 huevos, ¿cuántos huevos hay en total?",
            options: [
                {id: 'A', text: '9'},
                {id: 'B', text: '12'},
                {id: 'C', text: '18'},
                {id: 'D', text: '24'}
            ],
            correct: 'D',
            points: 1100
        },
    ],


     'Cultura Pop': [
        { text_en: "What is an 'Easter Egg' in software or games?", text_es: "¿Qué es un 'Huevo de Pascua' en software o juegos?", options: [{id: 'A', text: 'Hidden message/feature / Mensaje/función oculta'}, {id: 'B', text: 'Egg-laying character / Personaje que pone huevos'}, {id: 'C', text: 'Game glitch / Fallo del juego'}, {id: 'D', text: 'Decoration / Decoración'}], correct: 'A', points: 1000 },
        { text_en: "Which movie series often hides the code 'A113'?", text_es: "¿Qué serie de películas suele esconder el código 'A113'?", options: [{id: 'A', text: 'Shrek'}, {id: 'B', text: 'Ice Age / La Edad de Hielo'}, {id: 'C', text: 'Pixar movies / Películas de Pixar'}, {id: 'D', text: 'Madagascar'}], correct: 'C', points: 1000 },
        {
            text_en: "In the movie 'Ready Player One', finding hidden objects or 'Easter eggs' is central to the plot. What are they searching for?",
            text_es: "En la película 'Ready Player One', encontrar 'Huevos de Pascua' es central en la trama. ¿Qué buscan?",
            options: [
                {id: 'A', text: 'A Golden Ticket / Un Boleto Dorado'},
                {id: 'B', text: 'The Holy Grail / El Santo Grial'},
                {id: 'C', text: 'An Easter Egg (leading to control of the OASIS) / Un Huevo de Pascua (que lleva al control de OASIS)'},
                {id: 'D', text: 'A Lost City / Una Ciudad Perdida'}
            ],
            correct: 'C',
            points: 1000
        },
        {
            text_en: "What famous animated rabbit often says \"What's up, doc?\"",
            text_es: "¿Qué famoso conejo animado dice a menudo \"What's up, doc?\" (\"¿Qué hay de nuevo, viejo?\")?",
            options: [
                {id: 'A', text: 'Roger Rabbit'},
                {id: 'B', text: 'Bugs Bunny'},
                {id: 'C', text: 'Peter Rabbit / Pedrito Conejo'},
                {id: 'D', text: 'Thumper / Tambor'}
            ],
            correct: 'B',
            points: 900
        },
        {
            text_en: "The Konami Code (Up, Up, Down, Down, Left, Right, Left, Right, B, A) is a famous cheat code considered a type of...?",
            text_es: "El Código Konami (Arriba, Arriba, Abajo, Abajo, Izq, Der, Izq, Der, B, A) es un famoso código trampa considerado un tipo de...?",
            options: [
                {id: 'A', text: 'Password / Contraseña'},
                {id: 'B', text: 'Virus'},
                {id: 'C', text: 'Easter Egg'},
                {id: 'D', text: 'Glitch / Fallo'}
            ],
            correct: 'C',
            points: 1100
        }, 
    ]
};

// Función para obtener N preguntas aleatorias de todos los temas
function getRandomQuestions(numQuestions = 10) { // Tomaremos 10 preguntas en total como ejemplo
    const allQuestions = [];
    for (const theme in gameThemes) {
        gameThemes[theme].forEach(q => allQuestions.push({ ...q, theme })); // Añade el nombre del tema a cada pregunta
    }
    // Mezclar y seleccionar N preguntas
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numQuestions);
}


// --- Estado del Servidor ---
const games = {}; // Almacenará el estado de cada juego activo, la clave será el gameCode
const MAX_PLAYERS_PER_GAME = 4; // Número de jugadores para este juego
const QUESTION_TIME_LIMIT = 20; // Segundos por pregunta

// --- Lógica de Socket.IO ---
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    socket.on('joinGame', (gameCode, playerName) => {
        // Validar nombre y código (básico)
        if (!playerName || playerName.length > 15) {
            socket.emit('gameError', 'Invalid player name.');
            return;
        }
        // Si el juego no existe, crearlo
        if (!games[gameCode]) {
            games[gameCode] = {
                id: gameCode,
                players: {}, // { socketId: { name: playerName, score: 0, answered: false } }
                questions: getRandomQuestions(10), // Obtener 10 preguntas aleatorias
                currentQuestionIndex: -1,
                status: 'waiting', // waiting, active, finished
                questionTimer: null,
                answeredCount: 0
            };
            console.log(`Juego creado: ${gameCode}`);
        }

        const game = games[gameCode];

        // Comprobar si el juego está lleno o ya empezó
        if (Object.keys(game.players).length >= MAX_PLAYERS_PER_GAME && !game.players[socket.id]) {
             socket.emit('gameError', 'Game is full.');
             return;
        }
        if (game.status !== 'waiting' && !game.players[socket.id]) {
             socket.emit('gameError', 'Game has already started.');
             return;
        }

        // Añadir jugador o actualizar si se reconecta
        console.log(`${playerName} (${socket.id}) se unió/reconectó al juego ${gameCode}`);
        socket.join(gameCode); // Unir el socket a la sala del juego
        game.players[socket.id] = {
            id: socket.id,
            name: playerName,
            score: game.players[socket.id]?.score || 0, // Mantener score si es reconexión
            answered: false // Resetea 'answered' para la pregunta actual si se une a mitad
        };

        // Enviar lista actualizada de jugadores a todos en la sala
        io.to(gameCode).emit('currentPlayers', Object.values(game.players).map(p => ({id: p.id, playerName: p.name})));

        // Comprobar si se puede iniciar el juego (ej: si tenemos 4 jugadores)
        if (game.status === 'waiting' && Object.keys(game.players).length === MAX_PLAYERS_PER_GAME) {
            console.log(`Iniciando juego ${gameCode}...`);
            startGame(gameCode);
        }
    });

    socket.on('submitAnswer', (data) => {
        const gameCode = Array.from(socket.rooms).find(room => room !== socket.id); // Encuentra la sala del juego
        if (!gameCode || !games[gameCode]) return; // Ignorar si no está en un juego válido

        const game = games[gameCode];
        const player = game.players[socket.id];
        const currentQuestion = game.questions[game.currentQuestionIndex];

        if (!player || game.status !== 'active' || player.answered || !currentQuestion) {
            // Ignorar si el jugador no existe, el juego no está activo, ya respondió, o no hay pregunta actual
            return;
        }

        player.answered = true;
        game.answeredCount++;

        let isCorrect = data.answerId === currentQuestion.correct;
        let scoreEarned = 0;

        if (isCorrect) {
            // Puntuación básica por respuesta correcta (podrías añadir bonus por tiempo aquí)
            scoreEarned = currentQuestion.points || 1000;
            player.score += scoreEarned;
        }

        console.log(`Respuesta de ${player.name}: ${data.answerId}. Correcta: ${isCorrect}. Puntos: ${scoreEarned}`);

        // Enviar resultado individual al jugador
        socket.emit('answerResult', {
            isCorrect: isCorrect,
            correctAnswer: currentQuestion.correct, // Enviar respuesta correcta para feedback
            scoreEarned: scoreEarned,
            currentScore: player.score
        });

        // Enviar puntuaciones actualizadas a todos
        io.to(gameCode).emit('updateScores', getRankedScores(gameCode));

        // Comprobar si todos han respondido para pasar a la siguiente pregunta
        if (game.answeredCount === Object.keys(game.players).length) {
            moveToNextQuestion(gameCode);
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        // Encontrar a qué juego pertenecía y quitarlo
        for (const gameCode in games) {
            const game = games[gameCode];
            if (game.players[socket.id]) {
                const playerName = game.players[socket.id].name;
                console.log(`${playerName} (${socket.id}) se desconectó del juego ${gameCode}`);
                // Si el juego está activo, contar como que respondió (para no bloquear)
                if(game.status === 'active' && !game.players[socket.id].answered) {
                    game.players[socket.id].answered = true; // Marcar como respondido para no bloquear
                    game.answeredCount++;
                }

                delete game.players[socket.id]; // Quitar jugador del estado

                // Notificar a los demás
                io.to(gameCode).emit('playerLeft', { id: socket.id, playerName: playerName });
                io.to(gameCode).emit('currentPlayers', Object.values(game.players).map(p => ({id: p.id, playerName: p.name})));


                // ¿Qué hacer si el juego queda vacío o con muy pocos jugadores?
                if (Object.keys(game.players).length < 1 && game.status !== 'finished') { // Ejemplo: si queda vacío
                    console.log(`Juego ${gameCode} vacío. Terminando y limpiando.`);
                     clearTimeout(game.questionTimer); // Detener timer si existe
                     delete games[gameCode]; // Eliminar el juego del estado del servidor
                 } else if (game.status === 'active' && game.answeredCount === Object.keys(game.players).length) {
                    // Si el jugador que se fue era el último que faltaba por responder, avanza
                    moveToNextQuestion(gameCode);
                 }

                break; // Salir del loop una vez encontrado el juego
            }
        }
    });

});

// --- Funciones de Control del Juego ---

function startGame(gameCode) {
    const game = games[gameCode];
    if (!game || game.status !== 'waiting') return;

    game.status = 'active';
    game.currentQuestionIndex = -1; // Se incrementará a 0 en moveToNextQuestion

    // Notificar inicio a los jugadores (podría incluir la lista final de jugadores)
    const playersData = Object.values(game.players).map(p => ({id: p.id, playerName: p.name}));
    io.to(gameCode).emit('gameStarted', { players: playersData });

    console.log(`Juego ${gameCode} iniciado con ${playersData.length} jugadores.`);
    // Pausa breve antes de la primera pregunta
    setTimeout(() => {
        moveToNextQuestion(gameCode);
    }, 2000); // Espera 2 segundos antes de la primera pregunta
}

function moveToNextQuestion(gameCode) {
    const game = games[gameCode];
    if (!game || game.status !== 'active') return;

     // Limpiar timer anterior si existe
    clearTimeout(game.questionTimer);

    game.currentQuestionIndex++;
    game.answeredCount = 0; // Resetea contador de respuestas
    // Resetea el estado 'answered' de cada jugador
    Object.values(game.players).forEach(player => player.answered = false);


    if (game.currentQuestionIndex >= game.questions.length) {
        // Fin del juego
        endGame(gameCode);
    } else {
        // Enviar siguiente pregunta
        const question = game.questions[game.currentQuestionIndex];
        const questionData = {
            index: game.currentQuestionIndex,
            totalQuestions: game.questions.length,
            text: question.text_es, // O 'text_en' o ambos
            options: question.options,
            theme: question.theme,
            timeLimit: QUESTION_TIME_LIMIT
        };

        console.log(`Enviando pregunta ${game.currentQuestionIndex + 1} para juego ${gameCode}`);
        io.to(gameCode).emit('nextQuestion', questionData);

        // Iniciar temporizador para esta pregunta
        game.questionTimer = setTimeout(() => {
            console.log(`Tiempo agotado para pregunta ${game.currentQuestionIndex + 1} en juego ${gameCode}`);
             // Cuando se acaba el tiempo, consideramos que todos los que no respondieron, no suman puntos
             // y pasamos a la siguiente. Enviamos actualización de scores.
            io.to(gameCode).emit('updateScores', getRankedScores(gameCode)); // Enviar scores actuales
            io.to(gameCode).emit('answerResult', { timeUp: true }); // Notificar que se acabó el tiempo (opcional)

            setTimeout(() => { // Pequeña pausa antes de la siguiente pregunta
                 moveToNextQuestion(gameCode);
             }, 3000); // Espera 3 segundos mostrando scores/mensaje de tiempo fuera

        }, QUESTION_TIME_LIMIT * 1000); // El tiempo límite en milisegundos
    }
}

function endGame(gameCode) {
    const game = games[gameCode];
    if (!game || game.status !== 'active') return;

     // Limpiar timer si existe
    clearTimeout(game.questionTimer);

    game.status = 'finished';
    const finalScores = getRankedScores(gameCode);

    console.log(`Juego ${gameCode} finalizado. Resultados:`, finalScores);
    io.to(gameCode).emit('gameOver', finalScores);

    // Opcional: Limpiar el juego del estado después de un tiempo
    setTimeout(() => {
        delete games[gameCode];
        console.log(`Juego ${gameCode} limpiado del servidor.`);
    }, 60000); // Limpiar después de 1 minuto
}

function getRankedScores(gameCode) {
    const game = games[gameCode];
    if (!game) return [];
    // Devuelve un array de jugadores ordenados por puntuación descendente
    return Object.values(game.players)
        .map(p => ({ playerId: p.id, playerName: p.name, score: p.score }))
        .sort((a, b) => b.score - a.score);
}

// --- Iniciar el Servidor ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});