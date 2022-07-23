import Area from "./Area";
import Cell from "./Cell";

export default interface Board {
    cells: Cell[][]
    areas: Area[]
}