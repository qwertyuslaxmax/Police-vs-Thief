<script lang="ts">
    import "./app.css";
    import {borders} from "./borders";
    import {getBorderingCountries} from "./borders";
    import {toProperCase} from "./randomFunctions";
    import {pickRandomCountries} from "./randomFunctions";
    import {coords} from './coords';
    import type { LatLngExpression } from "leaflet";
    import Leaflet from './lib/Leaflet.svelte'
    import Marker from './lib/Marker.svelte';

    let gameState = "thiefSelection"; //Determines whose move it is
    let thiefDisplay = ""; //What is displayed to the police officers
    let errorMessage = ""; //Universal usage error message
    let turnNumber = 0; //Keeps track of # of turns (used for thiefDisplay)

    let prepare = 0; //Variable that represents readiness for robbery
    let cash = 150; //Used for moving as well as end goal (tbi)
    let trustTheProcess = "‎"; //trust me
    let thiefInput = ""; //used for storing thief's input
    let failedRobbery = false; //Feature to display error message and also used for detaining
    let thiefCountry = ""; //Self Explanatory
    let thiefSelectedCountry = ""; //Temp Variable used as middleman between html and js
    let thiefPrevious = ""; //Self Explanatory
    $: thiefBorderingCountries = thiefCountry ? [thiefCountry, ...getBorderingCountries(thiefCountry)] : [];

    class Police {
        name: string;
        location: string;
        turnNumber: number;
        
        constructor(name: string, location: string, turnNumber: number) {
            this.name = name;
            this.location = location;
            this.turnNumber = turnNumber;
        }

        get borderingCountries(): string[] {
            return this.location ? [this.location, ...getBorderingCountries(this.location)] : [];
        }
    }

    const initialView: LatLngExpression = [-28, 5]

    let thiefCountryMarker: Array<LatLngExpression> = [
        [42.62711, -70.58948], //Default location
    ];

    let policeMarkers: Array<LatLngExpression> = [
        [0, 0],
        [0, 0]
    ]

    let policeThiefPreviousMarker: Array<LatLngExpression> = [
        [0, 0]
    ]

    $: {
        if (thiefCountry && coords[thiefCountry]) {
            thiefCountryMarker[0] = [coords[thiefCountry][0], coords[thiefCountry][1]];
        } else {
            thiefCountryMarker[0] = [0, 0];
        }
    }

    $: {
        if (thiefPrevious && coords[thiefPrevious]) {
            policeThiefPreviousMarker[0] = [coords[thiefPrevious][0], coords[thiefPrevious][1]];
        } else {
            policeThiefPreviousMarker[0] = [0, 0];
        }
    }

    $: {
        if (police1.location && coords[police1.location] && police2.location && coords[police2.location]) {
            policeMarkers[0] = [coords[police1.location][0], coords[police1.location][1]];
            policeMarkers[1] = [coords[police2.location][0], coords[police2.location][1]];
        } else {
            policeMarkers[0] = [0, 0];
            policeMarkers[1] = [0, 0];
        }
    }

    function thiefHandleSubmitInput() {
        let thiefInputLowercase = toProperCase(thiefInput);

        if(thiefInputLowercase in borders){
            thiefCountry = thiefInputLowercase;
            thiefSelectedCountry = thiefCountry;
            gameState = "policeSelection";
        } else {
            errorMessage = "Invalid country! Please enter a valid country.";
            setTimeout(() => errorMessage = "", 3000);
        }
    }

    let bossLocations = pickRandomCountries();
    
    function getBossHome(){
        let countries = pickRandomCountries(); // Get the list of random countries
        let bossHome = countries[Math.floor(Math.random() * countries.length)]; // Pick one at random
        if(bossLocations.includes(bossHome)){
            return getBossHome();
        }
        return bossHome;
    }

    let bossHome = getBossHome();

    function rob() {

        let successRate = 0;

        if (prepare >= 1 && bossLocations.includes(thiefCountry)) {
            successRate = 0.95;
        } else if (prepare == 1 && !bossLocations.includes(thiefCountry)) {
            successRate = 0.50;
        } else if (prepare >= 2 && !bossLocations.includes(thiefCountry)) {
            successRate = 0.95;
        } else if (prepare == 0 && bossLocations.includes(thiefCountry)) {
            successRate = 0.60;
        } else if (prepare == 0 && !bossLocations.includes(thiefCountry)) {
            successRate = 0.10;
        }

        return Math.random() < successRate; // Returns true if robbery succeeds, false if it fails
    }

    let negativePrepareError = "";
    let robbedCountries: string[] = [];
    let alreadyRobbedError = "";
    let varA = true;

    function thiefHandleRobbery() {
        if (robbedCountries.includes(thiefCountry)){
            alreadyRobbedError = "Already Robbed this Country";
            setTimeout(() => (alreadyRobbedError = ""), 3000);
            return;
        }
        if (prepare < 0) {
            negativePrepareError = "Prepare can't be negative!";
            setTimeout(() => (negativePrepareError = ""), 3000);
            return;
        }

        if (rob()) {
            cash += 150;
            robbedCountries = [...robbedCountries, thiefCountry];
            failedRobbery = false;
        } else {
            failedRobbery = true;
            if(thiefCountry == "North Korea") {
                varA = false;
            }
        }

        prepare = -5;

        if (varA == false) {
            gameState = "KimJongUn";
            return;
        }
    }

    let numberA = 0;

    function thiefHandleSubmitDropdown() {

        turnNumber += 1;
        thiefPrevious = thiefCountry;
        
        if(thiefSelectedCountry == "skip"){
            thiefDisplay = thiefCountry;
            gameState = "policeMove1";
            if(numberA == 1){
                failedRobbery = false;
                numberA = 0;
            } else if(numberA == 0){
                failedRobbery = true;
                numberA += 1;
            }
            return;
        }

        thiefCountry = thiefSelectedCountry;

        if (thiefPrevious !== thiefCountry) {
            if (cash >= 10) {
                cash -= 10;
            } else {
                errorMessage = "Not enough cash to move!";
                setTimeout(() => (errorMessage = ""), 3000);
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

        if (turnNumber % 3 == 0) {
            thiefDisplay = thiefPrevious;
        } else {
            thiefDisplay = "???";
        }

        if (thiefCountry == police1.location || thiefCountry == police2.location) {
            gameState = "policeWin";
            return;
        }

        if (thiefCountry == bossHome && cash >= 800){
            gameState = "thiefWin";
            return;
        }

        gameState = "policeMove1"; // Next step after thief's move

        console.log('thiefCountry:', thiefCountry);
        console.log('coords[thiefCountry]:', coords[thiefCountry]);
        console.log(coords["New Zealand"]);  // Test with a known key
    }

    let maskScreen = false;

    function removeMask() {
        maskScreen = false;  // Remove black screen when clicked
    }

    let policeInput = "";
    let currentPoliceIndex = 0;
    let police1selectedCountry = "";
    let police2selectedCountry = "";

    let police1 = new Police("Police1", "", 1);
    let police2 = new Police("Police2", "", 2);

    $: police1BorderingCountries = police1.location ? police1.borderingCountries : [];
    $: police2BorderingCountries = police2.location ? police2.borderingCountries : [];

    function policeHandleSubmitInput() {
        let policeInputProper = toProperCase(policeInput);

        if (policeInputProper in borders) {

            let twoMoveReach = new Set(thiefBorderingCountries);
            for (let country of thiefBorderingCountries) {
                let secondMoveBorders = getBorderingCountries(country);
                for (let secondMove of secondMoveBorders) {
                    twoMoveReach.add(secondMove);
                }
            }

            if (twoMoveReach.has(policeInputProper)) {
                errorMessage = "Invalid choice! Police cannot start too close to the thief.";
                setTimeout(() => (errorMessage = ""), 3000);
                return;
            }

            if (currentPoliceIndex == 0){
                police1.location = policeInputProper;
            }

            if (currentPoliceIndex == 1){
                police2.location = policeInputProper;
                gameState = "thiefMove"
                return;
            }

            policeInput = "";
            currentPoliceIndex++;

        } else {
            errorMessage = "Invalid country! Please enter a valid country.";
            setTimeout(() => (errorMessage = ""), 3000);
        }
    }

    let varB = false;

    function police1handleSubmit(){
        police1.location = police1selectedCountry;

        if (thiefCountry == police1.location || thiefCountry == police2.location){
            gameState = "policeWin";
            return;
        }

        if (robbedCountries.includes(police1.location) || robbedCountries.includes(police2.location)) {
            varB = true;
        } else {
            varB = false;
        }

        gameState = "policeMove2"
    }

    function police2handleSubmit(){
        police2.location = police2selectedCountry;

        if (thiefCountry == police1.location || thiefCountry == police2.location){
            gameState = "policeWin";
            return;
        }

        if (robbedCountries.includes(police1.location) || robbedCountries.includes(police2.location)) {
            varB = true;
        } else {
            varB = false;
        }

        maskScreen = true;
        gameState = "thiefMove"
    }

</script>

<div class="game-container">
    <!-- Left Panel - Game Information -->
    <div class="panel info-panel">
        <div class="panel-content">
            <h2>Game Information</h2>
            
            {#if gameState === "thiefMove"}
                <div class="info-section">
                    <h3>Your Location</h3>
                    <p class="location">{thiefCountry}</p>
                </div>
                <div class="info-section">
                    <h3>Boss Locations</h3>
                    <ul class="location-list">
                        {#each bossLocations as location}
                            <li>{location}</li>
                        {/each}
                    </ul>
                </div>
                <div class="info-section">
                    <h3>Boss Home</h3>
                    <p class="location">{bossHome}</p>
                </div>
            {:else if gameState === "policeMove1" || gameState === "policeMove2"}
                <div class="info-section">
                    <h3>Police Locations</h3>
                    <p class="location">Police 1: {police1.location}</p>
                    <p class="location">Police 2: {police2.location}</p>
                </div>
                <div class="info-section">
                    <h3>Thief's Last Location</h3>
                    <p class="location">{thiefDisplay}</p>
                </div>
            {/if}
        </div>
    </div>

    <!-- Middle Panel - Game Controls -->
    <div class="panel control-panel">
        <div class="panel-content">
            {#if gameState === "thiefSelection"}
                <div class="input-section">
                    <h2>Select Starting Country</h2>
                    <div class="input-group">
                        <input 
                            id="text-input" 
                            type="text" 
                            bind:value={thiefInput}
                            placeholder="Enter country name..."
                        />
                        <button on:click={thiefHandleSubmitInput}>Submit</button>
                    </div>
                </div>
            {:else if gameState === "thiefMove"}
                <div class="input-section">
                    <h2>Your Move</h2>
                    <div class="input-group">
                        <select id="country-dropdown" bind:value={thiefSelectedCountry}>
                            {#if failedRobbery}
                                <option value="skip">Skip</option>
                            {:else}
                                {#each thiefBorderingCountries as country}
                                    <option value={country}>{country}</option>
                                {/each}
                            {/if}
                        </select>
                        <button on:click={thiefHandleSubmitDropdown}>Confirm Move</button>
                    </div>
                    <button 
                        class="rob-button" 
                        on:click={thiefHandleRobbery} 
                        disabled={prepare < 0}
                    >
                        Rob {thiefCountry}
                    </button>
                    <div class="stats-section">
                        <div class="stat-item">
                            <span class="stat-label">Cash:</span>
                            <span class="stat-value cash">${cash}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Turn:</span>
                            <span class="stat-value">{turnNumber}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Prepare:</span>
                            <span class="stat-value prepare">{prepare}</span>
                        </div>
                    </div>
                    <div class="police-locations">
                        <h3>Police Locations</h3>
                        <div class="location-grid">
                            <div class="location-item">
                                <span class="location-label">Police 1:</span>
                                <span class="location-value">{police1.location}</span>
                            </div>
                            <div class="location-item">
                                <span class="location-label">Police 2:</span>
                                <span class="location-value">{police2.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            {:else if gameState === "policeSelection"}
                <div class="input-section">
                    <h2>Police {currentPoliceIndex + 1} Starting Position</h2>
                    <p class="subtitle">Thief is in: {thiefCountry}</p>
                    <div class="input-group">
                        <input 
                            id="text-input" 
                            type="text" 
                            bind:value={policeInput}
                            placeholder="Enter country name..."
                        />
                        <button on:click={policeHandleSubmitInput}>Submit</button>
                    </div>
                </div>
            {:else if gameState === "policeMove1"}
                <div class="input-section">
                    <h2>Police 1 Move</h2>
                    <div class="input-group">
                        <select id="country-dropdown" bind:value={police1selectedCountry}>
                            {#each police1BorderingCountries as country}
                                <option value={country}>{country}</option>
                            {/each}
                        </select>
                        <button on:click={police1handleSubmit}>Submit Move</button>
                    </div>
                </div>
            {:else if gameState === "policeMove2"}
                <div class="input-section">
                    <h2>Police 2 Move</h2>
                    <div class="input-group">
                        <select id="country-dropdown" bind:value={police2selectedCountry}>
                            {#each police2BorderingCountries as country}
                                <option value={country}>{country}</option>
                            {/each}
                        </select>
                        <button on:click={police2handleSubmit}>Submit Move</button>
                    </div>
                </div>
            {/if}

            {#if errorMessage || negativePrepareError || alreadyRobbedError}
                <div class="notification-container">
                    <div class="notification">
                        {errorMessage || negativePrepareError || alreadyRobbedError}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <!-- Right Panel - Map -->
    <div class="panel map-panel">
        <div class="panel-content">
            {#if turnNumber === 0}
                <div class="how-to-play">
                    <h2>How to Play</h2>
                    <div class="instructions">
                        {#if gameState === "thiefSelection" || gameState === "thiefMove"}
                            <p>Welcome to the Bordering Countries Game! As the thief, here's how to play:</p>
                            <ol>
                                <li>You are trying to rob countries and escape to your boss's home.</li>
                                
                                <li>Two police officers are chasing you. If they catch you, you lose!</li>
                                <li>They can see your last location when turn number is divisible by 3</li>
                                <li>Note that the if your turn number is x, their next turn number will be x+1</li>

                                <li>Each move costs $10, and you start with $150.</li>
                                <li>You can rob countries for $150, but be careful - there's a chance of failure!</li>
                                <li>If you fail to rob a country, you are detained for 2 turns in that country, and the police can see your location for the whole time</li>
                                <li>If you successfully rob a country, you can move to any bordering country</li>
                                <li>To win, reach your boss's home with at least $800</li>

                                <li>There are 2 factors that determine if you rob a country successfully:</li>
                                <li>1. Your prepare value, which increases by 1 when you stay in the same country and choose not to move</li>
                                <li>2. Boss locations, which will be listed shortly, are easier to rob because your boss has provided instructions on how to rob those places</li>

                                <li>To win, reach your boss's home with at least $800.</li>

                                <h3>{trustTheProcess}</h3>

                                <h2>Details:</h2>
                                <li>Prepare is reset to -5 after any attempted robbery, serving as a robbery cooldown</li>
                                <li>When prepare is less than 0, a robbery can't be attempted</li>
                                <li>Success rates for robberies:</li>
                                <table class="success-table">
                                    <thead>
                                        <tr>
                                            <th>Prepare Value</th>
                                            <th>Boss Location</th>
                                            <th>Regular Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>&lt; 0</td>
                                            <td>Cannot Rob</td>
                                            <td>Cannot Rob</td>
                                        </tr>
                                        <tr>
                                            <td>0</td>
                                            <td>60%</td>
                                            <td>10%</td>
                                        </tr>
                                        <tr>
                                            <td>1</td>
                                            <td>95%</td>
                                            <td>50%</td>
                                        </tr>
                                        <tr>
                                            <td>≥ 2</td>
                                            <td>95%</td>
                                            <td>95%</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <h3>{trustTheProcess}</h3>
                            </ol>
                        {:else if gameState === "policeSelection" || gameState === "policeMove1" || gameState === "policeMove2"}
                            <p>Welcome to the Bordering Countries Game! As the police, here's how to play:</p>
                            <ol>
                                <li>You are two police officers trying to catch a thief.</li>
                                <li>You can only move to countries that border your current location.</li>
                                <li>Every 3 turns, you'll see the thief's location.</li>
                                <li>If either of you catches the thief, you win!</li>
                                <li>If the thief reaches their boss's home with $800, you lose.</li>
                                <li>Work together to corner and catch the thief!</li>
                                <h3>{trustTheProcess}</h3>
                                <li>Thief Instructions with more information:</li>

                                <li>Two police officers are chasing you. If they catch you, you lose!</li>
                                <li>They can see your last location when turn number is divisible by 3</li>
                                <li>Note that the if your turn number is x, their next turn number will be x+1</li>

                                <li>Each move costs $10, and you start with $150.</li>
                                <li>You can rob countries for $150, but be careful - there's a chance of failure!</li>
                                <li>If you fail to rob a country, you are detained for 2 turns in that country, and the police can see your location for the whole time</li>
                                <li>If you successfully rob a country, you can move to any bordering country</li>
                                <li>To win, reach your boss's home with at least $800</li>

                                <li>There are 2 factors that determine if you rob a country successfully:</li>
                                <li>1. Your prepare value, which increases by 1 when you stay in the same country and choose not to move</li>
                                <li>2. Boss locations, which will be listed shortly, are easier to rob because your boss has provided instructions on how to rob those places</li>

                                <li>To win, reach your boss's home with at least $800.</li>

                                <h3>{trustTheProcess}</h3>

                                <h2>Details:</h2>
                                <li>Prepare is reset to -5 after any attempted robbery, serving as a robbery cooldown</li>
                                <li>When prepare is less than 0, a robbery can't be attempted</li>
                                <li>Success rates for robberies:</li>
                                <table class="success-table">
                                    <thead>
                                        <tr>
                                            <th>Prepare Value</th>
                                            <th>Boss Location</th>
                                            <th>Regular Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>&lt; 0</td>
                                            <td>Cannot Rob</td>
                                            <td>Cannot Rob</td>
                                        </tr>
                                        <tr>
                                            <td>0</td>
                                            <td>60%</td>
                                            <td>10%</td>
                                        </tr>
                                        <tr>
                                            <td>1</td>
                                            <td>95%</td>
                                            <td>50%</td>
                                        </tr>
                                        <tr>
                                            <td>≥ 2</td>
                                            <td>95%</td>
                                            <td>95%</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <h3>{trustTheProcess}</h3>
                            </ol>
                        {/if}
                        <p>Good luck!</p>
                        <h3>{trustTheProcess}</h3>
                    </div>
                </div>
            {:else}
                <Leaflet view={initialView} zoom={1.8}>
                    {#if gameState=="thiefMove"}
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
                    {:else}
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
                    {/if}
                </Leaflet>
            {/if}
        </div>
    </div>
</div>

{#if gameState === "policeWin"}
    <div class="game-over">
        <h1>Thief Caught</h1>
        <h2>The Sucker Lost</h2>
        <h3>Imagine Losing</h3>
    </div>
{/if}

{#if gameState === "KimJongUn"}
    <div class="game-over">
        <h1>R.I.P thief 🪦💀</h1>
        <h2>Executed in North Korea for a robbery against the state</h2>
        <h3>Kim Jong Un seized all assets and refuses to return stolen money 🗿🗿⚔️⚔️⚔️</h3>
    </div>
{/if}

{#if gameState === "thiefWin"}
    <div class="game-over">
        <h1>Interpol Lost</h1>
        <h2>Boss and the thief are now both richer than all of your salaries combined</h2>
        <h3>Imagine Losing! Haha!</h3>
    </div>
{/if}

{#if varB}
    <p>This country was robbed</p>
    <p>Thief Cash: ${cash}</p>
{/if}

{#if maskScreen}
    <div 
        class="mask-screen"
        role="button" 
        tabindex="0"
        on:click={removeMask} 
        on:keydown={(e) => (e.key === "Enter" || e.key === " ") && removeMask()}
    >
        Transfer Device to Thief.<br>click or tap to dismiss
    </div>
{/if}

