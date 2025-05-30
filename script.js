/** @type {HTMLElement} */
let ctxMenu = null
const contextMenuRemovalCountdown = 0.2
let contextMenuRemovalNumber = null
let contextMenuMarked = false
let contextMenuCreatedOn = null

function destroyContextMenu() {
  if (ctxMenu === null) return
  ctxMenu.remove()
  ctxMenu = null
  contextMenuRemovalNumber = null
  contextMenuMarked = false
  contextMenuCreatedOn = null
}

function markContextMenuForRemoval() {
  if (ctxMenu === null) return
  if (contextMenuMarked) return

  contextMenuRemovalNumber = setTimeout(() => {
    destroyContextMenu()
  }, contextMenuRemovalCountdown * 1000)

  contextMenuMarked = true
}

document.addEventListener('click', e => {
  if (ctxMenu === null) return
  if (!ctxMenu.contains(e.target)) markContextMenuForRemoval()
})
window.addEventListener('contextmenu', e => {
  if (ctxMenu === null) return
  if (contextMenuCreatedOn === e.target) return
  if (!ctxMenu.contains(e.target)) markContextMenuForRemoval()
})

/**
 * @param {PointerEvent} e 
 * @param {Task} task
 */
function createContextMenu(e, task) {
  destroyContextMenu()

  const menu = document.createElement('ul')
  ctxMenu = menu
  contextMenuCreatedOn = e.target
  menu.classList.add('ctx-menu')
  menu.style.left = `${e.pageX - 7}px`
  menu.style.top = `${e.pageY - 7}px`

  const line = document.createElement('li')
  const lineSpan = document.createElement('span')

  line.appendChild(lineSpan)
  lineSpan.innerText = 'Rename'
  lineSpan.addEventListener('click', () => {
    promptForTaskName(ret => {
      if (ret.valid) {
        task.rename(ret.trimmed)
      }
    }, task.name)
    markContextMenuForRemoval()
  })

  menu.appendChild(line)

  menu.addEventListener('mouseleave', () => {
    markContextMenuForRemoval()
  })
  menu.addEventListener('contextmenu', e => {
    e.preventDefault()
  })

  document.body.appendChild(menu)
}







class SleekInput {
  /**
   * @param {string} placeholder 
   */
  constructor(placeholder = '') {
    this.placeholder = placeholder

    const span = document.createElement('span')
    span.style.whiteSpace = 'pre'
    span.style.visibility = 'hidden'

    this.tempSpan = span

    this.builtDom = false
  }

  /**
   * @param {string} initialValue
   * @returns {HTMLElement}
   */
  createDom(initialValue = '') {
    const input = document.createElement('input')
    input.type = 'text'
    input.classList.add('sleek')
    input.placeholder = this.placeholder

    this.domElement = input
    this.builtDom = true

    input.addEventListener('input', () => {
      this.updateWidth(input.value)
    })
    input.value = initialValue
    this.updateWidth(initialValue)

    return this.domElement
  }

  /**
   * @param {string} input 
   */
  updateWidth(input) {
    if (!this.builtDom) return

    const span = this.tempSpan
    span.style.font = getComputedStyle(this.domElement).font
    document.body.appendChild(span)

    if (input.length === 0) span.textContent = this.placeholder
    else span.textContent = input

    const width = span.offsetWidth
    this.domElement.style.width = width + 'px'

    span.remove()
  }
}























/** @type {Map<Task, Object>} */
const taskToButtonsMap = new Map()

const buttonDistanceConstant = 2
const buttonRemovalCountdown = 0.2

/**
 * @param {Task} task 
 * @param {boolean} immediate
 */
