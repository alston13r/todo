/**
 * @param {string} prefix 
 * @param {string} suffix 
 * @returns {string}
 */
function createRandomName(prefix = '', suffix = '') {
  return prefix + Math.random().toString(36).slice(2) + suffix
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
    const newTask = new Task()
    task.addTaskAbove(newTask)
    newTask.setBackgroundColor()

    setTimeout(() => new TaskPrompt(newTask, true), 5)
  })

  bottomButton.addEventListener('click', () => {
    const newTask = new Task()
    task.addTaskBelow(newTask)
    newTask.setBackgroundColor()

    setTimeout(() => new TaskPrompt(newTask, true), 5)
  })

  rightButton.addEventListener('click', () => {
    const newTask = new Task()
    task.addTask(newTask)
    newTask.setBackgroundColor()

    setTimeout(() => new TaskPrompt(newTask, true), 5)
  })

  const spanBounds = task.dom.span.getBoundingClientRect()

  topButton.style.left = '10px'
  topButton.style.top = `${-buttonDistanceConstant}px`
  topButton.style.userSelect = 'none'

  bottomButton.style.left = '10px'
  bottomButton.style.bottom = `${-buttonDistanceConstant}px`
  bottomButton.style.userSelect = 'none'

  const rightBounds = rightButton.getBoundingClientRect()
  rightButton.style.left = `${spanBounds.width + 5}px`
  rightButton.style.top = `${spanBounds.height / 2 - rightBounds.height / 2}px`
  rightButton.style.userSelect = 'none'

  taskToButtonsMap.set(task, {
    topButton, bottomButton, rightButton,
    marked: false
  })
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
    const newTask = new Task()
    addTaskToRoot(newTask)
    newTask.setBackgroundColor()

    setTimeout(() => new TaskPrompt(newTask, true), 5)

    button.remove()
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