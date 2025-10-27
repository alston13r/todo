class TaskStatusEnum {
  /** @type {string} */
  name = null
  /** @type {string} */
  shorthand = null

  /**
   * @param {string} name 
   * @param {string} shorthand 
   */
  constructor(name, shorthand) {
    if (typeof name !== 'string') throw Error('name must be a string')
    if (typeof shorthand !== 'string') throw Error('shorthand must be a string')
    this.name = name
    this.shorthand = shorthand
    Object.freeze(this)
  }

  /**
   * @returns {string}
   */
  getName() {
    return this.name
  }

  /**
   * @returns {string}
   */
  getShorthand() {
    return this.shorthand
  }

  static TODO = new TaskStatusEnum('TODO', ' ')
  static IN_PROGRESS = new TaskStatusEnum('IN_PROGRESS', '-')
  static COMPLETE = new TaskStatusEnum('COMPLETE', 'x')

  /**
   * @param {string} text 
   * @returns {TaskStatusEnum}
   */
  static Parse(text) {
    text = text.trim().toLowerCase()

    switch (text) {
      case '':
      case 'todo':
        return TaskStatusEnum.TODO

      case '-':
      case 'in_progress':
      case 'in progress':
        return TaskStatusEnum.IN_PROGRESS

      case 'x':
      case 'done':
      case 'complete':
        return TaskStatusEnum.COMPLETE
    }

    console.log(`bad task status - '${text}', defaulting TODO`)
    return TaskStatusEnum.TODO
  }
}

Object.freeze(TaskStatusEnum)