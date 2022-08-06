import * as React from "react"
import { useAppSelector } from "../store"
import { GameMode } from "../types/GameMode"
import "./CellComponent.css"
import Cell from "../types/Cell"

type CellProps = {
    cell: Cell
}

const CellComponent = (props: CellProps) => {
    let cell = props.cell
    let gameMode = useAppSelector((state) => state.gameMode.gameMode)
    let boxBottom = Math.floor(cell.index / 9) % 3 == 2
    let boxRight = cell.index % 3 == 2

    return (
        <div className={`cell ${boxBottom ? "box-bottom" : ""} ${boxRight ? "box-right" : ""} gameMode${gameMode} ${cell.selected ? "selected" : ""} areaColor${cell.areaColor}`}
            onClick={ (e) => select(cell, gameMode) }>
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
    let filled = cell.value != null
    if (filled) {
        return <div className="cellValue">{cell.value}</div>
    } else {
        return <div className="cellOptions">{renderOptions(cell)}</div>
    }
}

const renderOptions = (cell: Cell) => {
    return Array.from(Array(9).keys()).map(val => {
        let active = cell.options.includes(val + 1)
        return <div className={`cellOption ${active ? "active" : "inactive"}`} key={cell.index + "-" + val}>{val + 1}</div>
    })
}

const select = (cell: Cell, gameMode: GameMode) => {
    document.dispatchEvent(new CustomEvent('cellSelected', { detail: { gameMode: gameMode, cell: cell } }))
}

export default CellComponent