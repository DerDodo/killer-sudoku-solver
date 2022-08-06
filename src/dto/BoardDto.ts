import AreaDto from "./AreaDto";
import CellDto from "./CellDto";

export default interface BoardDto {
    cells: CellDto[][]
    areas: AreaDto[]
}