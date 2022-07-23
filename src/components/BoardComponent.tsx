import * as React from "react"
import Board from "../types/Board"
import CellComponent from "./CellComponent"
import "./BoardComponent.css"
import { GameMode } from "../types/GameMode"
import Cell from "../types/Cell"
import Area from "../types/Area"
import * as FileSaver from "file-saver"
import { getValue } from "@testing-library/user-event/dist/utils"

export default class BoardComponent extends React.Component <Board, {}> {
    gameMode?: GameMode = GameMode.Setup

    constructor (props: Board) {
        super(props)

        this.solve = this.solve.bind(this)

        document.addEventListener("cellSelected", this.cellSelected)
        document.addEventListener("gameModeChanged", this.gameModeChanged)
        document.addEventListener("keydown", this.keydown)
        document.addEventListener("saveBoard", () => {
            localStorage.setItem("board", JSON.stringify(this.props))
        })
        document.addEventListener("deleteSave", () => {
            localStorage.removeItem("board")
            window.location.reload()
        })
        document.addEventListener("saveBoardToFile", () => {
            FileSaver.saveAs(new File([JSON.stringify(this.props)], "sudoku.json", {type: "text/plain;charset=utf-8"}))
        })
        document.addEventListener("loadBoardFromFile", (event: CustomEvent) => {
            localStorage.setItem("board", event.detail)
            console.log(event.detail)
            window.location.reload()
        })
        document.addEventListener("createArea", (event: CustomEvent) => {
            const color = event.detail.color
            const value = event.detail.value
            const cells = this.getSelectedCells()
    
            if (value <= 0 || cells.length == 0) {
                return
            }
    
            const area: Area = {
                color: color,
                cellIds: cells.map(cell => cell.index),
                value: value,
                id: this.props.areas.length
            }
            this.props.areas.push(area)
            
            const topLeft = this.findTopLeftCell(cells)

            cells.forEach((cell) => {
                const realCell = this.getRealCell(cell)
                realCell.areaColor = area.color
                realCell.selected = false
                if (realCell.index == topLeft.index) {
                    realCell.areaValue = area.value
                }
            })

            this.forceUpdate()
        })
    }

    cellSelected = (event: CustomEvent) => {
        const gameMode = event.detail.gameMode as GameMode
        const cell = event.detail.cell as Cell
        switch(gameMode) {
            case GameMode.Play:
                this.selectAndUnselectOthers(cell)
                break
            case GameMode.Setup:
                this.toggleSelect(cell)
                break
        }
        this.forceUpdate()
    }

    selectAndUnselectOthers = (cell: Cell) => {
        this.props.cells.forEach(row => row.forEach(_cell => _cell.selected = _cell.index == cell.index))
    }

    toggleSelect = (cell: Cell) => {
        this.getCell(cell.index).selected = !cell.selected
    }

    getCell = (index: number) => {
        return this.props.cells[Math.floor(index / 9)][index % 9]
    }

    getRealCell = (cell: Cell) => {
        return this.getCell(cell.index)
    }

    findTopLeftCell = (cells: Cell[]) => {
        return this.getRealCell(cells.reduce((prev, curr) => {
            return prev.index < curr.index ? prev : curr
        }))
    }

