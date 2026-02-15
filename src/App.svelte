<script lang="ts">
    import "./app.css";
    import {borders, getBorderingCountries, coords, formattedCountries} from "./data_lists/index";
    import {toProperCase, pickRandomCountries, getCodes, getName, Police} from "./logic/index";
    import {getBossHome, rob, ok, nextTurn, bossLocations, bossHome} from "./game/index"
    import type {LatLngExpression} from "leaflet";
    import {initialView, view1, thiefCountryMarker, policeMarkers, policePreviousMarkers, policeThiefPreviousMarker ,dummyMarker, editMarkerLocations} from './map_markers/index';
    import Leaflet from './lib/Leaflet.svelte';
    import Marker from './lib/Marker.svelte';
    import Geodata from './lib/Geodata.svelte';

    let gameState = "menu-screen"; //Determines whose move it is
    let thiefDisplay = ""; //What is displayed to the police officers
    let message = ""; //Universal usage error message
    let turnNumber = 0; //Keeps track of # of turns (used for thiefDisplay)
    let dummyRandomizer = 0.5;
    let seaPopup = false;

    let prepare = 0; //Variable that represents readiness for robbery
    let cash = 200; //Used for moving as well as end goal (tbi)
    let blank = "‎"; //blank space for whenever necessary
    let thiefInput = ""; //used for storing thief's input
    let failedRobbery = false; //Feature to display error message and also used for detaining
    let thiefCountry = ""; //Self Explanatory
    let thiefSelectedCountry = ""; //Temp Variable used as middleman between html and js
    let thiefPrevious = ""; //Self Explanatory
    let whoseTurnNext = "";
    $: thiefBorderingCountries = thiefCountry ? [thiefCountry, ...getBorderingCountries(thiefCountry)] : [];
    $: thiefBorderingCodes = thiefBorderingCountries ? getCodes(thiefBorderingCountries) : [];
    let skipVar = 0;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let actionsOpen = false;
    let policeForce = "Interpol"
    let heatedCountries = [];
    let howToPopup = false;

    let robbedCountries: string[] = [];

    let policeFunding = 2000;
    let credibility = 0;

    function thiefHandleSubmitInput() {
        const trimmed = thiefInput.trim();
        if (!trimmed) {
            message = "Please type a country name.";
            setTimeout(() => (message = ""), 4000);
            return;
        }
        const thiefInputNormalized = toProperCase(trimmed);
        if (thiefInputNormalized in borders) {
            thiefCountry = thiefInputNormalized;
            thiefSelectedCountry = thiefCountry;
            selno += 1;
            currentPoliceIndex = 0;
            policeInput = "";
            gameState = "police-selection";
        } else {
            message = "Invalid country. Not in game, or incorrect spelling.";
            setTimeout(() => (message = ""), 4000);
        }
    }

    function thiefHandleRobbery() {
        if (robbedCountries.includes(thiefCountry)){
            message = "Already Robbed this Country";
            setTimeout(() => (message = ""), 4000);
            return;
        }
        if (prepare < 0) {
            message = "Prepare can't be negative!";
            setTimeout(() => (message = ""), 4000);
            return;
        }

        if (rob(prepare, thiefCountry)) {
            cash += 200;
            robbedCountries = [...robbedCountries, thiefCountry];
            failedRobbery = false;
        } else {
            failedRobbery = true;
            thiefSelectedCountry = "skip";
            thiefHandleSubmitDropdown();
        }

        prepare = -4;
    }

    function handleOk() {
        gameState = ok(); // returns "mask-screen"
    }

    function handleNextTurn() {
        gameState = nextTurn(whoseTurnNext); // returns "thiefMove" or "policeMove1"
        if (gameState === "policeMove1") police1selectedCountry = police1.location || "";
    }

    function thiefHandleSubmitDropdown() {
        if (blockaded.includes(thiefCountry) && blockaded.includes(thiefSelectedCountry) && thiefCountry != thiefSelectedCountry) {
            message = "This border is blockaded! Must find andother way!";
            setTimeout(() => (message = ""), 4000);
            return;
        }

        if (failedRobbery == true && thiefCountry == "North Korea") {
            gameState = "KimJongUn";
            return;
        }

        if (police1.location == police2.location && policeCountries.includes(police1.location) && credibility < 0) {
            credibility += 2;
            if (credibility > 0) {
                credibility = 0;
            }
        }

        policeFunding -= 200;

        if (policeFunding <= -500) {
            gameState = "policeLose";
            return;
        }

        turnNumber += 1;
        dummyRandomizer = Math.random();
        thiefPrevious = thiefCountry;

        if (dummyCooldown > 0) {
            dummyCooldown -= 1;
        }

        if(blockadeCooldown > 0) {
            blockadeCooldown -= 1;
        }

        if(investigationCooldown > 0) {
            investigationCooldown -= 1;
        }

        if(dummyReset > 0) {
            dummyReset -= 1;
        }

        if(dummyReset == 0) {
            dummyDisplay = dummyCountry;
            dummyDisplayConditional = true;
        } else {
            dummyDisplay = "";
            dummyDisplayConditional = false;
        }
        
        if(thiefSelectedCountry == "skip") {
            thiefDisplay = thiefCountry;
            if(skipVar == 1){
                failedRobbery = false;
                skipVar = 0;
            } else if(skipVar == 0){
                failedRobbery = true;
                skipVar += 1;
            }

            message = "The Robbery Failed. You will be detained for two rounds. Don't let the police know!";
            setTimeout(() => (message = ""), 5500);
            editMarkerLocations(thiefCountry, thiefDisplay, dummyCountry, police1, police2);
            whoseTurnNext = "Police"
            gameState = "mask-screen";
            return;
        }

        thiefCountry = thiefSelectedCountry;
        heatedCountries.push(thiefCountry);

        if (blockadeDuration > 0) {
            blockadeDuration -= 1;
        } else {
            blockaded = ["", ""];
        }

        if (thiefPrevious !== thiefCountry) {
            if (cash >= 10) {
                cash -= 20;
            } else {
                message = "Not enough cash to move!";
                setTimeout(() => (message = ""), 5000);
                thiefCountry = thiefPrevious;
                return;
            }
        }

        if (prepare < 0) {
            prepare += 1;
        } else if (prepare >= 0 && thiefPrevious != thiefCountry) {
            prepare = 0;
        } else if (prepare >= 0 && thiefPrevious == thiefCountry) {
            prepare += 1;
        }

        let abc = getBorderingCountries(thiefPrevious);
        abc.push(thiefPrevious);

        if (turnNumber % 3 == 0) {
            let count = 0;
            for (const x of heatedCountries) {
                if (x === thiefPrevious) count++;
            }
            if (count <= 3) {
                thiefDisplay = shuffle(abc)[0];
            } else {
                thiefDisplay = thiefPrevious;
            }
        } else {
            thiefDisplay = "???";
        }

        if (thiefCountry == police1.location || thiefCountry == police2.location) {
            gameState = "policeWin";
            return;
        }

        if (thiefCountry == bossHome && cash >= 1000){
            gameState = "thiefWin";
            return;
        }

        editMarkerLocations(thiefCountry, thiefDisplay, dummyCountry, police1, police2);
        whoseTurnNext = "Police"
        gameState = "mask-screen";
    }

    let policeInput = "";
    let currentPoliceIndex = 0;
    let police1selectedCountry = "";
    let police2selectedCountry = "";

    let police1 = new Police("Police1", "", 1);
    let police2 = new Police("Police2", "", 2);

    $: police1BorderingCountries = police1.location ? police1.borderingCountries : [];
    $: police2BorderingCountries = police2.location ? police2.borderingCountries : [];
    $: police1BorderingCodes = police1BorderingCountries ? getCodes(police1BorderingCountries) : [];
    $: police2BorderingCodes = police2BorderingCountries ? getCodes(police2BorderingCountries) : [];

    function policeHandleSubmitInput() {
        const trimmed = policeInput.trim();
        if (!trimmed) {
            message = "Please type a country name.";
            setTimeout(() => (message = ""), 4000);
            return;
        }
        const policeInputNormalized = toProperCase(trimmed);
        if (!(policeInputNormalized in borders)) {
            message = "Invalid country. Not in game / Incorrect spelling.";
            setTimeout(() => (message = ""), 4000);
            return;
        }

        const twoMoveReach = new Set<string>(thiefBorderingCountries);
        for (const country of thiefBorderingCountries) {
            for (const second of getBorderingCountries(country)) {
                twoMoveReach.add(second);
            }
        }
        if (twoMoveReach.has(policeInputNormalized)) {
            message = "Too close to the thief. Pick a country at least 2 moves away.";
            setTimeout(() => (message = ""), 4000);
            return;
        }

        if (currentPoliceIndex === 0) {
            police1.location = policeInputNormalized;
            police1.previous = police1.location;
            policeInput = "";
            selno += 1;
            currentPoliceIndex = 1;
        } else {
            police2.location = policeInputNormalized;
            police2.previous = police2.location;
            editMarkerLocations(thiefCountry, thiefPrevious, dummyCountry, police1, police2);
            whoseTurnNext = "Thief";
            gameState = "multiplayer-menu";
        }
    }

    function police1handleSubmit(){

        if (credibility < -3 && (highRefusalCountries.includes(police1selectedCountry) || lowRefusalCountries.includes(police1selectedCountry))) {
            let luck = Math.random();
            if (luck < 0.5) {
                message = "You've been barred from entry by " + police1selectedCountry;
                setTimeout(() => message = "", 4000);
            } else {
                police1.previous = police1.location;
                let g = police1.previous;
                police1.location = police1selectedCountry;
                police1 = new Police("", police1.location, police1.turnNumber);
                police1.previous = g;
            }
        } else if (credibility === -3 && highRefusalCountries.includes(police1selectedCountry)) {
            let luck = Math.random();
            if (luck < 0.5) {
                message = "You've been barred from entry by " + police1selectedCountry;
                setTimeout(() => message = "", 4000);
            } else {
                police1.previous = police1.location;
                let g = police1.previous;
                police1.location = police1selectedCountry;
                police1 = new Police("", police1.location, police1.turnNumber);
                police1.previous = g;
            }
        } else {
            police1.previous = police1.location;
            let g = police1.previous;
            police1.location = police1selectedCountry;
            police1 = new Police("", police1.location, police1.turnNumber);
            police1.previous = g;
        }

        if (thiefCountry == police1.location || thiefCountry == police2.location){
            gameState = "policeWin";
            return;
        }

        editMarkerLocations(thiefCountry, thiefPrevious, dummyCountry, police1, police2);
        police2selectedCountry = police2.location || "";
        gameState = "policeMove2";
    }

    function police2handleSubmit(){

        if (credibility < -3 && (highRefusalCountries.includes(police2selectedCountry) || lowRefusalCountries.includes(police2selectedCountry))) {
            let luck = Math.random();
            if (luck < 0.5) {
                message = "You've been barred from entry by " + police2selectedCountry;
                setTimeout(() => message = "", 4000);
            } else {
                police2.previous = police2.location;
                let g = police2.previous;
                police2.location = police2selectedCountry;
                police2 = new Police("", police2.location, police2.turnNumber);
                police2.previous = g;
            }
        } else if (credibility === -3 && highRefusalCountries.includes(police2selectedCountry)) {
            let luck = Math.random();
            if (luck < 0.5) {
                message = "You've been barred from entry by " + police2selectedCountry;
                setTimeout(() => message = "", 4000);
            } else {
                police2.previous = police2.location;
                let g = police2.previous;
                police2.location = police2selectedCountry;
                police2 = new Police("", police2.location, police2.turnNumber);
                police2.previous = g;
            }
        } else {
            police2.previous = police2.location;
            let g = police2.previous;
            police2.location = police2selectedCountry;
            police2 = new Police("", police2.location, police2.turnNumber);
            police2.previous = g;
        }

        if (thiefCountry == police1.location || thiefCountry == police2.location){
            gameState = "policeWin";
            return;
        }

        if(dummyDisplayConditional == true) {
            dummyDisplayConditional = false;
            dummyCountry = "";
            dummyReset = -1;
            dummyInput = "";
            dummyDisplay = "";
        }

        if(turnNumber > 5) {
            for(const country of thiefBorderingCountries) {
                if(country == police2.location || country == police1.location) {
                    policeProximity.push(1);
                } else if(getBorderingCountries(country).includes(police2.location) || getBorderingCountries(country).includes(police1.location)) {
                    policeProximity.push(2);
                } else {
                    policeProximity.push(3);
                }
            }
        }

        if (turnNumber > 6 && turnNumber % 3 === 2) {
            let averageProximity = (policeProximity[turnNumber - 3] + policeProximity[turnNumber - 2] + policeProximity[turnNumber - 1]) / 3;
            if (averageProximity < 1.4) {
                credibility += 1;
            } else if (averageProximity < 2.5) {
                credibility += 0;
            } else {
                credibility -= 1;
            }
            
            if (turnNumber % 6 === 0) {
                if (turnNumber / robbedCountries.length < 6) {
                    credibility -= 1;
                } else if (turnNumber / robbedCountries.length > 8) {
                    credibility += 1;
                }
            }
        }

        if (credibility > 3) {
            credibility = 3;
        }

        switch (credibility) {
            case 0: policeFunding += 180; break;
            case -1: policeFunding += 140; break;
            case -2: policeFunding += 80; break;
            case -3: policeFunding += 40; break;
            case 1: policeFunding += 200; break;
            case 2: policeFunding += 230; break;
            case 3: policeFunding += 250; break;
        }

        editMarkerLocations(thiefCountry, thiefPrevious, dummyCountry, police1, police2);
        heatedCountries.push(police1.location);
        heatedCountries.push(police2.location);
        whoseTurnNext = "Thief";
        gameState = "mask-screen";
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let possiblyImportantCountries = ["USA", "Canada", "Germany", "France", "Switzerland", "Japan", "South Korea", "Singapore", "Brazil", "South Africa", "Australia"]
    let lowRefusalCountries = ["Turkey", "Indonesia", "Malaysia", "Egypt", "Morocco", "Bolivia"]
    let highRefusalCountries = ["Russia", "China", "Iran", "Venezuela", "North Korea"]
    let policeCountries = shuffle(possiblyImportantCountries).slice(0, 5);

    let policeProximity: number[] = [];

    let dummyCooldown = 5;
    let dummyPopup = false;
    let dummyInput = "";
    let dummyCountry = "";
    let dummyReset = -1;
    let dummyDisplayConditional = false;
    let dummyDisplay = "";

    function dummyOpenPopup() {
        if(dummyCooldown > 0) {
            message = "Cooldown Active. Wait for " + dummyCooldown + " more turns.";
            setTimeout(() => (message = ""), 4000);
            return;
        }
            dummyPopup = true;
    }

    function dummyHandleSubmitInput() {
        let dummyInputLowercase = toProperCase(dummyInput);

        if(dummyInputLowercase in borders){
            dummyCountry = dummyInputLowercase;
            message = "Dummy Successfully Placed in " + dummyCountry + ".";
            setTimeout(() => message = "", 4000)
        } else {
            message = "Invalid country! Please enter a valid country.";
            setTimeout(() => message = "", 4000);
        }

        if(dummyCountry in borders) {

            dummyReset = (3 - (turnNumber % 3)) % 3;
            if (dummyReset === 0) dummyReset = 3;
            dummyCooldown = 8;
        }

        dummyPopup = false;
    }

    let popupOpen = false;

    function togglePopup() {
        popupOpen = !popupOpen;
    }

    function play() {
        gameState = "selection";
    }

    let selno = 0;

    let blockadePopupA = false;
    let blockadePopupB = false;
    let blockadeCooldown = 5;

    function blockadeOpenPopup() {
        if(policeFunding < 1000) {
            message = "Not enough funds. $1000 required.";
            setTimeout(() => (message = ""), 4000);
            return;
        }

        if(blockadeCooldown > 0) {
            message = "Cooldown Active. Wait for " + blockadeCooldown + " more turns.";
            setTimeout(() => (message = ""), 4000);
            return;
        }
        
        blockadePopupA = true;
    }

    let blockadeInput = "";
    let blockade1 = "";
    let blockadeAborders = [];
    let blockadeDuration = 0;

    function blockadeHandleSubmitInput() {
        let blockadeInputA = toProperCase(blockadeInput);

        if(blockadeInputA in borders){
            blockade1 = blockadeInputA;
            message = "Blockaded Country Selected: " + blockade1 + ".";
            setTimeout(() => message = "", 4000)
        } else {
            message = "Invalid country! Please enter a valid country.";
            setTimeout(() => message = "", 4000);
        }

        blockadeAborders = blockade1 ? [blockade1, ...getBorderingCountries(blockade1)] : [];
        blockadePopupA = false;
        blockadePopupB = true;
    }

    let blockaded = ["", ""];

    function blockadeSubmit() {
        const normalized = toProperCase(blockadeInput);

        if (!blockadeAborders.includes(normalized)) {
            message = "Invalid country! Please enter a valid bordering country.";
            setTimeout(() => message = "", 4000);
            return;
        }

        blockaded = [blockade1, normalized];


        policeFunding -= 1000;
        blockadeCooldown = 15;

        blockadeDuration = 3;

        blockadePopupB = false;

    }

    let investigationPopup = false;
    let investigateInput = "";
    let investigationCooldown = 3;

    function investigateOpenPopup() {
        if(policeFunding < 100) {
            message = "Not enough funds. $100 required.";
            setTimeout(() => (message = ""), 4000);
            return;
        }

        if(investigationCooldown > 0) {
            message = "Cooldown Active. Wait for " + investigationCooldown + " more turns.";
            setTimeout(() => (message = ""), 4000);
            return;
        }
        
        investigationPopup = true;
    }

    function investigateHandleSubmitInput() {
        let investigated = toProperCase(investigateInput);

        if(investigated in borders){
            if (bossLocations.includes(investigated)) {
                message = investigated + " is a boss location. Bingo!";
                setTimeout(() => message = "", 5000)
            } else if (investigated == bossHome) {
                message = investigated + " is THE BOSS HOME. Hehehe...";
                setTimeout(() => message = "", 4000)
            } else {
                message = investigated + " is not a relevant location for the boss. Clear.";
                setTimeout(() => message = "", 4000)
            }
            policeFunding -= 100;
            investigationCooldown = 3;

        } else {
            message = "Invalid country! Please enter a valid country.";
            setTimeout(() => message = "", 4000);
        }

        investigationPopup = false;
        
    }

    let received = false;

    function emergencyFunds() {
        if (received == true) {
            message = "Lmao we already gave you emergency funds you dumbasses what is this?!";
            setTimeout(() => message = "", 4000);
            credibility -= 1;
            return;
        }
        if (policeFunding < 0 && credibility > -5) {
            if (police1.location == police2.location && policeCountries.includes(police1.location)) {
                policeFunding += 500;
                credibility -= 2;
                received = true;
            } else {
                message = "Invalid country! Please enter a valid bordering country.";
                setTimeout(() => message = "", 4000);
            }
        } else {
            message = "Your current funds or credibility is not eligible to apply for emergency funding.";
            setTimeout(() => message = "", 4000);
        }
    }

</script>

{#if gameState == "menu-screen"}
    <div>
        <div class="fullscreen-map">
            <Leaflet view={view1} zoom={2.5}></Leaflet>
        </div>

        <div id="popup-overlay">
            <div class="popup-box">
                <h2>Welcome to Global Heist</h2>
                <p>Information on how to play will be available in game</p>
                <p>{blank}</p>
                <button class="button-54" on:click={async () => {await sleep(200); gameState = "thief-selection";}}>Multiplayer</button>
            </div>
        </div>
    </div>
{/if}

{#if gameState == "thief-selection"}
    <div class="thief-selection-screen">
        <div class="fullscreen-map">
            <Leaflet view={view1} zoom={2.5}></Leaflet>
        </div>
        <div class="thief-selection-overlay">
            <div class="thief-selection-card">
                <h2>Choose your starting country</h2>
                <p class="thief-selection-hint">Type the name of a country in the game.</p>
                <div class="thief-selection-input-group">
                    <input
                        type="text"
                        class="thief-selection-input"
                        bind:value={thiefInput}
                        placeholder="e.g. France, Brazil…"
                        on:keydown={(e) => e.key === "Enter" && thiefHandleSubmitInput()}
                        autocomplete="off"
                    />
                    <button class="button-54" on:click={thiefHandleSubmitInput}>Confirm</button>
                </div>
            </div>
        </div>
    </div>
{/if}

{#if gameState == "police-selection"}
    <div class="thief-selection-screen">
        <div class="fullscreen-map">
            <Leaflet view={view1} zoom={2.5}></Leaflet>
        </div>
        <div class="thief-selection-overlay">
            <div class="thief-selection-card">
                <h2>Police {currentPoliceIndex + 1}: choose your starting country</h2>
                <p class="thief-selection-hint">Thief is in <strong>{thiefCountry}</strong>. Pick a country at least 2 moves away.</p>
                <div class="thief-selection-input-group">
                    <input
                        type="text"
                        class="thief-selection-input"
                        bind:value={policeInput}
                        placeholder="e.g. Japan, Australia…"
                        on:keydown={(e) => e.key === "Enter" && policeHandleSubmitInput()}
                        autocomplete="off"
                    />
                    <button class="button-54" on:click={policeHandleSubmitInput}>Confirm</button>
                </div>
            </div>
        </div>
    </div>
{/if}

{#if gameState == "mask-screen"}
    <div class="mask-screen">
        <div class="fullscreen-map">
            <Leaflet view={view1} zoom={2.5}></Leaflet>
        </div>
        <div class="mask-overlay">
            <div class="mask-card">
                <p class="mask-message">Transfer device to <strong>{whoseTurnNext}</strong></p>
                <button class="btn-move-on" on:click={handleNextTurn}>Move On</button>
            </div>
        </div>
    </div>
{/if}

{#if (gameState == "multiplayer-menu" || gameState == "thiefMove")  && (blockadePopupA != true && investigationPopup != true && blockadePopupB != true && howToPopup != true && seaPopup != true)}
    <div class="game-screen">
    <!-- TOP ACTION BAR -->
    <header class="top-bar">
        <div class="top-left">
        <span>{turnNumber}</span>
        <span>${cash}</span>
        <span>Prep: {prepare}</span>
        </div>

        <div class="top-center">
        <label>
            Move to
            <select id="country-dropdown" bind:value={thiefSelectedCountry}>
                {#if failedRobbery}
                    <option value="skip">Skip</option>
                {:else}
                    {#each thiefBorderingCountries as country}
                        <option value={country}>{country}</option>
                    {/each}
                {/if}
            </select>
        </label>
        <button class="confirm-btn" on:click={thiefHandleSubmitDropdown}>Confirm Move</button>
        <button class="rob-btn" on:click={thiefHandleRobbery}>Rob</button>
        </div>

        <div class="top-right">
            <button
                class="actions-toggle"
                on:click={() => actionsOpen = !actionsOpen}
                aria-label="Open actions"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <!-- MAIN AREA -->
    <div class="main-area">
        <!-- LEFT INFO PANEL -->
        <aside class="info-panel">
        <section>
            <h3>Your Location</h3>
            <p>{thiefCountry}</p>
        </section>

        <section>
            <h3>Police</h3>
            <ul>
            <li>P1: {police1.previous}</li>
            <li>P2: {police2.previous}</li>
            </ul>
        </section>

        <section>
            <h3>Boss Locations</h3>
            <ul class="scroll-list">
                {#each bossLocations as location}
                    <li>{location}</li>
                {/each}
            </ul>
        </section>
        </aside>

        <!-- MAP -->
        <main class="map-area">
            <Leaflet view={initialView} zoom={1.8}>
                {#if failedRobbery}
                    <Geodata
                        availableCountries={[thiefCountry]}
                        onSelect={(code) => {
                            // This will only be called on second click
                            thiefSelectedCountry = getName(code); // store the selected country
                            thiefHandleSubmitDropdown();          // immediately trigger the move
                        }}
                    />
                {:else}
                    <Geodata
                        availableCountries={thiefBorderingCodes}
                        onSelect={(code) => {
                            // This will only be called on second click
                            thiefSelectedCountry = getName(code); // store the selected country
                            thiefHandleSubmitDropdown();          // immediately trigger the move
                        }}
                    />
                {/if}
                
                {#each thiefCountryMarker as latLng}
                    <Marker {latLng} width={40} height={40}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            xml:space="preserve"
                            style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"
                            viewBox="0 0 60.601004 60.601004"
                        >
                        <path style="fill:#010002;" d="M33.47,36.538c0.102-0.43,0.172-0.885,0.193-1.372c0.404-8.843-4.428-16.084-11.671-20.739
                            c-4.308-2.77-8.394,0.25-9.432,4.101c-2.67-2.125-7.294,1.055-5.214,4.548c0.076,0.127,0.154,0.255,0.232,0.383
                            c-2.088-0.008-8.742-0.029-6.879,0.002c2.202,0.038,7.486,5.964,7.486,5.964v-5c1.623,2.482,3.698,4.804,6.786,5.155
                            c1.408,0.161,2.571-0.275,3.527-1.038c1.207,1.477,1.822,3.135,1.942,5.125c-1.057-0.016-2.117,0.027-3.187,0.152
                            c-3.691,0.435-5.969,1.248-6.715,5.109c-1.122,5.824,1.907,10.078,5.174,14.53c2.658,3.621,8.776,0.112,6.083-3.56
                            c-2.202-3-4.417-5.465-4.326-8.951c2.152-0.327,4.292-0.239,6.477-0.03c1.069,0.46,2.275,0.646,3.469,0.553
                            c1.781,5.955,5.163,11.259,9.543,15.783c3.166,3.271,8.143-1.722,4.982-4.979C37.597,47.782,34.688,42.585,33.47,36.538z"/>
                        <path style="fill:#010002;" d="M6.805,7.951c0.009,0.1,0.012,0.2,0.026,0.301c0.449,3.26,3.454,5.539,6.712,5.09
                            c3.26-0.448,5.536-3.452,5.09-6.712c-0.092-0.678-0.3-1.309-0.594-1.885c0.201-0.097,0.292-0.328,0.224-0.809l-0.194-1.423
                            c-0.22-1.591-1.687-2.705-3.276-2.485l-6.342,0.87c-1.595,0.22-2.706,1.687-2.487,3.28l0.155,1.151
                            C5.23,6.038,4.479,6.934,4.642,7.884C4.784,8.727,5.718,8.518,6.805,7.951z"/>
                        <path style="fill:#010002;" d="M22.894,13.399c0,0,14.28,7.656,12.593,18.94c-3.698,9.408,12.449,19.098,21.229-2.6
                            C56.715,29.739,67.895,0.001,22.894,13.399z M47.071,31.105v1.814h-1.93v-1.707c-0.894-0.084-1.783-0.379-2.358-0.787
                            l-0.271-0.195l0.7-1.958l0.47,0.313c0.609,0.407,1.396,0.642,2.15,0.642c0.923,0,1.539-0.479,1.539-1.19
                            c0-0.48-0.191-1.001-1.604-1.573c-1.492-0.584-3.021-1.435-3.021-3.287c0-1.489,0.979-2.65,2.514-3.037v-1.763h1.913v1.643
                            c0.731,0.074,1.37,0.277,1.945,0.614l0.321,0.19l-0.73,1.928l-0.45-0.256c-0.264-0.151-0.887-0.508-1.876-0.508
                            c-0.975,0-1.322,0.512-1.322,0.991c0,0.519,0.258,0.855,1.791,1.491c1.326,0.54,2.853,1.422,2.853,3.451
                            C49.702,29.458,48.659,30.7,47.071,31.105z"/>
                        </svg>
                    </Marker>
                {/each}               
                {#each policePreviousMarkers as latLng}
                    <Marker {latLng} width={40} height={40}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            xml:space="preserve"
                            style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"
                            viewBox="0 0 60.601004 60.601004"
                        >
                            <path d="m 7.7898759,56.02613 c -1.7750001,0 -3.2150003,-1.43875 -3.2150003,-3.215 l 0,-45.0200039 c 0,-1.7762501 1.4400002,-3.2162502 3.2150003,-3.2162502 l 45.0212541,0 c 1.77625,0 3.215,1.4400001 3.215,3.2162502 l 0,45.0200039 c 0,1.77625 -1.43875,3.215 -3.215,3.215 l -45.0212541,0 z" style="fill:#ffffff;stroke:#000000;stroke-width:0.60625005;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;fill-opacity:1"/>
                            <path d="m 25.618626,18.467378 0,0.38875 c 0,2.57875 2.09,4.66875 4.66875,4.66875 2.578751,0 4.668751,-2.09 4.668751,-4.66875 l 0,-2.72375 -9.753751,0 -1.95875,2.335 2.375,0" style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none"/>
                            <path d="m 23.184876,10.518627 2.0175,4.3275 9.753751,0 0.92625,-2.5425 -12.697501,-1.785" style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none"/>
                            <path d="m 27.599876,43.048629 0,2.12125 10.220001,0 0.075,-2.12125 -10.295001,0 z m -0.85,-1.5925 c 0,-0.4875 -0.39375,-0.88375 -0.8825,-0.88375 l -3.0075,0 c -0.39,0 -0.70625,0.3175 -0.70625,0.7075 0,0.10375 0.02125,0.20125 0.0625,0.29 l 2.845,6.32375 c 0.13875,0.30625 0.44625,0.52125 0.80625,0.52125 0.48875,0 0.8825,-0.39625 0.8825,-0.885 l 0,-6.07375 z m 15.678751,-9.595001 -1.44375,16.493751 -3.275,0 -0.0625,1.767501 -14.722501,0 -0.06125,-1.767501 -3.277501,0 -1.44125,-16.493751 c -0.24,-2.7375 1.47875,-5.355 4.223751,-6.12625 1.57375,-0.43875 3.2,-0.75 4.87,-0.92125 l 3.04625,5.21625 3.05125,-5.22 c 1.662501,0.17 3.281251,0.47875 4.850001,0.91125 2.7425,0.77125 4.4825,3.4025 4.2425,6.14" style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none"/>
                        </svg>
                    </Marker>
                {/each}
            </Leaflet>
        <div id="map"></div>
        </main>
    </div>
    </div>
{/if}

{#if (gameState == "policeMove1" || gameState == "policeMove2") && (blockadePopupA != true && investigationPopup != true && blockadePopupB != true && howToPopup != true && seaPopup != true)}
    <div class="game-screen">
        <header class="top-bar">
            <div class="top-left">
                <span>{turnNumber}</span>
                <span>${policeFunding}</span>
                <span>Cred: {credibility}</span>
            </div>
            <div class="top-center">
                <span class="top-center-prefix">Move to</span>
                {#if gameState == "policeMove1"}
                    <select bind:value={police1selectedCountry}>
                        {#each police1BorderingCountries as country}
                            <option value={country}>{country}</option>
                        {/each}
                    </select>
                {:else}
                    <select bind:value={police2selectedCountry}>
                        {#each police2BorderingCountries as country}
                            <option value={country}>{country}</option>
                        {/each}
                    </select>
                {/if}
                <button class="confirm-btn" on:click={gameState === "policeMove1" ? police1handleSubmit : police2handleSubmit}>Confirm Move</button>
            </div>
            <div class="top-right">
                <button class="actions-toggle" on:click={() => actionsOpen = !actionsOpen} aria-label="Open actions">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>
        <div class="main-area">
            <aside class="info-panel">
                <section>
                    <h3>Police</h3>
                    <ul>
                        <li>P1: {police1.location || "—"}</li>
                        <li>P2: {police2.location || "—"}</li>
                    </ul>
                </section>
                <section>
                    {#if dummyRandomizer >= 0.5}
                        <div class="info-section">
                            <h3>Thief's Last Location</h3>
                            <p class="location">{thiefDisplay}</p>
                            {#if dummyDisplayConditional}
                                <h3>Thief's Last Location</h3>
                                <p class="location">{dummyDisplay}</p>
                            {/if}
                        </div>
                    {:else}
                        <div class="info-section">
                            {#if dummyDisplayConditional}
                                <h3>Thief's Last Location</h3>
                                <p class="location">{dummyDisplay}</p>
                            {/if}
                            <h3>Thief's Last Location</h3>
                            <p class="location">{thiefDisplay}</p>
                        </div>
                    {/if}
                </section>

                <section>
                    <h3>Jurisdictions</h3>
                    <ul class="scroll-list">
                        {#each policeCountries as location}
                            <li>{location}</li>
                        {/each}
                    </ul>
                </section>

            </aside>

            <main class="map-area">
                <Leaflet view={initialView} zoom={1.8}>
                    {#if gameState == "policeMove1"}
                        <Geodata
                            availableCountries={police1BorderingCodes}
                            onSelect={(code) => {
                                police1selectedCountry = getName(code);
                                police1handleSubmit();
                            }}
                        />
                    {:else}
                        <Geodata
                        availableCountries={police2BorderingCodes}
                        onSelect={(code) => {
                            police2selectedCountry = getName(code);
                            police2handleSubmit();
                        }}
                        />
                    {/if}
                    {#if thiefDisplay in borders}
                        {#each policeThiefPreviousMarker as latLng}
                            <Marker {latLng} width={40} height={40}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xml:space="preserve"
                                    style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"
                                    viewBox="0 0 60.601004 60.601004"
                                >
                                <path style="fill:#010002;" d="M33.47,36.538c0.102-0.43,0.172-0.885,0.193-1.372c0.404-8.843-4.428-16.084-11.671-20.739
                                    c-4.308-2.77-8.394,0.25-9.432,4.101c-2.67-2.125-7.294,1.055-5.214,4.548c0.076,0.127,0.154,0.255,0.232,0.383
                                    c-2.088-0.008-8.742-0.029-6.879,0.002c2.202,0.038,7.486,5.964,7.486,5.964v-5c1.623,2.482,3.698,4.804,6.786,5.155
                                    c1.408,0.161,2.571-0.275,3.527-1.038c1.207,1.477,1.822,3.135,1.942,5.125c-1.057-0.016-2.117,0.027-3.187,0.152
                                    c-3.691,0.435-5.969,1.248-6.715,5.109c-1.122,5.824,1.907,10.078,5.174,14.53c2.658,3.621,8.776,0.112,6.083-3.56
                                    c-2.202-3-4.417-5.465-4.326-8.951c2.152-0.327,4.292-0.239,6.477-0.03c1.069,0.46,2.275,0.646,3.469,0.553
                                    c1.781,5.955,5.163,11.259,9.543,15.783c3.166,3.271,8.143-1.722,4.982-4.979C37.597,47.782,34.688,42.585,33.47,36.538z"/>
                                <path style="fill:#010002;" d="M6.805,7.951c0.009,0.1,0.012,0.2,0.026,0.301c0.449,3.26,3.454,5.539,6.712,5.09
                                    c3.26-0.448,5.536-3.452,5.09-6.712c-0.092-0.678-0.3-1.309-0.594-1.885c0.201-0.097,0.292-0.328,0.224-0.809l-0.194-1.423
                                    c-0.22-1.591-1.687-2.705-3.276-2.485l-6.342,0.87c-1.595,0.22-2.706,1.687-2.487,3.28l0.155,1.151
                                    C5.23,6.038,4.479,6.934,4.642,7.884C4.784,8.727,5.718,8.518,6.805,7.951z"/>
                                <path style="fill:#010002;" d="M22.894,13.399c0,0,14.28,7.656,12.593,18.94c-3.698,9.408,12.449,19.098,21.229-2.6
                                    C56.715,29.739,67.895,0.001,22.894,13.399z M47.071,31.105v1.814h-1.93v-1.707c-0.894-0.084-1.783-0.379-2.358-0.787
                                    l-0.271-0.195l0.7-1.958l0.47,0.313c0.609,0.407,1.396,0.642,2.15,0.642c0.923,0,1.539-0.479,1.539-1.19
                                    c0-0.48-0.191-1.001-1.604-1.573c-1.492-0.584-3.021-1.435-3.021-3.287c0-1.489,0.979-2.65,2.514-3.037v-1.763h1.913v1.643
                                    c0.731,0.074,1.37,0.277,1.945,0.614l0.321,0.19l-0.73,1.928l-0.45-0.256c-0.264-0.151-0.887-0.508-1.876-0.508
                                    c-0.975,0-1.322,0.512-1.322,0.991c0,0.519,0.258,0.855,1.791,1.491c1.326,0.54,2.853,1.422,2.853,3.451
                                    C49.702,29.458,48.659,30.7,47.071,31.105z"/>
                                </svg>
                            </Marker>
                        {/each}
                    {/if}
                    {#if dummyDisplayConditional}
                        {#if dummyCountry in borders}
                            {#each dummyMarker as latLng}
                                <Marker {latLng} width={40} height={40}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        xml:space="preserve"
                                        style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"
                                        viewBox="0 0 60.601004 60.601004"
                                    >
                                    <path style="fill:#010002;" d="M33.47,36.538c0.102-0.43,0.172-0.885,0.193-1.372c0.404-8.843-4.428-16.084-11.671-20.739
                                        c-4.308-2.77-8.394,0.25-9.432,4.101c-2.67-2.125-7.294,1.055-5.214,4.548c0.076,0.127,0.154,0.255,0.232,0.383
                                        c-2.088-0.008-8.742-0.029-6.879,0.002c2.202,0.038,7.486,5.964,7.486,5.964v-5c1.623,2.482,3.698,4.804,6.786,5.155
                                        c1.408,0.161,2.571-0.275,3.527-1.038c1.207,1.477,1.822,3.135,1.942,5.125c-1.057-0.016-2.117,0.027-3.187,0.152
                                        c-3.691,0.435-5.969,1.248-6.715,5.109c-1.122,5.824,1.907,10.078,5.174,14.53c2.658,3.621,8.776,0.112,6.083-3.56
                                        c-2.202-3-4.417-5.465-4.326-8.951c2.152-0.327,4.292-0.239,6.477-0.03c1.069,0.46,2.275,0.646,3.469,0.553
                                        c1.781,5.955,5.163,11.259,9.543,15.783c3.166,3.271,8.143-1.722,4.982-4.979C37.597,47.782,34.688,42.585,33.47,36.538z"/>
                                    <path style="fill:#010002;" d="M6.805,7.951c0.009,0.1,0.012,0.2,0.026,0.301c0.449,3.26,3.454,5.539,6.712,5.09
                                        c3.26-0.448,5.536-3.452,5.09-6.712c-0.092-0.678-0.3-1.309-0.594-1.885c0.201-0.097,0.292-0.328,0.224-0.809l-0.194-1.423
                                        c-0.22-1.591-1.687-2.705-3.276-2.485l-6.342,0.87c-1.595,0.22-2.706,1.687-2.487,3.28l0.155,1.151
                                        C5.23,6.038,4.479,6.934,4.642,7.884C4.784,8.727,5.718,8.518,6.805,7.951z"/>
                                    <path style="fill:#010002;" d="M22.894,13.399c0,0,14.28,7.656,12.593,18.94c-3.698,9.408,12.449,19.098,21.229-2.6
                                        C56.715,29.739,67.895,0.001,22.894,13.399z M47.071,31.105v1.814h-1.93v-1.707c-0.894-0.084-1.783-0.379-2.358-0.787
                                        l-0.271-0.195l0.7-1.958l0.47,0.313c0.609,0.407,1.396,0.642,2.15,0.642c0.923,0,1.539-0.479,1.539-1.19
                                        c0-0.48-0.191-1.001-1.604-1.573c-1.492-0.584-3.021-1.435-3.021-3.287c0-1.489,0.979-2.65,2.514-3.037v-1.763h1.913v1.643
                                        c0.731,0.074,1.37,0.277,1.945,0.614l0.321,0.19l-0.73,1.928l-0.45-0.256c-0.264-0.151-0.887-0.508-1.876-0.508
                                        c-0.975,0-1.322,0.512-1.322,0.991c0,0.519,0.258,0.855,1.791,1.491c1.326,0.54,2.853,1.422,2.853,3.451
                                        C49.702,29.458,48.659,30.7,47.071,31.105z"/>
                                    </svg>
                                </Marker>
                            {/each}
                        {/if}
                    {/if}
                    {#each policeMarkers as latLng}
                        <Marker {latLng} width={40} height={40}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xml:space="preserve"
                                style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2"
                                viewBox="0 0 60.601004 60.601004"
                            >
                                <path d="m 7.7898759,56.02613 c -1.7750001,0 -3.2150003,-1.43875 -3.2150003,-3.215 l 0,-45.0200039 c 0,-1.7762501 1.4400002,-3.2162502 3.2150003,-3.2162502 l 45.0212541,0 c 1.77625,0 3.215,1.4400001 3.215,3.2162502 l 0,45.0200039 c 0,1.77625 -1.43875,3.215 -3.215,3.215 l -45.0212541,0 z" style="fill:#ffffff;stroke:#000000;stroke-width:0.60625005;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1;fill-opacity:1"/>
                                <path d="m 25.618626,18.467378 0,0.38875 c 0,2.57875 2.09,4.66875 4.66875,4.66875 2.578751,0 4.668751,-2.09 4.668751,-4.66875 l 0,-2.72375 -9.753751,0 -1.95875,2.335 2.375,0" style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none"/>
                                <path d="m 23.184876,10.518627 2.0175,4.3275 9.753751,0 0.92625,-2.5425 -12.697501,-1.785" style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none"/>
                                <path d="m 27.599876,43.048629 0,2.12125 10.220001,0 0.075,-2.12125 -10.295001,0 z m -0.85,-1.5925 c 0,-0.4875 -0.39375,-0.88375 -0.8825,-0.88375 l -3.0075,0 c -0.39,0 -0.70625,0.3175 -0.70625,0.7075 0,0.10375 0.02125,0.20125 0.0625,0.29 l 2.845,6.32375 c 0.13875,0.30625 0.44625,0.52125 0.80625,0.52125 0.48875,0 0.8825,-0.39625 0.8825,-0.885 l 0,-6.07375 z m 15.678751,-9.595001 -1.44375,16.493751 -3.275,0 -0.0625,1.767501 -14.722501,0 -0.06125,-1.767501 -3.277501,0 -1.44125,-16.493751 c -0.24,-2.7375 1.47875,-5.355 4.223751,-6.12625 1.57375,-0.43875 3.2,-0.75 4.87,-0.92125 l 3.04625,5.21625 3.05125,-5.22 c 1.662501,0.17 3.281251,0.47875 4.850001,0.91125 2.7425,0.77125 4.4825,3.4025 4.2425,6.14" style="fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none"/>
                            </svg>
                        </Marker>
                    {/each}
                    </Leaflet>
                <div id="map"></div>
            </main>
        </div>
    </div>
{/if}

{#if gameState == "policeWin"}
    <div class="mask-screen">
        <div class="fullscreen-map"><Leaflet view={view1} zoom={2.5}></Leaflet></div>
        <div class="mask-overlay">
            <div class="mask-card">
                <p class="mask-message">Police win!</p>
            </div>
        </div>
    </div>
{/if}

{#if gameState == "thiefWin" || gameState == "policeWin" || gameState == "KimJongUn" || gameState == "policeLose"}
    <div class="mask-screen">
        <div class="fullscreen-map"><Leaflet view={view1} zoom={2.5}></Leaflet></div>
        <div class="mask-overlay">
            <div class="mask-card">
                {#if gameState == "policeWin"}
                    <p class="mask-message">Thief Caught</p>
                    <p class="mask-message">The Sucker Lost</p>
                    <p class="mask-message">Imagine Losing Hahahaha</p>
                {:else if gameState == "thiefWin"}
                    <p class="mask-message">The Thief has done it!</p>
                    <p class="mask-message">{policeForce} has lost. L bozo, one thief and his boss lmaooooooo...</p>
                    <p class="mask-message">The boss and thief are both individually richer than all of the police officers' salaries combined.</p>
                {:else if gameState == "policeLose"}
                    <p class="mask-message">Supporters have drawn away all funding from {policeForce} and have closed the investigation.</p>
                    <p class="mask-message">Though individual countries would like to catch the thief, it will most certainly be too late by the time they mobilize.</p>
                    <p class="mask-message">Legend says the boss and thief have made a fortune as the officers (you suckers) have become homeless.</p>
                {:else}
                    <p class="mask-message">R.I.P thief 🪦💀</p>
                    <p class="mask-message">Executed in North Korea for a robbery against the state</p>
                    <p class="mask-message">Kim Jong Un seized all assets and refuses to return stolen money 🗿🗿⚔️⚔️⚔️</p>
                {/if}
            </div>
        </div>
    </div>
{/if}

{#if gameState == "thiefMove" && actionsOpen}
  <div class="panel-backdrop" tabindex="0" role="button" aria-label="Close actions panel" on:click={() => actionsOpen = false} on:keydown={(e) => {if (e.key === 'Enter' || e.key === ' ') {actionsOpen = false;}}}>
    <aside class="actions-panel">
      <button on:click={dummyOpenPopup}>Place Dummy</button>
      <button on:click={() => (seaPopup = true)}>View Path References</button>
      <button on:click={() => (howToPopup = true)}>How to Play?</button>

      <h3>Boss Home</h3>
      <p>{bossHome}</p>
    </aside>
  </div>
{/if}

{#if (gameState == "policeMove1" || gameState == "policeMove2") && actionsOpen}
  <div class="panel-backdrop" tabindex="0" role="button" aria-label="Close actions panel" on:click={() => actionsOpen = false} on:keydown={(e) => {if (e.key === 'Enter' || e.key === ' ') {actionsOpen = false;}}}>
    <aside class="actions-panel">
      <button on:click={blockadeOpenPopup}>Set up Blockade</button>
      <button on:click={investigateOpenPopup}>Investigate for Boss Location</button>
      <button on:click={emergencyFunds}>Request Emergency Funding</button>
      <button on:click={() => (seaPopup = true)}>View Path References</button>
      <button on:click={() => (howToPopup = true)}>How to Play?</button>
    </aside>
  </div>
{/if}

{#if message}
  <div class="notification-toast" role="alert">
    {message}
  </div>
{/if}

{#if dummyPopup === true || blockadePopupA === true || blockadePopupB === true || investigationPopup === true}
    <div>
        <div class="fullscreen-map">
            <Leaflet view={view1} zoom={2.5}></Leaflet>
        </div>

        <div id="popup-overlay">
            <div class="popup-box">
                <button class="close-button" on:click={() => {dummyPopup = false; blockadePopupA = false; blockadePopupB = false; investigationPopup = false}}>×</button>
                {#if dummyPopup === true}
                    <div>
                        <h2>Type Dummy Location</h2>
                        <input 
                            id="text-input"
                            class="thief-selection-input"
                            type="text"
                            bind:value={dummyInput}
                            placeholder="Enter country name..."
                        />

                        <button class="button-54" on:click={dummyHandleSubmitInput}>Place Dummy</button>
                    </div>
                {:else if blockadePopupA === true}
                    <div>
                        <h2>Type Country 1</h2>
                        <input 
                            id="text-input"
                            class="thief-selection-input"
                            type="text"
                            bind:value={blockadeInput}
                            placeholder="Enter country name..."
                        />

                        <button class="button-54" on:click={blockadeHandleSubmitInput}>Confirm</button>
                    </div>
                {:else if blockadePopupB == true}
                    <div>
                        <h2>Type Country 1</h2>
                        <select id="country-dropdown" bind:value={blockadeInput}>
                            {#each blockadeAborders as country}
                                <option value={country}>{country}</option>
                            {/each}
                        </select>

                        <button class="button-54" on:click={blockadeSubmit}>Confirm</button>
                    </div>
                {:else if investigationPopup == true}
                    <div>
                        <h2>Country to Investigate?</h2>
                        <input 
                            id="text-input"
                            class="thief-selection-input"
                            type="text"
                            bind:value={investigateInput}
                            placeholder="Enter country name..."
                        />

                        <button class="button-54" on:click={investigateHandleSubmitInput}>Investigate!</button>
                    </div>
                {/if}
            </div>
            
        </div>
    </div>
{/if}

{#if howToPopup || seaPopup}
    <div>
        <div class="fullscreen-map">
            <Leaflet view={view1} zoom={2.5} />
        </div>

        <div id="info-overlay">
            <div class="info-box">
                <button
                    class="close-button"
                    on:click={() => {howToPopup = false; seaPopup = false}}
                >
                    ×
                </button>

                {#if howToPopup}
                    <div class="info-content">
                        <h1>How to Play</h1>

                        <p>
                            The <strong>Thief</strong> attempts to rob countries while avoiding
                            two police units across a live world map.
                        </p>

                        <h2>Location Intel</h2>

                        <p>
                            Gameplay revolves around location intelligence. The thief is able to get the location of the
                            officers' previous positions every round, while police officers are constrained to the same
                            data every three rounds.
                        </p>
                        <p>
                            However, it still remains very difficult for the thief to gain enough distance to make safe robberies
                            as the two police officers can cover the map very well if used correctly. Any mistakes from the thief
                            can end the game while the police is given more room to breath.
                        </p>
                        <p>
                            Therefore, as a balancing factor, police data can sometimes be unreliable. If a country has been used less
                            than four times throughout the game and the thief is positioned upon it at the time police data is collected,
                            the police will see the thief's location not necessarily as it was, but as a country close to, as in bordering
                            it. Below is an example to illustrate this mechanic.
                        </p>
                        <p>
                            <strong>Round 25:</strong>
                        </p>
                        <p>
                            Police officers, situated in Peru and New Zealand, receive no intelligence. In anticipation, officer one
                            moves to Colombia while officer two moves to Antarctica. Next, the thief, situated in Honduras, moves to Guatemala.
                        </p>
                        <p>
                            <strong>Round 26:</strong>
                        </p>
                        <p>
                            Police officers, situated in Colombia and Antarctica, receive no intelligence. In anticipation, officer one
                            moves to Panama while officer two moves to Chile. The thief receives their previous positions, New Zealand and
                            Peru, then proceeds to move to Mexico.
                        </p>
                        <p>
                            <strong>Round 27:</strong>
                        </p>
                        <p>
                            Police officers receive intelligence as the turn is a multiple of three. They see that the thief was in Guatemala.
                            However, unreliable data may cause them to see any country that Guatemala borders too. If Guatemala had been
                            crossed at least four times, then they would see correct data. Therefore, police officers must always keep
                            a keen eye on what countries have been used and which ones haven't been used. In order to get better data
                            accross the board, the police may chose to travel to unused locations to increase reliability.
                        </p>
                        <table>
                            <thead>
                                <tr>
                                <th>Role</th>
                                <th>Intel Update</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                <td>Thief</td>
                                <td>Every turn</td>
                                </tr>
                                <tr>
                                <td>Police</td>
                                <td>Every 3 turns</td>
                                </tr>
                            </tbody>
                        </table>

                        <h2>Robberies</h2>
                        <p>
                            Robberies are the primary method by which the thief generates wealth. Each successful robbery earns the
                            thief $200. The thief starts the game with $200 and must end it with at least $1000 to satisfy its win
                            condition.
                        </p>
                        <p>
                            <strong>Robbery Success Rates</strong> are determined by two factors, both based on the thief's
                            preparation. Preparation is set at 0 by default, and increases by one every time the thief stays put
                            within a country. Once a robbery is conducted, prepare resets not to zero but to negative four, acting
                            as a robbery cooldown. The second factor is whether the thief's boss has already done some preparation
                            for the thief. There will be ten countries like this, known as boss locations. Robbery of a boss location
                            will generally yield more success for the thief. Below is a table to illustrate this:
                        </p>

                        <table>
                            <thead>
                                <tr>
                                <th>Prepare</th>
                                <th>0</th>
                                <th>1</th>
                                <th>2</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                <td>Boss Location</td>
                                <td>60%</td>
                                <td>95%</td>
                                <td>95%</td>
                                </tr>
                                <tr>
                                <td>Not Boss Location</td>
                                <td>10%</td>
                                <td>50%</td>
                                <td>95%</td>
                                <tr>
                            </tbody>
                        </table>

                        <p>
                            <strong>Robbery Failure</strong> causes the thief to be detained for two turns at the location of the
                            robbery. The police won't be explicitly notified of this, however, they will see the thief's location 
                            if he's detained.
                        </p>
                        <p>
                            <strong>The thief wins </strong> by going to the boss's home with at least $1000. Robberies are the only
                            way for the thief to earn money, but the thief can also lose money. Every movement (not turn) costs the
                            thief $20.
                        </p>
                        <p>
                            <strong>The thief can place a dummy</strong> to split the attention of the police between two locations:
                            what would normally be shown, and the dummy location. The dummy will only be shown once, and while it
                            does not cost the thief any cash amount, it comes with a cooldown limiting its use. Below is an example
                            of what the police may see on their turn.
                        </p>
                        <img src="/howToMap.png" alt="Dummy Visual" />

                        <h2>Police Credibility and Funding</h2>

                        <p>
                            Almost every action taken by the police requires some cash amount to be paid. While the police, unlike
                            the thief, can't rob countries, they can indirectly influence the amount of funding they receive.
                            Credibility is the primary way in which trust in the police is measured in this game. It's influenced
                            by two factors, distance to the thief, and the amount of countries robbed per turn.
                        </p>
                        <p>
                            If the closest police officer is close to the thief, there will be a gradual increase in credibility.
                            If the closest police officer is far away from the thief, there will be a gradual decrease. The number
                            of ccountries robbed per turn impacts credibility equally to the distance factor, and works in a similar
                            way in which more robberies will decrease credibility and less will increase it.
                        </p>
                        <p>
                            A credibility of 1 will prevent losses, and the intial value of 0 will lead to a net loss of $20 for
                            the police. Higher credibilities will lead to more funding in general.
                        </p>
                        <p>
                            In addition, extremely low credibility will prevent police officers from entering certain countries.
                            For now, these countries are predetermined and not influenced by the players. Below is the list:
                        </p>
                        <p>Blocked at -3: Russia, China, Iran, Venezuela, North Korea</p>
                        <p>Blocked at -4: Turkey, Indonesia, Malaysia, Egypt, Morocco, Bolivia, + above</p>

                        <p>{blank}</p>
                        <p><strong>How to manage credibilty?</strong></p>
                        <p>
                            By now, you may have realized that lower credibility will lead to a perpetual cycle of losing
                            credibility. The answer lies in regrouping rather than pushing aimlessly forward. Credbility will
                            increase by two each turn (with a cap at 0) if both police officers are situted in the same jurisdiction. While this
                            will likely put the police in a worse position geographically, there are instances where it will be
                            the best strategic move. Use this power wisely.
                        </p>
                        <p>
                            The police may also request emergency funding if funds go into the negatives. This package of $500 may help
                            as a short term relief, however, it will decrease credbility and therefore should not be relied on for long term
                            success. If funds go below -$500, the police will be shut down in order to prevent further losses. This
                            results in the thief's vitory.
                        </p>

                        <p>{blank}</p>
                        <p><strong>What to use funding for?</strong></p>
                        <p>
                            The police may use their funds on two things besides the costs of each normal turn. They may investigate
                            locations or place blockades. Investigations will often be a minor dent, but blocaked cost $1000, and
                            unless credibility is managed very effectively, the police may only get to use this power once. Keep in
                            mind that both of these uses come with cooldowns.
                        </p>
                    </div>
                {:else}
                    <div class="info-content">
                        <h1>Maritime and Unusual Borders / Paths</h1>
                    </div>
                    <h2>Maritime Connections</h2>
                    <p><strong>Spain - Morocco</strong></p>
                    <p><strong>Italy - Malta - Tunisia</strong></p>
                    <p><strong>Saudi Arabia - Egypt</strong></p>
                    <p><strong>Yemen - Djibouti</strong></p>
                    <p><strong>Iran - UAE</strong></p>
                    <p><strong>Malaysia - Singapore - Indonesia (cyclic)</strong></p>
                    <p><strong>Indonesia - Australia - New Zealand - Antarctica</strong></p>
                    <p><strong>Papua New Guinea - Australia</strong></p>
                    <p><strong>South Africa - Antarctica</strong></p>
                    <p><strong>Chile - Antarctica</strong></p>
                    <p><strong>USA - Cuba - Mexico (cyclic)</strong></p>
                    <p><strong>USA - Russia</strong></p>
                    <p><strong>Russia - Japan - South Korea</strong></p>
                    <p><strong>Azerbaijan - Turkmenistan</strong></p>
                    <h2>Other Unusual Borders</h2>
                    <p><strong>Suriname - France - Brazil</strong></p>
                    <p><strong>Netherlands - France</strong></p>
                    <p><strong>Poland - Russia</strong></p>
                    <p><strong>Sweden - Denmark - Canada</strong></p>
                {/if}
            </div>
        </div>
    </div>
{/if}
