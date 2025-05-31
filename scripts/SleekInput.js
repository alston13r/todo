class SleekInput {
  /**
   * @param {string} placeholder 
   */
  constructor(placeholder = '') {
    this.placeholder = placeholder

    const span = document.createElement('span')
    span.style.whiteSpace = 'pre'
    span.style.visibility = 'hidden'

    this.tempSpan = span

    this.builtDom = false
  }

  /**
   * @param {string} initialValue
   * @returns {HTMLInputElement}
   */
  createDom(initialValue = '') {
    const input = document.createElement('input')
    input.type = 'text'
    input.classList.add('sleek')
    input.placeholder = this.placeholder

    this.domElement = input
    this.builtDom = true

    input.addEventListener('input', () => {
      this.updateWidth(input.value)
    })
    input.value = initialValue
    this.updateWidth(initialValue)

    return this.domElement
  }

  /**
   * @param {string} input 
   */
  updateWidth(input) {
    if (!this.builtDom) return

    const span = this.tempSpan
    span.style.font = getComputedStyle(this.domElement).font
    document.body.appendChild(span)

    if (input.length === 0) span.textContent = this.placeholder
    else span.textContent = input

    const width = span.offsetWidth
    this.domElement.style.width = width + 'px'

    span.remove()
  }
}