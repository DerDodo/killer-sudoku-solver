import * as React from 'react'
import { getBoard, setBoard } from '../store/GameSlice'
import FileManager from '../util/FileManager'
import "./MenuComponent.css"
import { ChangeEvent, Component } from 'react'
import ScreenshotParser from '../util/ScreenshotParser'
import { store } from '../store'

export default class MenuComponent extends Component {
    fileManager: FileManager = new FileManager()
    imageData: string = null

    constructor(props: unknown) {
        super(props)
        this.onFileLoad = this.onFileLoad.bind(this)
        this.onScreenshotLoad = this.onScreenshotLoad.bind(this)
        this.loadFromFile = this.loadFromFile.bind(this)
        this.loadFromScreenshot = this.loadFromScreenshot.bind(this)
    }

    render() {
        return (
            <div className="fileMenu">
                <button onClick={() => this.save()}>Save</button>
                <button onClick={() => this._delete()}>Delete</button>
                <button onClick={() => this.saveToFile()}>Save to file</button>
                <label htmlFor="file-selector" className="custom-file-upload">
                    Upload file
                </label>
                <input type="file" id="file-selector" accept="application/json" onChange={this.loadFromFile}></input>
                <label htmlFor="screenshot-selector" className="custom-file-upload">
                    Upload screenshot
                </label>
                <input type="file" id="screenshot-selector" accept="image/*" onChange={this.loadFromScreenshot}></input>
                {this.renderImage()}
            </div>
        )
    }

    renderImage() {
        if (this.imageData != null) {
            return <img src={"data:image/png;base64, " + this.imageData} />
        } else {
            return null
        }
    }

    save() {
        this.fileManager.saveToLocalStorage(getBoard())
    }
    
    _delete() {
        this.fileManager.deleteLocalStorage()
        window.location.reload()
    }
    
    saveToFile() {
        this.fileManager.saveToFile(getBoard())
    }
    
    loadFromFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.currentTarget.files[0]
        if (file.type && file.type != 'application/json') {
            console.log('File is not a json.', file.type, file)
            return
        }
        const reader = new FileReader()
        reader.addEventListener('load', this.onFileLoad)
        reader.readAsText(file);
    }

    onFileLoad(event: ProgressEvent<FileReader>) {
        this.fileManager.saveStringToLocalStorage(event.target.result.toString())
        window.location.reload()
    }

    loadFromScreenshot(event: ChangeEvent<HTMLInputElement>) {
        const file = event.currentTarget.files[0]
        if (file.type && !file.type.startsWith('image/')) {
            console.log('File is not an image.', file.type, file)
            return
        }
        const reader = new FileReader()
        reader.addEventListener('load', this.onScreenshotLoad)
        reader.readAsDataURL(file);
    }

    async onScreenshotLoad(event: ProgressEvent<FileReader>) {
        const parser = new ScreenshotParser()
        parser.load(event.target.result as string).then(() => {
            const board = parser.parse()
            this.fileManager.saveDtoToLocalStorage(board)
            //this.imageData = parser.getDataForImg()
            this.forceUpdate()
            store.dispatch(setBoard(board))
        })
    }
}
