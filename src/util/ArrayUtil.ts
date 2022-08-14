export function isSubArray(array0: number[], array1: number[]): boolean {
    if (array0.length < array1.length)
        return false
    for (let i = 0; i < array1.length; ++i) {
        if (!array0.includes(array1[i])) {
            return false
        }
    }
    return true
}

export function isEqualArray(array0: number[], array1: number[]): boolean {
    if (array0.length != array1.length)
        return false
    for (let i = 0; i < array1.length; ++i) {
        if (array0[i] != array1[i]) {
            return false
        }
    }
    return true
}