import * as React from 'react'
import { store } from '../store';
import { createArea, getBoard, getGameMode, setColor, setGameMode } from '../store/GameSlice';
import { Color } from '../types/Color';
import FileManager from '../util/FileManage';
import "./MenuComponent.css"
import {GameMode} from "./../types/GameMode"
import { ChangeEvent, Component } from 'react';
import { stringToNumber } from '../util/NumberUtil';

type MenuComponentState = {
    areaValue: number
}

export default class MenuComponent extends Component<unknown, MenuComponentState> {
    fileManager: FileManager = new FileManager()

    constructor(props: unknown) {
        super(props)
        this.keydown = this.keydown.bind(this)
        this.onFileLoad = this.onFileLoad.bind(this)
        this.loadFromFile = this.loadFromFile.bind(this)
        document.addEventListener("keydown", this.keydown)
        this.state = {
            areaValue: 0
        }
    }

    render() {
        return (
            <div>
                <div className="fileMenu">
                    <button onClick={() => this.save()}>Save</button>
                    <button onClick={() => this._delete()}>Delete</button>
                    <button onClick={() => this.saveToFile()}>Save to file</button>
                    <label htmlFor="file-selector" className="custom-file-upload">
                        Upload file
                    </label>
                    <input type="file" id="file-selector" onChange={this.loadFromFile}></input>
                </div>
                <div>
                    <select onChange={ (e) => this.changeGameMode(e) }>
                        { this.renderGameModeOptions() }
                    </select>
                    <select onChange={ (e) => this.changeColor( e) }>
                        { this.renderColorOptions() }
                    </select>
                    { this.state.areaValue }
                </div>
            </div>
        )
    }

    save() {
        this.fileManager.saveToLocalStorage(getBoard())
    }
    
    _delete() {
        this.fileManager.deleteLocalStorage()
        window.location.reload()
    }
    
    saveToFile() {
        this.fileManager.saveToFile(getBoard())
    }
    
    loadFromFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.currentTarget.files[0]
        if (file.type && file.type != 'application/json') {
            console.log('File is not a json.', file.type, file)
            return
        }
        const reader = new FileReader()
        reader.addEventListener('load', this.onFileLoad)
        reader.readAsText(file);
    }

    onFileLoad(event: ProgressEvent<FileReader>) {
        console.log(this)
        this.fileManager.saveStringToLocalStorage(event.target.result.toString())
        window.location.reload()
    }

    set areaValue(value: number) {
        this.setState({
            areaValue: value
        })
    }
    
    keydown(event: KeyboardEvent) {
        if (event.code == "Backspace") {
            this.areaValue = Math.floor(this.state.areaValue / 10)
        } else if (event.code == "Enter") {
            store.dispatch(createArea(this.state.areaValue))
            this.areaValue = 0
        } else {
            const allowedKeys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
            if (allowedKeys.includes(event.key)) {
                switch(getGameMode()) {
                    case GameMode.Setup:
                        this.areaValue = this.state.areaValue * 10 + stringToNumber(event.key)
                        break         
                }
            }
        }
    }
    
    renderGameModeOptions() {
        return (Object.keys(GameMode) as Array<keyof typeof GameMode>).map((key) => {
            return <option value={key} key={key}>{GameMode[key]}</option>
        })
    }
    
    changeGameMode(event: React.ChangeEvent<HTMLSelectElement>) {
        const _gameMode = this.getGameModeEnum(event.currentTarget.value)
        store.dispatch(setGameMode(_gameMode))
    }
    
    getGameModeEnum(gameMode: string) {
        const indexOfS = Object.values(GameMode).indexOf(gameMode as unknown as GameMode);
        return Object.keys(GameMode)[indexOfS] as GameMode
    }
    
    renderColorOptions() {
        return (Object.keys(Color) as Array<keyof typeof Color>).map((key) => {
            return <option value={key} key={key}>{Color[key]}</option>
        })
    }
    
    changeColor(event: React.ChangeEvent<HTMLSelectElement>) {
        const _color = event.currentTarget.value as Color
        store.dispatch(setColor(_color))
    }
}