class TaskIO {
  static Save() {
    if (isRootEmpty()) return localStorage.setItem('todo-app-items', '')

    const rootObjs = []
    const obj = { root: rootObjs }
    for (const itemElement of root.children) {
      rootObjs.push(itemElement.myTaskReference.serialize())
    }

    localStorage.setItem('todo-app-items', JSON.stringify(obj))
  }

  static Load() {
    const value = localStorage.getItem('todo-app-items')
    if (value !== null && value.length > 0) {
      const obj = JSON.parse(value)
      if (obj.root.length === 0) return

      for (const itemSerial of obj.root) {
        addTaskToRoot(Item.FromSerial(itemSerial))
      }
    }
  }
}