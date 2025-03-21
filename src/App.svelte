<script lang="ts">
    import {borders} from "./borders";
    import {getBorderingCountries} from "./borders"
    import {toProperCase} from "./randomFunctions"
    import {pickRandomCountries} from "./randomFunctions"

    let gameState = "thiefSelection"; //Determines whose move it is
    let thiefDisplay = ""; //What is displayed to the police officers
    let errorMessage = ""; //Universal usage error message
    let turnNumber = 0; //Keeps track of # of turns (used for thiefDisplay)

    let prepare = 0; //Variable that represents readiness for robbery
    let cash = 150; //Used for moving as well as end goal (tbi)
    let trustTheProcess = "‎"; //trust me
    let thiefInput = ""; //used for storing thief's input
    let failedRobbery = false; //Currently not useful. Feature to display error message and also used for detaining
    let thiefCountry = ""; //Self Explanatory
    let thiefSelectedCountry = ""; //Temp Variable used as middleman between html and js
    let thiefPrevious = ""; //Self Explanatory
    $: thiefBorderingCountries = thiefCountry ? [thiefCountry, ...getBorderingCountries(thiefCountry)] : [];

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
    }


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

    function police1handleSubmit(){
        police1.location = police1selectedCountry;

        if (thiefCountry == police1.location || thiefCountry == police2.location){
            gameState = "policeWin";
            return;
        }

        gameState = "policeMove2"
    }

    function police2handleSubmit(){
        police2.location = police2selectedCountry;

        if (thiefCountry == police1.location || thiefCountry == police2.location){
            gameState = "policeWin";
            return;
        }

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
    <button on:click={thiefHandleSubmitDropdown}>Submit Move</button>

    <!-- Robbery Button -->
    <button on:click={thiefHandleRobbery} disabled={prepare < 0}>Rob</button>

    <!-- Display if robbery failed -->
    {#if failedRobbery}
        <p style="color: red;">The robbery failed!</p>
    {/if}

    <!-- Display cash -->
    <p>Cash: ${cash}</p>
    <p>Boss Locations:</p>
    <ul>
        {#each bossLocations as location}
            <li>{location}</li>
        {/each}
    </ul>

    <h1>{trustTheProcess}</h1>
    <h3>Boss Home: {bossHome}</h3>
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
{/if}

{#if gameState === "policeMove2"}
    <label for="country-dropdown">Your move:</label>
    <select id="country-dropdown" bind:value={police2selectedCountry}>
        {#each police2BorderingCountries as country}
            <option value={country}>{country}</option>
        {/each}
    </select>
    <button on:click={police2handleSubmit}>Submit Move</button>
{/if}

{#if errorMessage}
    <p style="color: red;">{errorMessage}</p>
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

{#if negativePrepareError}
    <p style="color: red;">{negativePrepareError}</p>
{/if}

{#if alreadyRobbedError}
    <p style="color: red;">{alreadyRobbedError}</p>
{/if}

<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h3>Police 1 Location: {police1.location}</h3>
<h3>Police 2 Location: {police2.location}</h3>
<h1>{trustTheProcess}</h1>
<h3>Thief Last Location: {thiefDisplay}</h3>

{#if gameState === "thiefMove"}
    <h3>Prepare: {prepare}</h3>
{/if}

<style>

</style>