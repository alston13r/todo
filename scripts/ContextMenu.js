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
    // menu.style.left = `${e.pageX - ContextMenu.CreationOffset}px`
    // menu.style.top = `${e.pageY - ContextMenu.CreationOffset}px`

    this.createdOnTarget = e.target

    for (const line of lines) menu.appendChild(line.domElement)

    menu.addEventListener('contextmenu', e => e.preventDefault())

    menu.style.visibility = 'hidden'
    document.body.appendChild(menu)
    const bounds = menu.getBoundingClientRect()

    if (e.clientX + bounds.width >= window.innerWidth) {
      menu.style.left = `${e.pageX - bounds.width}px`
    } else {
      menu.style.left = `${e.pageX}px`
    }

    if (e.clientY + bounds.height >= window.innerHeight) {
      menu.style.top = `${e.pageY - bounds.height}px`
    } else {
      menu.style.top = `${e.pageY}px`
    }
    menu.style.visibility = 'visible'
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
      }),
      new ContextMenuLine('Change color', () => {
        // rgb(r, g, b)
        const bg = task.style.backgroundColor
        function ensureLength(str = '00', len = 2, fill = '0') {
          const t = fill.repeat(len).substring(0, str.length - len)
          return t + str
        }

        const [r, g, b] = bg.match(/\d+/g).map(Number).map(v => ensureLength(v.toString(16)))
        const bgFormatted = '#' + r + g + b

        promptForColor(ret => {
          task.setBackgroundColor(ret.picked)
        }, bgFormatted)
        menu.destroy()
      }),
      new ContextMenuLine('Reset color', () => {
        task.setBackgroundColor(Task.DefaultBackgroundColor)
        menu.destroy()
      }),
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
      new ContextMenuLine('Change color', () => {
        // rgb(r, g, b)
        const bg = task.style.backgroundColor
        function ensureLength(str = '00', len = 2, fill = '0') {
          const t = fill.repeat(len).substring(0, str.length - len)
          return t + str
        }

        const [r, g, b] = bg.match(/\d+/g).map(Number).map(v => ensureLength(v.toString(16)))
        const bgFormatted = '#' + r + g + b

        promptForColor(ret => {
          task.setBackgroundColor(ret.picked)
        }, bgFormatted)
        menu.destroy()
      }),
      new ContextMenuLine('Reset color', () => {
        task.setBackgroundColor(Task.DefaultBackgroundColor)
        menu.destroy()
      }),
      new ContextMenuLine('Expand all', () => {
        task.expandAll()
        menu.destroy()
      }),
      new ContextMenuLine('Collapse all', () => {
        task.collapseAll()
        menu.destroy()
      }),
    ])

    ContextMenu.Current = menu
    return menu
  }

  static CreateBackgroundContextMenu(e) {
    ContextMenu.DestroyCurrent()

    const menu = new ContextMenu(e, [
      new ContextMenuLine('Export tasks', () => {
        TaskIO.Export()
        menu.destroy()
      }),
      new ContextMenuLine('Import tasks', () => {
        TaskIO.Import()
        menu.destroy()
      }),
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

    /**
     * @param {PointerEvent} e 
     */
    const documentContextCallback = e => {
      e.preventDefault()
      ContextMenu.CreateBackgroundContextMenu(e)
    }

    ContextMenu.Listeners = {
      documentClickCallback,
      windowContextmenuCallback,
      documentContextCallback,
    }

    document.addEventListener('click', documentClickCallback)
    window.addEventListener('contextmenu', windowContextmenuCallback)
    document.addEventListener('contextmenu', documentContextCallback)
  }

  static DestroyEventListeners() {
    if (ContextMenu.Listeners === null) return

    document.removeEventListener('click', ContextMenu.Listeners.documentClickCallback)
    window.removeEventListener('contextmenu', ContextMenu.Listeners.windowContextmenuCallback)
    document.removeEventListener('contextmenu', ContextMenu.Listeners.documentContextCallback)

    ContextMenu.Listeners = null
  }
}