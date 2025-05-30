/** @type {Map<Item, Object>} */
const itemToButtonsMap = new Map()

const buttonDistanceConstant = 2
const buttonRemovalCountdown = 0.2

/**
 * @param {Item} item 
 * @param {boolean} immediate
 */
function markCreationButtonsForRemoval(item, immediate = false) {
  if (item === null) return
  if (!itemToButtonsMap.has(item)) return

  const val = itemToButtonsMap.get(item)
  if (immediate === true) {
    val.topButton.remove()
    val.bottomButton.remove()
    val.rightButton.remove()
    itemToButtonsMap.delete(item)
    return
  }

  if (val.marked) return

  val.timeout = setTimeout(() => {
    val.topButton.remove()
    val.bottomButton.remove()
    val.rightButton.remove()
    itemToButtonsMap.delete(item)
  }, buttonRemovalCountdown * 1000)
}

/**
 * @param {Item} item 
 */
function addCreationButtonsToItem(item) {
  if (itemToButtonsMap.has(item)) {
    // ensure not marked for removal
    clearTimeout(itemToButtonsMap.get(item).timeout)
    return
  }
  if (!item.builtDom) return

  const topButton = document.createElement('button')
  topButton.classList.add('is-plus')
  topButton.innerText = '+'

  const bottomButton = document.createElement('button')
  bottomButton.classList.add('is-plus')
  bottomButton.innerText = '+'

  const rightButton = document.createElement('button')
  rightButton.classList.add('is-plus')
  rightButton.innerText = '+'

  item.dom.container.append(topButton, bottomButton, rightButton)

  topButton.addEventListener('click', () => {
    promptForNewTask(ret => {
      if (ret.valid) {
        const newTask = new Item(ret.trimmed)
        item.addItemAbove(newTask)
      }
    })
  })

  bottomButton.addEventListener('click', () => {
    promptForNewTask(ret => {
      if (ret.valid) {
        const newTask = new Item(ret.trimmed)
        item.addItemBelow(newTask)
      }
    })
  })

  rightButton.addEventListener('click', () => {
    promptForNewTask(ret => {
      if (ret.valid) {
        const newTask = new Item(ret.trimmed)
        item.addItem(newTask)
      }
    })
  })

  const spanBounds = item.dom.span.getBoundingClientRect()

  topButton.style.left = '10px'
  topButton.style.top = `${-buttonDistanceConstant}px`

  bottomButton.style.left = '10px'
  bottomButton.style.bottom = `${-buttonDistanceConstant}px`

  const rightBounds = rightButton.getBoundingClientRect()
  rightButton.style.left = `${spanBounds.width + 5}px`
  rightButton.style.top = `${spanBounds.height / 2 - rightBounds.height / 2}px`

  itemToButtonsMap.set(item, {
    topButton, bottomButton, rightButton,
    marked: false
  })
}

function promptForNewTask(callback) {
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

  const input = document.createElement('input')
  input.type = 'text'
  input.classList.add('sleek')
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

class Item {
  /** @type {Item} */
  static _CurrentHover = null

  /** @param {Item} */
  static set CurrentHover(v) {
    if (Item._CurrentHover !== v) {
      const oldHover = Item._CurrentHover
      Item._CurrentHover = v
      if (v === null) {
        // start timer for old add buttons
        markCreationButtonsForRemoval(oldHover)
      }
      else if (v instanceof Item) {
        // start timer for old add buttons
        markCreationButtonsForRemoval(oldHover)
        // show add buttons
        addCreationButtonsToItem(v)
      }
    }
  }

  /** @returns {Item} */
  static get CurrentHover() {
    return this._CurrentHover
  }

  /**
   * @param {string} name 
   */
  constructor(name) {
    this.name = name

    this.builtDom = false

    /** @type {Item[]} */
    this.children = []

    /** @type {Item} */
    this.parent = null

    this._extended = false
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
   * @param {Item} item 
   * @param {boolean} bubble
   * @param {boolean} save
   */
  addItem(item, bubble = true, save = true) {
    item.removeFromParent(false)
    this.children.push(item)
    item.parent = this

    this.dom.ul.appendChild(item.createDom())
    this.extend(bubble, false)

    if (save === true) TaskIO.Save()
  }

  /**
   * @param {Item} item 
   * @param {boolean} save
   */
  addItemAbove(item, save = true) {
    item.removeFromParent(false)

    // at the root
    if (this.parent === null) return addTaskToRootAboveReference(item, this)

    const siblingIndex = this.parent.children.indexOf(this)
    this.parent.children.splice(siblingIndex, 0, item)
    item.parent = this.parent

    this.createDom().before(item.createDom())

    if (save === true) TaskIO.Save()
  }

  /**
   * @param {Item} item 
   * @param {boolean} save
   */
  addItemBelow(item, save = true) {
    item.removeFromParent(false)

    // at the root
    if (this.parent === null) return addTaskToRootBelowReference(item, this)

    const siblingIndex = this.parent.children.indexOf(this) + 1
    this.parent.children.splice(siblingIndex, 0, item)
    item.parent = this.parent

    this.createDom().after(item.createDom())

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
      Item.CurrentHover = this
    })
    container.addEventListener('mouseleave', e => {
      e.stopPropagation()
      if (Item.CurrentHover === this) Item.CurrentHover = null
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
   * @returns {Item}
   */
  static FromSerial(obj) {
    const thisItem = new Item(obj.name)
    thisItem.createDom({ initialSelection: obj.selected })

    if ('children' in obj) {
      for (const child of obj.children) {
        const childItem = Item.FromSerial(child)
        thisItem.addItem(childItem, false, false)
      }
      thisItem.setExtended(obj.extended, false)
    }

    return thisItem
  }
}

const root = document.querySelector('.root')

/**
 * @param {Item} item 
 */
function addTaskToRoot(item) {
  root.appendChild(item.createDom())
}

/**
 * @param {Item} item 
 * @param {Item} reference 
 * @param {boolean} save
 */
function addTaskToRootAboveReference(item, reference, save = true) {
  item.removeFromParent(false)
  root.insertBefore(item.createDom(), reference.createDom())
  if (save === true) TaskIO.Save()
}

/**
 * @param {Item} item 
 * @param {Item} reference 
 * @param {boolean} save
 */
function addTaskToRootBelowReference(item, reference, save = true) {
  item.removeFromParent(false)
  reference.createDom().after(item.createDom())
  if (save === true) TaskIO.Save()
}

function addCreateButtonToRoot() {
  const button = document.createElement('button')
  button.classList.add('is-plus')
  button.innerText = '+'

  root.appendChild(button)

  button.addEventListener('click', () => {
    promptForNewTask(ret => {
      if (ret.valid) {
        const newTask = new Item(ret.trimmed)
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