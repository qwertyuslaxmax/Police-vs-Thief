export function toProperCase(str: string): string {
    let a = str.toLowerCase();

    switch(a){
        case "car": return "CAR";
        case "south africa": return "South Africa";
        case "drc": return "DRC";
        case "north korea": return "North Korea";
        case "south korea": return "South Korea";
        case "uae": return "UAE";
        case "bosnia and herzegovina": return "Bosnia and Herzegovina";
        case "new zealand": return "New Zealand";
        case "usa": return "USA";
        case "costa rica": return "Costa Rica";
    }

    return str
        .split(' ') 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}