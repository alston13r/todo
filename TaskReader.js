class TaskReader {
  /** @type {number} */
  static _TAB_LENGTH = 4
  /** @type {number} */
  static _SPACE_LENGTH = 1
  /** @type {string} */
  static _DESCRIPTION_STRING = '---'

  /**
   * @param {string} text 
   * 
   * @returns {Project[]}
   */
  static ParseFullText(text) {
    const projectTextSplit = text.split(/(?:\r?\n)?###/)
    projectTextSplit.shift()

    const projects = []

    for (const projectText of projectTextSplit) {
      const parsedProject = TaskReader._ParseProjectText(projectText)
      if (parsedProject === null) continue

      const project = new Project(parsedProject.name)

      function descend(parent) {
        const info = parent.info
        const type = info.type

        let item = null
        if (type === 'TASK') {
          item = new Task(info.name, info.status)
          if ('date' in info) {
            item.setDate(info.date)
          }
        } else if (type === 'SECTION') {
          item = new Section(info.name)
        } else {
          return info.descriptionText
        }

        if (item === null) return null

        for (let child of parent.children) {
          child = descend(child)
          if (typeof child === 'string') {
            item.addDescriptionLine(child)
          } else {
            if (child !== null) item.addChild(child)
          }
        }

        return item
      }

      for (let child of parsedProject.children) {
        child = descend(child)
        if (typeof child === 'string') {
          project.addDescriptionLine(child)
        } else {
          if (child !== null) project.addChild(child)
        }
      }

      projects.push(project)
    }

    return projects
  }

  /**
   * @param {string} text 
   * 
   * @returns {Project}
   */
  static _ParseProjectText(text) {
    let lines = text.split(/\r?\n/)
    const projectName = TaskReader._ParseProjectTextName(lines.shift())

    /** @type {{indentation: number, info: {type: string}}[]} */
    const parsedLines = lines.filter(x => x.trim().length > 0)
      .map(line => TaskReader._ParseProjectTextLine(line))
      .filter(line => line !== null)

    const project = { name: projectName, indentation: -1, children: [] }

    /** @type {{indentation: number, children: []}[]} */
    const context = [project]

    for (const line of parsedLines) {
      line.children = []
      for (let i = context.length - 1; i >= 0; i--) {
        if (line.indentation <= context[i].indentation) {
          context.pop()
          continue
        }
        context[i].children.push(line)
        context.push(line)
        break
      }
    }

    return project
  }

  /**
   * @param {string} text 
   * 
   * @returns {string}
   */
  static _ParseProjectTextName(text) {
    return text.trim()
  }

  /**
   * @param {string} text 
   * 
   * @returns {number}
   */
  static _GetLineIndentation(text) {
    if (text.trim().length === 0) return 0

    let indentation = 0
    for (const c of text) {
      if (c === '\t') indentation += TaskReader._TAB_LENGTH
      else if (c === ' ') indentation += TaskReader._SPACE_LENGTH
      else break
    }

    return indentation
  }

  /**
   * @param {string} text 
   */
  static _ParseProjectTextLine(text) {
    // either a section or a task
    const content = text.trim()
    const indentation = TaskReader._GetLineIndentation(text)
    const info = TaskReader._ParseProjectTextLineContent(content)
    return info !== null ? { indentation, info } : null
  }

  /**
   * @param {string} text 
   * @returns {{type: 'TASK' | 'SECTION' | 'DESCRIPTION', name?: string, status?: TaskStatusEnum, date?: Date, descriptionText?: string}}
   */
  static _ParseProjectTextLineContent(text) {
    text = text.trimStart()
    if (text.length === 0) return null

    if (text.startsWith(TaskReader._DESCRIPTION_STRING)) {
      // is a description
      const descriptionText = text.substring(TaskReader._DESCRIPTION_STRING.length + 1)
      return { type: 'DESCRIPTION', descriptionText }
    }

    else if (text.charAt(0) === '[') {
      // is a task
      const taskInfo = TaskReader._ParseTaskText(text)
      if (taskInfo !== null) return { type: 'TASK', ...taskInfo }
    }

    else {
      // is a section
      const sectionName = TaskReader._ParseSectionText(text)
      if (sectionName !== null) return { type: 'SECTION', name: sectionName }
    }

    return null
  }

  /**
   * @param {string} text
   * @returns {string | null}
   */
  static _ParseSectionText(text) {
    text = text.trim()
    return text.length > 0 ? text : null
  }

  /**
   * @param {string} text 
   * @returns {{name: string, status: TaskStatusEnum, date?: Date} | null}
   */
  static _ParseTaskText(text) {
    text = text.trim()
    const statusText = text.match(/\[([^\]]*)\]/)?.[1]?.trim()
    if (statusText === null || statusText === undefined) {
      console.log(`bad task - '${text}'`)
      return null
    }

    const status = TaskStatusEnum.Parse(statusText)

    const taskInfoText = text.substring(text.indexOf(']') + 1).trim()
    const parsedInfo = TaskReader._ParseTaskInfoText(taskInfoText)

    return parsedInfo !== null ? { status, ...parsedInfo } : null
  }

  /**
   * @param {string} text 
   */
  static _ParseTaskInfoText(text) {
    const split = text.split(',').map(x => x.trim()).filter(x => x.length > 0)
    if (split.length === 0) return null

    let name = [split.shift().trim()]

    const info = {}

    while (split.length > 0) {
      const item = split.shift()
      const date = new Date(item)
      if (date.toString() === 'Invalid Date') {
        name.push(item)
      } else {
        info.date = date
        break
      }
    }

    if (split.length > 0) {
      console.log('unexpected items', split)
    }

    info.name = name.join(', ')

    return info
  }
}