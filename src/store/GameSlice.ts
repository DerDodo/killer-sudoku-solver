import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import AreaDto from '../dto/AreaDto'
import BoardDto from '../dto/BoardDto'
import { store } from '../store'
import Board from '../types/Board'
import { Color } from '../types/Color'
import { GameMode } from '../types/GameMode'
import FileManager from '../util/FileManage'

interface Game {
  gameMode: GameMode,
  board: BoardDto,
}

const fileManager = new FileManager()

const initialState: Game = {
  gameMode: GameMode.Setup,
  board: fileManager.loadInitialBoard().toDto()
}

export interface SetCellValuePaylod {
  cellId: number
  value: number
}

export interface CreateAreaPayload {
  color: Color
  areaValue: number
}

class CellWrapper {
  private board: BoardDto
  private cellId: number

  constructor(board: BoardDto, cellId: number) {
    this.board = board
    this.cellId = cellId
  }

  private getRowAndCol(): [number, number] {
    return [Math.floor(this.cellId / 9), this.cellId % 9]
  }

  toggleSelect() {
    this.selected = !this.selected
  }

  get selected(): boolean {
    const [row, col] = this.getRowAndCol()
    return this.board.cells[row][col].selected
  }

  set selected(value: boolean) {
    const [row, col] = this.getRowAndCol()
    this.board.cells[row][col].selected = value
  }

  set value(value: number) {
    const [row, col] = this.getRowAndCol()
    this.board.cells[row][col].value = value
  }

  set areaColor(value: Color) {
    const [row, col] = this.getRowAndCol()
    this.board.cells[row][col].areaColor = value
  }

  set areaValue(value: number) {
    const [row, col] = this.getRowAndCol()
    this.board.cells[row][col].areaValue = value
  }
}

class BoardWrapper {
  private board: BoardDto

  constructor(board: BoardDto) {
    this.board = board
  }

  setCellValue(payload: SetCellValuePaylod): BoardWrapper {
    return this._setCellValue(payload.cellId, payload.value)
  }

  private _setCellValue(cellId: number, value: number): BoardWrapper {
    this.wrap(cellId).value = value
    return this
  }

  public selectOnly(id: number): BoardWrapper {
      this.board.cells.forEach(row => row.forEach(cell => cell.selected = cell.index == id))
      return this
  }

  public toggleSelect(cellId: number): BoardWrapper {
    this.wrap(cellId).toggleSelect()
    return this
  }

  public createArea(payload: CreateAreaPayload): BoardWrapper {
    const selectedCellIds = this.board.cells.flat().filter(cell => cell.selected).map(cell => cell.index)

    if (payload.areaValue <= 0 || selectedCellIds.length == 0) {
      return
    }

    const area: AreaDto = {
      color: payload.color,
      cellIds: selectedCellIds,
      value: payload.areaValue,
      id: this.board.areas.length
    }
    this.board.areas.push(area)
    
    selectedCellIds.forEach(cellId => {
      const cell = this.wrap(cellId)
      cell.areaColor = payload.color
      cell.selected = false
    })

    const topLeft = Math.min(...selectedCellIds)
    this.wrap(topLeft).areaValue = payload.areaValue

    return this
  }

  return(): BoardDto {
    return this.board
  }

  private wrap(cellId: number): CellWrapper {
    return new CellWrapper(this.board, cellId)
  }
}

function wrap(board: BoardDto): BoardWrapper {
  return new BoardWrapper(board)
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameMode: (state, action: PayloadAction<GameMode>) => {
      state.gameMode = action.payload
    },
    setBoard: (state, action: PayloadAction<BoardDto>) => {
      state.board = action.payload
    },
    setCellValue: (state, action: PayloadAction<SetCellValuePaylod>) => {
      state.board = wrap(state.board).setCellValue(action.payload).return()
    },
    selectCell: (state, action: PayloadAction<number>) => {
      switch(state.gameMode) {
        case GameMode.Play:
          state.board = wrap(state.board).selectOnly(action.payload).return()
          break
        case GameMode.Setup:
          state.board = wrap(state.board).toggleSelect(action.payload).return()
          break
      }
    },
    createArea: (state, action: PayloadAction<CreateAreaPayload>) => {
      state.board = wrap(state.board).createArea(action.payload).return()
    },
  },
})

export const { setGameMode, setBoard, setCellValue, selectCell, createArea } = gameSlice.actions
export function getGameMode(): GameMode { return store.getState().game.gameMode }
export function getBoard(): Board { return new Board(store.getState().game.board) }
export function dispatchCreateArea(areaValue: number, color: Color) { store.dispatch(createArea({ areaValue: areaValue, color: color } as CreateAreaPayload)) }
export function dispatchSetCellValue(cellId: number, value: number) { store.dispatch(setCellValue({ cellId: cellId, value: value } as SetCellValuePaylod)) }
export default gameSlice.reducer