import * as React from 'react'
import { AppDispatch, store, useAppDispatch, useAppSelector } from '../store';
import { createArea, setColor, setGameMode } from '../store/GameSlice';
import Board from '../types/Board';
import { Color } from '../types/Color';
import FileManager from '../util/FileManage';
import "./MenuComponent.css"
import {GameMode} from "./../types/GameMode"
import { ChangeEvent } from 'react';

let areaValue = 0
let gameMode = GameMode.Setup
let color = Color.Green
const fileManager = new FileManager()

//create your forceUpdate hook
function useForceUpdate(){
    const setValue = React.useState(0)[1] // integer state
    return () => setValue(value => value + 1) // update state to force render
    // An function that increment 👆🏻 the previous state like here 
    // is better than directly setting `value + 1`
}

let updateCallback: () => void

const MenuComponent = () => {
    const forceUpdate = useForceUpdate();
    updateCallback = () => {
        forceUpdate()
    }
    const dispatch = useAppDispatch()
    const board = new Board(useAppSelector((state) => state.game.board))
    return (
        <div>
            <div className="fileMenu">
                <button onClick={() => save(board)}>Save</button>
                <button onClick={_delete}>Delete</button>
                <button onClick={() => saveToFile(board)}>Save to file</button>
                <label htmlFor="file-selector" className="custom-file-upload">
                    Upload file
                </label>
                <input type="file" id="file-selector" onChange={loadFromFile}></input>
            </div>
            <div>
                <select onChange={ (e) => changeGameMode(dispatch, e) }>
                    { renderGameModeOptions() }
                </select>
                <select onChange={ (e) => changeColor(dispatch, e) }>
                    { renderColorOptions() }
                </select>
                { areaValue }
            </div>
        </div>
    )
}

const save = (board: Board) => {
    fileManager.saveToLocalStorage(board)
}

const _delete = () => {
    fileManager.deleteLocalStorage()
    window.location.reload()
}

const saveToFile = (board: Board) => {
    fileManager.saveToFile(board)
}

const loadFromFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files[0]
    if (file.type && file.type != 'application/json') {
        console.log('File is not a json.', file.type, file)
        return
    }
    const reader = new FileReader()
    reader.addEventListener('load', (event) => {
        fileManager.saveStringToLocalStorage(event.target.result.toString())
        window.location.reload()
    })
    reader.readAsText(file);
}

const keydown = (event: KeyboardEvent) => {
    if (event.code == "Backspace") {
        areaValue = Math.floor(areaValue / 10)
        if (updateCallback) {
            updateCallback()
        }
    } else if (event.code == "Enter") {
        store.dispatch(createArea(areaValue))
        areaValue = 0
        if (updateCallback) {
            updateCallback()
        }
    } else {
        const allowedKeys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        if (allowedKeys.includes(event.key)) {
            switch(gameMode) {
                case GameMode.Setup:
                    areaValue = areaValue * 10 + toNumber(event.key)
                    if (updateCallback) {
                        updateCallback()
                    }
                    break         
            }
        }
    }
}

const toNumber = (key: string): number | null => {
    switch(key) {
        case "0": return 0
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

const renderGameModeOptions = () => {
    return (Object.keys(GameMode) as Array<keyof typeof GameMode>).map((key) => {
        return <option value={key} key={key}>{GameMode[key]}</option>
    })
}

const changeGameMode = (dispatch: AppDispatch, event: React.ChangeEvent<HTMLSelectElement>) => {
    const _gameMode = getGameModeEnum(event.currentTarget.value)
    gameMode = _gameMode
    dispatch(setGameMode(_gameMode))
    document.dispatchEvent(new CustomEvent("gameModeChanged", { detail: _gameMode }))
}

const getGameModeEnum = (gameMode: string) => {
    const indexOfS = Object.values(GameMode).indexOf(gameMode as unknown as GameMode);
    return Object.keys(GameMode)[indexOfS] as GameMode
}

const renderColorOptions = () => {
    return (Object.keys(Color) as Array<keyof typeof Color>).map((key) => {
        return <option value={key} key={key}>{Color[key]}</option>
    })
}

const changeColor = (dispatch: AppDispatch, event: React.ChangeEvent<HTMLSelectElement>) => {
    const _color = event.currentTarget.value as Color
    color = _color
    dispatch(setColor(color))
}

document.addEventListener("keydown", keydown)

export default MenuComponent