class TaskWriter {
  static _INDENTATION_STRING = '    '
  static _EOL_SEQUENCE = '\n'

  /**
   * @param {Project} project 
   * 
   * @returns {string}
   */
  static ProjectToString(project) {
    const res = []

    res.push(project.toString())

    /**
     * @param {Task | Section} item 
     * @param {number} indentation 
     */
    function descend(item, indentation = 0) {
      const str = item.toString()
      res.push(TaskWriter._INDENTATION_STRING.repeat(indentation) + str)
      for (const child of item.children) descend(child, indentation + 1)
    }

    for (const child of project.children) descend(child)

    return res.join(TaskWriter._EOL_SEQUENCE)
  }

  /**
   * @param {Project[]} projects 
   * 
   * @returns {string}
   */
  static ProjectsToString(projects) {
    return projects.map(project => TaskWriter.ProjectToString(project)).join(TaskWriter._EOL_SEQUENCE)
  }
}