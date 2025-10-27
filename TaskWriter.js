const INDENTATION_STRING = '    '
const EOL_SEQUENCE = '\n'

/**
 * @param {Project} project 
 * 
 * @returns {string}
 */
function descendProject(project) {
  const res = []

  res.push(project.toString())

  /**
   * @param {Task | Section} item 
   * @param {number} indentation 
   */
  function descend(item, indentation = 0) {
    const str = item.toString()
    res.push(INDENTATION_STRING.repeat(indentation) + str)
    for (const child of item.children) descend(child, indentation + 1)
  }

  for (const child of project.children) descend(child)

  return res.join(EOL_SEQUENCE)
}