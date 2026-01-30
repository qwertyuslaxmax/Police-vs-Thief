import {rob} from "./robbery";

export function attemptRobbery(
    prepare: number,
    thiefCountry: string,
    bossLocations: string[],
    robbedCountries: string[]
): {
    success: boolean;
    cashGained: number;
    updatedRobbedList: string[];
    error: string | null;
} {
    let alreadyRobbed = false;
    for (let i = 0; i < robbedCountries.length; i++) {
        if (robbedCountries[i] === thiefCountry) {
            alreadyRobbed = true;
            break;
        }
    }

    if (alreadyRobbed) {
        return {
            success: false,
            cashGained: 0,
            updatedRobbedList: robbedCountries,
            error: "Already Robbed this Country"
        };
    }

    if (prepare < 0) {
        return {
            success: false,
            cashGained: 0,
            updatedRobbedList: robbedCountries,
            error: "Prepare can't be negative!"
        };
    }

    const success = rob(prepare, thiefCountry);
    let newList: string[] = [];

    if (success) {
        for (let i = 0; i < robbedCountries.length; i++) {
            newList.push(robbedCountries[i]);
        }
        newList.push(thiefCountry);
    } else {
        for (let i = 0; i < robbedCountries.length; i++) {
            newList.push(robbedCountries[i]);
        }
    }

    return {
        success: success,
        cashGained: success ? 200 : 0,
        updatedRobbedList: newList,
        error: null
    };
}
