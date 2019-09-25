/* ### Pulling Elements from HTML ### */
// Title
let title = document.querySelector("#pseudo_page").querySelector("h2");

// Left Nav Bar
let nav_ul = document.querySelector("#pokemon_list"); //Nav bar's unordered list
let search_bar = document.querySelector("#text_input");
let search_button = document.querySelector("#search_button")
let currently_displayed = "";
let current_pkmn = nav_ul.querySelector("li:nth-of-type(0)");

search_button.addEventListener("click", searchForPokemon)

// Previous/Current/Next Bar
let previous_arrow = document.querySelector("#prev_arrow");
let previous_number_sprite = document.querySelector("#previous");
let current_number_sprite = document.querySelector("#current");
let next_number_sprite = document.querySelector("#next");
let next_arrow = document.querySelector("#next_arrow");

// SPRITE LISTENERS
// setting up listeners for the sprites at the top
previous_arrow.addEventListener("click", getPrevPokemonData);
previous_number_sprite.addEventListener("click", getPrevPokemonData);
next_arrow.addEventListener("click", getNextPokemonData);
next_number_sprite.addEventListener("click", getNextPokemonData);

// Stats
let stat_holder = document.querySelector("#stat_holder");
let stat_hp = stat_holder.querySelector('#stat_hp');
//console.log(stat_hp);
let stat_atk = stat_holder.querySelector('#stat_atk');
let stat_def = stat_holder.querySelector('#stat_def');
let stat_sp_atk = stat_holder.querySelector('#stat_sp_atk');
let stat_sp_def = stat_holder.querySelector('#stat_sp_def');
let stat_spd = stat_holder.querySelector('#stat_spd');
let stat_list =[stat_spd, stat_sp_def, stat_sp_atk, stat_def, stat_atk, stat_hp];   //list of stats to easily cycle through

// Types
let typesBox = document.querySelector("#types").querySelector("div");
let first_type = typesBox.querySelector("#first_type");
let second_type = typesBox.querySelector("#second_type");

// Flavor Text
let flavor_text = document.querySelector("#flavor_text").querySelector("p");

// Sprites
let sprite_front = document.querySelector("#sprite_front");
let sprite_back = document.querySelector("#sprite_back");
let sprite_toggle = document.querySelector("#sprite_type_selector");

let CURRENT_NUMBER = "";
let CURRENT_NAME = "";

/* ##### Setting up API Calls ##### */
let current_term = "1"; //the default pokemon will be pokemon 001, bulbasaur
const BASIC_URL = "https://pokeapi.co/api/v2/";
const STORAGE_PREFIX = "jj_pokedex_storage_";
const STORED_DATA = localStorage.getItem(STORAGE_PREFIX + current_term);

let speciesURL = "";
let evolutionChainURL = "";

// Pull the first 151 Pokemon's names and numbers then drop them into the left nav panel
const POKEMON_ALL = localStorage.getItem(STORAGE_PREFIX + "ALL_POKEMON")

// Check if we need to make an API call to accomplish this
if (!POKEMON_ALL){
    //console.log(POKEMON_ALL);
    $.ajax({
        dataType: "json",
        url: BASIC_URL + "pokemon?limit=151",
        data: null,
        success: populateNavBar
    });
} else {
    //console.log(POKEMON_ALL);
    let pokemon_all_parsed = JSON.parse(POKEMON_ALL);
    populateNavBar(pokemon_all_parsed);
}

// Pull up the default page
const DEFAULT_PAGE = localStorage.getItem(STORAGE_PREFIX + "prev_page")
if (!DEFAULT_PAGE){
    getPokemonData(1); //load bulbasaur
} else {
    getPokemonData(DEFAULT_PAGE);
}

// Function for appending a new nav bar entry
function AddNavEntry(number, name){
    let test_li = document.createElement("li");
    let test_span = document.createElement("span");
    test_span.innerHTML = `#${number}`;
    test_li.name_value = `${name}`;
    
    test_li.appendChild(test_span);
    test_li.innerHTML += ` ${name}`;
    
    nav_ul.appendChild(test_li);
    test_li.addEventListener("click", PullAndLoadInfo);
}

// Populates the navigation bar with the first 151 pokemon (can easily be expanded)
function populateNavBar(pokemon_page){
    console.log(pokemon_page);
    for(let i = 0; i < 151; i++){
        let current_name = pokemon_page.results[i].name;
        current_name = current_name.charAt(0).toUpperCase() + current_name.slice(1);
        AddNavEntry(i+1, current_name);
    }
    
    // Set the stringified object into storage for future use
    let pokemon_page_stringified = JSON.stringify(pokemon_page);
    localStorage.setItem(STORAGE_PREFIX + "ALL_POKEMON", pokemon_page_stringified);
}

// Pull up new information based on selected pokemon
function PullAndLoadInfo(e){
    let identifier = e.target.name_value.toLowerCase();
    //console.log(e);
    //console.log(identifier);
    
    // Set up the page with the identified pokemon's information
    current_term = STORAGE_PREFIX + identifier;
    let new_data = localStorage.getItem(current_term);
    if(!new_data){   //if new_data is null, fill it
        getPokemonData(identifier);
    } else {
        loadPokemonData(new_data);
    } 
}

// Checks if a pokemon's data is already logged, pulls it if the data is not yet logged
function getPokemonData(indentifier){
    let url = BASIC_URL;
    
    //if the identified is 0 letters, bail out as this function won't return anything
    if (indentifier.length < 1){ return; }
    
    //set up the basic url to be called
    url = `${BASIC_URL}pokemon/${indentifier}/`;
    //console.log(url);
    
    // Makes an API call based on the pokemon/main url 
    $.ajax({
        dataType: "json",
        url: url,
        data: null,
        success: loadPokemonData,
        error: searchFailed
    });
    
    // Makes an API call based on species url, puts data into loadSpeciesData function
    $.ajax({
        dataType: "json",
        url: speciesURL,
        data: null,
        success: loadSpeciesData
    });
}

