class Item {
  /** @type {string} */
  name = null
  /** @type {Item[]} */
  children = []
  /** @type {Item} */
  parent = null

  /** @type {boolean} */
  _isItem = true

  /**
   * @param {string} name 
   */
  constructor(name) {
    if (typeof name !== 'string') throw Error('name must be a string')
    this.name = name
  }

  /**
   * @param {Item} item 
   */
  addChild(item) {
    if (item._isItem !== true) throw Error('child must be an Item')
    item.removeFromParent()
    this.children.push(item)
    item.parent = this
  }

  removeFromParent() {
    if (this.parent === null) return
    const index = this.parent.children.indexOf(this)
    if (index >= 0) this.parent.children.splice(index, 1)
    this.parent = null
  }
}

class Task extends Item {
  /** @type {TaskStatusEnum} */
  status = null

  /** @type {Date} */
  date = null

  /** @type {boolean} */
  _isTask = true

  /**
   * @param {string} name 
   * @param {TaskStatusEnum} status
   */
  constructor(name, status = TaskStatusEnum.TODO, date = null) {
    super(name)
    this.status = status
    this.date = date
  }

  /**
   * @returns {boolean}
   */
  hasDate() {
    return this.date !== null && this.date.toString() !== 'Invalid Date'
  }

  /**
   * @param {Date} date 
   */
  setDate(date) {
    if (!(date instanceof Date)) throw Error('date must be a Date')
    this.date = date
  }

  clearDate() {
    this.date = null
  }

  /**
   * @returns {string}
   */
  getDateString() {
    if (!this.hasDate()) return null
    return prettyPrintDate(this.date)
  }

  /**
   * @returns {string} [STATUS] TASK NAME, DATE
   */
  toString() {
    const status = this.status.getShorthand()
    const name = this.name
    const hasDate = this.hasDate()
    return `[${status}] ${name}` + (hasDate ? `, ${this.getDateString()}` : '')
  }
}

class Section extends Item {
  /** @type {boolean} */
  _isSection = true

  /**
   * @param {string} name 
   */
  constructor(name) {
    super(name)
  }

  /**
   * @returns {string} SECTION NAME
   */
  toString() {
    return this.name
  }
}

class Project extends Item {
  /** @type {boolean} */
  _isProject = true

  /**
   * @param {string} name 
   */
  constructor(name) {
    super(name)
  }

  /**
   * @returns {string} ### PROJECT NAME
   */
  toString() {
    return '### ' + this.name
  }
}