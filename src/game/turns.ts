export function ok(): string {
    return "mask-screen";
}

export function nextTurn(whoseTurnNext: string): string {
    switch (whoseTurnNext.toLowerCase()) {
        case "thief":
            return "thiefMove";
        case "police":
            return "policeMove1";
        default:
            return "menu-screen"; // fallback
    }
}