function markCreationButtonsForRemoval(task, immediate = false) {
  if (task === null) return
  if (!taskToButtonsMap.has(task)) return

  const val = taskToButtonsMap.get(task)
  if (immediate === true) {
    val.topButton.remove()
    val.bottomButton.remove()
    val.rightButton.remove()
    taskToButtonsMap.delete(task)
    return
  }

  if (val.marked) return

  val.timeout = setTimeout(() => {
    val.topButton.remove()
    val.bottomButton.remove()
    val.rightButton.remove()
    taskToButtonsMap.delete(task)
  }, buttonRemovalCountdown * 1000)
}

/**
 * @param {Task} task 
 */
function addCreationButtonsToTask(task) {
  if (taskToButtonsMap.has(task)) {
    // ensure not marked for removal
    clearTimeout(taskToButtonsMap.get(task).timeout)
    return
  }
  if (!task.builtDom) return

  const topButton = document.createElement('button')
  topButton.classList.add('is-plus')
  topButton.innerText = '+'

  const bottomButton = document.createElement('button')
  bottomButton.classList.add('is-plus')
  bottomButton.innerText = '+'

  const rightButton = document.createElement('button')
  rightButton.classList.add('is-plus')
  rightButton.innerText = '+'

  task.dom.container.append(topButton, bottomButton, rightButton)

  topButton.addEventListener('click', () => {
    promptForTaskName(ret => {
      if (ret.valid) {
        const newTask = new Task(ret.trimmed)
        task.addTaskAbove(newTask)
      }
    })
  })

  bottomButton.addEventListener('click', () => {
    promptForTaskName(ret => {
      if (ret.valid) {
        const newTask = new Task(ret.trimmed)
        task.addTaskBelow(newTask)
      }
    })
  })

  rightButton.addEventListener('click', () => {
    promptForTaskName(ret => {
      if (ret.valid) {
        const newTask = new Task(ret.trimmed)
        task.addTask(newTask)
      }
    })
  })

  const spanBounds = task.dom.span.getBoundingClientRect()

  topButton.style.left = '10px'
  topButton.style.top = `${-buttonDistanceConstant}px`

  bottomButton.style.left = '10px'
  bottomButton.style.bottom = `${-buttonDistanceConstant}px`

  const rightBounds = rightButton.getBoundingClientRect()
  rightButton.style.left = `${spanBounds.width + 5}px`
  rightButton.style.top = `${spanBounds.height / 2 - rightBounds.height / 2}px`

  taskToButtonsMap.set(task, {
    topButton, bottomButton, rightButton,
    marked: false
  })
}

/**
 * @param {(ret: {original: string, trimmed: string, valid: boolean}) => void} callback 
 * @param {string} placeholder
 */
function promptForTaskName(callback, placeholder = '') {
  let removed = false
  let escaped = false

  const background = document.createElement('div')
  background.classList.add('horizontal', 'center', 'overlay')
  background.addEventListener('click', () => {
    if (!removed) {
      removed = true
      background.remove()
    }
  })

  const aligner = document.createElement('div')
  aligner.classList.add('vertical', 'center')
  background.appendChild(aligner)

  const sleek = new SleekInput(placeholder)
  const input = sleek.createDom()
  input.addEventListener('change', () => {
    if (!removed) {
      removed = true
      background.remove()
    }

    if (escaped) return

    const original = input.value
    const trimmed = original.trim()
    const valid = trimmed.length > 0
    callback({ original, trimmed, valid })
  })
  input.addEventListener('keydown', e => {
    if (!removed && e.key === 'Escape') {
      escaped = true
      removed = true
      background.remove()
    }
  })

  aligner.appendChild(input)

  document.body.appendChild(background)
  input.focus()
}

