import * as React from "react"
import CellComponent from "./CellComponent"
import "./BoardComponent.css"
import Board from "../types/Board"
import Solver from "../util/Solver"
import { Component } from "react"
import { RootState } from "../store"
import { connect } from "react-redux"

type BoardComponentProps = {
    board: Board
}

class BoardComponent extends Component<BoardComponentProps, unknown> {
    constructor (props: BoardComponentProps) {
        super(props)

        this.solve = this.solve.bind(this)
    }

    get board(): Board {
        return this.props.board
    }

    render() {
        return (
            <div>
                <div className="board">
                    {this.renderCells()}
                </div>
                { this.renderSolver() }
            </div>
        )
    }

    renderCells() {
        return this.board.cells.map(row => {
            return row.map(cell => {
                return <CellComponent cell={cell} key={cell.index} />
            })
        }).flat()
    }

    renderSolver() {
        return (
            <div>
                <button onClick={ this.solve }>Solve</button>
            </div>
        )
    }

    solve() {
        const solver = new Solver(this.board)
        solver.solve()
        this.forceUpdate()
    }
}

function mapStateToProps(state: RootState): BoardComponentProps {
    return { 
        board: new Board(state.game.board)
    }
}

export default connect(mapStateToProps)(BoardComponent);