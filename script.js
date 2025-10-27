function readInput() {
  /** @type {HTMLTextAreaElement} */
  const inputElement = document.querySelector('#mainInput')
  if (!inputElement) throw Error('could not find input element')

  const rawText = inputElement.value
  const projects = TextParser.ParseFullText(rawText)

  const descended = projects.map(project => descendProject(project))
  console.log(descended)
}