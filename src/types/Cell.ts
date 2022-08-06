import CellDto from "../dto/CellDto";
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
        this._areaColor = !!cellDto.areaColor ? cellDto.areaColor as Color : undefined
        this._areaValue = cellDto.areaValue
    }

    public get value(): number | undefined {
        return this._value
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

    public get areaColor(): Color | undefined {
        return this._areaColor
    }

    public get areaValue(): number | undefined {
        return this._areaValue
    }

    public set value(value: number) {
        this._value = value
    }

    public set selected(isSelected: boolean) {
        this._selected = isSelected
    }

    public set areaColor(areaColor: Color) {
        this._areaColor = areaColor
    }

    public set areaValue(areaValue: number) {
        this._areaValue = areaValue
    }
    
    public toggleSelect() {
        this._selected = !this._selected
    }

    public clearOptions(): void {
        this._options = []
    }

    public setOptions1To9(): void {
        this._options = numbers1to9()
    }

    public removeOption(option: number): void {
        this._options = this._options.filter(o => o != option)
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