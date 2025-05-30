class IconManager {
  constructor(name) {
    this.name = name
  }

  static FOLDER = new IconManager('icon-folder')
  static CARET = new IconManager('icon-caret')

  static _Current = IconManager.FOLDER

  /**
   * @returns {IconManager}
   */
  static get Current() {
    return IconManager._Current
  }

  /**
   * @param {IconManager} v
   */
  static set Current(v) {
    if (!(v instanceof IconManager)) return
    if (v === IconManager._Current) return

    const curr = IconManager._Current.name

    document.querySelectorAll('.' + curr)
      .forEach(e => e.classList.replace(curr, v.name))

    IconManager._Current = v
  }
}