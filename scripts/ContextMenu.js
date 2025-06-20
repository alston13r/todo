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

class TaskPrompt {
  /**
   * @param {Task} task 
   */
  constructor(task) {
    let escaped = false
    let removed = false

    const span = document.createElement('span')
    span.style.whiteSpace = 'pre'
    span.style.visibility = 'hidden'

    const taskName = task.name
    const input = document.createElement('input')
    input.classList.add('new-input')

    const style = getComputedStyle(task.dom.span)
    input.style.font = style.font
    input.style.color = style.color

    input.style.caretColor = style.color

    /**
     * @param {string} text 
     */
    function updateWidth(text) {
      document.body.appendChild(span)

      if (text.length === 0) span.textContent = task.name
      else span.textContent = text

      const width = span.offsetWidth
      input.style.width = width + 'px'

      span.remove()
    }

    input.name = createRandomName('input-')
    input.value = taskName
    input.placeholder = taskName
    task.dom.text.replaceWith(input)
    task.dom.text = null
    input.focus()

    updateWidth(task.name)

    input.addEventListener('click', e => {
      e.stopPropagation()
    })
    function windowClick() {
      if (!removed) {
        removed = true
        const text = document.createTextNode(taskName)
        input.replaceWith(text)
        task.dom.text = text
      }
      window.removeEventListener('click', windowClick)
    }

    input.addEventListener('input', () => {
      updateWidth(input.value)
    })

    input.addEventListener('change', () => {
      window.removeEventListener('click', windowClick)
      if (!removed) removed = true
      if (escaped) return

      const original = input.value
      const trimmed = original.trim()
      const valid = trimmed.length > 0

      const text = document.createTextNode(valid ? trimmed : taskName)
      input.replaceWith(text)
      task.dom.text = text
      if (valid) task.rename(trimmed)
    })

    input.addEventListener('keydown', e => {
      if (!removed && e.key === 'Escape') {
        window.removeEventListener('click', windowClick)
        escaped = true
        removed = true
        const text = document.createTextNode(taskName)
        input.replaceWith(text)
        task.dom.text = text
      }
    })

    window.addEventListener('click', windowClick)
  }
}

class ContextMenu {
  /** @type {ContextMenu} */
  static Current = null

  /** @type {number} */
  static CreationOffset = 20

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
    menu.addEventListener('click', e => e.stopPropagation())
    this.domElement = menu
    menu.classList.add('ctx-menu')

    this.createdOnTarget = e.target

    for (const line of lines) menu.appendChild(line.domElement)

    menu.addEventListener('contextmenu', e => e.preventDefault())

    menu.style.visibility = 'hidden'
    document.body.appendChild(menu)
    const bounds = menu.getBoundingClientRect()

    menu.style.left = e.pageX - (e.clientX + bounds.width >= window.innerWidth - ContextMenu.CreationOffset ? bounds.width : 0) + 'px'
    menu.style.top = e.pageY - (e.clientY + bounds.height >= window.innerHeight - ContextMenu.CreationOffset ? bounds.height : 0) + 'px'

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
        new TaskPrompt(task)
        menu.destroy()
      }),
      new ContextMenuLine('Change color', () => {
        PromptForColor(ret => {
          task.setBackgroundColor(ret.picked)
        }, task.style.backgroundColor)
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
        new TaskPrompt(task)
        menu.destroy()
      }),
      new ContextMenuLine('Change color', () => {
        PromptForColor(ret => {
          task.setBackgroundColor(ret.picked)
        }, task.style.backgroundColor)
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
      new ContextMenuLine('Import tasks', () => {
        TaskIO.Import()
        menu.destroy()
      }),
      new ContextMenuLine('Export tasks', () => {
        TaskIO.Export()
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
     * @param {KeyboardEvent} e 
     */
    const windowKeydownCallback = e => {
      if (ContextMenu.Current === null) return
      if (e.key === 'Escape') ContextMenu.DestroyCurrent()
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
      windowKeydownCallback,
    }

    document.addEventListener('click', documentClickCallback)
    window.addEventListener('contextmenu', windowContextmenuCallback)
    document.addEventListener('contextmenu', documentContextCallback)
    window.addEventListener('keydown', windowKeydownCallback)
  }

  static DestroyEventListeners() {
    if (ContextMenu.Listeners === null) return

    document.removeEventListener('click', ContextMenu.Listeners.documentClickCallback)
    window.removeEventListener('contextmenu', ContextMenu.Listeners.windowContextmenuCallback)
    document.removeEventListener('contextmenu', ContextMenu.Listeners.documentContextCallback)
    window.removeEventListener('keydown', ContextMenu.Listeners.windowKeydownCallback)

    ContextMenu.Listeners = null
  }
}