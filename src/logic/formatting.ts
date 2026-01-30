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
        case "cote d'ivoire": return "Cote d'Ivoire";
        case "czech republic": return "Czechia";
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

