class OptionManager {
  static _id = 0

  /**
   * @param {string} name 
   * @param {Object} style 
   */
  constructor(name, style = {}) {
    this.name = name
    this.style = style
    this.index = OptionManager._id++
  }

  static TODO = new OptionManager('Todo', { backgroundColor: '#777' })
  static IN_PROGRESS = new OptionManager('In Progress', { backgroundColor: '#ff0' })
  static COMPLETE = new OptionManager('Complete', { backgroundColor: '#0f0' })

  static *[Symbol.iterator]() {
    yield OptionManager.TODO
    yield OptionManager.IN_PROGRESS
    yield OptionManager.COMPLETE
  }

  /**
   * @param {OptionManager} option 
   * @returns {HTMLElement}
   */
  static CreateElement(option) {
    const element = document.createElement('option')
    element.text = option.name
    for (const k in option.style) {
      element.style[k] = option.style[k]
    }
    return element
  }

  /**
   * @returns {HTMLElement}
   */
  createElement() {
    return OptionManager.CreateElement(this)
  }
}