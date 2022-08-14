import * as React from "react"
import { store } from "../store"
import "./CellComponent.css"
import Cell from "../types/Cell"
import { getGameMode, selectCell } from "../store/GameSlice"

type CellProps = {
    cell: Cell
}

const CellComponent = (props: CellProps) => {
    const cell = props.cell
    const boxBottom = Math.floor(cell.index / 9) % 3 == 2
    const boxRight = cell.index % 3 == 2

    return (
        <div className={`cell ${boxBottom ? "box-bottom" : ""} ${boxRight ? "box-right" : ""} gameMode${getGameMode()} ${cell.selected ? "selected" : ""} areaColor${cell.areaColor}`}
            onClick={ () => select(cell) }>
            { renderAreaValue(cell) }
            { renderCellContent(cell) }
        </div>
    )
}

const renderAreaValue = (cell: Cell) => {
    if (cell.areaColor) {
        return <div className="areaValue">{cell.areaValue}</div>
    }
}

const renderCellContent = (cell: Cell) => {
    const filled = cell.value != null
    if (filled) {
        return <div className="cellValue">{cell.value}</div>
    } else {
        return <div className="cellOptions">{renderOptions(cell)}</div>
    }
}

const renderOptions = (cell: Cell) => {
    return Array.from(Array(9).keys()).map(val => {
        const active = cell.options.includes(val + 1)
        return <div className={`cellOption ${active ? "active" : "inactive"}`} key={cell.index + "-" + val}>{val + 1}</div>
    })
}

const select = (cell: Cell) => {
    store.dispatch(selectCell(cell.index))
}

export default CellComponent