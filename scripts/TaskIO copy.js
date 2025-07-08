const localStorageKeyName = 'todo-app-items'

/**
 * @param {object} obj 
 */
function parseVersion0(obj) {
  if (!('root' in obj)) return
  if (obj.root.length === 0) return

  root.innerHTML = ''

  for (const itemSerial of obj.root) {
    addTaskToRoot(Task.FromSerial(itemSerial), true)
  }
}

/**
 * @param {object} obj 
 */
function parseVersion1(obj) {

}

class TaskIO {
  static Save() {
    if (isRootEmpty()) return localStorage.setItem(localStorageKeyName, '')

    const rootObjs = []
    const obj = {
      version: 1, root: rootObjs, preferences: {
        colors: {
          arr: [
            'rgb(153, 153, 153)'
          ],
          table: {
            'rgb(153, 153, 153)': {
              index: 0,
              count: 0
            }
          }
        }
      }
    }
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
        if (!('version' in obj)) {
          parseVersion0(obj)
        } else {
          const ver = obj.version
          console.log(ver)
        }
        // if (obj.root.length === 0) return

        // root.innerHTML = ''

        // for (const itemSerial of obj.root) {
        //   addTaskToRoot(Task.FromSerial(itemSerial), true)
        // }
      } catch (err) {
        console.error('The key stored in local storage is invalid, please import again', err)
      }
    }
    handleEmptyRoot()
  }

  /**
   * @param {string} [data=''] 
   */
  static _ExportToPrompt(data = '') {
    promptForTextOutput(data)
  }

  /**
   * @param {string} data 
   */
  static _ExportToClipboard(data = '') {
    navigator.clipboard.writeText(data)
      .then(() => console.log('Saved to clipboard'))
      .catch(err => {
        if (err.name === 'NotAllowedError') {
          TaskIO._ExportToPrompt(data)
        } else {
          console.error('Export failed', err)
        }
      })
  }

  static async Export() {
    // get data to export
    const data = localStorage.getItem(localStorageKeyName)

    // check for clipboard permissions
    const perms = await navigator.permissions.query({ name: 'clipboard-write', allowWithoutGesture: false })

    // if allowed, copy directly
    if (perms.state === 'prompt' || perms.state === 'granted') return TaskIO._ExportToClipboard(data)

    // else show text area with text already selected
    TaskIO._ExportToPrompt(data)
  }

  /**
   * @returns {Promise<string>}
   */
  static async _ImportFromPrompt() {
    return await new Promise((res, rej) => {
      promptForTextInput(ret => {
        if (ret.valid) res(ret.trimmed)
        else rej()
      })
    })
  }

  /**
   * @returns {Promise<string>}
   */
  static async _ImportFromClipboard() {
    try {
      return await navigator.clipboard.readText()
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        return await TaskIO._ImportFromPrompt()
      }
      console.error('Import failed', err)
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
    const data = await TaskIO._ImportFromPrompt()
    localStorage.setItem(localStorageKeyName, data)
    TaskIO.Load()
  }
}