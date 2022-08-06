import AreaDto from "../dto/AreaDto";
import Board from "./Board";
import Cell from "./Cell";
import { Color } from "./Color";

export default class Area {
    private _board: Board

    private _value: number
    private _cellIds: number[]
    private _color: Color
    private _id: number

    private _cells: Cell[]

    constructor(board: Board, areaDto: AreaDto) {
        this._board = board

        this._value = areaDto.value
        this._cellIds = areaDto.cellIds
        this._color = areaDto.color
        this._id = areaDto.id

        this._cells = this._cellIds.map(cellId => board.getCellById(cellId))
    }

    public get cells(): Cell[] {
        return this._cells
    }

    public get value(): number {
        return this._value
    }

    public getRemainingValue(): number {
        const filledSum = this.cells.filter(cell => !!cell.value).reduce(function (s, a) {
            return s + a.value;
        }, 0)
        return this._value - filledSum
    }

    public toDto(): AreaDto {
        return {
            value: this._value,
            cellIds: this._cellIds,
            color: this._color,
            id: this._id
        } as AreaDto
    }
}