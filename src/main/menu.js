import { Menu, MenuItem, app } from 'electron'
import { createWindow } from './windows'

export function createContextMenu() {
  const contextMenu = new Menu()

  contextMenu.append(
    new MenuItem({
      label: '设置',
      click: () => {
        createWindow()
      }
    })
  )
  contextMenu.append(
    new MenuItem({
      label: '退出',
      click: () => {
        app.exit()
      }
    })
  )
  return contextMenu
}
