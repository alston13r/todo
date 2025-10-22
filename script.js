class TaskState {
  /** @type {string} */
  name = ''
  /** @type {string} */
  char = ''

  /**
   * @param {string} name 
   * @param {string} char
   */
  constructor(name, char) {
    this.name = name
    this.char = char
    Object.freeze(this)
  }

  static TODO = new TaskState('TODO', ' ')
  static IN_PROGRESS = new TaskState('IN_PROGRESS', '-')
  static COMPLETE = new TaskState('COMPLETE', 'x')

  /**
   * @param {string} char 
   * @returns {TaskState}
   */
  static Parse(char) {
    if (typeof char !== 'string' || char.length !== 1) return null
    switch (char.charAt(0).toLowerCase()) {
      case ' ': return TaskState.TODO
      case '-': return TaskState.IN_PROGRESS
      case 'x': return TaskState.COMPLETE
    }
    return null
  }
}
Object.freeze(TaskState)

class ItemType {
  /** @type {string} */
  name = ''

  /**
   * @param {string} name 
   */
  constructor(name) {
    this.name = name
    Object.freeze(this)
  }

  static TASK = new ItemType('TASK')
  static SECTION = new ItemType('SECTION')
}
Object.freeze(ItemType)

class DueDate {
  /** @type {boolean} */
  isValid = false
  /** @type {string} */
  raw = ''
  /** @type {Date} */
  date = null

  /**
   * @param {string} text 
   */
  constructor(text = '') {
    this.raw = text.trim()
    this.date = new Date(this.raw)
    this.isValid = isFinite(this.date.getTime())
    Object.freeze(this)
  }

  toString() {
    if (!this.isValid) return 'Invalid Date'
    return `${this.date.getMonth() + 1}/${this.date.getDate()}/${this.date.getFullYear()} ${this.date.getHours().toString().padStart(2, '0')}:${this.date.getMinutes().toString().padStart(2, '0')}`
  }
}
Object.freeze(DueDate)

class TaskDepth {
  /** @type {boolean} */
  valid = false
  /** @type {string} */
  raw = ''
  /** @type {number} */
  depth = 0

  /**
   * @param {string} depthString 
   */
  constructor(depthString = '') {
    this.raw = depthString.trim()
    this.depth = parseInt(this.raw)
    this.valid = isFinite(this.depth)
    Object.freeze(this)
  }
}
Object.freeze(TaskDepth)











class Project {
  /** @type {string} */
  name = ''
  /** @type {(Task | Section)[]} */
  children = []

  /**
   * @param {string} name 
   */
  constructor(name) {
    this.setName(name)
  }

  /**
   * @param {string} name 
   */
  setName(name) {
    if (typeof name !== 'string') throw Error('name must be a string')
    name = name.trim()
    if (name.length === 0) throw Error('name cannot be empty')
    this.name = name
  }

  /**
   * @param {Task | Section} child 
   */
  addChild(child) {
    if (!(child instanceof Task) && !(child instanceof Section)) throw Error('child must be a Task or Section')
    this.children.push(child)
    child.parent = this
  }
}
Object.freeze(Project)





class Task {
  /** @type {string} */
  name = ''
  /** @type {TaskState} */
  state = TaskState.TODO
  /** @type {DueDate} */
  dueDate = null
  /** @type {(Task | Section)[]} */
  children = []
  /** @type {string[]} */
  tags = []
  /** @type {Section | Task | Project} */
  parent = null
  /** @type {boolean} */
  expanded = false

  /**
   * @param {string} name 
   * @param {TaskState} state 
   */
  constructor(name, state) {
    this.setName(name)
    this.setState(state)
  }

  /**
   * @param {string} name 
   */
  setName(name) {
    if (typeof name !== 'string') throw Error('name must be a string')
    name = name.trim()
    if (name.length === 0) throw Error('name cannot be empty')
    this.name = name
  }

  /**
   * @param {TaskState} state 
   */
  setState(state) {
    if (!(state instanceof TaskState)) throw Error('state must be a TaskState')
    this.state = state
  }

