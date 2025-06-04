/**
 * @param {number} x 
 * @param {number} [max=1] 
 * @param {number} [min=0] 
 * @returns {number} x clamped between min and max, inclusive
 */
function clamp(x, max = 1, min = 0) {
  return Math.min(max, Math.max(min, x))
}

class ColorPicker extends EventTarget {
  constructor(title = 'Color picker') {
    super()

    this.addEventListener('dropperchange-palette', e => {
      /** @type {MouseEvent} */
      const event = e.detail.event

      const bounds = this.paletteContainer.getBoundingClientRect()
      const u = clamp(event.clientX - bounds.x, bounds.width) / bounds.width
      const v = clamp(event.clientY - bounds.y, bounds.height) / bounds.height

      this.setDropperPosPalette(u, v)
      this.setSV(u, 1 - v)

      this.updateConversionFields()
    })

    this.addEventListener('dropperchange-slider', e => {
      const event = e.detail.event

      if (event instanceof WheelEvent) {

        const newHue = clamp(this.hue + e.detail.scrollDir, 360)
        this.setHue(newHue)
        this.setDropperPosSlider(newHue / 360)

      }

      else if (event instanceof MouseEvent) {

        const bounds = hueSlider.getBoundingClientRect()
        const t = clamp(event.clientX - bounds.x, bounds.width) / bounds.width

        this.setDropperPosSlider(t)
        this.setHue(t * 360)

      }

      this.updateConversionFields()
    })

    // [ ] whenever a field changes, update the rest of the fields and the palette
    // [X] whenever the palette changes, update the fields

    this.addEventListener('fieldchange-hex', console.log)
    this.addEventListener('fieldchange-rgb', console.log)
    this.addEventListener('fieldchange-hsv', console.log)
    this.addEventListener('fieldchange-hsl', console.log)
    this.addEventListener('fieldchange-cmyk', console.log)

    const colorPickerContainer = document.createElement('div')
    colorPickerContainer.classList.add('color-picker-container', 'vertical', 'center')

    const nameContainer = document.createElement('div')
    nameContainer.classList.add('name-container')
    nameContainer.innerText = title
    colorPickerContainer.appendChild(nameContainer)

    const displayPaletteContainer = document.createElement('div')
    displayPaletteContainer.classList.add('display-palette-container', 'horizontal')
    colorPickerContainer.appendChild(displayPaletteContainer)

    const colorDisplay = document.createElement('div')
    colorDisplay.classList.add('color-display')
    displayPaletteContainer.appendChild(colorDisplay)

    const paletteContainer = document.createElement('div')
    paletteContainer.classList.add('palette-container')
    displayPaletteContainer.appendChild(paletteContainer)

    const backgroundHue = document.createElement('div')
    const saturationGradient = document.createElement('div')
    const valueGradient = document.createElement('div')
    const paletteDropper = document.createElement('div')
    backgroundHue.classList.add('background-hue')
    saturationGradient.classList.add('saturation-gradient')
    valueGradient.classList.add('value-gradient')
    paletteDropper.classList.add('dropper')
    paletteContainer.append(backgroundHue, saturationGradient, valueGradient, paletteDropper)

    const sliderContainer = document.createElement('div')
    sliderContainer.classList.add('slider-container', 'horizontal', 'center')
    colorPickerContainer.appendChild(sliderContainer)

    const hueSlider = document.createElement('div')
    hueSlider.classList.add('hue-slider')
    sliderContainer.appendChild(hueSlider)

    const hueDropper = document.createElement('div')
    hueDropper.classList.add('dropper')
    hueSlider.appendChild(hueDropper)

    const conversionsContainer = document.createElement('div')
    conversionsContainer.classList.add('color-format-container')
    colorPickerContainer.appendChild(conversionsContainer)

    const conversionHexContainer = document.createElement('div')
    conversionHexContainer.classList.add('flex-item', 'wide')
    conversionsContainer.appendChild(conversionHexContainer)
    {
      const fieldset = document.createElement('fieldset')
      fieldset.classList.add('input-box')
      const legend = document.createElement('legend')
      legend.innerText = 'HEX'
      const input = document.createElement('input')
      input.type = 'text'
      input.addEventListener('input', () => {
        this.dispatchEvent(new CustomEvent('fieldchange-hex', { detail: { value: input.value } }))
      })
      fieldset.append(legend, input)
      conversionHexContainer.appendChild(fieldset)
      this.fieldHEX = input
    }

    const conversionRGBContainer = document.createElement('div')
    conversionRGBContainer.classList.add('flex-item')
    conversionsContainer.appendChild(conversionRGBContainer)
    {
      const fieldset = document.createElement('fieldset')
      fieldset.classList.add('input-box')
      const legend = document.createElement('legend')
      legend.innerText = 'RGB'
      const input = document.createElement('input')
      input.type = 'text'
      input.addEventListener('input', () => {
        this.dispatchEvent(new CustomEvent('fieldchange-rgb', { detail: { value: input.value } }))
      })
      fieldset.append(legend, input)
      conversionRGBContainer.appendChild(fieldset)
      this.fieldRGB = input
    }

    const conversionCMYKContainer = document.createElement('div')
    conversionCMYKContainer.classList.add('flex-item')
    conversionsContainer.appendChild(conversionCMYKContainer)
    {
      const fieldset = document.createElement('fieldset')
      fieldset.classList.add('input-box')
      const legend = document.createElement('legend')
      legend.innerText = 'CMYK'
      const input = document.createElement('input')
      input.type = 'text'
      input.addEventListener('input', () => {
        this.dispatchEvent(new CustomEvent('fieldchange-cmyk', { detail: { value: input.value } }))
      })
      fieldset.append(legend, input)
      conversionCMYKContainer.appendChild(fieldset)
      this.fieldCMYK = input
    }

    const conversionHSVContainer = document.createElement('div')
    conversionHSVContainer.classList.add('flex-item')
    conversionsContainer.appendChild(conversionHSVContainer)
    {
      const fieldset = document.createElement('fieldset')
      fieldset.classList.add('input-box')
      const legend = document.createElement('legend')
      legend.innerText = 'HSV'
      const input = document.createElement('input')
      input.type = 'text'
      input.addEventListener('input', () => {
        this.dispatchEvent(new CustomEvent('fieldchange-hsv', { detail: { value: input.value } }))
      })
      fieldset.append(legend, input)
      conversionHSVContainer.appendChild(fieldset)
      this.fieldHSV = input
    }

    const conversionHSLContainer = document.createElement('div')
    conversionHSLContainer.classList.add('flex-item')
    conversionsContainer.appendChild(conversionHSLContainer)
    {
      const fieldset = document.createElement('fieldset')
      fieldset.classList.add('input-box')
      const legend = document.createElement('legend')
      legend.innerText = 'HSL'
      const input = document.createElement('input')
      input.type = 'text'
      input.addEventListener('input', () => {
        this.dispatchEvent(new CustomEvent('fieldchange-hsl', { detail: { value: input.value } }))
      })
      fieldset.append(legend, input)
      conversionHSLContainer.appendChild(fieldset)
      this.fieldHSL = input
    }

    this.element = colorPickerContainer
    this.paletteContainer = paletteContainer
    this.paletteDropper = paletteDropper
    this.hueDropper = hueDropper
    this.colorDisplay = colorDisplay
    this.backgroundHue = backgroundHue
    this.hueSlider = hueSlider

    this.hue = 0
    this.lastSV = [0, 0]

    // events for palette dropper
    {
      let movingDropper = false

      paletteContainer.addEventListener('mousedown', e => {
        movingDropper = true
        this.dispatchEvent(new CustomEvent('dropperchange-palette', { detail: { event: e } }))
      })

      paletteContainer.addEventListener('mouseup', e => {
        this.dispatchEvent(new CustomEvent('dropperchange-palette', { detail: { event: e } }))
      })

      window.addEventListener('mouseup', () => {
        movingDropper = false
      })

      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          movingDropper = false
        }
      })

      window.addEventListener('mousemove', e => {
        if (movingDropper) {
          this.dispatchEvent(new CustomEvent('dropperchange-palette', { detail: { event: e } }))
        }
      })
    }

    // events for hue dropper
    {
      let movingDropper = false

      hueSlider.addEventListener('mousedown', e => {
        e.stopPropagation()
        this.dispatchEvent(new CustomEvent('dropperchange-slider', { detail: { event: e } }))
      })

      hueDropper.addEventListener('mousedown', e => {
        e.stopPropagation()
        movingDropper = true
        this.dispatchEvent(new CustomEvent('dropperchange-slider', { detail: { event: e } }))
      })

      sliderContainer.addEventListener('mousedown', e => {
        e.stopPropagation()
        this.dispatchEvent(new CustomEvent('dropperchange-slider', { detail: { event: e } }))
      })

      hueSlider.addEventListener('mouseup', e => {
        if (!movingDropper) return
        movingDropper = false
        this.dispatchEvent(new CustomEvent('dropperchange-slider', { detail: { event: e } }))
      })

      window.addEventListener('mouseup', () => {
        movingDropper = false
      })

      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          movingDropper = false
        }
      })

      window.addEventListener('mousemove', e => {
        if (movingDropper) {
          this.dispatchEvent(new CustomEvent('dropperchange-slider', { detail: { event: e } }))
        }
      })

      sliderContainer.addEventListener('wheel', e => {
        e.preventDefault()
        if (e.deltaY === 0) return
        const scrollDir = Math.sign(e.deltaY)
        if (this.hue === 0 && scrollDir < 0) return
        if (this.hue === 360 && scrollDir > 0) return

        this.dispatchEvent(new CustomEvent('dropperchange-slider', { detail: { event: e, scrollDir } }))
      })
    }
  }

  /**
   * @param {'HEX' | 'RGB' | 'CMYK' | 'HSV' | 'HSL' | ''} [exclude=''] 
   */
  updateConversionFields(exclude = '') {
    const c = new Color(this.getCurrentColor())

    if (exclude !== 'HEX') {
      this.fieldHEX.value = c.toHexString()
    }

    if (exclude !== 'RGB') {
      let s = c.toRGBString()
      this.fieldRGB.value = s.substring(4, s.length - 1)
    }

    if (exclude !== 'CMYK') {
      let s = c.toCMYKString()
      this.fieldCMYK.value = s.substring(5, s.length - 1)
    }

    if (exclude !== 'HSV') {
      let s = c.toHSVString(true)
      this.fieldHSV.value = s.substring(4, s.length - 1)
    }

    if (exclude !== 'HSL') {
      let s = c.toHSLString(true)
      this.fieldHSL.value = s.substring(4, s.length - 1)
    }
  }

  /**
   * @param {number} u 0 <= u (left) <= 1
   * @param {number} v 0 <= v (top) <= 1
   */
  setDropperPosPalette(u, v) {
    const dropperBounds = this.paletteDropper.getBoundingClientRect()
    const paletteBounds = this.paletteContainer.getBoundingClientRect()

    this.paletteDropper.style.left = (u * paletteBounds.width - dropperBounds.width / 2) + 'px'
    this.paletteDropper.style.top = (v * paletteBounds.height - dropperBounds.height / 2) + 'px'
  }

  /**
   * @param {number} t 0 <= t (left) <= 1
   */
  setDropperPosSlider(t) {
    const dropperBounds = this.hueDropper.getBoundingClientRect()
    const sliderBounds = this.hueSlider.getBoundingClientRect()

    this.hueDropper.style.left = (t * sliderBounds.width - dropperBounds.width / 2) + 'px'
    this.hueDropper.style.top = (sliderBounds.height / 2 - dropperBounds.height / 2) + 'px'
  }

  /**
   * @param {number} hue 0 <= hue < 360
   * @param {boolean?} [setsv=true] whether or not to also call this.setSV
   */
  setHue(hue, setsv = true) {
    this.hue = hue
    this.backgroundHue.style.setProperty('--hue', hue % 360)
    this.hueDropper.style.backgroundColor = `hsl(${hue % 360}, 100%, 50%)`
    if (setsv === true) this.setSV(...this.lastSV)
  }

  /**
   * @param {number} saturation 0 <= saturation <= 1
   * @param {number} value 0 <= value <= 1
   */
  setSV(saturation, value) {
    const c = new Color().fromHSV(this.hue, saturation, value)
    const str = c.toHSLString()
    this.paletteDropper.style.backgroundColor = str
    this.colorDisplay.style.backgroundColor = str
    this.lastSV[0] = saturation
    this.lastSV[1] = value
  }

  /**
   * @param {string} [initialColor='rgb(204, 40, 40)'] 
   * @returns {ColorPicker}
   */
  initialize(initialColor = 'rgb(204, 40, 40)') {
    const c = new Color(initialColor)
    const [h, s, v] = c.getHSV()

    this.setHue(h, false)
    this.setSV(s, v)
    this.setDropperPosPalette(s, 1 - v)
    this.setDropperPosSlider(h / 360)

    return this
  }

  /**
   * @param {HTMLElement} element 
   * @returns {ColorPicker}
   */
  appendTo(element) {
    element.appendChild(this.element)
    return this
  }

  /**
   * @returns {string} rgb(red, green, blue)
   */
  getCurrentColor() {
    return this.colorDisplay.style.backgroundColor
  }
}