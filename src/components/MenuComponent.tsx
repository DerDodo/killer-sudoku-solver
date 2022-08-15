import * as React from 'react'
import { RootState, store } from '../store';
import { dispatchCreateArea, getBoard, getGameMode, setGameMode } from '../store/GameSlice';
import { Color } from '../types/Color';
import FileManager from '../util/FileManage';
import "./MenuComponent.css"
import {GameMode} from "./../types/GameMode"
import { ChangeEvent, Component } from 'react';
import { isValidNumKey, stringToNumber } from '../util/NumberUtil';
import { connect } from 'react-redux';

type MenuComponentState = {
    areaValue: number
    color: Color
}

type MenuComponentProps = {
    gameMode: GameMode
}

class MenuComponent extends Component<MenuComponentProps, MenuComponentState> {
    fileManager: FileManager = new FileManager()

    constructor(props: MenuComponentProps) {
        super(props)
        this.keydown = this.keydown.bind(this)
        this.onFileLoad = this.onFileLoad.bind(this)
        this.loadFromFile = this.loadFromFile.bind(this)
        document.addEventListener("keydown", this.keydown)
        this.state = {
            areaValue: 0,
            color: Color.Green,
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
                    <select onChange={ (e) => this.changeGameMode(e) } value={getGameMode()}>
                        { this.renderGameModeOptions() }
                    </select>
                    <select onChange={ (e) => this.changeColor( e) } value={this.state.color}>
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
        this.fileManager.saveStringToLocalStorage(event.target.result.toString())
        window.location.reload()
    }
    
    keydown(event: KeyboardEvent) {
        if (event.code == "Backspace") {
            this.areaValue = Math.floor(this.state.areaValue / 10)
        } else if (event.code == "Enter") {
            dispatchCreateArea(this.state.areaValue, this.state.color)
            this.areaValue = 0
        } else if(event.code == "Space") {
            if (getGameMode() == GameMode.Play) {
                store.dispatch(setGameMode(GameMode.Setup))
            } else {
                store.dispatch(setGameMode(GameMode.Play))
            }
        } else if(event.key == "c") {
            switch(this.state.color) {
                case Color.Green: this.color = Color.Yellow; break
                case Color.Yellow: this.color = Color.Red; break
                case Color.Red: this.color = Color.Purple; break
                case Color.Purple: this.color = Color.Turqoise; break
                case Color.Turqoise: this.color = Color.Green; break
            }
        } else if (isValidNumKey(event) && getGameMode() == GameMode.Setup) {
            this.areaValue = this.state.areaValue * 10 + stringToNumber(event.key)
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
        this.color = event.currentTarget.value as Color
    }

    set areaValue(value: number) {
        this.setState(state => ({
            ...state,
            areaValue: value
        }))
    }

    set color(color: Color) {
        this.setState(state => ({
            ...state,
            color: color
        }))
    }
}

function mapStateToProps(state: RootState): MenuComponentProps {
    return { 
        gameMode: state.game.gameMode
    }
}

export default connect(mapStateToProps)(MenuComponent);
