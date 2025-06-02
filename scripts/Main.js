/**
 * @param {string} prefix 
 * @param {string} suffix 
 * @returns {string}
 */
function createRandomName(prefix = '', suffix = '') {
  return prefix + Math.random().toString(36).slice(2) + suffix
}







/**
 * @param {string} rgb rgb(r, g, b)
 * @param {number} amount 
 * @returns {string} hsl(h, s%, l%)
 */
function darkenColor(rgb, amount = 0.2) {
  const [r, g, b] = rgb.match(/\d+/g).map(Number)
  const hsl = rgbToHsl(r, g, b)

  hsl[2] = Math.max(0, hsl[2] - amount)

  return `hsl(${Math.round(hsl[0] * 360)}, ${Math.round(hsl[1] * 100)}%, ${Math.round(hsl[2] * 100)}%)`
}

/**
 * @param {number} r 0-255
 * @param {number} g 0-255
 * @param {number} b 0-255
 * @returns {[number, number, number]}
 */
function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0))
        break
      case g:
        h = ((b - r) / d + 2)
        break
      case b:
        h = ((r - g) / d + 4)
        break
    }
    h /= 6
  }

  return [h, s, l]
}

/**
 * @param {number} r 
 * @param {number} g 
 * @param {number} b 
 * @returns {'black' | 'white'}
 */
function getTextColor(r, g, b) {
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 128 ? 'black' : 'white'
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
        newTask.setBackgroundColor()
      }
    })
  })

  bottomButton.addEventListener('click', () => {
    promptForTaskName(ret => {
      if (ret.valid) {
        const newTask = new Task(ret.trimmed)
        task.addTaskBelow(newTask)
        newTask.setBackgroundColor()
      }
    })
  })

  rightButton.addEventListener('click', () => {
    promptForTaskName(ret => {
      if (ret.valid) {
        const newTask = new Task(ret.trimmed)
        task.addTask(newTask)
        newTask.setBackgroundColor()
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
 * @param {string} [initial=''] 
 * @param {string} [placeholder=''] 
 */
function promptForTaskName(callback, initial = '', placeholder = '') {
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
  const input = sleek.createDom(initial)
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

/**
 * @param {(ret: {original: string, picked: string}) => void} callback 
 * @param {string} initial
 */
function promptForColor(callback, initial) {
  let removed = false

  /**
   * @param {KeyboardEvent} e 
   */
  function windowCallback(e) {
    if (!removed && e.key === 'Escape') {
      removed = true
      background.remove()
    }
    window.removeEventListener('keydown', windowCallback)
  }
  window.addEventListener('keydown', windowCallback)

  const background = document.createElement('div')
  background.classList.add('horizontal', 'center', 'overlay')

  const aligner = document.createElement('div')
  aligner.classList.add('vertical', 'center')
  aligner.style.gap = '20px'
  background.appendChild(aligner)

  const colorPicker = new ColorPicker()

  const colorSubmit = document.createElement('button')
  colorSubmit.classList.add('button-27')
  colorSubmit.addEventListener('click', () => {
    if (!removed) {
      removed = true
      background.remove()
    }

    const original = initial
    const picked = colorPicker.getCurrentColor()
    callback({ original, picked })
  })
  colorSubmit.innerText = 'Submit new color'

  colorPicker.appendTo(aligner)
  aligner.append(colorSubmit)
  document.body.appendChild(background)
  colorPicker.initialize(initial)
}

/**
 * @param {({original: string, trimmed: string, valid: boolean}) => void} callback 
 * @param {string} [initial=''] 
 * @param {boolean} [focus=true] 
 */
function promptForTextInput(callback, initial = '', select = true) {
  let removed = false

  const background = document.createElement('div')
  background.classList.add('horizontal', 'center', 'overlay')
  background.addEventListener('click', () => {
    if (removed) return
    removed = true
    background.remove()
  })

  const aligner = document.createElement('div')
  aligner.classList.add('vertical', 'center')
  background.appendChild(aligner)

  const textArea = document.createElement('textarea')
  textArea.value = initial

  function doCallback(e) {
    if (removed) return

    removed = true
    background.remove()

    const original = textArea.value
    const trimmed = original.trim()
    const valid = trimmed.length > 0
    callback({ original, trimmed, valid })
  }

  textArea.addEventListener('click', e => e.stopPropagation())
  textArea.addEventListener('change', doCallback)
  textArea.addEventListener('paste', () => setTimeout(doCallback, 50))

  aligner.append(textArea)
  document.body.appendChild(background)

  textArea.focus()
  if (select === true) textArea.select()
}

/**
 * @param {string} [initial=''] 
 * @param {boolean} [focus=true] 
 */
function promptForTextOutput(initial = '', select = true) {
  let removed = false

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

  const textArea = document.createElement('textarea')
  textArea.value = initial

  textArea.addEventListener('click', e => {
    e.stopPropagation()
  })
  textArea.addEventListener('copy', () => {
    if (!removed) {
      removed = true
      setTimeout(() => background.remove(), 50)
    }
  })

  aligner.append(textArea)
  document.body.appendChild(background)

  textArea.focus()
  if (select === true) textArea.select()
}

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
  constructor(name, style = { backgroundColor: Task.DefaultBackgroundColor }) {
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
      this._expanded = false
      this.hideIcon()
      this.dom.icon.classList.remove('down')
      this.dom.ul.classList.remove('active')
      if (save === true) TaskIO.Save()
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

    if (newColor.length > 0) {
      // set background color
      this.dom.span.style.backgroundColor = newColor
    } else {
      this.dom.span.style.backgroundColor = this.style.backgroundColor
    }

    // get rgb(r, g, b)
    const rgbString = getComputedStyle(this.dom.span).backgroundColor
    const [r, g, b] = rgbString.match(/\d+/g).map(Number)

    // ensure style is updated
    this.style.backgroundColor = rgbString

    if (save === true) TaskIO.Save()

    // get darkened hsl(h, s%, l%)
    const hsl = darkenColor(rgbString)

    // set border color
    this.dom.span.style.borderColor = hsl

    // set text color
    this.dom.span.style.color = getTextColor(r, g, b)
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

const root = document.querySelector('.root')

/**
 * @param {Task} task 
 * @param {boolean} [cascadeStyle=false] 
 */
function addTaskToRoot(task, cascadeStyle = false) {
  root.appendChild(task.createDom())

  /**
   * @param {Task} parent 
   */
  function cascade(parent) {
    parent.setBackgroundColor('', false)
    for (const child of parent.children) cascade(child)
  }
  if (cascadeStyle === true) cascade(task)
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
        newTask.setBackgroundColor()
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
  ContextMenu.SetupEventListeners()
  TaskIO.Load()
}