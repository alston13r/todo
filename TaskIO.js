const localStorageKeyName = 'todo-app-items'

class TaskIO {
  static Save() {
    if (isRootEmpty()) return localStorage.setItem(localStorageKeyName, '')

    const rootObjs = []
    const obj = { root: rootObjs }
    for (const itemElement of root.children) {
      rootObjs.push(itemElement.myTaskReference.serialize())
    }

    localStorage.setItem(localStorageKeyName, JSON.stringify(obj))
  }

  static Load() {
    const value = localStorage.getItem(localStorageKeyName)
    if (value !== null && value.length > 0) {
      const obj = JSON.parse(value)
      if (obj.root.length === 0) return

      for (const itemSerial of obj.root) {
        addTaskToRoot(Task.FromSerial(itemSerial))
      }
    }
  }
}