import * as React from 'react'
import { getBoard } from '../store/GameSlice';
import FileManager from '../util/FileManage';
import "./MenuComponent.css"
import { ChangeEvent, Component } from 'react';

export default class MenuComponent extends Component {
    fileManager: FileManager = new FileManager()

    constructor(props: unknown) {
        super(props)
        this.onFileLoad = this.onFileLoad.bind(this)
        this.loadFromFile = this.loadFromFile.bind(this)
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
                <input type="file" id="file-selector" onChange={this.loadFromFile}></input>
            </div>
        )
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
}
