function clamp(x, max = 1, min = 0) {
  return Math.min(max, Math.max(min, x))
}

class ColorPicker extends EventTarget {
  constructor(title = 'Color picker') {
    super()

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
      input.placeholder = 'placeholder' // TODO remove
      fieldset.append(legend, input)
      conversionHexContainer.appendChild(fieldset)
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
      input.placeholder = 'placeholder' // TODO remove
      fieldset.append(legend, input)
      conversionRGBContainer.appendChild(fieldset)
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
      input.placeholder = 'placeholder' // TODO remove
      fieldset.append(legend, input)
      conversionCMYKContainer.appendChild(fieldset)
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
      input.placeholder = 'placeholder' // TODO remove
      fieldset.append(legend, input)
      conversionHSVContainer.appendChild(fieldset)
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
      input.placeholder = 'placeholder' // TODO remove
      fieldset.append(legend, input)
      conversionHSLContainer.appendChild(fieldset)
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

        const bounds = paletteContainer.getBoundingClientRect()

        const ox = clamp(e.clientX - bounds.x, bounds.width)
        const oy = clamp(e.clientY - bounds.y, bounds.height)
        this.setPaletteDropperPos(ox, oy)

        const u = clamp(ox / bounds.width) // saturation
        const v = clamp(1 - (oy / bounds.height)) // value
        this.setSV(u, v)
      })

      paletteContainer.addEventListener('mouseup', e => {
        const bounds = paletteContainer.getBoundingClientRect()

        const ox = clamp(e.clientX - bounds.x, bounds.width)
        const oy = clamp(e.clientY - bounds.y, bounds.height)
        this.setPaletteDropperPos(ox, oy)

        const u = clamp(ox / bounds.width) // saturation
        const v = clamp(1 - (oy / bounds.height)) // value
        this.setSV(u, v)
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
          const bounds = paletteContainer.getBoundingClientRect()

          const ox = clamp(e.clientX - bounds.x, bounds.width)
          const oy = clamp(e.clientY - bounds.y, bounds.height)
          this.setPaletteDropperPos(ox, oy)

          const u = clamp(ox / bounds.width) // saturation
          const v = clamp(1 - (oy / bounds.height)) // value
          this.setSV(u, v)
        }
      })
    }

    // events for hue dropper
    {
      let movingDropper = false

      hueSlider.addEventListener('mousedown', e => {
        // movingDropper = true

        const bounds = hueSlider.getBoundingClientRect()

        const ox = clamp(e.clientX - bounds.x, bounds.width)
        this.setHueDropperPos(ox)

        const hue = clamp(ox / bounds.width)
        this.setHue(hue * 360)
      })

      hueDropper.addEventListener('mousedown', e => {
        movingDropper = true

        const bounds = hueSlider.getBoundingClientRect()

        const ox = clamp(e.clientX - bounds.x, bounds.width)
        this.setHueDropperPos(ox)

        const hue = clamp(ox / bounds.width)
        this.setHue(hue * 360)
      })

      hueSlider.addEventListener('mouseup', e => {
        if (!movingDropper) return
        movingDropper = false

        const bounds = hueSlider.getBoundingClientRect()

        const ox = clamp(e.clientX - bounds.x, bounds.width)
        this.setHueDropperPos(ox)

        const hue = clamp(ox / bounds.width)
        this.setHue(hue * 360)
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
          const bounds = hueSlider.getBoundingClientRect()

          const ox = clamp(e.clientX - bounds.x, bounds.width)
          this.setHueDropperPos(ox)

          const hue = clamp(ox / bounds.width)
          this.setHue(hue * 360)
        }
      })

      sliderContainer.addEventListener('wheel', e => {
        e.preventDefault()
        if (e.deltaY === 0) return
        const scrollDir = Math.sign(e.deltaY)
        if (this.hue === 0 && scrollDir < 0) return
        if (this.hue === 360 && scrollDir > 0) return
        const newHue = clamp(this.hue + scrollDir, 360, 0)
        this.setHue(newHue)

        const bounds = hueSlider.getBoundingClientRect()
        const ox = clamp(bounds.width * newHue / 360, bounds.width)
        this.setHueDropperPos(ox)
      })
    }
  }

  setPaletteDropperPos(x, y) {
    const bounds = this.paletteDropper.getBoundingClientRect()
    this.paletteDropper.style.left = (x - bounds.width / 2) + 'px'
    this.paletteDropper.style.top = (y - bounds.height / 2) + 'px'
  }

  setHueDropperPos(x) {
    const bounds = this.hueDropper.getBoundingClientRect()
    const sliderBounds = this.hueSlider.getBoundingClientRect()
    this.hueDropper.style.left = (x - bounds.width / 2) + 'px'
    this.hueDropper.style.top = (sliderBounds.height / 2 - bounds.height / 2) + 'px'
  }

  /**
   * @param {number} hue 0 <= hue < 360
   */
  setHue(hue) {
    this.hue = hue
    this.backgroundHue.style.setProperty('--hue', hue % 360)
    this.hueDropper.style.backgroundColor = `hsl(${hue % 360}, 100%, 50%)`
    this.setSV(...this.lastSV)

    this.dispatchEvent(new CustomEvent('colorchange', {
      detail: {
        newColor: new Color().fromHSV(this.hue % 360, ...this.lastSV).toHexString()
      }
    }))
  }

  /**
   * @param {number} saturation 0 <= saturation <= 1
   * @param {number} value 0 <= value <= 1
   */
  setSV(saturation, value) {
    const c = new Color().fromHSV(this.hue % 360, saturation, value)
    const str = c.toHSLString()
    this.paletteDropper.style.backgroundColor = str
    this.colorDisplay.style.backgroundColor = str
    this.lastSV[0] = saturation
    this.lastSV[1] = value

    this.dispatchEvent(new CustomEvent('colorchange', {
      detail: {
        newColor: new Color().fromHSV(this.hue % 360, ...this.lastSV).toHexString()
      }
    }))
  }

  /**
   * @param {string} [initialColor='rgb(204, 40, 40)'] 
   * @returns {ColorPicker}
   */
  initialize(initialColor = 'rgb(204, 40, 40)') {
    const paletteBounds = this.paletteContainer.getBoundingClientRect()
    const sliderBounds = this.hueSlider.getBoundingClientRect()

    const c = new Color(initialColor)
    const [h, s, v] = c.getHSV()

    this.setHue(h)
    this.setSV(s, v)
    this.setPaletteDropperPos(paletteBounds.width * s, paletteBounds.height * (1 - v))
    this.setHueDropperPos(sliderBounds.width * h / 360)

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
   * @returns {string} rgb(r, g, b)
   */
  getCurrentColor() {
    return this.colorDisplay.style.backgroundColor
  }
}