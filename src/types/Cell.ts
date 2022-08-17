import CellDto from "../dto/CellDto";
import { dispatchSetCellValue, dispatchSetOptions } from "../store/GameSlice";
import { numbers1to9 } from "../util/NumberUtil";
import Board from "./Board";
import { Color } from "./Color";

export default class Cell {
    private _board: Board

    private _value?: number
    private _options: number[]
    private _index: number
    private _selected: boolean
    private _areaColor?: Color
    private _areaValue?: number

    constructor(board: Board, cellDto: CellDto) {
        this._board = board

        this._value = cellDto.value
        this._options = cellDto.options
        this._index = cellDto.index
        this._selected = cellDto.selected
        this._areaColor = cellDto.areaColor ? cellDto.areaColor as Color : undefined
        this._areaValue = cellDto.areaValue
    }

    public get value(): number | undefined {
        return this._value
    }

    public set value(value: number) {
        this._value = value
        dispatchSetCellValue(this.index, value)
    }

    public get options(): number[] {
        return this._options
    }

    public get index(): number {
        return this._index
    }

    public get selected(): boolean {
        return this._selected
    }

    public set selected(isSelected: boolean) {
        this._selected = isSelected
    }

    public get areaColor(): Color | undefined {
        return this._areaColor
    }

    public set areaColor(areaColor: Color) {
        this._areaColor = areaColor
    }

    public get areaValue(): number | undefined {
        return this._areaValue
    }

    public set areaValue(areaValue: number) {
        this._areaValue = areaValue
    }

    public get row(): number {
        return Math.floor(this._index / 9)
    }

    public get col(): number {
        return this._index % 9
    }

    public get boxId(): number {
        const boxX = Math.floor(this.col / 3)
        const boxY = Math.floor(this.row / 3)
        return boxY * 3 + boxX
    }
    
    public toggleSelect() {
        this._selected = !this._selected
    }

    public clearOptions(): void {
        this._options = []
        dispatchSetOptions(this._index, this._options)
    }

    public setOptions1To9(): void {
        this._options = numbers1to9()
        dispatchSetOptions(this._index, this._options)
    }

    public removeOption(option: number): void {
        this._options = this._options.filter(o => o != option)
        dispatchSetOptions(this._index, this._options)
    }

    public toDto(): CellDto {
        return {
            value: this._value,
            options: this._options,
            index: this._index,
            selected: this._selected,
            areaColor: this._areaColor,
            areaValue: this._areaValue
        } as CellDto
    }
}