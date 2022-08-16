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

class SolverComponent extends Component<SolverComponentProps, never> {
    constructor (props: SolverComponentProps) {
        super(props)
        this.solve = this.solve.bind(this)
    }

    render() {
        return (
            <div className="sideMenu">
                <button onClick={ this.solve }>Solve</button>
            </div>
        )
    }

    solve() {
        const solver = new Solver(this.props.board)
        solver.solve()
        this.forceUpdate()
    }
}

function mapStateToProps(state: RootState): SolverComponentProps {
    return { 
        board: new Board(state.game.board)
    }
}

export default connect(mapStateToProps)(SolverComponent);
