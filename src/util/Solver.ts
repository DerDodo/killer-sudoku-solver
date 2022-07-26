import Area from "../types/Area";
import Board from "../types/Board";
import Cell from "../types/Cell";
import { isEqualArray, isSubArray } from "./ArrayUtil";
import { numbers1to9 } from "./NumberUtil";

class UnsolvableError extends Error {
    public msg: string
    constructor(msg: string) {
        super(msg);
        this.msg = msg
        Object.setPrototypeOf(this, UnsolvableError.prototype);
    }
}

export default class Solver {
    private board: Board
    private MAX_LOOPS = 100

    constructor(board: Board) {
        this.board = board
    }
    
    public solve() {
        const boardCopy = new Board(this.board.toDto(), false)
        const solver = new Solver(boardCopy)
        solver._solve(false)
        if (!solver.isDone()) {
            const boardCopy2 = new Board(this.board.toDto(), false)
            const solver2 = new Solver(boardCopy2)
            solver2._solve(true)
            this.copyCells(boardCopy2)
        } else {
            this.copyCells(boardCopy)
        }
    }
    
    private _solve(withSpecialOptionsReducers = false, bruteForceDepth = 30) {
        let prevNumFilledCells = 0
        let newNumFilledCells = 0
        let numLoops = 0
        do {
            numLoops += 1
            prevNumFilledCells = this.calcNumFilledCells()
            this.completeSingleMissingValues()
            this.calcOptions(withSpecialOptionsReducers)
            this.solveSingleOptions()
            this.solveUniqueOptions()
            this.solveSubGroupOptionRest()
            newNumFilledCells = this.calcNumFilledCells()
        } while(prevNumFilledCells != newNumFilledCells && numLoops < this.MAX_LOOPS)

        if (!this.isDone()) {
            try {
                this.bruteForce(withSpecialOptionsReducers, bruteForceDepth)
            } catch(e) {
                // Do nothing. Try next option
            }
        }
    }

    bruteForce(withSpecialOptionsReducers: boolean, bruteForceDepth: number) {
        let boardCopy = null
        if (bruteForceDepth > 0) {
            const testCell = this.findBruteForceTestCell()
            if (testCell !== undefined) {
                for (let i = 0; i < testCell.options.length; ++i) {
                    const option = testCell.options[i]
                    boardCopy = new Board(this.board.toDto(), false)
                    if (this.canSetValue(testCell, option)) {
                        boardCopy.getCellById(testCell.index).value = option
                        const solver = new Solver(boardCopy)
                        try {
                            solver._solve(withSpecialOptionsReducers, bruteForceDepth - 1)
                            if (solver.isDone() ) {
                                this.copyCells(boardCopy)
                                return
                            }
                        } catch(e) {
                            if (i == testCell.options.length - 1) {
                                throw new UnsolvableError("Could find any valid solution")
                            }
                        }
                    }
                }
            }
        }
        this.copyCells(boardCopy)
    }

    findBruteForceTestCell(): Cell | undefined {
        for (let numOptions = 2; numOptions <= 9; ++numOptions) {
            const testCell = this.board.cells.flat().filter(cell => !cell.value).find(cell => cell.options.length == numOptions)
            if (testCell !== undefined) {
                return testCell
            }
        }
    }

    copyCells(otherBoard: Board) {
        this.board.cells.flat().forEach(cell => {
            cell.value = otherBoard.getCellById(cell.index).value
            cell.options = otherBoard.getCellById(cell.index).options
        })
    }

    completeSingleMissingValues() {
        let changed = false
        let numLoops = 0
        do {
            numLoops += 1
            changed = false
            if (this.completeRows()) changed = true
            if (this.completeColumns()) changed = true
            if (this.completeBoxes()) changed = true
            if (this.completeAreas()) changed = true
        } while (changed && numLoops < this.MAX_LOOPS)
    }

    completeAreas(): boolean {
        let success = false
        this.board.areas.forEach((area => {
            const cells = area.cells
            if (this.isOnlyOneValueMissing(cells)) {
                const val = area.getRemainingValue()
                if (val > 0 && val < 10) {
                    this.fillSingleMissingCell(cells, val)
                    success = true
                }
            }
        }))
        return success
    }

    completeRows(): boolean {
        let success = false
        this.board.getRows().forEach((row => {
            if (this.isOnlyOneValueMissing(row)) {
                this.fillSingleMissingCell(row, this.findMissingValue(row))
                success = true
            }
        }))
        return success
    }

