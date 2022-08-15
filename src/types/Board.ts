import BoardDto from "../dto/BoardDto"
import { numbers1to9 } from "../util/NumberUtil"
import Area from "./Area"
import Cell from "./Cell"

export default class Board {
    private _cells: Cell[][]
    private _areas: Area[]

    constructor(boardDto: BoardDto) {
        this._cells = boardDto.cells.map(dtos => dtos.map(dto => new Cell(this, dto)))
        this._areas = boardDto.areas.map(dto => new Area(this, dto))
    }

    public get cells(): Cell[][] {
        return this._cells
    }

    public get areas(): Area[] {
        return this._areas
    }

    public getCellById(cellId: number): Cell {
        return this._cells[Math.floor(cellId / 9)][cellId % 9]
    }

    public getRows(): Cell[][] {
        return this._cells
    }

    public getCols(): Cell[][] {
        const cols: Cell[][] = []
        for (let col = 0; col < 9; ++col) {
            cols.push(this.getCol(col))
        }
        return cols
    }

    getBoxes(): Cell[][] {
        const boxes: Cell[][] = []
        for (let boxX = 0; boxX < 3; ++boxX) {
            for (let boxY = 0; boxY < 3; ++boxY) {
                boxes.push(this.getBoxByCoordinates(boxY * 3, boxX * 3))
            }
        }
        return boxes
    }

    public getRow(row: number): Cell[] {
        return this._cells[row]
    }

    public getCol(col: number): Cell[] {
        return numbers1to9().map(row => this._cells[row - 1][col])
    }

    public getBoxByCell(cell: Cell): Cell[] {
        const row = Math.floor(cell.index / 9)
        const col = cell.index % 9
        return this.getBoxByCoordinates(row, col)
    }

    public getBoxByCoordinates(row: number, col: number): Cell[] {
        const boxX = Math.floor(col / 3)
        const boxY = Math.floor(row / 3)

        return [
            this._cells[boxY * 3][boxX * 3],
            this._cells[boxY * 3][boxX * 3 + 1],
            this._cells[boxY * 3][boxX * 3 + 2],
            this._cells[boxY * 3 + 1][boxX * 3],
            this._cells[boxY * 3 + 1][boxX * 3 + 1],
            this._cells[boxY * 3 + 1][boxX * 3 + 2],
            this._cells[boxY * 3 + 2][boxX * 3],
            this._cells[boxY * 3 + 2][boxX * 3 + 1],
            this._cells[boxY * 3 + 2][boxX * 3 + 2],
        ]
    }

    public getSelectedCells(): Cell[] {
        return this._cells.flat().filter(cell => cell.selected)
    }

    public toDto(): BoardDto {
        return {
            cells: this.cells.map(cells => cells.map(cell => cell.toDto())),
            areas: this.areas.map(area => area.toDto()),
        } as BoardDto
    }
}