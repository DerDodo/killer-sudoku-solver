export function numbers1to9(): number[] {
    return Array.from(Array(9).keys()).map(val => val + 1)
}

export function stringToNumber(key: string): number | null {
    switch(key) {
        case "1": return 1
        case "2": return 2
        case "3": return 3
        case "4": return 4
        case "5": return 5
        case "6": return 6
        case "7": return 7
        case "8": return 8
        case "9": return 9
        default: return null
    }
}

const allowedKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
export function isValidNumKey(event: KeyboardEvent): boolean {
    return allowedKeys.includes(event.key)
}