class Task {
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
   */
  constructor(name) {
    this.name = name

    this.builtDom = false

    /** @type {Task[]} */
    this.children = []

    /** @type {Task} */
    this.parent = null

    this._extended = false
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
        if (parentChildren.length === 0) {
          parent.setExtended(false, false)
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
    this.extend(bubble, false)

    if (save === true) TaskIO.Save()
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

    if (save === true) TaskIO.Save()
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

    if (save === true) TaskIO.Save()
  }

  /**
   * @param {boolean} bubble 
   */
  extend(bubble = true, save = true) {
    this.setExtended(true, false)
    this.showIcon()

    if (bubble === true) {
      if (this.parent === null && save) TaskIO.Save()
      this.parent?.extend(bubble)
    } else if (save === true) TaskIO.Save()
  }

  /**
   * @returns {boolean}
   */
  isExtended() {
    return this._extended
  }

  /**
   * @param {boolean} newValue 
   * @param {boolean} save 
   */
  setExtended(newValue, save = true) {
    if (!this.builtDom) return

    if (this.children.length === 0) {
      this._extended = false
      this.hideIcon()
      this.dom.icon.classList.remove('down')
      this.dom.ul.classList.remove('active')
      if (save === true) TaskIO.Save()
      return
    }

    if (typeof newValue !== 'boolean' || this._extended === newValue) return
    this._extended = newValue
    if (this._extended) {
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
    container2.classList.add('inlineSpread')

    const span = document.createElement('span')
    const icon = document.createElement('i')
    icon.classList.add('icon', IconManager.Current.name)
    const text = document.createTextNode(this.name)
    span.append(icon, text)

    span.addEventListener('click', () => {
      this.setExtended(!this.isExtended())
    })

    span.addEventListener('contextmenu', e => {
      e.preventDefault()
      createContextMenu(e, this)
    })

    const ul = document.createElement('ul')
    ul.classList.add('nested')

    const utilityContainer = document.createElement('div')
    utilityContainer.classList.add('horizontal')

    const optionsDropdown = document.createElement('select')
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
   * @returns {Object}
   */
  serialize() {
    const obj = {}

    obj.name = this.name
    obj.selected = this.dom.select.selectedIndex

    if (this.children.length > 0) {
      obj.children = this.children.map(child => child.serialize())
      obj.extended = this.isExtended()
    }

    return obj
  }

  /**
   * @param {{name: string, selected: number, extended?: boolean, children?: Array}} obj 
   * @returns {Task}
   */
  static FromSerial(obj) {
    const thisTask = new Task(obj.name)
    thisTask.createDom({ initialSelection: obj.selected })

    if ('children' in obj) {
      for (const child of obj.children) {
        const childTask = Task.FromSerial(child)
        thisTask.addTask(childTask, false, false)
      }
      thisTask.setExtended(obj.extended, false)
    }

    return thisTask
  }
}

const root = document.querySelector('.root')

/**
 * @param {Task} task 
 */
function addTaskToRoot(task) {
  root.appendChild(task.createDom())
}

/**
 * @param {Task} task 
 * @param {Task} reference 
 * @param {boolean} save
 */
function addTaskToRootAboveReference(task, reference, save = true) {
  task.removeFromParent(false)
  root.insertBefore(task.createDom(), reference.createDom())
  if (save === true) TaskIO.Save()
}

/**
 * @param {Task} task 
 * @param {Task} reference 
 * @param {boolean} save
 */
function addTaskToRootBelowReference(task, reference, save = true) {
  task.removeFromParent(false)
  reference.createDom().after(task.createDom())
  if (save === true) TaskIO.Save()
}

function addCreateButtonToRoot() {
  const button = document.createElement('button')
  button.classList.add('is-plus')
  button.innerText = '+'

  root.appendChild(button)

  button.addEventListener('click', () => {
    promptForTaskName(ret => {
      if (ret.valid) {
        const newTask = new Task(ret.trimmed)
        addTaskToRoot(newTask)
        button.remove()
        TaskIO.Save()
      }
    })
  })
}

function handleEmptyRoot() {
  if (root.children.length === 0) addCreateButtonToRoot()
}

function isRootEmpty() {
  if (root.children.length === 0) return true
  if (root.children[0].tagName === 'BUTTON') return true
  return false
}

document.body.onload = () => {
  TaskIO.Load()
  handleEmptyRoot()
}