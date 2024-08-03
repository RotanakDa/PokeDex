async function fetchRandomPokemonName() {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=1025`);
        const data = await response.json();
        const pokemonNames = data.results.map(pokemon => pokemon.name);
        const randomIndex = Math.floor(Math.random() * pokemonNames.length);
        return pokemonNames[randomIndex];
    } catch (error) {
        console.error(error);
        return null; // Return null if there's an error
    }
}

// Event listener for the Random Pokémon button
document.getElementById("randomPokemonBtn").addEventListener("click", async () => {
    const randomPokemonName = await fetchRandomPokemonName();
    if (randomPokemonName) {
        document.getElementById("pokemonName").value = randomPokemonName;
        fetchData(randomPokemonName);
    }
});

async function fetchData(pokemonName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        if (!response.ok) {
            throw new Error("Pokemon not found in the database.");
        }

        clearErrorMessage();

        const data = await response.json();
        const pokemonSprite = data.sprites.front_default;
        const imgElement = document.getElementById("pokemonSprite");
        imgElement.src = pokemonSprite;
        imgElement.style.display = "block";

        const pokemonId = data.id;
        const pokemonNameCapitalized = pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);
        const pokemonTypes = data.types.map(type => {
            return `<span class="pokemon-type ${type.type.name}">${type.type.name}</span>`;
        }).join(' ');

        const weaknesses = await getWeaknesses(data.types);

        const pokemonDetailsHTML = `
            <h1 class="mx-auto"><strong>${pokemonNameCapitalized}'s Dex</strong></h1>
            <p><strong>ID:</strong> <span>${pokemonId}</span></p>
            <p><strong>Name:</strong> <span>${pokemonNameCapitalized}</span></p>
            <p><strong>Types:</strong> <span>${pokemonTypes}</span></p>
            <p><strong>Weaknesses:</strong> 
                <span>${weaknesses.map(weakness => 
                    `<span class="pokemon-type ${weakness.type}">${weakness.type} (x${weakness.multiplier})</span>`
                ).join(' ')}</span>
            </p>
            <button class="btn btn-sm btn-outline-light mt-3 hear-cry-btn"
                    data-cry-url="https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg">
                <i class="fas fa-volume-up"></i> Hear Pokémon Cry
            </button>
        `;

        document.getElementById("pokemonDetails").innerHTML = pokemonDetailsHTML;

        const statsHTML = data.stats.map(stat => {
            let color;
            if (stat.base_stat < 55) {
                color = 'red';
            } else if (stat.base_stat < 85) {
                color = 'orange';
            } else if (stat.base_stat < 125) {
                color = 'green';
            } else {
                color = 'Teal';
            }

            const widthPercentage = (stat.base_stat / 300) * 100;

            return `
                <div class="stat d-flex align-items-center">
                    <span class="stat-name">${stat.stat.name.toUpperCase()}</span>
                    <span class="stat-value">${stat.base_stat}</span>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${widthPercentage}%; background-color: ${color};"></div>
                    </div>
                </div>
            `;
        }).join('');

        const movesHTML = await getMovesHTML(data.moves);

        const totalStats = data.stats.reduce((total, stat) => total + stat.base_stat, 0);

        document.querySelector('.stats-container').innerHTML = `
            <h1 class="text-center mb-4" style="font-weight: bold;">${pokemonNameCapitalized}'s Base Stats</h1>
            ${statsHTML}
            <div class="stat d-flex align-items-center">
                <span class="stat-name"><strong>Total</strong></span>
                <span class="stat-value"><strong>${totalStats}</strong></span>
            </div>
        `;

        document.querySelector('.moves-container').innerHTML = `
            ${movesHTML}
        `;

        document.querySelector('.stats-container').style.display = 'block';
        document.querySelector('.moves-container').style.display = 'block';

        const hearCryBtn = document.querySelector('.hear-cry-btn');
        hearCryBtn.addEventListener('click', function() {
            const cryUrl = this.getAttribute('data-cry-url');
            if (cryUrl) {
                const audio = new Audio(cryUrl);
                audio.play().catch(error => {
                    console.error('Failed to play Pokémon cry:', error);
                });
            }
        });

        // Show the content rows
        var contentRow = document.getElementById('contentRow');
        var movesCard = document.getElementById('movesCard');
        contentRow.classList.remove('hidden');
        contentRow.classList.add('visible');
        movesCard.classList.remove('hidden');
        movesCard.classList.add('visible');

    } catch (error) {
        console.error(error);
        displayErrorMessage(error.message);
    }
}


document.getElementById('toggleButton').addEventListener('click', function() {
    var contentRow = document.getElementById('contentRow');
    var movesCard = document.getElementById('movesCard');
    
    if (contentRow.classList.contains('hidden')) {
        contentRow.classList.remove('hidden');
        contentRow.classList.add('visible');
    } else {
        contentRow.classList.remove('visible');
        contentRow.classList.add('hidden');
    }

    if (movesCard.classList.contains('hidden')) {
        movesCard.classList.remove('hidden');
        movesCard.classList.add('visible');
    } else {
        movesCard.classList.remove('visible');
        movesCard.classList.add('hidden');
    }
});


document.getElementById('toggleButton').addEventListener('click', function() {
    var content = document.getElementById('content');
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        content.classList.add('visible');
    } else {
        content.classList.remove('visible');
        content.classList.add('hidden');
    }
});



function displayErrorMessage(message) {
    const errorBox = document.createElement('div');
    errorBox.className = 'alert alert-danger mt-3';
    errorBox.textContent = message;
    const jumbotron = document.querySelector('.jumbotron');
    jumbotron.insertAdjacentElement('afterend', errorBox);
    setTimeout(() => {
        errorBox.remove();
    }, 3000); // Remove error message after 3 seconds
}

function clearErrorMessage() {
    const existingError = document.querySelector('.alert.alert-danger');
    if (existingError) {
        existingError.remove();
    }
}

// Function to handle click event on Random Pokémon button
async function handleRandomPokemon() {
    try {
        const randomPokemonName = await fetchRandomPokemonName();
        if (randomPokemonName) {
            document.getElementById("pokemonName").value = randomPokemonName;
            await fetchData(randomPokemonName);
        } else {
            console.error("Failed to fetch random Pokémon name.");
        }
    } catch (error) {
        console.error(error);
    }
}

// Event listener for Random Pokémon button click
const randomPokemonBtn = document.getElementById("randomPokemonBtn");
randomPokemonBtn.addEventListener("click", handleRandomPokemon);

async function getWeaknesses(types) {
    const weaknesses = {};

    for (const type of types) {
        const response = await fetch(type.type.url);
        const typeData = await response.json();

        typeData.damage_relations.double_damage_from.forEach(damageType => {
            if (weaknesses[damageType.name]) {
                weaknesses[damageType.name] *= 2; // Double the weakness if it exists
            } else {
                weaknesses[damageType.name] = 2; // Initial weakness
            }
        });

        typeData.damage_relations.half_damage_from.forEach(damageType => {
            if (weaknesses[damageType.name]) {
                weaknesses[damageType.name] /= 2; // Halve the weakness if it exists
            } else {
                weaknesses[damageType.name] = 0.5; // Initial resistance
            }
        });

        typeData.damage_relations.no_damage_from.forEach(damageType => {
            weaknesses[damageType.name] = 0; // No damage means immunity
        });
    }

    // Filter out types with no weakness or resistance (neutral damage)
    const filteredWeaknesses = Object.keys(weaknesses)
        .filter(type => weaknesses[type] !== 1)
        .map(type => ({
            type: type,
            multiplier: weaknesses[type]
        }));

    return filteredWeaknesses;
}


async function getMovesHTML(moves) {
    const movesData = await Promise.all(moves.map(async (move) => {
        const moveResponse = await fetch(move.move.url);
        const moveData = await moveResponse.json();
        const learnedByLevel = move.version_group_details.find(detail => detail.level_learned_at > 0);
        const learnedByTM = move.version_group_details.find(detail => detail.move_learn_method.name === 'machine');

        if (learnedByLevel === undefined && learnedByTM === undefined) {
            return null;
        }

        return {
            level: learnedByLevel ? learnedByLevel.level_learned_at : 'N/A',
            tm: learnedByTM ? learnedByTM.move_learn_method.name : 'N/A',
            name: moveData.name,
            type: moveData.type.name,
            category: moveData.damage_class.name,
            power: moveData.power || 'N/A',
            accuracy: moveData.accuracy || 'N/A'
        };
    }));

    const filteredMovesData = movesData.filter(move => move !== null);

    filteredMovesData.sort((a, b) => {
        if (a.tm !== 'N/A' && b.tm === 'N/A') return 1;
        if (a.tm === 'N/A' && b.tm !== 'N/A') return -1;
        return 0;
    });

    return `
        <h1 class="text-center mb-4" style="font-weight: bold;"><strong>Moves learnt by level up</strong></h1>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Lv</th>
                    <th>Move</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Power</th>
                    <th>Accuracy</th>
                </tr>
            </thead>
            <tbody>
                ${filteredMovesData
                    .filter(move => move.tm === 'N/A')
                    .sort((a, b) => a.level - b.level) // Sort by level ascending
                    .map(move => `
                        <tr>
                            <td>${move.level}</td>
                            <td>${move.name}</td>
                            <td><span class="pokemon-type ${move.type}">${move.type}</span></td>
                            <td><i class="${getCategoryIconClass(move.category)} category-icon"></i></td>
                            <td>${move.power}</td>
                            <td>${move.accuracy}</td>
                        </tr>
                    `)
                    .join('')}
            </tbody>
        </table>
        
       <h1 class="text-center mb-4" style="font-weight: bold;"><strong>Moves learnt by TM</strong></h1>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>TM</th>
                    <th>Move</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Power</th>
                    <th>Accuracy</th>
                </tr>
            </thead>
            <tbody>
                ${filteredMovesData.map(move => `
                    <tr>
                        <td>${move.tm}</td>
                        <td>${move.name}</td>
                        <td><span class="pokemon-type ${move.type}">${move.type}</span></td>
                        <td><i class="${getCategoryIconClass(move.category)} category-icon"></i></td>
                        <td>${move.power}</td>
                        <td>${move.accuracy}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getCategoryIconClass(category) {
    switch (category) {
        case 'physical':
            return 'fas fa-star-of-life'; // Example physical icon
        case 'special':
            return 'fas fa-compress'; // Example special icon
        case 'status':
            return 'fas fa-shield-alt'; // Example status icon
        default:
            return 'fas fa-question-circle'; // Default icon for unknown category
    }
}

// Function to fetch Pokémon names from the API
async function fetchPokemonNames(query) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?limit=1000`);
        const data = await response.json();
        const pokemonNames = data.results.map(pokemon => pokemon.name);
        return pokemonNames.filter(name => name.toLowerCase().startsWith(query.toLowerCase()));
    } catch (error) {
        console.error(error);
        return []; // Return an empty array if there's an error
    }
}

