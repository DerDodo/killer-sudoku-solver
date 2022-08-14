import * as React from "react"
import { createRoot } from "react-dom/client"
import MenuComponent from "./components/MenuComponent"
import { Provider } from "react-redux"
import { store } from "./store"
import BoardComponent from "./components/BoardComponent"
import "./index.css"
import InputManagerComponent from "./components/InputManagerComponent"

const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

root.render(
    <Provider store={store}>
      <InputManagerComponent />
      <MenuComponent />
      <BoardComponent />
    </Provider>
)