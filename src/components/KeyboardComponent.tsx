import * as React from 'react'
import { Component } from 'react'
import { numbers1to9 } from '../util/NumberUtil'
import "./KeyboardComponent.css"

export default class KeyboardComponent extends Component {

    constructor(props: unknown) {
        super(props)
    }

    render() {
        return (
            <div className="keyboard">
                <button onClick={() => this.sendNumKey(0)}>{ 0 }</button>
                { this.renderButtons() }
                <button onClick={() => this.sendBackspace()}>&larr;</button>
                <button onClick={() => this.sendEnter()}>&#x2713;</button>
            </div>
        )
    }

    renderButtons() {
        return numbers1to9().map(num => {
            return <button key={"keyboard" + num} onClick={() => this.sendNumKey(num)}>{ num }</button>
        })
    }

    sendNumKey(num: number) {
        document.dispatchEvent(new KeyboardEvent("keydown", {"key": num.toString()} as KeyboardEventInit))
    }

    sendBackspace() {
        document.dispatchEvent(new KeyboardEvent("keydown", {"code": "Backspace"} as KeyboardEventInit))
    }

    sendEnter() {
        document.dispatchEvent(new KeyboardEvent("keydown", {"code": "Enter"} as KeyboardEventInit))
    }
}