// Specific get-data from selecting an image along the bar at the top
function getNextPokemonData(){
    if(CURRENT_NUMBER < 151){
        getPokemonData(CURRENT_NUMBER + 1);        
    }
    else{
        getPokemonData(1);
    }
}

function getPrevPokemonData(){
    if(CURRENT_NUMBER > 1){
        getPokemonData(CURRENT_NUMBER - 1);        
    }
    else{
        getPokemonData(151);
    }
}

// Load's the data into the page from a given pokemon object
function loadPokemonData(obj){    
    // Update the 'CURRENT' stats
    CURRENT_NAME = obj.species.name;
    CURRENT_NUMBER = obj.id;
    
    let stats = obj.stats;
    let sprites = obj.sprites;
    let types = obj.types;
    let speciesObj = null;
    speciesURL = obj.species.url;

    //console.log(types);            
    
    // STATS
    // pulls the stats of the pokemon
    for(let i = 0; i<stats.length; i++){
        let current_stat = stats[i].base_stat
        stat_list[i].innerHTML = current_stat;
        let percentage = current_stat/1.54; //154 is the max stat
        stat_list[i].style.width = `${percentage}%`; 
    } 
    
    // TYPES
    // pulls types of the pokemon
    while (typesBox.firstChild) {
    typesBox.removeChild(typesBox.firstChild);
    }
    console.log(types);
    let first_type_src_url = "types/"+ types[0].type.name +".png"
    let newTypeImage = document.createElement("img");
    newTypeImage.src = first_type_src_url;
    typesBox.appendChild(newTypeImage);

    
    if (types.length > 1)
    {
        //console.log(types[1].type.name);
        let newType2Image = document.createElement("img");
        let second_type_src_url = "types/"+ types[1].type.name +".png"
        //console.log(second_type_src_url);
        newType2Image.src = second_type_src_url;
        typesBox.appendChild(newType2Image);
    }
    
    // SPRITES
    // toggles between shiny and normal type
    //console.log(sprites);

    sprite_front.src = sprites.front_default
    sprite_front.style.width = "50%";
    sprite_back.src = sprites.back_default;
    sprite_back.style.width = "50%";

    sprite_toggle.onchange = function () {
    if (sprite_toggle.value == "default")
    {
        sprite_front.src = sprites.front_default;
        sprite_front.style.width = "50%";
        sprite_back.src = sprites.back_default;
        sprite_back.style.width = "50%";
    }
    else
    {
        sprite_front.src = sprites.front_shiny;
        sprite_front.style.width = "50%";
        sprite_back.src = sprites.back_shiny;
        sprite_back.style.width = "50%";
    }};
    
    let image = document.createElement("img");
    
    // FLAVOR TEXT
    while (current_number_sprite.firstChild) {
    current_number_sprite.removeChild(current_number_sprite.firstChild);
    }
    
    image = document.createElement("img");
    image.style.width = "100%";
    image.style.maxHeight = "100%";
    image.src = "images/" + CURRENT_NUMBER + ".png";
    current_number_sprite.appendChild(image);
    
    // clear our and load in left + right images
    while (previous_number_sprite.firstChild) {
    previous_number_sprite.removeChild(previous_number_sprite.firstChild);
    }
    while (next_number_sprite.firstChild) {
    next_number_sprite.removeChild(next_number_sprite.firstChild);
    }
    
    let one_up = CURRENT_NUMBER + 1;
    if (one_up == 152){
        one_up = 1;
    }
    let one_down = CURRENT_NUMBER - 1;
    if (one_down == 0){
        one_down = 151;
    }
    
    // Set the CSS rules governing the new elements
    image_prev = document.createElement("img");
    image_prev.style.width = "100%";
    image_prev.style.maxHeight = "100%";
    image_prev.src = "images/" + one_down + ".png";
    previous_number_sprite.appendChild(image_prev);
    
    image_next = document.createElement("img");
    image_next.style.width = "100%";
    image_next.style.maxHeight = "100%";
    image_next.src = "images/" + one_up + ".png";
    next_number_sprite.appendChild(image_next);
    
    // Update the higlighted pokemon in the side menu
    let nav_children = nav_ul.querySelectorAll("li");
    console.log(nav_children);
    for(let i=0; i<nav_children.length; i++){
        nav_children[i].style.color = "#FB9D57";

    }

    current_pkmn = nav_ul.querySelector(`li:nth-of-type(${CURRENT_NUMBER})`);
    current_pkmn.style.color = "#FFF";
    
    let temp_current_name = CURRENT_NAME.charAt(0).toUpperCase() + CURRENT_NAME.slice(1);
    title.innerHTML = `#${CURRENT_NUMBER} ${temp_current_name}`;
    
    localStorage.setItem(STORAGE_PREFIX + "prev_page", CURRENT_NUMBER);
}

// Loads data into screen based on pokemon's species object
function loadSpeciesData(obj){
    //Load the evolution chain url
    console.log("obj = " + obj);
    //console.log("obj stringified" + JSON.stringify(obj));

    for(let i = 0; i < obj.flavor_text_entries.length; i++)
    {
        if(obj.flavor_text_entries[i].language.name == "en")
        {
            flavor_text.innerHTML = obj.flavor_text_entries[i].flavor_text;
            //return;
        }
    }
}

// Use the search bar
function searchForPokemon(){
    let searchedTerm = search_bar.value;
    getPokemonData(searchedTerm);
}

function searchFailed(){
    search_bar.value = "Input DNE";
}