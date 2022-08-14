import * as FileSaver from "file-saver";
import BoardDto from "../dto/BoardDto";
import CellDto from "../dto/CellDto";
import Board from "../types/Board";

export default class FileManager {
    private static get LOCAL_STORAGE_ID(): string { return "board" }
    private static get DOWNLOAD_FILE_NAME(): string { return "sudoku.json" }
    private static get DOWNLOAD_FILE_TYPE(): string { return "text/plain;charset=utf-8" }

    public saveToLocalStorage(board: Board): void {
        localStorage.setItem(FileManager.LOCAL_STORAGE_ID, JSON.stringify(board.toDto()))
    }

    public saveStringToLocalStorage(board: string): void {
        localStorage.setItem(FileManager.LOCAL_STORAGE_ID, board)
    }
    
    public deleteLocalStorage(): void {
        localStorage.removeItem(FileManager.LOCAL_STORAGE_ID)
    }

    public saveToFile(board: Board): void {
        FileSaver.saveAs(new File([JSON.stringify(board.toDto())], FileManager.DOWNLOAD_FILE_NAME, {type: FileManager.DOWNLOAD_FILE_TYPE}))
    }

    public loadInitialBoard(): Board {
        const save = localStorage.getItem(FileManager.LOCAL_STORAGE_ID)

        if (save) {
          return new Board(JSON.parse(save) as BoardDto)
        } else {
          return new Board({ cells: this.initCells(), areas: [] })
        }
    }

    private initCells(): CellDto[][] {
      const cells: CellDto[][] = []
      for (let row = 0; row < 9; ++row) {
        const rowCells: CellDto[] = []
        for (let col = 0; col < 9; ++col) {
          const index = row * 9 + col
          rowCells.push({ options: [], index: index, selected: false, areaColor: null })
        }
        cells.push(rowCells)
      }
      return cells
    }
}