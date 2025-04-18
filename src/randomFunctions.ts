import {borders} from "./borders";

export function toProperCase(str: string): string {
    let a = str.toLowerCase();

    switch(a){
        case "car": return "CAR";
        case "south africa": return "South Africa";
        case "south sudan": return "South Sudan";
        case "drc": return "DRC";
        case "north korea": return "North Korea";
        case "south korea": return "South Korea";
        case "uae": return "UAE";
        case "united arab emirates": return "UAE";
        case "bosnia and herzegovina": return "Bosnia and Herzegovina";
        case "new zealand": return "New Zealand";
        case "usa": return "USA";
        case "costa rica": return "Costa Rica";
        case "cote d'ivoire": return "Cote d'Ivoire"
        case "burkina faso": return "Burkina Faso";
        case "east timor": return "East Timor";
        case "timor leste": return "East Timor";
        case "united states": return "USA";
        case "united states of america": return "USA";
        case "democratic republic of the congo": return "DRC";
        case "central african republic": return "CAR";
    }

    return str
        .split(' ') 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to pick 10 random countries from the borders object
export function pickRandomCountries(): string[] {
    const countries = Object.keys(borders);
    const shuffledCountries = shuffleArray(countries);
    const selectedCountries = shuffledCountries.slice(0, 10);
    
    return selectedCountries;
}