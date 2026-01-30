import {formattedCountries} from "../data_lists/index";

function getCode(country: string) {
    for(let i = 0; i < formattedCountries.length; i++) {
        let c = formattedCountries[i];
        if(c.name === country) {
            return c.code;
        }
    }
    return "No Data";
}

export function getCodes(countries: Array<string>) {
    let formattedBorders = [];
    for(let i = 0; i < countries.length; i++) {
        formattedBorders.push(getCode(countries[i]))
    }
    return formattedBorders;
}

export function getName(code: string) {
    for(let i = 0; i < formattedCountries.length; i++) {
        let c = formattedCountries[i];
        if(c.code === code) {
            return c.name;
        }
    }
    return "No Data";
}