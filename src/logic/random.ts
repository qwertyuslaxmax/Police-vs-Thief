import {borders} from "../data_lists/index";

function shuffleArray(array: string[]): string[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function pickRandomCountries(): string[] {
    const countries = Object.keys(borders);
    const shuffledCountries = shuffleArray(countries);
    const selectedCountries = shuffledCountries.slice(0, 10);
    
    return selectedCountries;
}