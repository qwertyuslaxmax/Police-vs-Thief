import { pickRandomCountries } from "../logic";

export let robbedCountries: string[] = [];
export let bossLocations = pickRandomCountries();

export function getBossHome() {
    const countries = pickRandomCountries();
    const bossHome = countries[Math.floor(Math.random() * countries.length)];
    if (bossLocations.includes(bossHome)) {
        return getBossHome();
    }
    return bossHome;
}

export let bossHome = getBossHome()

export function rob(prepare, thiefCountry) {
    let successRate = 0;

    const atBoss = bossLocations.includes(thiefCountry);

    if (prepare >= 1 && atBoss) {
        successRate = 0.95;
    } else if (prepare === 1 && !atBoss) {
        successRate = 0.5;
    } else if (prepare >= 2 && !atBoss) {
        successRate = 0.95;
    } else if (prepare === 0 && atBoss) {
        successRate = 0.6;
    } else {
        successRate = 0.1;
    }

    return Math.random() < successRate;
}