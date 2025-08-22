// Global variables
let currentOffset = 0;
const limit = 20;
let allPokemon = [];
let filteredPokemon = [];

// DOM Elements
const pokemonGrid = document.getElementById('pokemonGrid');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchSuggestions = document.getElementById('searchSuggestions');
const typeFilter = document.getElementById('typeFilter');
const sortOrder = document.getElementById('sortOrder');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const modal = document.getElementById('pokemonModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close');

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Reset to home page
function resetToHome() {
    // Reset search input
    searchInput.value = '';
    
    // Reset filters
    typeFilter.value = '';
    sortOrder.value = 'id';
    
    // Reset offset
    currentOffset = 0;
    
    // Reset filtered Pokemon to show all
    filteredPokemon = [...allPokemon];
    
    // Clear and reload the Pokemon grid
    pokemonGrid.innerHTML = '';
    displayPokemon(allPokemon.slice(0, limit));
    
    // Hide search suggestions
    searchSuggestions.style.display = 'none';
    
    // Show load more button
    loadMoreBtn.style.display = 'block';
}

// Event Listeners
document.getElementById('homeLogo').addEventListener('click', resetToHome);

searchButton.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
searchInput.addEventListener('input', debounce(handleSearchSuggestions, 300));
searchInput.addEventListener('focus', () => {
    if (searchInput.value) {
        searchSuggestions.style.display = 'block';
    }
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!searchSuggestions.contains(e.target) && e.target !== searchInput) {
        searchSuggestions.style.display = 'none';
    }
});

typeFilter.addEventListener('change', filterPokemon);
sortOrder.addEventListener('change', sortPokemon);
loadMoreBtn.addEventListener('click', loadMorePokemon);
closeModal.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// Functions
async function fetchPokemon(offset = 0, limit = 20) {
    try {
        loadingSpinner.style.display = 'flex';
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        
        const pokemonDetails = await Promise.all(
            data.results.map(async (pokemon) => {
                const response = await fetch(pokemon.url);
                return response.json();
            })
        );
        
        allPokemon = [...allPokemon, ...pokemonDetails];
        filteredPokemon = [...allPokemon];
        return pokemonDetails;
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        return [];
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.onclick = () => showPokemonDetails(pokemon);
    
    card.innerHTML = `
        <div class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</div>
        <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
             alt="${pokemon.name}">
        <h2 class="pokemon-name">${pokemon.name}</h2>
        <div class="pokemon-types">
            ${pokemon.types.map(type => 
                `<span class="type-badge ${type.type.name}">${type.type.name}</span>`
            ).join('')}
        </div>
    `;
    
    return card;
}

async function loadMorePokemon() {
    currentOffset += limit;
    const newPokemon = await fetchPokemon(currentOffset);
    displayPokemon(newPokemon);
}

function displayPokemon(pokemonList) {
    if (currentOffset === 0) {
        pokemonGrid.innerHTML = '';
    }
    
    if (pokemonList.length === 0) {
        pokemonGrid.innerHTML = `
            <div class="no-results-container">
                <i class="fas fa-search"></i>
                <h2>No Pokémon Found</h2>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    loadMoreBtn.style.display = 'block';
    pokemonList.forEach(pokemon => {
        pokemonGrid.appendChild(createPokemonCard(pokemon));
    });
}

function handleSearchSuggestions() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) {
        searchSuggestions.style.display = 'none';
        return;
    }

    const matchingPokemon = allPokemon.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm) ||
        pokemon.id.toString() === searchTerm
    ).slice(0, 5); // Limit to 5 suggestions

    searchSuggestions.style.display = 'block';
    
    if (matchingPokemon.length > 0) {
        searchSuggestions.innerHTML = matchingPokemon.map(pokemon => `
            <div class="suggestion-item" onclick="selectPokemon('${pokemon.name}')">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <div class="pokemon-info">
                    <span class="pokemon-name">${pokemon.name}</span>
                    <span class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</span>
                </div>
            </div>
        `).join('');
    } else {
        searchSuggestions.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No Pokémon found matching "${searchTerm}"</p>
            </div>
        `;
    }
}

function selectPokemon(pokemonName) {
    searchInput.value = pokemonName;
    searchSuggestions.style.display = 'none';
    handleSearch();
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    filteredPokemon = allPokemon.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm) ||
        pokemon.id.toString() === searchTerm
    );
    pokemonGrid.innerHTML = '';
    displayPokemon(filteredPokemon);
    searchSuggestions.style.display = 'none';
}

function filterPokemon() {
    const selectedType = typeFilter.value;
    filteredPokemon = allPokemon.filter(pokemon => 
        selectedType === '' || 
        pokemon.types.some(type => type.type.name === selectedType)
    );
    pokemonGrid.innerHTML = '';
    displayPokemon(filteredPokemon);
}

function sortPokemon() {
    const selectedSort = sortOrder.value;
    filteredPokemon.sort((a, b) => {
        if (selectedSort === 'id') {
            return a.id - b.id;
        } else {
            return a.name.localeCompare(b.name);
        }
    });
    pokemonGrid.innerHTML = '';
    displayPokemon(filteredPokemon);
}

function showPokemonDetails(pokemon) {
    modalContent.innerHTML = `
        <div class="pokemon-details">
            <div class="pokemon-image">
                <img src="${pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}" 
                     alt="${pokemon.name}">
                <div class="pokemon-types">
                    ${pokemon.types.map(type => 
                        `<span class="type-badge ${type.type.name}">${type.type.name}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="stats-container">
                <h2>#${String(pokemon.id).padStart(3, '0')} ${pokemon.name}</h2>
                <div class="pokemon-info">
                    <p>Height: ${pokemon.height / 10}m</p>
                    <p>Weight: ${pokemon.weight / 10}kg</p>
                </div>
                <h3>Base Stats</h3>
                ${pokemon.stats.map(stat => `
                    <div class="stat">
                        <p>${stat.stat.name}: ${stat.base_stat}</p>
                        <div class="stat-bar">
                            <div class="stat-fill" style="width: ${(stat.base_stat / 255) * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
                <h3>Abilities</h3>
                <p>${pokemon.abilities.map(ability => 
                    ability.ability.name.replace('-', ' ')
                ).join(', ')}</p>
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

// Initial load
async function initialize() {
    const initialPokemon = await fetchPokemon();
    displayPokemon(initialPokemon);
}

initialize();
