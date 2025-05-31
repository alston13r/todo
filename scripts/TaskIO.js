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

        root.innerHTML = ''

        for (const itemSerial of obj.root) {
          addTaskToRoot(Task.FromSerial(itemSerial), true)
        }
      } catch (err) {
        console.error('The key stored in local storage is invalid, please import again', err)
      }
    }
    handleEmptyRoot()
  }

  /**
   * @param {string} data 
   */
  static _ExportToClipboard(data = '') {
    navigator.clipboard.writeText(data)
      .then(() => console.log('Saved to clipboard'))
      .catch(err => console.error('Copy failed', err))
  }

  static async Export() {
    // get data to export
    const data = localStorage.getItem(localStorageKeyName)

    // check for clipboard permissions
    const perms = await navigator.permissions.query({ name: 'clipboard-write', allowWithoutGesture: false })

    // if allowed, copy directly
    if (perms.state === 'prompt' || perms.state === 'granted') return TaskIO._ExportToClipboard(data)

    // else show text area with text already selected
    // TODO show prompt
    console.log(data)
  }

  /**
   * @returns {Promise<string>}
   */
  static async _ImportFromClipboard() {
    try {
      return await navigator.clipboard.readText()
    } catch (err) {
      console.error('Failed to import from clipboard', err)
    }
  }

  static async Import() {
    // check for clipboard permissions
    const perms = await navigator.permissions.query({ name: 'clipboard-read', allowWithoutGesture: false })

    // if allowed, copy directly
    if (perms.state === 'prompt' || perms.state === 'granted') {
      const data = await TaskIO._ImportFromClipboard()
      localStorage.setItem(localStorageKeyName, data)
      TaskIO.Load()
      return
    }

    // else show empty text area
    console.log('Prompt for import not yet implemented')
  }
}