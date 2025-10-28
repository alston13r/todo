class Item {
  /** @type {string} */
  name = null
  /** @type {Item[]} */
  children = []
  /** @type {Item} */
  parent = null
  /** @type {boolean} */
  expanded = true
  /** @type {string} */
  description = ''

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
   * @param {boolean} autoExpand
   */
  addChild(item, autoExpand = true) {
    if (item._isItem !== true) throw Error('child must be an Item')
    item.removeFromParent()
    this.children.push(item)
    item.parent = this
    if (autoExpand === true) this.setExpanded(true)
  }

  removeFromParent() {
    if (this.parent === null) return
    const index = this.parent.children.indexOf(this)
    if (index >= 0) this.parent.children.splice(index, 1)
    this.parent = null
  }

  /**
   * @param {boolean} expanded 
   */
  setExpanded(expanded) {
    if (typeof expanded !== 'boolean') throw Error('expanded value must be a boolean')
    this.expanded = expanded
  }

  /**
   * @returns {string}
   */
  getDescription() {
    return this.description
  }

  /**
   * @param {string} description 
   */
  setDescription(description) {
    this.description = description
  }

  /**
   * @param {string} description 
   */
  addDescriptionLine(description) {
    if (this.description.length === 0) this.description = description
    else this.description += TaskWriter._EOL_SEQUENCE + description
  }

  /**
   * @returns {boolean}
   */
  hasDescription() {
    return this.description.length > 0
  }

  /**
   * @param {number} indentation 
   */
  _prepareDescriptionForWrite(indentation = 0) {
    if (!this.hasDescription()) return null

    return this.getDescription()
      .split(/\r?\n/)
      .map(line =>
        TaskWriter._INDENTATION_STRING.repeat(indentation + 1) +
        TaskReader._DESCRIPTION_STRING +
        ' ' +
        line
      )
      .join(TaskWriter._EOL_SEQUENCE)
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
   * @param {number} indentation
   * 
   * @returns {string} [STATUS] TASK NAME, DATE \n --- DESCRIPTION
   */
  toString(indentation = 0) {
    const status = this.status.getShorthand()
    const name = this.name
    const hasDate = this.hasDate()
    return `[${status}] ${name}` + (hasDate ? `, ${this.getDateString()}` : '') + (this.hasDescription() ? TaskWriter._EOL_SEQUENCE + this._prepareDescriptionForWrite(indentation) : '')
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
   * @returns {string} SECTION NAME \n --- DESCRIPTION
   */
  toString(indentation = 0) {
    return this.name + (this.hasDescription() ? TaskWriter._EOL_SEQUENCE + this._prepareDescriptionForWrite(indentation) : '')
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
  toString(indentation = 0) {
    return '### ' + this.name + (this.hasDescription() ? TaskWriter._EOL_SEQUENCE + this._prepareDescriptionForWrite(indentation - 1) : '')
  }
}