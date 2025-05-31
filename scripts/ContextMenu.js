class ContextMenuLine {
  /**
   * @param {string} text 
   * @param {(e: MouseEvent) => void} callback 
   */
  constructor(text, callback) {
    const line = document.createElement('li')
    this.domElement = line

    const lineSpan = document.createElement('span')

    line.appendChild(lineSpan)
    lineSpan.innerText = text
    lineSpan.addEventListener('click', callback)
  }
}

class ContextMenu {
  /** @type {ContextMenu} */
  static Current = null

  /** @type {number} */
  static CreationOffset = 7

  /** @type {number} */
  static RemovalCountdown = 0.2

  /**
   * @param {PointerEvent} e 
   * @param {ContextMenuLine[]} lines 
   */
  constructor(e, lines) {
    /** @type {boolean} */
    this.destroyed = false
    /** @type {number} */
    this.timeout = null

    const menu = document.createElement('ul')
    this.domElement = menu
    menu.classList.add('ctx-menu')
    menu.style.left = `${e.pageX - ContextMenu.CreationOffset}px`
    menu.style.top = `${e.pageY - ContextMenu.CreationOffset}px`

    this.createdOnTarget = e.target

    for (const line of lines) menu.appendChild(line.domElement)

    menu.addEventListener('contextmenu', e => e.preventDefault())

    document.body.appendChild(menu)
  }

  destroy() {
    if (this.destroyed) return
    this.domElement.remove()
    this.destroyed = true
    if (ContextMenu.Current === this) ContextMenu.Current = null
  }

  /**
   * @param {HTMLElement} element 
   * @returns {boolean}
   */
  contains(element) {
    return this.domElement.contains(element)
  }

  static DestroyCurrent() {
    ContextMenu.Current?.destroy()
  }

  /**
   * @param {PointerEvent} e 
   * @param {Task} task 
   * 
   * @returns {ContextMenu}
   */
  static CreateTaskContextMenu(e, task) {
    ContextMenu.DestroyCurrent()

    const menu = new ContextMenu(e, [
      new ContextMenuLine('Rename', () => {
        promptForTaskName(ret => {
          if (ret.valid) {
            task.rename(ret.trimmed)
          }
        }, task.name)
        menu.destroy()
      })
    ])

    ContextMenu.Current = menu
    return menu
  }

  /**
   * @param {PointerEvent} e 
   * @param {Task} task 
   * 
   * @returns {ContextMenu}
   */
  static CreateGroupContextMenu(e, task) {
    ContextMenu.DestroyCurrent()

    const menu = new ContextMenu(e, [
      new ContextMenuLine('Rename', () => {
        promptForTaskName(ret => {
          if (ret.valid) {
            task.rename(ret.trimmed)
          }
        }, task.name)
        menu.destroy()
      }),
      new ContextMenuLine('Expand all', () => {
        task.expandAll()
        menu.destroy()
      }),
      new ContextMenuLine('Collapse all', () => {
        task.collapseAll()
        menu.destroy()
      })
    ])

    ContextMenu.Current = menu
    return menu
  }

  /** @type {Object} */
  static Listeners = null

  static SetupEventListeners() {
    if (ContextMenu.Listeners !== null) return

    /**
     * @param {MouseEvent} e 
     */
    const documentClickCallback = e => {
      if (ContextMenu.Current === null) return
      if (!ContextMenu.Current.contains(e.target)) ContextMenu.DestroyCurrent()
    }

    /**
     * @param {PointerEvent} e 
     */
    const windowContextmenuCallback = e => {
      if (ContextMenu.Current === null) return
      if (ContextMenu.Current.createdOnTarget === e.target) return
      if (!ContextMenu.Current.contains(e.target)) ContextMenu.DestroyCurrent()
    }

    ContextMenu.Listeners = {
      documentClickCallback,
      windowContextMenuCallback: windowContextmenuCallback
    }

    document.addEventListener('click', documentClickCallback)
    window.addEventListener('contextmenu', windowContextmenuCallback)
  }

  static DestroyEventListeners() {
    if (ContextMenu.Listeners === null) return

    document.removeEventListener('click', ContextMenu.Listeners.documentClickCallback)
    window.removeEventListener('contextmenu', ContextMenu.Listeners.windowContextmenuCallback)

    ContextMenu.Listeners = null
  }
}