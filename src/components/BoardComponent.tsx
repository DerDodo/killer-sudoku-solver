import * as React from "react"
import CellComponent from "./CellComponent"
import "./BoardComponent.css"
import { GameMode } from "../types/GameMode"
import AreaDto from "../dto/AreaDto"
import * as FileSaver from "file-saver"
import Board from "../types/Board"
import Cell from "../types/Cell"
import Solver from "../util/Solver"

type BoardComponentProps = {
    board: Board
}

export default class BoardComponent extends React.Component <BoardComponentProps, {}> {
    private gameMode?: GameMode = GameMode.Setup

    private get board(): Board {
        return this.props.board
    }

    constructor (props: BoardComponentProps) {
        super(props)

        this.solve = this.solve.bind(this)

        document.addEventListener("cellSelected", this.cellSelected)
        document.addEventListener("gameModeChanged", this.gameModeChanged)
        document.addEventListener("keydown", this.keydown)
        document.addEventListener("saveBoard", () => {
            localStorage.setItem("board", JSON.stringify(this.board.toDto()))
        })
        document.addEventListener("deleteSave", () => {
            localStorage.removeItem("board")
            window.location.reload()
        })
        document.addEventListener("saveBoardToFile", () => {
            FileSaver.saveAs(new File([JSON.stringify(this.board.toDto())], "sudoku.json", {type: "text/plain;charset=utf-8"}))
        })
        document.addEventListener("loadBoardFromFile", (event: CustomEvent) => {
            localStorage.setItem("board", event.detail)
            window.location.reload()
        })
        document.addEventListener("createArea", (event: CustomEvent) => {
            const color = event.detail.color
            const value = event.detail.value
            const cells = this.board.getSelectedCells()
    
            if (value <= 0 || cells.length == 0) {
                return
            }
    
            const areaDto: AreaDto = {
                color: color,
                cellIds: cells.map(cell => cell.index),
                value: value,
                id: this.board.areas.length
            }
            this.board.createArea(areaDto)

            this.forceUpdate()
        })
    }

    cellSelected = (event: CustomEvent) => {
        const gameMode = event.detail.gameMode as GameMode
        const cell = event.detail.cell as Cell
        switch(gameMode) {
            case GameMode.Play:
                this.board.selectOnly(cell)
                break
            case GameMode.Setup:
                cell.toggleSelect()
                break
        }
        this.forceUpdate()
    }

    keydown = (event: KeyboardEvent) => {
        const allowedKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
        if (allowedKeys.includes(event.key)) {
            switch(this.gameMode) {
                case GameMode.Setup:

                    break
                case GameMode.Play:
                    this.enterCellValue(this.toNumber(event.key))
                    break            
            }
        }
    }

    toNumber = (key: string): number | null => {
        switch(key) {
            case "1": return 1
            case "2": return 2
            case "3": return 3
            case "4": return 4
            case "5": return 5
            case "6": return 6
            case "7": return 7
            case "8": return 8
            case "9": return 9
            default: return null
        }
    }

    enterCellValue = (val: number | null) => {
        if (val) {
            const cells = this.board.getSelectedCells()
            if (cells.length > 0) {
                cells[0].value = val
                this.forceUpdate()
            }
        }
    }

    gameModeChanged = (event: CustomEvent) => {
        this.gameMode = event.detail as GameMode
    }

    render() {
        return (
            <div>
                <div className="board">
                    {this.renderCells()}
                </div>
                { this.renderSolver() }
            </div>
        )
    }

    renderCells() {
        return this.board.cells.map(row => {
            return row.map(cell => {
                return <CellComponent cell={cell} />
            })
        }).flat()
    }

    renderSolver() {
        return (
            <div>
                <button onClick={ this.solve }>Solve</button>
            </div>
        )
    }

    solve() {
        let solver = new Solver(this.board)
        solver.solve()
        this.forceUpdate()
    }
}