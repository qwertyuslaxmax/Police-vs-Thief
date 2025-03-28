<script lang="ts">
    import {borders} from "./borders";
    import {getBorderingCountries} from "./borders";
    import {toProperCase} from "./randomFunctions";
    import {pickRandomCountries} from "./randomFunctions";
    import {coords} from './coords';
    import type { LatLngExpression } from "leaflet";
    import Leaflet from './lib/Leaflet.svelte'
    import Marker from './lib/Marker.svelte';
	//import Popup from './lib/Popup.svelte';

    let gameState = "thiefSelection"; //Determines whose move it is
    let thiefDisplay = ""; //What is displayed to the police officers
    let errorMessage = ""; //Universal usage error message
    let turnNumber = 0; //Keeps track of # of turns (used for thiefDisplay)
    let force = 0;

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

    const initialView: LatLngExpression = [42.62711, -70.58948]

    let thiefCountryMarker: Array<LatLngExpression> = [
        [42.62711, -70.58948], //Default location
    ];

    $: policeMarkers = [
        police1.location && coords[police1.location] ? [coords[police1.location][0], coords[police1.location][1]] : [0, 0],
        police2.location && coords[police2.location] ? [coords[police2.location][0], coords[police2.location][1]] : [0, 0]
    ];

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
        if (police1.location && coords[police1.location]) {
            policeMarkers = [
                [coords[police1.location][0], coords[police1.location][1]],
                policeMarkers[1] // Keep the second marker as is
            ];
        }
    }

    $: {
        if (police2.location && coords[police2.location]) {
            policeMarkers = [
                policeMarkers[0], // Keep the first marker as is
                [coords[police2.location][0], coords[police2.location][1]]
            ];
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

{#if gameState === "thiefSelection"}
    <label for="text-input">Enter your starting country:</label>
    <input id="text-input" type="text" bind:value={thiefInput} />
    <button on:click={thiefHandleSubmitInput}>Submit</button>
{/if}

{#if gameState === "thiefMove"}
    <label for="country-dropdown">Your move:</label>
    <select id="country-dropdown" bind:value={thiefSelectedCountry}>
        {#if failedRobbery}
            <option value="skip">Skip</option>
        {:else}
            {#each thiefBorderingCountries as country}
                <option value={country}>{country}</option>
            {/each}
        {/if}
    </select>
    <button class = "confirmChoiceThief" on:click={thiefHandleSubmitDropdown}>Confirm Choice</button>

    <button on:click={thiefHandleRobbery} disabled={prepare < 0}>Rob {thiefCountry}</button>

    {#if failedRobbery}
        <p style="color: red;">The robbery failed!</p>
    {/if}

    <p>Cash: ${cash}</p>
    <p>Turn Number: {turnNumber}</p>
    <p>Prepare: {prepare}</p>

    <p>Boss Locations:</p>
    <ul>
        {#each bossLocations as location}
            <li>{location}</li>
        {/each}
    </ul>

    <h1>{trustTheProcess}</h1>
    <h3>Boss Home: {bossHome}</h3>

    <h3>Police 1 Location: {police1.location}</h3>
    <h3>Police 2 Location: {police2.location}</h3>
{/if}

{#if gameState === "policeSelection"}
    <label for="text-input">Thief Country: {thiefCountry}<br><br>Enter starting country for {`Police ${currentPoliceIndex + 1}`}:</label>
    <input id="text-input" type="text" bind:value={policeInput} />
    <button on:click={policeHandleSubmitInput}>Submit</button>
{/if}

{#if gameState === "policeMove1"}
    <label for="country-dropdown">Your move:</label>
    <select id="country-dropdown" bind:value={police1selectedCountry}>
        {#each police1BorderingCountries as country}
            <option value={country}>{country}</option>
        {/each}
    </select>
    <button on:click={police1handleSubmit}>Submit Move</button>
    <h3>Thief Last Location: {thiefDisplay}</h3>
{/if}

{#if gameState === "policeMove2"}
    <label for="country-dropdown">Your move:</label>
    <select id="country-dropdown" bind:value={police2selectedCountry}>
        {#each police2BorderingCountries as country}
            <option value={country}>{country}</option>
        {/each}
    </select>
    <button on:click={police2handleSubmit}>Submit Move</button>

    <h3>Thief Last Location: {thiefDisplay}</h3>
{/if}

{#if errorMessage}
    <p style="color: red;">{errorMessage}</p>
{/if}

{#if negativePrepareError}
    <p style="color: red;">{negativePrepareError}</p>
{/if}

{#if alreadyRobbedError}
    <p style="color: red;">{alreadyRobbedError}</p>
{/if}

{#if gameState === "policeWin"}
    <h1>Thief Caught</h1>
    <h1>The Sucker Lost</h1>
    <h1>Imagine Losing</h1>
{/if}

{#if gameState === "KimJongUn"}
    <h1>R.I.P thief 🪦💀</h1>
    <h1>Executed in North Korea for a robbery against the state</h1>
    <h1>Kim Jong Un seized all assets and refuses to return stolen money 🗿🗿🗿⚔️⚔️⚔️</h1>
{/if}

{#if gameState === "thiefWin"}
    <h1>Interpol Lost</h1>
    <h1>Boss and the thief are now both richer than all of your salaries combined</h1>
    <h1>Imagine Losing! Haha!</h1>
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

<h1>{trustTheProcess}</h1>

<div class="map">
    <Leaflet view={initialView} zoom={17}>
        {#if gameState=="thiefMove"}
            {#each thiefCountryMarker as latLng}
                <Marker {latLng}></Marker>
            {/each}
            {#each policeMarkers as latLng}
                <Marker {latLng}></Marker>
            {/each}
        {/if}
        {#if gameState=="policeMove1" || gameState=="policeMove2"}
            {#if thiefDisplay in borders}
                {#each policeThiefPreviousMarker as latLng}
                    <Marker {latLng}></Marker>
                {/each}
            {/if}
            {#each policeMarkers as latLng}
                <Marker {latLng}></Marker>
            {/each}
        {/if}
    </Leaflet>
</div>

<h1>{trustTheProcess}</h1>

<style>

</style>