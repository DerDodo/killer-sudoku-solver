import * as React from "react"
import CellComponent from "./CellComponent"
import "./BoardComponent.css"
import Board from "../types/Board"
import { Component } from "react"
import { RootState } from "../store"
import { connect } from "react-redux"

type BoardComponentProps = {
    board: Board
}

class BoardComponent extends Component<BoardComponentProps, unknown> {
    constructor (props: BoardComponentProps) {
        super(props)
    }

    render() {
        return (
            <div className="board">
                {this.renderCells()}
            </div>
        )
    }

    renderCells() {
        return this.props.board.cells.map(row => {
            return row.map(cell => {
                return <CellComponent cell={cell} key={cell.index} />
            })
        }).flat()
    }
}

function mapStateToProps(state: RootState): BoardComponentProps {
    return { 
        board: new Board(state.game.board, true)
    }
}

export default connect(mapStateToProps)(BoardComponent);