  /**
   * @param {Task | Section} child 
   */
  addChild(child) {
    if (!(child instanceof Task) && !(child instanceof Section)) throw Error('child must be a Task or Section')
    this.children.push(child)
    child.parent = this
    this.expanded = true
  }

  /**
   * @param {DueDate} dueDate 
   */
  setDueDate(dueDate) {
    if (!(dueDate instanceof DueDate)) throw Error('due date must be a DueDate')
    this.dueDate = dueDate
  }

  clearDueDate() {
    this.dueDate = null
  }
}
Object.freeze(Task)







class Section {
  /** @type {string} */
  name = ''
  /** @type {(Section | Task)[]} */
  children = []
  /** @type {string[]} */
  tags = []
  /** @type {Section | Task | Project} */
  parent = null
  /** @type {boolean} */
  expanded = false

  /**
   * @param {string} name 
   */
  constructor(name) {
    this.setName(name)
  }

  /**
   * @param {string} name 
   */
  setName(name) {
    if (typeof name !== 'string') throw Error('name must be a string')
    name = name.trim()
    if (name.length === 0) throw Error('name cannot be empty')
    this.name = name
  }

  /**
   * @param {Task | Section} child 
   */
  addChild(child) {
    if (!(child instanceof Task) && !(child instanceof Section)) throw Error('child must be a Task or Section')
    this.children.push(child)
    child.parent = this
    this.expanded = true
  }
}
Object.freeze(Section)














let data = null

function writeData() {
  if (!data) return

  const res = []

  /**
   * @param {Task} task 
   * @param {number} depth
   */
  function writeTask(task, depth = 0) {
    res.push('\t'.repeat(depth) + `[${task.state.char}] ${task.name}` + (task.dueDate ? ` - ${task.dueDate.toString()}` : ''))
  }

  /**
   * @param {Section} section 
   * @param {number} depth
   */
  function writeSection(section, depth) {
    res.push('\t'.repeat(depth) + `${section.name}`)
  }

  /**
   * @param {(Task | Section)[]} children 
   * @param {number} depth
   */
  function writeChildren(children, depth = 0) {
    if (children.length === 0) return
    for (const child of children) {
      if (child instanceof Task) {
        writeTask(child, depth)
      } else if (child instanceof Section) {
        writeSection(child, depth)
      } else continue
      writeChildren(child.children, depth + 1)
    }
  }

  /**
   * @param {Project} project 
   */
  function writeProject(project) {
    res.push(`# ${project.name}`)
    writeChildren(project.children, 0)
  }

  for (const project of data) writeProject(project)

  const fullText = res.join('\n')
  console.log(fullText)

  /** @type {HTMLTextAreaElement} */
  const inputElement = document.querySelector('#mainInput')
  if (!inputElement) throw Error('could not find input element')

  inputElement.value = fullText
}

function readInput() {
  /** @type {HTMLTextAreaElement} */
  const inputElement = document.querySelector('#mainInput')
  if (!inputElement) throw Error('could not find input element')

  const rawText = inputElement.value
  data = parseTextInput(rawText)
}



/**
 * @param {string} text 
 */
