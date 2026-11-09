/* =====================================================
   JOGO DA MEMÓRIA
===================================================== */


/* =====================================================
   ELEMENTOS DO HTML
===================================================== */

const gameBoard = document.getElementById("game-board");

const movesElement = document.getElementById("moves");

const pairsElement = document.getElementById("pairs");

const timerElement = document.getElementById("timer");

const messageElement = document.getElementById("message");

const restartButton =
    document.getElementById("restart-button");

const winModal =
    document.getElementById("win-modal");

const finalMoves =
    document.getElementById("final-moves");

const finalTime =
    document.getElementById("final-time");

const playAgainButton =
    document.getElementById("play-again-button");


/* =====================================================
   CONFIGURAÇÃO DAS CARTAS
===================================================== */


/*
   Temos 6 símbolos.

   Cada símbolo aparece duas vezes.

   Portanto:

   6 símbolos x 2 = 12 cartas
*/

const cardSymbols = [
    "🎮",
    "🕹️",
    "🎲",
    "🏆",
    "🧩",
    "🎯"
];


/* =====================================================
   VARIÁVEIS DO JOGO
===================================================== */

let cards = [];

let firstCard = null;

let secondCard = null;

let lockBoard = false;

let moves = 0;

let matchedPairs = 0;

let seconds = 0;

let timerInterval = null;

let gameStarted = false;


/* =====================================================
   INICIAR O JOGO
===================================================== */

function startGame() {

    /*
       Zera todas as variáveis.
    */

    firstCard = null;

    secondCard = null;

    lockBoard = false;

    moves = 0;

    matchedPairs = 0;

    seconds = 0;

    gameStarted = false;


    /*
       Para o cronômetro anterior,
       caso exista.
    */

    clearInterval(timerInterval);

    timerInterval = null;


    /*
       Atualiza os dados na tela.
    */

    movesElement.textContent = "0";

    pairsElement.textContent = "0 / 6";

    timerElement.textContent = "00:00";

    messageElement.textContent =
        "Clique em duas cartas para começar!";


    /*
       Fecha a janela de vitória,
       caso esteja aberta.
    */

    winModal.classList.remove("show");


    /*
       Cria as cartas.
    */

    createCards();
}


/* =====================================================
   CRIAR AS CARTAS
===================================================== */

function createCards() {

    /*
       Limpa o tabuleiro.
    */

    gameBoard.innerHTML = "";


    /*
       Cria duas ocorrências de cada símbolo.

       Exemplo:

       🎮 🎮
       🕹️ 🕹️
       🎲 🎲
       🏆 🏆
       🧩 🧩
       🎯 🎯
    */

    cards = [...cardSymbols, ...cardSymbols];


    /*
       Embaralha as cartas.
    */

    shuffleCards();


    /*
       Cria cada carta na tela.
    */

    cards.forEach((symbol, index) => {

        const card = document.createElement("button");

        card.classList.add("card");

        /*
           Evita que o botão envie algum formulário.
        */

        card.type = "button";


        /*
           Armazena o símbolo dentro da carta.
        */

        card.dataset.symbol = symbol;


        /*
           Identificador da carta.
        */

        card.dataset.index = index;


        /*
           Estrutura HTML da carta.

           A carta possui:

           .card
             └── .card-inner
                    ├── .card-back
                    └── .card-front
        */

        card.innerHTML = `

            <div class="card-inner">

                <div class="card-back">
                    ?
                </div>

                <div class="card-front">
                    ${symbol}
                </div>

            </div>

        `;


        /*
           Evento de clique.
        */

        card.addEventListener("click", () => {

            flipCard(card);

        });


        /*
           Adiciona a carta ao tabuleiro.
        */

        gameBoard.appendChild(card);

    });

}


/* =====================================================
   EMBARALHAR CARTAS
===================================================== */

function shuffleCards() {

    /*
       Algoritmo Fisher-Yates.

       Ele embaralha o array de maneira eficiente.
    */

    for (
        let i = cards.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(Math.random() * (i + 1));

        [
            cards[i],
            cards[randomIndex]
        ] = [
            cards[randomIndex],
            cards[i]
        ];

    }

}


/* =====================================================
   VIRAR CARTA
===================================================== */

