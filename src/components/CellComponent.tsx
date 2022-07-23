import * as React from "react"
import { useAppSelector } from "../store"
import Cell from '../types/Cell'
import { GameMode } from "../types/GameMode"
import "./CellComponent.css"

const CellComponent = (props: Cell) => {
    let gameMode = useAppSelector((state) => state.gameMode.gameMode)
    let boxBottom = Math.floor(props.index / 9) % 3 == 2
    let boxRight = props.index % 3 == 2

    return (
        <div className={`cell ${boxBottom ? "box-bottom" : ""} ${boxRight ? "box-right" : ""} gameMode${gameMode} ${props.selected ? "selected" : ""} areaColor${props.areaColor}`}
            onClick={ (e) => select(props, gameMode) }>
            { renderAreaValue(props) }
            { renderCellContent(props) }
        </div>
    )
}

const renderAreaValue = (props: Cell) => {
    if (props.areaColor) {
        return <div className="areaValue">{props.areaValue}</div>
    }
}

const renderCellContent = (props: Cell) => {
    let filled = props.value != null
    if (filled) {
        return <div className="cellValue">{props.value}</div>
    } else {
        return <div className="cellOptions">{renderOptions(props)}</div>
    }
}

const renderOptions = (props: Cell) => {
    return Array.from(Array(9).keys()).map(val => {
        let active = props.options.includes(val + 1)
        return <div className={`cellOption ${active ? "active" : "inactive"}`} key={props.index + "-" + val}>{val + 1}</div>
    })
}

const select = (cell: Cell, gameMode: GameMode) => {
    document.dispatchEvent(new CustomEvent('cellSelected', { detail: { gameMode: gameMode, cell: cell } }))
}

export default CellComponent