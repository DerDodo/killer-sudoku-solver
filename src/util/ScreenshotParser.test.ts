import ScreenshotParser from "./ScreenshotParser"

function testSudoku(path: string, areaValues: number[]): Promise<void> {
    const parser = new ScreenshotParser()
    return parser.load(path).then(() => {
        const board = parser.parse()
        expect(board.areas.length).toBe(areaValues.length)
        for (let i = 0; i < areaValues.length; ++i) {
            expect(board.areas[i].value).toBe(areaValues[i])
        }
    })
}

test('sudoku 1', async () => {
    const areaValues = [
        20, 21, 4, 32,
        13, 2, 10,
        19, 3, 10, 15, 13, 15,
        6, 15,
        5, 17, 19, 9, 14,
        16, 4,
        6, 14, 13, 9, 9,
        13, 18, 25,
        1, 15
    ]
    await testSudoku("./src/assets/sudoku-1.jpg", areaValues)
})

test('sudoku 2', async () => {
    const areaValues = [
        17, 7, 14, 7, 17, 15,
        13, 17,
        8, 14, 15, 15, 7, 10,
        14, 13,
        17, 13, 9, 15, 10,
        24, 9,
        10, 14, 2, 16,
        10, 12, 13,
        12, 16
    ]
    await testSudoku("./src/assets/sudoku-2.jpg", areaValues)
})

test('sudoku 3', async () => {
    const areaValues = [
        13, 19, 5, 22, 19,
        13, 8,
        15, 5, 6, 19,
        11, 14, 15, 8,
        10, 9, 8, 18,
        17, 14, 5, 19,
        6, 10, 21, 7, 12,
        17, 3,
        15, 1, 15, 6
    ]
    await testSudoku("./src/assets/sudoku-3.jpg", areaValues)
})

test('sudoku 4', async () => {
    const areaValues = [
        15, 13, 13, 9, 13,
        9, 9, 9,
        8, 8, 32, 15,
        8, 13, 14, 9, 10,
        8, 15, 9,
        19, 11, 11,
        17, 10, 13, 10, 16,
        18, 7, 15,
        19
    ]
    await testSudoku("./src/assets/sudoku-4.jpg", areaValues)
})

test('sudoku 5', async () => {
    const areaValues = [
        24, 6, 7, 16, 8, 14, 8,
        16, 15,
        8, 26,
        18, 12, 15,
        17, 30, 22,
        11, 8, 5, 9,
        10, 7, 20, 8,
        14, 12, 12,
        9, 4, 5, 9
    ]
    await testSudoku("./src/assets/sudoku-5.jpg", areaValues)
})

test('sudoku 6', async () => {
    const areaValues = [
        17, 14, 9, 21, 4, 20,
        7, 10, 14,
        13, 18, 12, 9,
        18, 3,
        8, 21, 8, 16, 18,
        10,
        16, 17, 4, 15, 6,
        15, 19, 6, 18,
        15, 4
    ]
    await testSudoku("./src/assets/sudoku-6.jpg", areaValues)
})

test('sudoku 7', async () => {
    const areaValues = [
        11, 8, 14, 11, 13, 12, 6,
        10, 17,
        14, 14, 10, 13,
        18, 14, 15, 5,
        18, 16, 13,
        11, 7, 14, 17,
        14, 9, 3, 10,
        8, 10, 24, 26
    ]
    await testSudoku("./src/assets/sudoku-7.jpg", areaValues)
})

test('sudoku 8', async () => {
    const areaValues = [
        6, 15, 17, 7, 6, 7,
        14, 12, 11, 18,
        8, 26,
        9, 10, 8, 6, 26,
        14, 19,
        23, 12, 8, 28, 7,
        12,
        10, 15, 13, 10,
        10, 13, 5
    ]
    await testSudoku("./src/assets/sudoku-8.jpg", areaValues)
})

test('sudoku 9', async () => {
    const areaValues = [
        27, 6, 21, 5,
        6, 2, 12, 8, 13, 11,
        10, 15, 8, 15,
        7, 32, 10, 12,
        11, 3, 6, 10,
        17,14, 9,
        24, 11, 15,
        6, 6, 24, 13, 10,
        6
    ]
    await testSudoku("./src/assets/sudoku-9.jpg", areaValues)
})

test('sudoku 10', async () => {
    const areaValues = [
        14, 13, 14, 3, 16,
        11, 7, 20, 13,
        8, 18, 11, 7,
        14, 8, 21, 17,
        10, 7,
        13, 10, 17, 11, 20,
        5, 16, 9,
        15, 4, 14, 18,
        21
    ]
    await testSudoku("./src/assets/sudoku-10.jpg", areaValues)
})

test('sudoku 11', async () => {
    const areaValues = [
        12, 10, 15, 7, 4, 18,
        11, 8, 17,
        26, 19, 12, 12,
        11, 19, 14,
        10,
        11, 7, 5, 16, 5, 9,
        15, 22, 15,
        13, 5, 8, 12, 11, 11, 11,
        4
    ]
    await testSudoku("./src/assets/sudoku-11.jpg", areaValues)
})

test('sudoku 12', async () => {
    const areaValues = [
        18, 12, 6, 14,
        10, 14, 23,
        23, 7, 17, 11,
        15, 7, 11,
        4, 19, 12, 10, 8, 15,
        24, 14,
        16, 19, 4, 17,
        19, 12, 4,
        8, 8, 4
    ]
    await testSudoku("./src/assets/sudoku-12.jpg", areaValues)
})
