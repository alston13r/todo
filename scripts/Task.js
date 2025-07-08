class Task {
  /** @type {string} */
  static DefaultBackgroundColor = '#999'

  /** @type {Task} */
  static _CurrentHover = null

  /** @param {Task} */
  static set CurrentHover(v) {
    if (Task._CurrentHover !== v) {
      const oldHover = Task._CurrentHover
      Task._CurrentHover = v
      if (v === null) {
        // start timer for old add buttons
        markCreationButtonsForRemoval(oldHover)
      }
      else if (v instanceof Task) {
        // start timer for old add buttons
        markCreationButtonsForRemoval(oldHover)
        // show add buttons
        addCreationButtonsToTask(v)
      }
    }
  }

  /** @returns {Task} */
  static get CurrentHover() {
    return this._CurrentHover
  }

  /**
   * @param {string} name 
   * @param {{ backgroundColor: string; }} [style={ backgroundColor: Task.DefaultBackgroundColor }] 
   */
  constructor(name = 'New task', style = { backgroundColor: Task.DefaultBackgroundColor }) {
    this.name = name

    this.builtDom = false

    /** @type {Task[]} */
    this.children = []

    /** @type {Task} */
    this.parent = null

    this._expanded = false

    this.style = style
  }

  /**
   * @param {string} newName 
   * @param {boolean} save
   */
  rename(newName, save = true) {
    this.name = newName
    if (this.builtDom) {
      this.dom.text.nodeValue = newName
    }

    if (save === true) TaskIO.Save()
  }

  /**
   * @param {boolean} save 
   */
  removeFromParent(save = true) {
    const parent = this.parent
    if (parent !== null) {
      const parentChildren = this.parent.children
      const i = parentChildren.indexOf(this)
      if (i >= 0) {
        parentChildren.splice(i, 1)
        if (!parent.isGroup()) {
          parent.setExpanded(false, false)
          parent.hideIcon()
        }
      }
    }

    this.parent = null

    if (save === true) TaskIO.Save()
  }

  /**
   * @param {boolean} save 
   */
  remove(save = true) {
    this.removeFromParent(false)
    if (this.builtDom) this.dom.container.remove()
    markCreationButtonsForRemoval(this, true)
    handleEmptyRoot()

    if (save === true) TaskIO.Save()
  }

  /**
   * @param {Task} task 
   * @param {boolean} bubble
   * @param {boolean} save
   */
  addTask(task, bubble = true, save = true) {
    task.removeFromParent(false)
    this.children.push(task)
    task.parent = this

    this.dom.ul.appendChild(task.createDom())
    this.expand(bubble, false)

    if (save === true) {
      task.setBackgroundColor(this.style.backgroundColor, false)
      TaskIO.Save()
    }
  }

  /**
   * @param {Task} task 
   * @param {boolean} save
   */
  addTaskAbove(task, save = true) {
    task.removeFromParent(false)

    // at the root
    if (this.parent === null) return addTaskToRootAboveReference(task, this)

    const siblingIndex = this.parent.children.indexOf(this)
    this.parent.children.splice(siblingIndex, 0, task)
    task.parent = this.parent

    this.createDom().before(task.createDom())

    if (save === true) {
      task.setBackgroundColor(this.parent.style.backgroundColor, false)
      TaskIO.Save()
    }
  }

  /**
   * @param {Task} task 
   * @param {boolean} save
   */
  addTaskBelow(task, save = true) {
    task.removeFromParent(false)

    // at the root
    if (this.parent === null) return addTaskToRootBelowReference(task, this)

    const siblingIndex = this.parent.children.indexOf(this) + 1
    this.parent.children.splice(siblingIndex, 0, task)
    task.parent = this.parent

    this.createDom().after(task.createDom())

    if (save === true) {
      task.setBackgroundColor(this.parent.style.backgroundColor, false)
      TaskIO.Save()
    }
  }

  /**
   * @param {boolean} bubble 
   */
  expand(bubble = true, save = true) {
    this.setExpanded(true, false)
    this.showIcon()

    if (bubble === true) {
      if (this.parent === null && save) TaskIO.Save()
      this.parent?.expand(bubble)
    } else if (save === true) TaskIO.Save()
  }

  /**
   * @param {boolean} save 
   */
  expandAll(save = true) {
    this.setExpanded(true, false)

    for (const child of this.children) {
      child.expandAll(false)
    }

    if (save === true) TaskIO.Save()
  }

  /**
   * @param {boolean} save 
   */
  collapseAll(save = true) {
    this.setExpanded(false, false)

    for (const child of this.children) {
      child.collapseAll(false)
    }

    if (save === true) TaskIO.Save()
  }

  /**
   * @returns {boolean}
   */
  isExpanded() {
    return this._expanded
  }

  /**
   * @param {boolean} newValue 
   * @param {boolean} save 
   */
  setExpanded(newValue, save = true) {
    if (!this.builtDom) return

    if (!this.isGroup()) {
      const old = this._expanded
      this._expanded = false
      this.hideIcon()
      this.dom.icon.classList.remove('down')
      this.dom.ul.classList.remove('active')
      if (save === true && old) TaskIO.Save()
      return
    }

    if (typeof newValue !== 'boolean' || this._expanded === newValue) return
    this._expanded = newValue
    if (this._expanded) {
      this.dom.icon.classList.add('down')
      this.dom.ul.classList.add('active')
    } else {
      this.dom.icon.classList.remove('down')
      this.dom.ul.classList.remove('active')
    }
    if (save === true) TaskIO.Save()
  }

  /**
   * @param {{initialSelection?: number}} args 
   * @returns {HTMLElement}
   */
  createDom(args = { initialSelection: 0 }) {
    if (this.builtDom) return this.dom.container

    const container = document.createElement('li')
    container.addEventListener('mouseover', e => {
      e.stopPropagation()
      Task.CurrentHover = this
    })
    container.addEventListener('mouseleave', e => {
      e.stopPropagation()
      if (Task.CurrentHover === this) Task.CurrentHover = null
    })

    const container2 = document.createElement('div')
    container2.classList.add('horizontal', 'spread')
    container2.style.gap = '40px'

    const span = document.createElement('span')
    const icon = document.createElement('i')
    icon.classList.add('icon', IconManager.Current.name)
    const text = document.createTextNode(this.name)
    span.append(icon, text)

    span.addEventListener('click', () => {
      this.setExpanded(!this.isExpanded())
    })

    span.addEventListener('contextmenu', e => {
      e.preventDefault()
      e.stopPropagation()
      if (this.isGroup()) {
        ContextMenu.CreateGroupContextMenu(e, this)
      } else {
        ContextMenu.CreateTaskContextMenu(e, this)
      }
    })

    const ul = document.createElement('ul')
    ul.classList.add('nested')

    const utilityContainer = document.createElement('div')
    utilityContainer.classList.add('horizontal', 'center')

    const optionsDropdown = document.createElement('select')
    optionsDropdown.name = createRandomName('select-')
    for (const option of OptionManager) {
      optionsDropdown.appendChild(option.createElement())
    }
    optionsDropdown.addEventListener('change', () => {
      const selected = optionsDropdown.options[optionsDropdown.selectedIndex]
      for (const k of selected.style) {
        optionsDropdown.style[k] = selected.style[k]
      }

      TaskIO.Save()
    })
    {
      optionsDropdown.selectedIndex = args.initialSelection
      const selected = optionsDropdown.options[optionsDropdown.selectedIndex]
      for (const k of selected.style) {
        optionsDropdown.style[k] = selected.style[k]
      }
    }

    const trashButton = document.createElement('i')
    trashButton.classList.add('icon', 'icon-trash')
    trashButton.addEventListener('click', () => {
      this.remove()
    })

    utilityContainer.append(optionsDropdown, trashButton)

    container2.append(span, utilityContainer)

    container.append(container2, ul)

    this.dom = {
      container,
      span,
      ul,
      text,
      icon,
      select: optionsDropdown,
    }
    this.builtDom = true

    this.hideIcon()

    container.myTaskReference = this

    return container
  }

  showIcon() {
    if (this.builtDom) {
      this.dom.icon.style.display = 'inline'
    }
  }

  hideIcon() {
    if (this.builtDom) {
      this.dom.icon.style.display = 'none'
    }
  }

  /**
   * @param {string} newColor 
   * @param {boolean} [save=true] 
   */
  setBackgroundColor(newColor = '', save = true) {
    if (!this.builtDom) return

    const c = newColor.length > 0 ? new Color(newColor) : new Color(this.style.backgroundColor)
    const str = c.toRGBString()

    // ensure style is updated
    this.style.backgroundColor = str

    // set background color
    this.dom.span.style.backgroundColor = str

    // set border color
    this.dom.span.style.borderColor = RGBToRGBString(...DarkenColor(c.r, c.g, c.b))

    // set text color
    this.dom.span.style.color = GetTextColor(c.r, c.g, c.b)

    if (save === true) TaskIO.Save()
  }

  /**
   * @returns {boolean}
   */
  isGroup() {
    return this.children.length > 0
  }

  /**
   * @returns {Object}
   */
  serialize() {
    const obj = {}

    obj.name = this.name
    obj.selected = this.dom.select.selectedIndex

    if (this.isGroup()) {
      obj.children = this.children.map(child => child.serialize())
      obj.expanded = this.isExpanded()
    }

    obj.backgroundColor = this.style.backgroundColor
    return obj
  }

  /**
   * @param {{name: string, selected: number, expanded?: boolean, children?: Array}} obj 
   * @returns {Task}
   */
  static FromSerial(obj) {
    let thisTask

    if ('backgroundColor' in obj) {
      thisTask = new Task(obj.name, { backgroundColor: obj.backgroundColor })
    } else {
      thisTask = new Task(obj.name)
    }

    thisTask.createDom({ initialSelection: obj.selected })

    if ('children' in obj) {
      for (const child of obj.children) {
        const childTask = Task.FromSerial(child)
        thisTask.addTask(childTask, false, false)
      }
      thisTask.setExpanded(obj.expanded, false)
    }

    return thisTask
  }
}