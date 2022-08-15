import { Component, ReactNode } from "react"
import { store } from "../store"
import { getBoard, getGameMode, setCellValue, SetCellValuePaylod } from "../store/GameSlice"
import { GameMode } from "../types/GameMode"
import { stringToNumber } from "../util/NumberUtil"

export default class InputManagerComponent extends Component {
    constructor(props: unknown) {
        super(props)
        this.keydown = this.keydown.bind(this)
        document.addEventListener("keydown", this.keydown)
    }

    keydown(event: KeyboardEvent): void {
        const allowedKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
        if (allowedKeys.includes(event.key)) {
            switch(getGameMode()) {
                case GameMode.Setup:

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
                store.dispatch(setCellValue({cellId: cells[0].index, value: val} as SetCellValuePaylod))
            }
        }
    }

    render(): ReactNode {
        return null
    }
}