    completeColumns(): boolean {
        let success = false
        this.board.getCols().forEach((col => {
            if (this.isOnlyOneValueMissing(col)) {
                this.fillSingleMissingCell(col, this.findMissingValue(col))
                success = true
            }
        }))
        return success
    }

    completeBoxes(): boolean {
        let success = false
        this.board.getBoxes().forEach((box => {
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
        this.setValue(cells.find(cell => !cell.value), value)
    }

    findMissingValue(cells: Cell[]): number | null {
        const setValues = cells.map(cell => cell.value).filter(cell => cell != null)
        const missingValues = numbers1to9().filter(val => !setValues.includes(val))
        if (missingValues.length == 1) {
            return missingValues[0]
        } else {
            return null
        }
    }

    calcOptions(withSpecialOptionsReducers: boolean) {
        this.fillAllOptions()
        let prevNumOptions = 0
        let newNumOptions = 0
        let numLoops = 0
        do {
            numLoops += 1
            prevNumOptions = this.sumNumOptions()
            this.reduceDirectOptions()
            this.reduceAreaOptionsLowAndHighNumbers()
            this.reduceTwoCellAreas()
            this.reduceIfClosedSubset()
            if (withSpecialOptionsReducers) {
                this.reduceImpossibleNumbers()
                this.reduceMustHaveNumbersInAreas()
            }
            newNumOptions = this.sumNumOptions()
        } while(prevNumOptions != newNumOptions && numLoops < this.MAX_LOOPS)
    }

    sumNumOptions() {
        return this.board.cells.flat().filter(cell => !cell.value).reduce(function (s, a) {
            return s + a.options.length;
        }, 0)
    }

    fillAllOptions() {
        this.board.cells.flat().forEach(cell => {
            if (cell.value) {
                cell.clearOptions()
            } else {
                cell.setOptions1To9()
            }
        })
    }

    reduceDirectOptions() {
        for (let row = 0; row < 9; ++row) {
            for (let col = 0; col < 9; ++col) {
                const filledCell = this.board.cells[row][col]
                if (filledCell.value) {
                    this.board.getRow(row).forEach(cell => cell.removeOption(filledCell.value))
                    this.board.getCol(col).forEach(cell => cell.removeOption(filledCell.value))
                    this.board.getBoxByCoordinates(row, col).forEach(cell => cell.removeOption(filledCell.value))
                }
            }
        }
    }

    reduceDirectOptionsForFilledCell(cell: Cell) {
        this.board.getRow(cell.row).forEach(cell => cell.removeOption(cell.value))
        this.board.getCol(cell.col).forEach(cell => cell.removeOption(cell.value))
        this.board.getBoxByCoordinates(cell.row, cell.col).forEach(cell => cell.removeOption(cell.value))
    }

    reduceAreaOptionsLowAndHighNumbers() {
        this.board.areas.forEach(area => {
            const remainingAreaValue = area.getRemainingValue()
            if (remainingAreaValue > 0) {
                const cells = area.cells
                const missingValues = this.getMissingValues(cells)
                const missingCells = cells.filter(cell => !cell.value)
                let minValue = 0
                let maxValue = 0
                for (let i = 0; i < missingCells.length - 1; ++i) {
                    minValue += missingValues[i]
                    maxValue += missingValues[missingValues.length - i - 1]
                }

                for (let i = 0; i < missingValues.length - missingCells.length + 1; ++i) {
                    if (minValue + missingValues[missingValues.length - i] > remainingAreaValue) {
                        missingCells.forEach(cell => cell.removeOption(missingValues[missingValues.length - i]))
                    }
                    if (maxValue + missingValues[i] < remainingAreaValue) {
                        missingCells.forEach(cell => cell.removeOption(missingValues[i]))
                    }
                }
            }
        })
    }

    reduceTwoCellAreas() {
        this.board.areas.forEach(area => {
            const cells = area.cells
            const missingCells = cells.filter(cell => !cell.value)
            if (missingCells.length == 2) {
                const remainingAreaValue = area.getRemainingValue()
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
                cell0.removeOption(option)
            }
        })
    }

    halfMissingAreaValue(cell0: Cell, cell1: Cell, remainingAreaValue: number) {
        if (remainingAreaValue % 2 == 0) {
            cell0.removeOption(remainingAreaValue / 2)
            cell1.removeOption(remainingAreaValue / 2)
        }
    }

    reduceIfClosedSubset() {
        this.board.getRows().forEach(row => this.reduceIfClosedSubsetForCells(row))
        this.board.getCols().forEach(col => this.reduceIfClosedSubsetForCells(col))
        this.board.getBoxes().forEach(box => this.reduceIfClosedSubsetForCells(box))
    }

    reduceIfClosedSubsetForCells(cells: Cell[]) {
        const emptyCells = cells.filter(cell => !cell.value)
        emptyCells.forEach(cell => {
            const numOptions = cell.options.length
            let subOptions = 0
            const equalCells: Cell[] = []
            emptyCells.filter(otherCell => otherCell.options.length <= numOptions).forEach(comparisonCell => {
                if (isSubArray(cell.options, comparisonCell.options)) {
                    subOptions += 1
                    equalCells.push(comparisonCell)
                }
            })

            if (subOptions == numOptions) {
                const otherCells = this.getOtherCells(emptyCells, equalCells)
                cell.options.forEach(option => {
                    otherCells.forEach(cell => cell.removeOption(option))
                })
            }
        })
    }

    reduceImpossibleNumbers() {
        this.board.areas.forEach(area => {
            const areaCells = area.cells
            const emptyCells = areaCells.filter(cell => !cell.value)
            const remainingValue = area.getRemainingValue()
            if (emptyCells.length > 1) {
                emptyCells.forEach(cell => {
                    const otherCells = emptyCells.filter(c => c.index != cell.index)
                    cell.options.forEach(option => {
                        if (!this.canSumUpTo(otherCells, remainingValue - option, [option])) {
                            cell.removeOption(option)
                        }
                    })
                })
            }
        })
    }

    reduceMustHaveNumbersInAreas() {
        this.board.areas.forEach(area => {
            const emptyCells = area.cells.filter(cell => !cell.value)
            if (emptyCells.length > 0) {
                const remainingValue = area.getRemainingValue()
                const allSolutions = this.getSolutionsForArea(remainingValue, emptyCells)
                if (allSolutions.length != 0) {
                    this.removeMustHaveOptionsInArea(emptyCells, allSolutions)
                    this.removeUniqueOptionsInArea(emptyCells, allSolutions)
                } else {
                    throw new UnsolvableError("Couldn't calculate a valid solution for area")
                }
            }
        })
    }

    removeMustHaveOptionsInArea(emptyCells: Cell[], allSolutions: number[][]) {
        const allCellsInSameRow = emptyCells.filter(cell => cell.row == emptyCells[0].row).length == emptyCells.length
        const allCellsInSameCol = emptyCells.filter(cell => cell.col == emptyCells[0].col).length == emptyCells.length
        const allCellsInSameBox = emptyCells.filter(cell => cell.boxId == emptyCells[0].boxId).length == emptyCells.length
        if (allCellsInSameRow || allCellsInSameCol || allCellsInSameBox) {
            numbers1to9().forEach(number => {
                if (allSolutions.filter(solution => solution.includes(number)).length == allSolutions.length) {
                    if (allCellsInSameRow) {
                        this.removeOptionFromCells(this.board.getRow(emptyCells[0].row), emptyCells, number)
                    }
                    if (allCellsInSameCol) {
                        this.removeOptionFromCells(this.board.getCol(emptyCells[0].col), emptyCells, number)
                    }
                    if (allCellsInSameBox) {
                        this.removeOptionFromCells(this.board.getBoxByCell(emptyCells[0]), emptyCells, number)
                    }
                }
            })
        }
    }

    removeUniqueOptionsInArea(emptyCells: Cell[], allSolutions: number[][]) {
        for (let i = 0; i < emptyCells.length; ++i) {
            const isUnique = allSolutions.filter(solution => solution[i] == allSolutions[0][i]).length == allSolutions.length
            if (isUnique) {
                this.setValue(emptyCells[i], allSolutions[0][i])
            }
        }
    }

    removeOptionFromCells(cells: Cell[], exceptions: Cell[], option: number) {
        cells.filter(cell => !exceptions.map(exception => exception.index).includes(cell.index)).forEach(cell => {
            cell.removeOption(option)
        })
    }

    getSolutionsForArea(targetValue: number, cells: Cell[], forbiddenNumbers: number[] = []): number[][] {
        if (cells.length == 1) {
            if (cells[0].options.includes(targetValue) && !forbiddenNumbers.includes(targetValue)) {
                return [[targetValue]]
            } else {
                return []
            }
        } else {
            const cell = cells[0]
            const solutions: number[][] = []
            for (const option of cell.options) {
                if (!forbiddenNumbers.includes(option)) {
                    const newTargetValue = targetValue - option
                    if (newTargetValue <= 0) {
                        continue
                    } else {
                        const solutionsForOption = this.getSolutionsForArea(newTargetValue, cells.slice(1), [option, ...forbiddenNumbers])
                        for (const solution of solutionsForOption) {
                            solutions.push([option, ...solution])
                        }
                    }
                }
            }
            return solutions
        }
    }

    canSumUpTo(cells: Cell[], targetValue: number, forbiddenOptions: number[]): boolean {
        if (cells.length == 1) {
            return cells[0].options.includes(targetValue) && !forbiddenOptions.includes(targetValue)
        } else {
            for (const cell of cells) {
                const otherCells = cells.filter(c => c.index != cell.index)
                for (const option of cell.options) {
                    if (!forbiddenOptions.includes(option)) {
                        const forbiddenOptionsCopy = [...forbiddenOptions, option]
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
        return cells.filter(cell => isEqualArray(cell.options, cells[0].options)).length == cells.length
    }

    getOtherCells(allCells: Cell[], minus: Cell[]): Cell[] {
        const allIds = minus.map(cell => cell.index)
        return allCells.filter(cell => !allIds.includes(cell.index))
    }
    
    getMissingValues(cells: Cell[]): number[] {
        const allValues = cells.map(cell => cell.value)
        return numbers1to9().filter(value => !allValues.includes(value))
    }

    solveSingleOptions() {
        this.board.cells.flat().forEach(cell => {
            if (!cell.value && cell.options.length == 1) {
                this.setValue(cell, cell.options[0])
            }
        })
    }

    solveUniqueOptions() {
        this.board.getRows().forEach(row => { this.solveUniqueOptionsForCells(row) })
        this.board.getCols().forEach(col => { this.solveUniqueOptionsForCells(col) })
        this.board.getBoxes().forEach(box => { this.solveUniqueOptionsForCells(box) })
    }

    solveUniqueOptionsForCells(cells: Cell[]) {
        const filledValues = cells.map(cell => cell.value)
        const emptyCells = cells.filter(cell => !cell.value)
        numbers1to9().filter(val => !filledValues.includes(val)).forEach(val => {
            const numOptions = emptyCells.filter(cell => cell.options.includes(val)).length
            if (numOptions == 1) {
                this.setValue(cells.find(cell => cell.options.includes(val)), val)
            }
        })
    }

    solveSubGroupOptionRest() {
        this.board.areas.forEach(area => {
            const areaCells = area.cells
            const emptyCells = areaCells.filter(cell => !cell.value)
            const remainingValue = area.getRemainingValue()
            const optionSubgroups = this.findOptionSubgroups(area)
            let subgroupsValue = 0
            let subgroupsNumCells = 0
            optionSubgroups.forEach(subgroup => {
                subgroup.forEach(val => {
                    subgroupsNumCells += 1
                    subgroupsValue += val
                })
            })

            if (emptyCells.length - subgroupsNumCells == 1) {
                this.setValue(emptyCells.find(cell => {
                    return !optionSubgroups.find(options => isEqualArray(options, cell.options))
                }), remainingValue - subgroupsValue)
            }
        })
    }

    findOptionSubgroups(area: Area): number[][] {
        const areaCells = area.cells
        const emptyCells = areaCells.filter(cell => !cell.value)
        const optionSubgroups: number[][] = []
        emptyCells.forEach(cell => {
            if (emptyCells.filter(otherCell => isEqualArray(otherCell.options, cell.options)).length == cell.options.length) {
                if (!optionSubgroups.find(options => isEqualArray(options, cell.options))) {
                    optionSubgroups.push(cell.options)
                }
            }
        })
        return optionSubgroups
    }

    calcNumFilledCells(): number {
        return this.board.cells.flat().filter(cell => !!cell.value).length
    }

    isDone(): boolean {
        return this.board.cells.flat().find(cell => !cell.value) === undefined
    }

    setValue(cell: Cell, value: number): void {
        if (this.canSetValue(cell, value)) {
            cell.value = value
            this.reduceDirectOptionsForFilledCell(cell)
        } else {
            throw new UnsolvableError("Cannot set " + value + " in cell " + cell.index)
        }
    }

    canSetValue(cell: Cell, value: number): boolean {
        return !this.board.getRow(cell.row).find(cell => cell.value == value) &&
        !this.board.getCol(cell.col).find(cell => cell.value == value) &&
        !this.board.getBoxByCell(cell).find(cell => cell.value == value)
    }
}