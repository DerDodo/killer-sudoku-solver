import CellDto from "./CellDto"
import { Color } from "../types/Color"

export default interface AreaDto {
    value: number
    cellIds: number[]
    color: Color
    id: number
}