function flipCard(card) {

    /*
       Não permite clicar novamente
       quando o tabuleiro está bloqueado.
    */

    if (lockBoard) {
        return;
    }


    /*
       Não permite clicar na mesma carta duas vezes.
    */

    if (card === firstCard) {
        return;
    }


    /*
       Não permite clicar em uma carta
       que já encontrou seu par.
    */

    if (card.classList.contains("matched")) {
        return;
    }


    /*
       Inicia o cronômetro no primeiro clique.
    */

    if (!gameStarted) {

        gameStarted = true;

        startTimer();

    }


    /*
       Adiciona a classe flipped.

       Isso faz a carta girar 180 graus.
    */

    card.classList.add("flipped");


    /*
       Se ainda não temos a primeira carta,
       ela será armazenada.
    */

    if (firstCard === null) {

        firstCard = card;

        messageElement.textContent =
            "Agora escolha a segunda carta.";

        return;
    }


    /*
       Caso já exista uma primeira carta,
       esta será a segunda.
    */

    secondCard = card;


    /*
       Cada duas cartas abertas
       representam uma jogada.
    */

    moves++;

    movesElement.textContent = moves;


    /*
       Compara as duas cartas.
    */

    checkForMatch();

}


/* =====================================================
   VERIFICAR PAR
===================================================== */

function checkForMatch() {

    const firstSymbol =
        firstCard.dataset.symbol;

    const secondSymbol =
        secondCard.dataset.symbol;


    /*
       Se os símbolos forem iguais,
       encontramos um par.
    */

    if (firstSymbol === secondSymbol) {

        disableMatchedCards();

    }

    /*
       Caso contrário,
       as cartas serão fechadas novamente.
    */

    else {

        unflipCards();

    }

}


/* =====================================================
   CARTAS IGUAIS
===================================================== */

function disableMatchedCards() {

    /*
       Mantém as duas cartas abertas.
    */

    firstCard.classList.add("matched");

    secondCard.classList.add("matched");


    /*
       Atualiza a quantidade de pares.
    */

    matchedPairs++;

    pairsElement.textContent =
        `${matchedPairs} / 6`;


    messageElement.textContent =
        "Par encontrado! Muito bem!";


    /*
       Verifica se o jogador encontrou
       todos os pares.
    */

    resetTurn();


    if (matchedPairs === 6) {

        finishGame();

    }

}


/* =====================================================
   CARTAS DIFERENTES
===================================================== */

function unflipCards() {

    /*
       Bloqueia novas cartas durante
       a animação.
    */

    lockBoard = true;

    messageElement.textContent =
        "As cartas não combinam...";


    /*
       Aguarda 1 segundo para fechar as cartas.
    */

    setTimeout(() => {

        firstCard.classList.remove("flipped");

        secondCard.classList.remove("flipped");


        messageElement.textContent =
            "Escolha duas cartas.";


        resetTurn();

    }, 1000);

}


/* =====================================================
   RESETAR TURNO
===================================================== */

function resetTurn() {

    firstCard = null;

    secondCard = null;

    lockBoard = false;

}


/* =====================================================
   CRONÔMETRO
===================================================== */

function startTimer() {

    /*
       Evita criar mais de um cronômetro.
    */

    clearInterval(timerInterval);


    timerInterval =
        setInterval(() => {

            seconds++;

            updateTimer();

        }, 1000);

}


/* =====================================================
   ATUALIZAR CRONÔMETRO
===================================================== */

function updateTimer() {

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        seconds % 60;


    const formattedMinutes =
        String(minutes).padStart(2, "0");

    const formattedSeconds =
        String(remainingSeconds).padStart(2, "0");


    timerElement.textContent =
        `${formattedMinutes}:${formattedSeconds}`;

}


/* =====================================================
   FINALIZAR JOGO
===================================================== */

function finishGame() {

    /*
       Para o cronômetro.
    */

    clearInterval(timerInterval);

    timerInterval = null;


    /*
       Mostra os resultados no modal.
    */

    finalMoves.textContent = moves;

    finalTime.textContent =
        timerElement.textContent;


    /*
       Pequeno atraso para que o jogador
       veja a última carta sendo revelada.
    */

    setTimeout(() => {

        winModal.classList.add("show");

        messageElement.textContent =
            "Você encontrou todos os pares!";

    }, 500);

}


/* =====================================================
   BOTÃO REINICIAR
===================================================== */

restartButton.addEventListener(
    "click",
    startGame
);


/* =====================================================
   BOTÃO JOGAR NOVAMENTE
===================================================== */

playAgainButton.addEventListener(
    "click",
    startGame
);


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

startGame();