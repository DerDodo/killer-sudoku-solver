import Image from 'image-js'
import AreaDto from '../dto/AreaDto'
import BoardDto from '../dto/BoardDto'
import CellDto from '../dto/CellDto'
import Board from '../types/Board'
import { Color } from '../types/Color'
import { numbers0to8 } from './NumberUtil'

// https://gist.github.com/mjackson/5311256
function rgbToHsv(pixel: number[]) {
    const r = pixel[0] / 255, g = pixel[1] / 255, b = pixel[2] / 255

    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const d = max - min

    if (max == min) {
        return 0 // achromatic
    } else {
        switch (max) {
            case r: return ((g - b) / d + (g < b ? 6 : 0)) / 6 * 255
            case g: return ((b - r) / d + 2) / 6 * 255
            case b: return ((r - g) / d + 4) / 6 * 255
        }
    }
}

interface AreaCellData {
    row: number,
    col: number,
    id: number,
    areaId: number | null,
    areaColor: Color,
}

interface Coordinate {
    x: number,
    y: number,
}

export default class ScreenshotParser {
    image: Image
    numberImage: Image
    board: Board
    
    COLORS = new Map<Color, number[]>([
        [Color.Green, [195, 241, 204]],
        [Color.Yellow, [255, 248, 185]],
        [Color.Red, [255, 200, 223]],
        [Color.Purple, [210, 202, 251]],
        [Color.Turqoise, [204, 242, 255]],
    ])
    HUES = new Map(Array.from(this.COLORS, ([key, value]) => [key, rgbToHsv(value)]))

    NUMBER_HOT_SPOTS = [
        [[39, 21, 0], [30, 24, 0], [40, 32, 0], [40, 48, 0]], // 1
        [[29, 25, 0], [43, 21, 0], [42, 37, 0], [29, 53, 0], [48, 53, 0]], // 2
        [[29, 24, 0], [43, 21, 0], [35, 37, 0], [45, 51, 0], [28, 50, 0], [28, 31, 255], [28, 44, 255]], // 3
        [[43, 23, 0], [35, 32, 0], [27, 45, 0], [49, 45, 0], [44, 53, 0]], // 4
        [[46, 19, 0], [32, 21, 0], [31, 34, 0], [47, 37, 0], [46, 51, 0], [30, 48, 0]], // 5
        [[41, 20, 0], [30, 29, 0], [28, 46, 0], [44, 51, 0], [46, 38, 0], [35, 33, 0]], // 6
        [[29, 20, 0], [49, 20, 0], [43, 31, 0], [39, 41, 0], [34, 53, 0]], // 7
        [[37, 20, 0], [45, 28, 0], [28, 31, 0], [38, 37, 0], [28, 44, 0], [47, 47, 0], [37, 55, 0]], // 8
        [[36, 20, 0], [27, 30, 0], [46, 30, 0], [36, 41, 0], [45, 46, 0], [33, 54, 0]], // 9
    ]

    AREA_NUMBER_HOT_SPOTS = [
        [[8, 5, 0], [4, 11, 0], [8, 17, 0], [11, 11, 0], [8, 11, 255], [8, 9, 255]], // 0
        [[5, 7, 0], [8, 7, 0], [8, 12, 0], [8, 16, 0], [11, 8, 255]], // 1
        [[4, 7, 0], [8, 5, 0], [10, 7, 0], [8, 12, 0], [6, 14, 0], [5, 17, 0], [10, 17, 0]], // 2
        [[5, 7, 0], [8, 5, 0], [11, 8, 0], [8, 11, 0], [11, 13, 0], [8, 17, 0], [5, 15, 0], [5, 9, 255], [5, 13, 255]], // 3
        [[10, 7, 0], [6, 10, 0], [5, 14, 0], [10, 14, 0], [10, 16, 0], [6, 5, 255]], // 4
        [[11, 5, 0], [5, 5, 0], [5, 10, 0], [10, 10, 0], [11, 13, 0], [8, 17, 0], [5, 15, 0], [10, 8, 255], [4, 12, 255]], // 5
        [[9, 5, 0], [5, 10, 0], [9, 10, 0], [11, 12, 0], [11, 15, 0], [8, 17, 0], [5, 13, 0], [10, 8, 255]], // 6
        [[4, 5, 0], [11, 5, 0], [10, 8, 0], [8, 12, 0], [6, 17, 0], [5, 9, 255]], // 7
        [[5, 7, 0], [8, 5, 0], [11, 8, 0], [8, 11, 0], [11, 13, 0], [8, 17, 0], [5, 15, 0], [5, 9, 0], [5, 13, 0]], // 8
        [[6, 5, 0], [5, 10, 0], [10, 6, 0], [11, 12, 0], [7, 16, 0]], // 9
    ]

    AREA_NUMBER_WIDTH = 11
    OUTER_BORDER_WIDTH = 3
    INNER_BORDER_WIDTH = 1
    CELL_WIDTH = 76
    COLOR_PIXEL_X = 66
    COLOR_PIXEL_Y = 21

    areaColors: Color[][]
    areas: AreaDto[]
    numbers: number[][]
    cells: CellDto[][]

    async load(dataUrl: string): Promise<void> {
        this.image = await Image.load(dataUrl)
    }

    parse(): BoardDto {
        this.image = this.image.crop({x: 9, y: 318, width: 702, height: 702})
        this.numberImage = this.image.grey().mask().rgba8()

        this.areaColors = this.readAreaColors()
        this.areas = this.calcAreas(this.areaColors)

        this.numbers = this.readNumbers()
        this.cells = this.calcCells(this.numbers, this.areas)

        return { cells: this.cells, areas: this.areas}
    }

    getDataForImg(): string {
        return this.numberImage.toBase64("image/png") as string
    }

