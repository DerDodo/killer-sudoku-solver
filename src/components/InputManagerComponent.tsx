import { Component, ReactNode } from "react"
import { getBoard, getGameMode } from "../store/GameSlice"
import { GameMode } from "../types/GameMode"
import { isValidNumKey, stringToNumber } from "../util/NumberUtil"

export default class InputManagerComponent extends Component {
    constructor(props: unknown) {
        super(props)
        this.keydown = this.keydown.bind(this)
        document.addEventListener("keydown", this.keydown)
    }

    keydown(event: KeyboardEvent): void {
        if (isValidNumKey(event)) {
            switch(getGameMode()) {
                case GameMode.Setup:
                    // Intentionally empty
                    break
                case GameMode.Play:
                    this.enterCellValue(stringToNumber(event.key))
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

    render(): ReactNode {
        return null
    }
}