/** @type {Project[]} */
let data = null

function readInput() {
  /** @type {HTMLTextAreaElement} */
  const inputElement = document.querySelector('#mainInput')
  if (!inputElement) throw Error('could not find input element')

  const rawText = inputElement.value
  const projects = TaskReader.ParseFullText(rawText)

  data = projects
}

function writeData() {
  if (data === null) throw Error('no data saved')

  /** @type {HTMLTextAreaElement} */
  const inputElement = document.querySelector('#mainInput')
  if (!inputElement) throw Error('could not find input element')

  const fullText = TaskWriter.ProjectsToString(data)
  inputElement.value = fullText
}