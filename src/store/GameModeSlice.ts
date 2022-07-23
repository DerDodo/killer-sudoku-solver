import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { Color } from '../types/Color'
import { GameMode } from '../types/GameMode'

interface GameModeState {
    gameMode: GameMode,
    color: Color,
}

const initialState: GameModeState = {
    gameMode: GameMode.Setup,
    color: Color.Green
}

export const gameModeSlice = createSlice({
  name: 'gameMode',
  initialState,
  reducers: {
    setGameMode: (state, action: PayloadAction<GameMode>) => {
      state.gameMode = action.payload
    },
    setColor: (state, action: PayloadAction<Color>) => {
      state.color = action.payload
    },
  },
})

export const { setGameMode, setColor } = gameModeSlice.actions
export const getGameMode = (state: RootState) => state.gameMode.gameMode
export default gameModeSlice.reducer