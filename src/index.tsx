import * as React from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./store"
import MenuComponent from "./components/MenuComponent"
import BoardComponent from "./components/BoardComponent"
import InputManagerComponent from "./components/InputManagerComponent"
import "./index.css"

const rootElement = document.getElementById("root")
const root = createRoot(rootElement)

root.render(
    <Provider store={store}>
      <MenuComponent />
      <InputManagerComponent />
      <BoardComponent />
    </Provider>
)