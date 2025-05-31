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
      try {
        const obj = JSON.parse(value)
        if (obj.root.length === 0) return

        for (const itemSerial of obj.root) {
          addTaskToRoot(Task.FromSerial(itemSerial))
        }
      } catch (err) {
        console.error('The key stored in local storage is invalid, please import again', err)
      }
    }
  }

  static Export() {
    const data = localStorage.getItem(localStorageKeyName)
    navigator.clipboard.writeText(data ?? '')
      .then(() => console.log('Saved to clipboard'))
      .catch(err => console.error('Copy failed', err))
  }

  static async Import() {
    try {
      const text = await navigator.clipboard.readText()
      localStorage.setItem(localStorageKeyName, text)
      TaskIO.Load()
    } catch (err) {
      console.error('Failed to import', err)
    }
  }
}