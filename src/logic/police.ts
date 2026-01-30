import { getBorderingCountries } from "../data_lists/borders";

export class Police {
    name: string;
    location: string;
    previous: string;
    turnNumber: number;
    
    constructor(name: string, location: string, turnNumber: number) {
        this.name = name;
        this.location = location;
        this.turnNumber = turnNumber;
    }

    get borderingCountries(): string[] {
        if (!this.location) {
            return [];
        }

        const borders = getBorderingCountries(this.location);
        const result = [this.location, ...borders];
        return result;
    }
}