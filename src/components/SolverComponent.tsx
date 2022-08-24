import * as React from 'react'
import { Component } from 'react'
import { connect } from 'react-redux'
import { RootState } from '../store'
import Board from '../types/Board'
import Solver from '../util/Solver'
import "./SolverComponent.css"

type SolverComponentProps = {
    board: Board
}

type SolverComponentState = {
    solving: boolean
}

class SolverComponent extends Component<SolverComponentProps, SolverComponentState> {

    constructor (props: SolverComponentProps) {
        super(props)
        this.startSolve = this.startSolve.bind(this)
        this.state = {
            solving: false
        }
    }

    render() {
        return (
            <div className="sideMenu">
                <button onClick={ this.startSolve } disabled={ this.state.solving }>Solve</button>
                { this.renderIndicator() }
            </div>
        )
    }

    renderIndicator() {
        if (this.state.solving) {
            return (
                <span>
                    <span>Solving...</span>
                </span>
            )
        } else  {
            return null
        }
    }

    startSolve() {
        this.setSolving(true)
        window.setTimeout(() => {
            const solver = new Solver(this.props.board)
            solver.solve()
            this.setSolving(false)
        }, 10)
    }

    setSolving(solving: boolean) {
        this.setState({
            solving: solving
        })
    }
}

function mapStateToProps(state: RootState): SolverComponentProps {
    return { 
        board: new Board(state.game.board, true)
    }
}

export default connect(mapStateToProps)(SolverComponent);
