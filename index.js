const pokeApiUrl = "https://pokeapi.co/api/v2/pokemon/";

let matches = 0;
let totalPairs = 0;
let clicks = 0;
let timer;
let timeLeft;
let secondsPassed = 0;

const setup = () => {
  let firstCard, secondCard;

  $(".card").on("click", function () {
    if (!$(this).hasClass("flip") && !$(this).hasClass("matched")) {
      clicks++;
      $("#clicks").text(clicks);
      $(this).toggleClass("flip");

      if (!firstCard) {
        firstCard = $(this).find(".front_face")[0];
      } else {
        secondCard = $(this).find(".front_face")[0];
        if (firstCard.src === secondCard.src) {
          matches++;
          $("#matches").text(matches);
          $("#left").text(totalPairs - matches);
          $(`#${firstCard.id}`).parent().off("click").addClass("matched");
          $(`#${secondCard.id}`).parent().off("click").addClass("matched");
          firstCard = undefined;
          secondCard = undefined;
          if (matches === totalPairs) {
            clearInterval(timer);
            setTimeout(() => {
              alert("Congratulations! You've matched all pairs!");
            }, 600); // Delay alert for 600ms after last match animation finishes
          }
        } else {
          setTimeout(() => {
            $(`#${firstCard.id}`).parent().toggleClass("flip");
            $(`#${secondCard.id}`).parent().toggleClass("flip");
            firstCard = undefined;
            secondCard = undefined;
          }, 1000);
        }
      }
    }
  });
};

const startGame = async () => {
  let difficulty = $('input[name="options"]:checked').val();
  let numPairs, timeLimit;

  if (difficulty === "easy") {
    numPairs = 3;
    timeLimit = 100;
  } else if (difficulty === "medium") {
    numPairs = 6;
    timeLimit = 80;
  } else if (difficulty === "hard") {
    numPairs = 10;
    timeLimit = 60;
  }

  totalPairs = numPairs;
  matches = 0;
  clicks = 0;
  secondsPassed = 0;
  $("#total").text(numPairs);
  $("#matches").text(matches);
  $("#left").text(numPairs);
  $("#clicks").text(clicks);
  $("#timer").text(timeLimit);
  $("#time").text(secondsPassed);
  timeLeft = timeLimit;

  // Fetch random Pokémon
  const pokemonImages = await getRandomPokemonImages(numPairs);
  const cards = shuffleArray([...pokemonImages, ...pokemonImages]);

  // Generate game grid
  generateGameGrid(cards);

  // Show game grid and info
  $("#game_grid").show();
  $("#info").show();

  // Hide difficulty buttons
  $("#difficulty").hide();

  // Start the timer
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    secondsPassed++;
    $("#time").text(secondsPassed);
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("Time's up! Game over.");
      $(".card").off("click"); // Disable further clicks
    }
  }, 1000);

  setup();
};

const getRandomPokemonImages = async (numPairs) => {
  const promises = [];
  const ids = new Set();
  
  while (ids.size < numPairs) {
    const id = Math.floor(Math.random() * 898) + 1; // Pokémon IDs range from 1 to 898
    if (!ids.has(id)) {
      ids.add(id);
      promises.push(fetch(pokeApiUrl + id).then(response => response.json()));
    }
  }
  
  const pokemonData = await Promise.all(promises);
  return pokemonData.map(pokemon => pokemon.sprites.other["official-artwork"].front_default);
};

const generateGameGrid = (images) => {
  const gameGrid = $("#game_grid");
  gameGrid.empty();
  images.forEach((image, index) => {
    const card = `
      <div class="card">
        <img id="img${index}" class="front_face" src="${image}" alt="Pokemon">
        <img class="back_face" src="back.webp" alt="Back">
      </div>
    `;
    gameGrid.append(card);
  });
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

$(document).ready(function() {
  $('#start').click(startGame);

  $('#dark').click(function() {
    $('body').addClass('dark-theme');
  });

  $('#light').click(function() {
    $('body').removeClass('dark-theme');
  });
});
