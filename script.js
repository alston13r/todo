/** @type {Project[]} */
let data = null

function readInput() {
  /** @type {HTMLTextAreaElement} */
  const inputElement = document.querySelector('#mainInput')
  if (!inputElement) throw Error('could not find input element')

  const rawText = inputElement.value
  const projects = TextParser.ParseFullText(rawText)

  data = projects

  const descended = projects.map(project => descendProject(project))
  console.log(descended)
}

function writeData() {
  if (data === null) throw Error('no data saved')

  /** @type {HTMLTextAreaElement} */
  const inputElement = document.querySelector('#mainInput')
  if (!inputElement) throw Error('could not find input element')

  const fullText = data.map(project => descendProject(project))
  inputElement.value = fullText.join(EOL_SEQUENCE)
}