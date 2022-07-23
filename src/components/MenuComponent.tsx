import * as React from 'react'
import { AppDispatch, useAppDispatch } from '../store';
import { setColor, setGameMode } from '../store/GameModeSlice';
import { Color } from '../types/Color';
import {GameMode} from "./../types/GameMode"

var areaValue = 0
var gameMode = GameMode.Setup
var color = Color.Green

//create your forceUpdate hook
function useForceUpdate(){
    const [value, setValue] = React.useState(0); // integer state
    return () => setValue(value => value + 1); // update state to force render
    // An function that increment 👆🏻 the previous state like here 
    // is better than directly setting `value + 1`
}

var updateCallback: () => void

const MenuComponent = () => {
    const forceUpdate = useForceUpdate();
    updateCallback = () => {
        forceUpdate()
    }
    const dispatch = useAppDispatch()
    return (
        <div>
            <button onClick={save}>Save</button>
            <button onClick={_delete}>Delete</button>
            <button onClick={saveToFile}>Save to file</button>
            <input type="file" id="file-selector" onChange={loadFromFile}></input>
            <select onChange={ (e) => changeGameMode(dispatch, e) }>
                { renderGameModeOptions() }
            </select>
            <select onChange={ (e) => changeColor(dispatch, e) }>
                { renderColorOptions() }
            </select>
            { areaValue }
        </div>
    )
}

const save = () => {
    document.dispatchEvent(new CustomEvent("saveBoard"))
}

const _delete = () => {
    document.dispatchEvent(new CustomEvent("deleteSave"))
}

const saveToFile = () => {
    document.dispatchEvent(new CustomEvent("saveBoardToFile"))
}

const loadFromFile = (event: any) => {
    const file = event.currentTarget.files[0]
    if (file.type && file.type != 'application/json') {
        console.log('File is not a json.', file.type, file)
        return
    }
    const reader = new FileReader()
    reader.addEventListener('load', (event) => {
        document.dispatchEvent(new CustomEvent("loadBoardFromFile", { detail: event.target.result }))
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
        document.dispatchEvent(new CustomEvent("createArea", { detail: { value: areaValue, color: color } }))
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

const getGameModeEnum = (gameMode: String) => {
    const indexOfS = Object.values(GameMode).indexOf(gameMode as unknown as GameMode);
    return Object.keys(GameMode)[indexOfS] as GameMode
}

const renderColorOptions = () => {
    return (Object.keys(Color) as Array<keyof typeof Color>).map((key) => {
        return <option value={key} key={key}>{Color[key]}</option>
    })
}

const changeColor = (dispatch: AppDispatch, event: React.ChangeEvent<HTMLSelectElement>) => {
    const _color = getColorEnum(event.currentTarget.value)
    color = _color
    dispatch(setColor(color))
    //document.dispatchEvent(new CustomEvent("colorChanged", { detail: color}))
}

const getColorEnum = (color: String) => {
    const indexOfS = Object.values(Color).indexOf(color as unknown as Color);
    return Object.keys(Color)[indexOfS] as Color
}

document.addEventListener("keydown", keydown)

export default MenuComponent