// Function to update suggestions in the datalist
async function updateSuggestions(inputValue) {
    const suggestions = await fetchPokemonNames(inputValue);
    const datalist = document.getElementById("pokemonList");
    datalist.innerHTML = "";
    suggestions.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        datalist.appendChild(option);
    });
}


// Event listener for input change
const inputField = document.getElementById("pokemonName");
inputField.addEventListener("input", function() {
    const inputValue = inputField.value.trim();
    if (inputValue.length >= 2) {
        updateSuggestions(inputValue);
    } else {
        clearSuggestions();
    }
});

// Function to clear suggestions
function clearSuggestions() {
    const datalist = document.getElementById("pokemonList");
    datalist.innerHTML = "";
}


// Initial fetch data on form submit
const form = document.getElementById("pokemonForm");
form.addEventListener("submit", async function(event) {
    event.preventDefault();
    const pokemonName = inputField.value.trim();
    await fetchData(pokemonName);
});


// Function to toggle between light and dark themes
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('pokemon-theme'); // Toggle the existing theme class
    
    // Check if body has the theme class to decide which theme to apply
    const isDarkMode = body.classList.contains('pokemon-theme');
    
    // Update the button text and icon based on the current theme
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (isDarkMode) {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        themeToggleBtn.innerHTML = '<i class="fas fa-adjust"></i> Dark Mode';
    }
    
    // Optionally, you can save the user's theme preference in localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Function to initialize the theme based on user's preference stored in localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('pokemon-theme'); // Apply dark theme class
        document.getElementById('themeToggleBtn').innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        document.body.classList.remove('pokemon-theme'); // Apply light theme class
        document.getElementById('themeToggleBtn').innerHTML = '<i class="fas fa-adjust"></i> Dark Mode';
    }
}

// Function to toggle between light and dark themes
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('pokemon-theme'); // Toggle the existing theme class
    
    // Check if body has the theme class to decide which theme to apply
    const isDarkMode = body.classList.contains('pokemon-theme');
    
    // Update the button text and icon based on the current theme
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (isDarkMode) {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {    
        themeToggleBtn.innerHTML = '<i class="fas fa-adjust"></i> Dark Mode';
    }
    
    // Optionally, you can save the user's theme preference in localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Function to initialize the theme based on user's preference stored in localStorage                   
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('pokemon-theme'); // Apply dark theme class
        document.getElementById('themeToggleBtn').innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        document.body.classList.remove('pokemon-theme'); // Apply light theme class
        document.getElementById('themeToggleBtn').innerHTML = '<i class="fas fa-adjust"></i> Dark Mode';
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', initializeTheme);