    readAreaColors(): Color[][] {
        return numbers0to8().map((row) => {
            return numbers0to8().map((col) => {
                return this.getColor(row, col)
            })
        })
    }

    getColor(row: number, col: number): Color {
        const topLeft = this.getTopLeft(row, col)
        const pixel = this.image.getPixelXY(topLeft.x + this.COLOR_PIXEL_Y, topLeft.y + this.COLOR_PIXEL_Y)
        return this.getClosestColor(pixel)
    }

    getTopLeft(row: number, col: number): Coordinate {
        const x = this.OUTER_BORDER_WIDTH * (Math.floor(col / 3) + 1) +
                    this.CELL_WIDTH * col +
                    this.INNER_BORDER_WIDTH * (Math.floor(col / 3) * 2 + col % 3)
        const y = this.OUTER_BORDER_WIDTH * (Math.floor(row / 3) + 1) +
                    this.CELL_WIDTH * row +
                    this.INNER_BORDER_WIDTH * (Math.floor(row / 3) * 2 + row % 3)
        return { x: x, y: y }
    }

    getClosestColor(pixel: number[]): Color {
        const hue = rgbToHsv(pixel)
        let min_distance = 255 * 3
        let color = null
        this.HUES.forEach((h, c) => {
            const distance = Math.abs(hue - h)
            if (distance < min_distance) {
                min_distance = distance
                color = c
            }
        })
        return color
    }

    calcAreas(areaColors: Color[][]): AreaDto[] {
        const cells = numbers0to8().map((row) => {
            return numbers0to8().map((col) => {
                return {
                    row: row,
                    col: col,
                    id: row * 9 + col,
                    areaId: null,
                    areaColor: areaColors[row][col],
                } as AreaCellData
            })
        })

        let areaCounter = 0
        numbers0to8().forEach((row) => {
            numbers0to8().forEach((col) => {
                if (cells[row][col].areaId == null) {
                    this.fillArea(row, col, areaCounter, cells)
                    areaCounter += 1
                }
            })
        })

        const areas: AreaDto[] = []
        for (let i = 0; i < areaCounter; ++i) {
            const areaCells = cells.flat().filter((cell) => { return cell.areaId === i })
            const cellIds = areaCells.map((cell) => cell.id)
            const areaNumber = this.readAreaNumber(areaCells[0])
            areas.push({
                value: areaNumber,
                cellIds: cellIds,
                color: areaCells[0].areaColor,
                id: i,
            } as AreaDto)
        }

        return areas
    }

    fillArea(row: number, col: number, areaId: number, cells: AreaCellData[][]) {
        cells[row][col].areaId = areaId
        const color = cells[row][col].areaColor

        if (col !== 0 && cells[row][col - 1].areaColor === color && cells[row][col - 1].areaId === null) {
            this.fillArea(row, col - 1, areaId, cells)
        }
        if (row !== 0 && cells[row - 1][col].areaColor === color && cells[row - 1][col].areaId === null) {
            this.fillArea(row - 1, col, areaId, cells)
        }
        if (col !== 8 && cells[row][col + 1].areaColor === color && cells[row][col + 1].areaId === null) {
            this.fillArea(row, col + 1, areaId, cells)
        }
        if (row !== 8 && cells[row + 1][col].areaColor === color && cells[row + 1][col].areaId == null) {
            this.fillArea(row + 1, col, areaId, cells)
        }
    }

    readAreaNumber(cell: AreaCellData): number | null {
        const topLeft = this.getTopLeft(cell.row, cell.col)
        for (let i = 1; i <= 9; ++i) {
            if (this.isAreaNumber(topLeft, i)) {
                topLeft.x += this.AREA_NUMBER_WIDTH
                for (let j = 0; j <= 9; ++j) {
                    if (this.isAreaNumber(topLeft, j)) {
                        return i * 10 + j
                    }
                }
                return i
            }
        }
        return null
    }

    isAreaNumber(topLeft: Coordinate, num: number) {
        const numHitSpots = this.AREA_NUMBER_HOT_SPOTS[num].filter((spot) => {
            return this.numberImage.getPixelXY(topLeft.x + spot[0], topLeft.y + spot[1])[0] === spot[2]
        }).length
        return numHitSpots == this.AREA_NUMBER_HOT_SPOTS[num].length
    }

    readNumbers(): number[][] {
        return numbers0to8().map((row) => {
            return numbers0to8().map((col) => {
                return this.getNumber(row, col)
            })
        })
    }

    getNumber(row: number, col: number): number | null {
        const topLeft = this.getTopLeft(row, col)

        for (let i = 1; i <= 9; ++i) {
            if (this.isNumber(topLeft, i)) {
                return i
            }
        }
        
        return null
    }

    isNumber(topLeft: Coordinate, num: number) {
        const numHitSpots = this.NUMBER_HOT_SPOTS[num - 1].filter((spot) => {
            return this.numberImage.getPixelXY(topLeft.x + spot[0], topLeft.y + spot[1])[0] === spot[2]
        }).length
        return numHitSpots == this.NUMBER_HOT_SPOTS[num - 1].length
    }

    calcCells(numbers: number[][], areas: AreaDto[]): CellDto[][] {
        return numbers0to8().map((row) => {
            return numbers0to8().map((col) => {
                const id = row * 9 + col
                const area = areas.find((area) => { return area.cellIds.find((cellId) => cellId === id) === id })
                const areaValue = area && area.cellIds[0] == id ? area.value : null
                return {
                    value: numbers[row][col],
                    options: [],
                    index: id,
                    selected: false,
                    areaColor: area ? area.color : null,
                    areaValue: areaValue,
                } as CellDto
            })
        })
    }
}