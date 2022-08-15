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
  color: Color,
  board: BoardDto,
}

const fileManager = new FileManager()

const initialState: Game = {
  gameMode: GameMode.Setup,
  color: Color.Green,
  board: fileManager.loadInitialBoard().toDto()
}

export interface SetCellValuePaylod {
  cellId: number
  value: number
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameMode: (state, action: PayloadAction<GameMode>) => {
      state.gameMode = action.payload
    },
    setColor: (state, action: PayloadAction<Color>) => {
      state.color = action.payload
    },
    setBoard: (state, action: PayloadAction<BoardDto>) => {
      state.board = action.payload
    },
    setCellValue: (state, action: PayloadAction<SetCellValuePaylod>) => {
      const board = new Board(state.board)
      board.getCellById(action.payload.cellId).value = action.payload.value
      state.board = board.toDto()
    },
    selectCell: (state, action: PayloadAction<number>) => {
      const board = new Board(state.board)
      const cell = board.getCellById(action.payload)
      switch(state.gameMode) {
          case GameMode.Play:
              board.selectOnly(cell)
              break
          case GameMode.Setup:
              cell.toggleSelect()
              break
      }
      state.board = board.toDto()
    },
    createArea: (state, action: PayloadAction<number>) => {
      const board = new Board(state.board)
      const cells = board.getSelectedCells()

      if (action.payload <= 0 || cells.length == 0) {
          return
      }

      const areaDto: AreaDto = {
          color: state.color,
          cellIds: cells.map(cell => cell.index),
          value: action.payload,
          id: board.areas.length
      }
      board.createArea(areaDto)
      state.board = board.toDto()
    },
  },
})

export const { setGameMode, setColor, setBoard, setCellValue, selectCell, createArea } = gameSlice.actions
export function getGameMode(): GameMode { return store.getState().game.gameMode }
export function getBoard(): Board { return new Board(store.getState().game.board) }
export function getColor(): Color { return store.getState().game.color }
export default gameSlice.reducer