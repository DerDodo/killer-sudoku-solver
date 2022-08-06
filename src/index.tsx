import * as React from "react";
import { createRoot } from "react-dom/client";
import CellDto from "./dto/CellDto";
import MenuComponent from "./components/MenuComponent";
import { Provider } from "react-redux";
import { store } from "./store"
import BoardComponent from "./components/BoardComponent";
import BoardDto from "./dto/BoardDto";
import Board from "./types/Board";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

const save = localStorage.getItem("board")
var board: Board
if (save) {
  board = new Board(JSON.parse(save) as BoardDto)
} else {
  board = new Board({ cells: initCells(), areas: [] })
}


root.render(
    <Provider store={store}>
      <MenuComponent />
      <BoardComponent board={board} />
    </Provider>
)

export function initCells() {
  let cells: CellDto[][] = []
  for (var row = 0; row < 9; ++row) {
    let rowCells: CellDto[] = []
    for (var col = 0; col < 9; ++col) {
      let index = row * 9 + col
      rowCells.push({ options: [], index: index, selected: false, areaColor: null })
    }
    cells.push(rowCells)
  }
  return cells
}