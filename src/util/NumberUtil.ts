export function numbers1to9(): number[] {
    return Array.from(Array(9).keys()).map(val => val + 1)
}