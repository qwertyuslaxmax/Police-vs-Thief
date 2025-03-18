<script lang="ts">
    import {borders} from "./borders";
    import {getBorderingCountries} from "./borders"
    import {toProperCase} from "./randomFunctions"

    let gameState = "thiefSelection";
    let thiefDisplay = "";
    let errorMessage = "";
    let turnNumber = 0;

    let prepare = 0;
    let trustTheProcess = "‎";
    let thiefInput = "";
    let thiefCountry = "";
    let thiefSelectedCountry = "";
    let thiefPrevious = "";
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

    function thiefHandleSubmitDropdown() {
        turnNumber += 1;
        thiefPrevious = thiefCountry;
        thiefCountry = thiefSelectedCountry;

        if(turnNumber % 3 == 0){
            thiefDisplay = thiefPrevious;
        } else {
            thiefDisplay = "???"
        }

        if (thiefCountry == police1.location || thiefCountry == police2.location){
            gameState = "policeWin";
            return;
        }

        gameState = "policeMove1";
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
        {#each thiefBorderingCountries as country}
            <option value={country}>{country}</option>
        {/each}
    </select>
    <button on:click={thiefHandleSubmitDropdown}>Submit Move</button>
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


<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h1>{trustTheProcess}</h1>
<h3>Police 1 Location: {police1.location}</h3>
<h3>Police 2 Location: {police2.location}</h3>
<h1>{trustTheProcess}</h1>
<h3>Thief Last Location: {thiefDisplay}</h3>

<style>

</style>