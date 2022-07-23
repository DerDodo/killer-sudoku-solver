import Cell from "./Cell"
import { Color } from "./Color"

export default interface Area {
    value: number
    cellIds: number[]
    color: Color
    id: number
}