function parseTextInput(text = '') {
  const split = text.split(/^#(.*)/gm)
  split.shift()

  const projects = []

  for (let i = 0; i < split.length; i += 2) {
    const projectName = split[i]
    const projectText = split[i + 1]

    projects.push(parseProject(projectName, projectText))
  }

  return projects
}

/**
 * @param {string} name 
 * @param {string} text 
 */
function parseProject(name = '', text = '') {
  name = name.trim()
  if (name.length === 0) return null

  // console.log(`Project <${name}>`, text)
  const lines = text.split(/\r?\n/).filter(line => line.length > 0).map(parseLine).filter(line => line != null)

  const project = new Project(name)
  /** @type {(Project | Section | Task)[]} */
  const stack = [project]

  for (const line of lines) {
    /** @type {[number, Section | Task]} */
    const [depth, item] = line
    stack[depth].addChild(item)
    stack[depth + 1] = item
  }

  return project
}

/**
 * @param {string} line 
 * @returns {number}
 */
function getLineDepth(line = '') {
  let depth = 0
  for (const c of line) {
    if (c === '\t') depth++
    else break
  }
  return depth
}

/**
 * @param {string} line 
 */
function parseLine(line = '') {
  if (line.trim().length === 0) return null

  const depth = getLineDepth(line)
  line = line.trimStart()

  if (line.startsWith('[')) {
    // is a task
    const task = parseTaskLine(line)
    return [depth, task]
  }

  // is a section
  return [depth, new Section(line)]
}








/**
 * @param {string} taskLine 
 */
function parseTaskLine(taskLine = '') {
  taskLine = taskLine.trim()
  if (taskLine.length === 0) return null

  const statusMatch = taskLine.match(/\[(.)\]/)
  if (!statusMatch) return null

  const state = TaskState.Parse(statusMatch[1])
  if (!state) return null

  const [name, ...info] = taskLine.split('-').map(x => x.trim()).filter(x => x.length > 0)

  const taskName = name.substring(name.indexOf(']') + 1).trim()
  const task = new Task(taskName, state)

  for (const x of info.map(x => {
    const dueDate = new DueDate(x)
    if (dueDate.isValid) return dueDate

    return null
  }).filter(x => x !== null)) {
    if (x instanceof DueDate) task.setDueDate(x)
  }

  return task
}





















// /**
//  * @param {string} projectText
//  */
// function parseProjectText(projectText) {
//   const lines = projectText.split(/\r?\n/).map(line => line.trim())
//   if (lines.length === 0) return null

//   const projectName = lines.shift()
//   if (projectName.length === 0) return null

//   console.log(`Project <${projectName}>`)

//   const remainderText = lines.join('\n')

//   const sectionsSplit = remainderText.split('Section:')
//   const miscTasksText = sectionsSplit.shift().trim()
//   const miscTasks = parseTaskList(miscTasksText)

//   console.log(miscTasks)

//   for (const sectionText of sectionsSplit) {
//     const section = parseSection(sectionText)
//     console.log(section)
//   }
// }

// /**
//  * @param {string} sectionText 
//  */
// function parseSection(sectionText = '') {
//   const lines = sectionText.split(/\r?\n/).map(line => line.trim())
//   if (lines.length === 0) return null

//   const sectionName = lines.shift()
//   if (sectionName.length === 0) return null

//   console.log(`Section <${sectionName}>`)

//   const remainderText = lines.join('\n')

//   const tasks = parseTaskList(remainderText)

//   console.log(tasks)

//   console.log(remainderText)
// }

// /**
//  * @param {string} tasksText
//  */
// function parseTaskList(tasksText = '') {
//   console.log(tasksText)
//   const split = tasksText.split('Task:').map(task => task.trim()).filter(line => line.length > 0)

//   return split.map(taskText => parseTask(taskText))
// }

// /**
//  * @param {string} taskText 
//  */
// function parseTask(taskText = '') {
//   try {

//     const regex = /\s*\[(?<statusChar>.)\](?<taskText>(?:.|\n|\r)*)/
//     let m

//     if (m = regex.exec(taskText)) {

//       const state = parseStatusChar(m.groups.statusChar)
//       if (state === null) return null

//       const lines = m.groups.taskText.trim().split(/\r?\n/).map(line => line.trim())

//       const name = lines.shift()
//       if (name.length === 0) return null

//       const info = lines.map(x => parseInfoLine(x))
//       return { name, state, info }

//     }

//     return null

//   } catch (e) {
//     return null
//   }
// }

// /**
//  * @param {string} char 
//  */
// function parseStatusChar(char = '') {
//   if (char.length === 0) return null
//   switch (char.toLowerCase()) {
//     case ' ': return TaskState.TODO
//     case '-': return TaskState.IN_PROGRESS
//     case 'x': return TaskState.COMPLETE
//   }
//   return null
// }

// /**
//  * @param {string} line 
//  */
// function parseInfoLine(line = '') {
//   const split = line.split(':')
//   const type = split.shift().trim()
//   if (type.length === 0) return null

//   const rest = split.join(':').trim()

//   switch (type.toLowerCase()) {
//     case 'due':
//     case 'date':
//       return new DueDate(rest)
//     case 'depth':
//     case 'level':
//       return new TaskDepth(rest)
//   }

//   throw Error(`unknown info type - ${type}`)
// }