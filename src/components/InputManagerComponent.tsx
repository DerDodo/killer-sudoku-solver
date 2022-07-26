import * as React from 'react'
import "./InputManagerComponent.css"
import { Component } from 'react'
import { connect } from 'react-redux'
import { RootState, store } from '../store'
import { dispatchCreateArea, getBoard, getGameMode, setGameMode } from "../store/GameSlice"
import { Color } from '../types/Color'
import { GameMode } from "../types/GameMode"
import { isValidNumKey, stringToNumber } from "../util/NumberUtil"

type InputManagerComponentState = {
    areaValue: number
    color: Color
}

type InputManagerComponentProps = {
    gameMode: GameMode
}

class InputManagerComponent extends Component<InputManagerComponentProps, InputManagerComponentState> {
    constructor(props: InputManagerComponentProps) {
        super(props)
        this.keydown = this.keydown.bind(this)
        document.addEventListener("keydown", this.keydown)
        this.state = {
            areaValue: 0,
            color: Color.Green,
        }
    }

    keydown(event: KeyboardEvent): void {
        if (event.code == "Backspace") {
            this.areaValue = Math.floor(this.state.areaValue / 10)
        } else if (event.code == "Enter") {
            dispatchCreateArea(this.state.areaValue, this.state.color)
            this.areaValue = 0
        } else if(event.key == "x") {
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
        } else if (isValidNumKey(event)) {
            const number = stringToNumber(event.key)
            switch(getGameMode()) {
                case GameMode.Setup:
                    this.areaValue = this.state.areaValue * 10 + number
                    break
                case GameMode.Play:
                    if (number != 0) {
                        this.enterCellValue(number)
                    }
                    break            
            }
        }
    }

    enterCellValue(val: number | null): void {
        if (val) {
            const cells = getBoard().getSelectedCells()
            if (cells.length > 0) {
                cells[0].value = val
            }
        }
    }

    render() {
        const gameMode = getGameMode()
        return (
            <div className={`interactionMenu sideMenu gameMode${gameMode}`}>
                <select onChange={ (e) => this.changeGameMode(e) } value={gameMode} id="gameModeSelect">
                    { this.renderGameModeOptions() }
                </select>
                <select onChange={ (e) => this.changeColor(e) } value={this.state.color} id="colorSelect" className={`color${this.state.color}`}>
                    { this.renderColorOptions() }
                </select>
                { this.state.areaValue }
            </div>
        )
    }
    
    renderGameModeOptions() {
        return (Object.keys(GameMode) as Array<keyof typeof GameMode>).map((key) => {
            return <option value={key} key={key}>{GameMode[key]}</option>
        })
    }
    
    changeGameMode(event: React.ChangeEvent<HTMLSelectElement>) {
        const gameMode = this.getGameModeEnum(event.currentTarget.value)
        store.dispatch(setGameMode(gameMode))
    }
    
    getGameModeEnum(gameMode: string) {
        const indexOfS = Object.values(GameMode).indexOf(gameMode as unknown as GameMode);
        return Object.keys(GameMode)[indexOfS] as GameMode
    }
    
    renderColorOptions() {
        return (Object.keys(Color) as Array<keyof typeof Color>).map((key) => {
            return <option value={key} key={key} className={`color${key}`}>{Color[key]}</option>
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

function mapStateToProps(state: RootState): InputManagerComponentProps {
    return { 
        gameMode: state.game.gameMode
    }
}

export default connect(mapStateToProps)(InputManagerComponent)