    getSelectedCells = (): Cell[] => {
        return this.props.cells.flat().filter(cell => cell.selected)
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
            const cells = this.getSelectedCells()
            if (cells.length > 0) {
                this.getRealCell(cells[0]).value = val
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
        return this.props.cells.map(row => {
            return row.map(cell => {
                return <CellComponent value={cell.value} options={cell.options} key={cell.index} index={cell.index} selected={cell.selected} areaColor={cell.areaColor} areaValue={cell.areaValue} />
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

    completeSingleMissingValues() {
        var changed = false
        do {
            changed = false
            if (this.completeRows()) changed = true
            if (this.completeColumns()) changed = true
            if (this.completeBoxes()) changed = true
            if (this.completeAreas()) changed = true
        } while (changed)
    }

    completeAreas(): boolean {
        var success = false
        this.props.areas.forEach((area => {
            const cells = this.getCellsOfArea(area)
            if (this.isOnlyOneValueMissing(cells)) {
                const val = this.getRemainingAreaValue(area)
                if (val > 0 && val < 10) {
                    this.fillSingleMissingCell(cells, val)
                    success = true
                }
            }
        }))
        return success
    }

    getCellsOfArea(area: Area): Cell[] {
        return area.cellIds.map(cell => this.getCell(cell))
    }

    getRemainingAreaValue(area: Area): number {
        const filledSum = this.getCellsOfArea(area).filter(cell => !!cell.value).reduce(function (s, a) {
            return s + a.value;
        }, 0)
        return area.value - filledSum
    }

    completeRows(): boolean {
        var success = false
        this.getRows().forEach((row => {
            if (this.isOnlyOneValueMissing(row)) {
                this.fillSingleMissingCell(row, this.findMissingValue(row))
                success = true
            }
        }))
        return success
    }

    completeColumns(): boolean {
        var success = false
        this.getCols().forEach((col => {
            if (this.isOnlyOneValueMissing(col)) {
                this.fillSingleMissingCell(col, this.findMissingValue(col))
                success = true
            }
        }))
        return success
    }

    completeBoxes(): boolean {
        var success = false
        this.getBoxes().forEach((box => {
            if (this.isOnlyOneValueMissing(box)) {
                this.fillSingleMissingCell(box, this.findMissingValue(box))
                success = true
            }
        }))
        return success
    }

    isOnlyOneValueMissing(cells: Cell[]) {
        return cells.filter(cell => !cell.value).length == 1
    }

    fillSingleMissingCell(cells: Cell[], value: number) {
        this.getRealCell(cells.find(cell => !cell.value)).value = value
    }

    findMissingValue(cells: Cell[]): number | null {
        const setValues = cells.map(cell => cell.value).filter(cell => cell != null)
        const missingValues = this.get1to9().filter(val => !setValues.includes(val))
        if (missingValues.length == 1) {
            return missingValues[0]
        } else {
            return null
        }
    }

    get1to9(): number[] {
        return Array.from(Array(9).keys()).map(val => val + 1)
    }

    getRows(): Cell[][] {
        return this.props.cells
    }

    getCols(): Cell[][] {
        const cols: Cell[][] = []
        for (var col = 0; col < 9; ++col) {
            cols.push(this.getCol(col))
        }
        return cols
    }

    getBoxes(): Cell[][] {
        const boxes: Cell[][] = []
        for (var boxX = 0; boxX < 3; ++boxX) {
            for (var boxY = 0; boxY < 3; ++boxY) {
                boxes.push(this.getBoxByCoordinates(boxY * 3, boxX * 3))
            }
        }
        return boxes
    }

    calcOptions() {
        this.fillAllOptions()
        var prevNumOptions = 0
        var newNumOptions = 0
        do {
            prevNumOptions = this.sumNumOptions()
            this.reduceDirectOptions()
            this.reduceAreaOptionsLowAndHighNumbers()
            this.reduceTwoCellAreas()
            this.reduceIfClosedSubset()
            this.reduceImpossibleNumbers()
            newNumOptions = this.sumNumOptions()
        } while(prevNumOptions != newNumOptions)
    }

    sumNumOptions() {
        return this.props.cells.flat().filter(cell => !cell.value).reduce(function (s, a) {
            return s + a.options.length;
        }, 0)
    }

    fillAllOptions() {
        this.props.cells.flat().forEach(cell => {
            if (cell.value) {
                this.getRealCell(cell).options = []
            } else {
                this.getRealCell(cell).options = this.get1to9()
            }
        })
    }

    reduceDirectOptions() {
        for (var row = 0; row < 9; ++row) {
            for (var col = 0; col < 9; ++col) {
                const filledCell = this.props.cells[row][col]
                if (filledCell.value) {
                    this.removeOptions(this.getRow(row), filledCell.value)
                    this.removeOptions(this.getCol(col), filledCell.value)
                    this.removeOptions(this.getBoxByCoordinates(row, col), filledCell.value)
                }
            }
        }
    }

    reduceAreaOptionsLowAndHighNumbers() {
        this.props.areas.forEach(area => {
            const remainingAreaValue = this.getRemainingAreaValue(area)
            if (remainingAreaValue > 0) {
                const cells = this.getCellsOfArea(area)
                const missingValues = this.getMissingValues(cells)
                const missingCells = cells.filter(cell => !cell.value)
                var minValue = 0
                var maxValue = 0
                for (var i = 0; i < missingCells.length - 1; ++i) {
                    minValue += missingValues[i]
                    maxValue += missingValues[missingValues.length - i - 1]
                }

                for (var i = 0; i < missingValues.length - missingCells.length + 1; ++i) {
                    if (minValue + missingValues[missingValues.length - i] > remainingAreaValue) {
                        this.removeOptions(missingCells, missingValues[missingValues.length - i])
                    }
                    if (maxValue + missingValues[i] < remainingAreaValue) {
                        this.removeOptions(missingCells, missingValues[i])
                    }
                }
            }
        })
    }

    reduceTwoCellAreas() {
        this.props.areas.forEach(area => {
            const cells = this.getCellsOfArea(area)
            const missingCells = cells.filter(cell => !cell.value)
            if (missingCells.length == 2) {
                const remainingAreaValue = this.getRemainingAreaValue(area)
                this.reduceTwoCellAreasPartnerValues(missingCells[0], missingCells[1], remainingAreaValue)
                this.reduceTwoCellAreasPartnerValues(missingCells[1], missingCells[0], remainingAreaValue)
                this.halfMissingAreaValue(missingCells[0], missingCells[1], remainingAreaValue)
            }
        })
    }

    reduceTwoCellAreasPartnerValues(cell0: Cell, cell1: Cell, remainingAreaValue: number) {
        cell0.options.forEach(option => {
            const partnerValue = remainingAreaValue - option
            if (!cell1.options.includes(partnerValue)) {
                this.removeOption(cell0, option)
            }
        })
    }

    halfMissingAreaValue(cell0: Cell, cell1: Cell, remainingAreaValue: number) {
        if (remainingAreaValue % 2 == 0) {
            this.removeOption(cell0, remainingAreaValue / 2)
            this.removeOption(cell1, remainingAreaValue / 2)
        }
    }

    reduceIfClosedSubset() {
        this.getRows().forEach(row => this.reduceIfClosedSubsetForCells(row))
        this.getCols().forEach(col => this.reduceIfClosedSubsetForCells(col))
        this.getBoxes().forEach(box => this.reduceIfClosedSubsetForCells(box))
    }

    reduceIfClosedSubsetForCells(cells: Cell[]) {
        const emptyCells = cells.filter(cell => !cell.value)
        emptyCells.forEach(cell => {
            const numOptions = cell.options.length
            var subOptions = 0
            const equalCells:Cell[] = []
            emptyCells.filter(otherCell => otherCell.options.length <= numOptions).forEach(comparisonCell => {
                if (this.isSubArray(cell.options, comparisonCell.options)) {
                    subOptions += 1
                    equalCells.push(comparisonCell)
                }
            })

            if (subOptions == numOptions) {
                const otherCells = this.getOtherCells(emptyCells, equalCells)
                cell.options.forEach(option => {
                    this.removeOptions(otherCells, option)
                })
            }
        })
    }

    reduceImpossibleNumbers() {
        this.props.areas.forEach(area => {
            const areaCells = this.getCellsOfArea(area)
            const emptyCells = areaCells.filter(cell => !cell.value)
            const remainingValue = this.getRemainingAreaValue(area)
            if (emptyCells.length > 1) {
                emptyCells.forEach(cell => {
                    let otherCells = emptyCells.filter(c => c.index != cell.index)
                    cell.options.forEach(option => {
                        if (!this.canSumUpTo(otherCells, remainingValue - option, [option])) {
                            this.removeOption(cell, option)
                        }
                    })
                })
            }
        })
    }

    canSumUpTo(cells: Cell[], targetValue: number, forbiddenOptions: number[]): boolean {
        if (cells.length == 1) {
            return cells[0].options.includes(targetValue) && !forbiddenOptions.includes(targetValue)
        } else {
            for (let cell of cells) {
                let otherCells = cells.filter(c => c.index != cell.index)
                for (let option of cell.options) {
                    if (!forbiddenOptions.includes(option)) {
                        let forbiddenOptionsCopy = [...forbiddenOptions, option]
                        if (this.canSumUpTo(otherCells, targetValue - option, forbiddenOptionsCopy)) {
                            return true
                        }
                    }
                }
            }
            return false
        }
    }

    areAllOptionsEqual(cells: Cell[]): boolean {
        return cells.filter(cell => this.isEqualArray(cell.options, cells[0].options)).length == cells.length
    }

    getOtherCells(allCells: Cell[], minus: Cell[]): Cell[] {
        const allIds = minus.map(cell => cell.index)
        return allCells.filter(cell => !allIds.includes(cell.index))
    }

    isSubArray(array0: number[], array1: number[]): boolean {
        if (array0.length < array1.length)
            return false
        for (var i = 0; i < array1.length; ++i) {
            if (!array0.includes(array1[i])) {
                return false
            }
        }
        return true
    }

    isEqualArray(array0: number[], array1: number[]): boolean {
        if (array0.length != array1.length)
            return false
        for (var i = 0; i < array1.length; ++i) {
            if (array0[i] != array1[i]) {
                return false
            }
        }
        return true
    }
    
    getMissingValues(cells: Cell[]): number[] {
        const allValues = cells.map(cell => cell.value)
        return this.get1to9().filter(value => !allValues.includes(value))
    }

    removeOptions(cells: Cell[], val: number) {
        cells.filter(cell => !cell.value).forEach(cell => this.removeOption(cell, val))
    }

    removeOption(cell: Cell, val: number) {
        this.getRealCell(cell).options = cell.options.filter(option => option != val)
    }

    getRow(row: number): Cell[] {
        return this.props.cells[row]
    }

    getCol(col: number): Cell[] {
        return this.get1to9().map(row => this.props.cells[row - 1][col])
    }

    getBoxByCell(cell: Cell): Cell[] {
        const row = Math.floor(cell.index / 9)
        const col = cell.index % 9
        return this.getBoxByCoordinates(row, col)
    }

    getBoxByCoordinates(row: number, col: number): Cell[] {
        const boxX = Math.floor(col / 3)
        const boxY = Math.floor(row / 3)

        return [
            this.props.cells[boxY * 3][boxX * 3],
            this.props.cells[boxY * 3][boxX * 3 + 1],
            this.props.cells[boxY * 3][boxX * 3 + 2],
            this.props.cells[boxY * 3 + 1][boxX * 3],
            this.props.cells[boxY * 3 + 1][boxX * 3 + 1],
            this.props.cells[boxY * 3 + 1][boxX * 3 + 2],
            this.props.cells[boxY * 3 + 2][boxX * 3],
            this.props.cells[boxY * 3 + 2][boxX * 3 + 1],
            this.props.cells[boxY * 3 + 2][boxX * 3 + 2],
        ]
    }

    solveSingleOptions() {
        this.props.cells.flat().forEach(cell => {
            if (!cell.value && cell.options.length == 1) {
                this.getRealCell(cell).value = cell.options[0]
            }
        })
    }

    solveUniqueOptions() {
        this.getRows().forEach(row => { this.solveUniqueOptionsForCells(row) })
        this.getCols().forEach(col => { this.solveUniqueOptionsForCells(col) })
        this.getBoxes().forEach(box => { this.solveUniqueOptionsForCells(box) })
    }

    solveUniqueOptionsForCells(cells: Cell[]) {
        const filledValues = cells.map(cell => cell.value)
        const emptyCells = cells.filter(cell => !cell.value)
        this.get1to9().filter(val => !filledValues.includes(val)).forEach(val => {
            var numOptions = emptyCells.filter(cell => cell.options.includes(val)).length
            if (numOptions == 1) {
                this.getRealCell(cells.find(cell => cell.options.includes(val))).value = val
            }
        })
    }

    solveSubGroupOptionRest() {
        this.props.areas.forEach(area => {
            const areaCells = this.getCellsOfArea(area)
            const emptyCells = areaCells.filter(cell => !cell.value)
            const remainingValue = this.getRemainingAreaValue(area)
            const optionSubgroups = this.findOptionSubgroups(area)
            var subgroupsValue = 0
            var subgroupsNumCells = 0
            optionSubgroups.forEach(subgroup => {
                subgroup.forEach(val => {
                    subgroupsNumCells += 1
                    subgroupsValue += val
                })
            })

            if (emptyCells.length - subgroupsNumCells == 1) {
                console.log(optionSubgroups, emptyCells.find(cell => {
                    return !optionSubgroups.find(options => this.isEqualArray(options, cell.options))
                }))
                this.getRealCell(emptyCells.find(cell => {
                    return !optionSubgroups.find(options => this.isEqualArray(options, cell.options))
                })).value = remainingValue - subgroupsValue
            }
        })
    }

    findOptionSubgroups(area: Area): number[][] {
        const areaCells = this.getCellsOfArea(area)
        const emptyCells = areaCells.filter(cell => !cell.value)
        let optionSubgroups: number[][] = []
        emptyCells.forEach(cell => {
            if (emptyCells.filter(otherCell => this.isEqualArray(otherCell.options, cell.options)).length == cell.options.length) {
                if (!optionSubgroups.find(options => this.isEqualArray(options, cell.options))) {
                    optionSubgroups.push(cell.options)
                }
            }
        })
        return optionSubgroups
    }

    solve() {
        var prevNumFilledCells = 0
        var newNumFilledCells = 0
        do {
            prevNumFilledCells = this.calcNumFilledCells()
            this.completeSingleMissingValues()
            this.calcOptions()
            this.solveSingleOptions()
            this.solveUniqueOptions()
            this.solveSubGroupOptionRest()
            newNumFilledCells = this.calcNumFilledCells()
        } while(prevNumFilledCells != newNumFilledCells)
        this.forceUpdate()
    }

    calcNumFilledCells(): number {
        return this.props.cells.flat().filter(cell => !!cell.value).length
    }
}