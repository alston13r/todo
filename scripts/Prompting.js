/**
 * @param {(ret: {original: string, trimmed: string, valid: boolean}) => void} callback 
 * @param {string} [initial=''] 
 * @param {string} [placeholder=''] 
 */
function PromptForTaskName(callback, initial = '', placeholder = '') {
  let removed = false
  let escaped = false

  const background = document.createElement('div')
  background.classList.add('horizontal', 'center', 'overlay')
  background.addEventListener('click', () => {
    if (!removed) {
      removed = true
      background.remove()
    }
  })

  const aligner = document.createElement('div')
  aligner.classList.add('vertical', 'center')
  background.appendChild(aligner)

  const sleek = new SleekInput(placeholder)
  const input = sleek.createDom(initial)
  input.addEventListener('change', () => {
    if (!removed) {
      removed = true
      background.remove()
    }

    if (escaped) return

    const original = input.value
    const trimmed = original.trim()
    const valid = trimmed.length > 0
    callback({ original, trimmed, valid })
  })
  input.addEventListener('keydown', e => {
    if (!removed && e.key === 'Escape') {
      escaped = true
      removed = true
      background.remove()
    }
  })

  aligner.appendChild(input)

  document.body.appendChild(background)
  input.focus()
}

/**
 * @param {(ret: {original: string, picked: string}) => void} callback 
 * @param {string} initial
 */
function PromptForColor(callback, initial) {
  let removed = false

  /**
   * @param {KeyboardEvent} e 
   */
  function windowCallback(e) {
    if (!removed && e.key === 'Escape') {
      removed = true
      background.remove()
    }
    window.removeEventListener('keydown', windowCallback)
  }
  window.addEventListener('keydown', windowCallback)

  const background = document.createElement('div')
  background.classList.add('horizontal', 'center', 'overlay')

  const aligner = document.createElement('div')
  aligner.classList.add('vertical', 'center')
  aligner.style.gap = '20px'
  background.appendChild(aligner)

  const colorPicker = new ColorPicker()

  const buttonContainer = document.createElement('div')
  buttonContainer.classList.add('horizontal')
  buttonContainer.style.gap = '20px'

  const colorSubmit = document.createElement('button')
  colorSubmit.classList.add('button-27')
  colorSubmit.addEventListener('click', () => {
    if (!removed) {
      removed = true
      background.remove()
    }

    const original = initial
    const picked = colorPicker.getCurrentColor()
    callback({ original, picked })
  })
  colorSubmit.innerText = 'Submit new color'

  const colorCancel = document.createElement('button')
  colorCancel.classList.add('button-27')
  colorCancel.addEventListener('click', () => {
    if (!removed) {
      removed = true
      background.remove()
    }
  })
  colorCancel.innerText = 'Cancel'

  buttonContainer.append(colorSubmit, colorCancel)

  colorPicker.appendTo(aligner)
  aligner.append(buttonContainer)
  document.body.appendChild(background)
  colorPicker.initialize(initial)
}

/**
 * @param {({original: string, trimmed: string, valid: boolean}) => void} callback 
 * @param {string} [initial=''] 
 * @param {boolean} [focus=true] 
 */
function PromptForTextInput(callback, initial = '', select = true) {
  let removed = false

  const background = document.createElement('div')
  background.classList.add('horizontal', 'center', 'overlay')
  background.addEventListener('click', () => {
    if (removed) return
    removed = true
    background.remove()
  })

  const aligner = document.createElement('div')
  aligner.classList.add('vertical', 'center')
  background.appendChild(aligner)

  const textArea = document.createElement('textarea')
  textArea.value = initial

  function doCallback(e) {
    if (removed) return

    removed = true
    background.remove()

    const original = textArea.value
    const trimmed = original.trim()
    const valid = trimmed.length > 0
    callback({ original, trimmed, valid })
  }

  textArea.addEventListener('click', e => e.stopPropagation())
  textArea.addEventListener('change', doCallback)
  textArea.addEventListener('paste', () => setTimeout(doCallback, 50))

  aligner.append(textArea)
  document.body.appendChild(background)

  textArea.focus()
  if (select === true) textArea.select()
}

/**
 * @param {string} [initial=''] 
 * @param {boolean} [focus=true] 
 */
function PromptForTextOutput(initial = '', select = true) {
  let removed = false

  const background = document.createElement('div')
  background.classList.add('horizontal', 'center', 'overlay')
  background.addEventListener('click', () => {
    if (!removed) {
      removed = true
      background.remove()
    }
  })

  const aligner = document.createElement('div')
  aligner.classList.add('vertical', 'center')
  background.appendChild(aligner)

  const textArea = document.createElement('textarea')
  textArea.value = initial

  textArea.addEventListener('click', e => {
    e.stopPropagation()
  })
  textArea.addEventListener('copy', () => {
    if (!removed) {
      removed = true
      setTimeout(() => background.remove(), 50)
    }
  })

  aligner.append(textArea)
  document.body.appendChild(background)

  textArea.focus()
  if (select === true) textArea.select()
}