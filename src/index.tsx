import * as React from "react"
import { createRoot } from "react-dom/client"
import MenuComponent from "./components/MenuComponent"
import { Provider } from "react-redux"
import { store } from "./store"
import BoardComponent from "./components/BoardComponent"
import Board from "./types/Board"
import "./index.css"
import FileManager from "./util/FileManage"

const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

const fileManager = new FileManager()
var board: Board = fileManager.loadInitialBoard()

root.render(
    <Provider store={store}>
      <MenuComponent board={board} />
      <BoardComponent board={board} />
    </Provider>
)