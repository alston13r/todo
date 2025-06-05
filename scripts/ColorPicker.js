/**
 * @param {number} x 
 * @param {number} [max=1] 
 * @param {number} [min=0] 
 * @returns {number} x clamped between min and max, inclusive
 */
function clamp(x, max = 1, min = 0) {
  return Math.min(max, Math.max(min, x))
}

class Validator {
  /**
   * @param {HTMLInputElement} input 
   * @param {string} initial 
   */
  constructor(input, initial) {
    this.isValidator = true

    this.input = input
    this.lastValid = initial
  }

  /**
   * @returns {Color | null}
   */
  validate() {
    return null
  }

  onBlur() {
    this.input.value = this.lastValid
  }
}

// class SingleRegexValidator extends Validator {
//   /**
//    * @param {HTMLInputElement} input 
//    * @param {string} initial 
//    */
//   constructor(input, initial) {
//     super(input, initial)
//     this.isSingleRegexValidator = true
//     this.regex = /.*/i
//   }

//   validate() {
//     const m = this.inpu
//     return this.input.value.match
//   }
// }

class RGBValidator extends Validator {
  static Regex = /\s*(?:rgb\()?\s*(?<red>\d{1,3})\s*,\s*(?<green>\d{1,3})\s*,\s*(?<blue>\d{1,3})\s*\)?\s*$/i

  /**
   * @param {HTMLInputElement} input 
   * @param {string} initial 
   */
  constructor(input, initial) {
    super(input, initial)
    this.isRGBValidator = true

    this.regex = RGBValidator.Regex
  }

  /**
   * @returns {Color | null}
   */
  validate() {
    const m = this.input.value.match(this.regex)
    if (m === null) return null

    const c = new Color(`rgb(${m[0]})`)

    const r = Math.floor(c.r * 255)
    const g = Math.floor(c.g * 255)
    const b = Math.floor(c.b * 255)
    this.lastValid = `${r}, ${g}, ${b}`

    return c
  }
}

class HSVValidator extends Validator {
  static Regex = /\s*(?:hsv\()?\s*(?<hue>\d+(?:\.\d+)?)°?\s*,\s*(?<saturation>(?:\d+(?:\.\d+)?%)|(?:0(?:\.0+)?|1(?:\.0+)?|0?\.\d+))\s*,\s*(?<value>(?:\d+(?:\.\d+)?%)|(?:0(?:\.0+)?|1(?:\.0+)?|0?\.\d+))\s*\)?\s*$/i

  /**
   * @param {HTMLInputElement} input 
   * @param {string} initial 
   */
  constructor(input, initial) {
    super(input, initial)
    this.isHSVValidator = true

    this.regex = HSVValidator.Regex
  }

  /**
   * @returns {Color | null}
   */
  validate() {
    const m = this.input.value.match(this.regex)
    if (m === null) return null

    const c = new Color(`hsv(${m[0]})`)
    const [h, s, v] = RGBToHSV(c.r, c.g, c.b)
    this.lastValid = `${h}°, ${Math.floor(s * 100)}%, ${Math.floor(v * 100)}%`

    return c
  }
}

class HSLValidator extends Validator {
  static Regex = /\s*(?:hsl\()?\s*(?<hue>\d+(?:\.\d+)?)°?\s*,\s*(?<saturation>(?:\d+(?:\.\d+)?%)|(?:0(?:\.0+)?|1(?:\.0+)?|0?\.\d+))\s*,\s*(?<light>(?:\d+(?:\.\d+)?%)|(?:0(?:\.0+)?|1(?:\.0+)?|0?\.\d+))\s*\)?\s*$/i

  /**
   * @param {HTMLInputElement} input 
   * @param {string} initial 
   */
  constructor(input, initial) {
    super(input, initial)
    this.isHSLValidator = true

    this.regex = HSLValidator.Regex
  }

  /**
   * @returns {Color | null}
   */
  validate() {
    const m = this.input.value.match(this.regex)
    if (m === null) return null

    const c = new Color(`hsl(${m[0]})`)
    const [h, s, l] = RGBToHSL(c.r, c.g, c.b)
    this.lastValid = `${h}°, ${Math.floor(s * 100)}%, ${Math.floor(l * 100)}%`

    return c
  }
}

class CMYKValidator extends Validator {
  static Regex = /\s*(?:cmyk\()?\s*(?<cyan>(?:\d+(?:\.\d+)?%)|(?:0(?:\.0+)?|1(?:\.0+)?|0?\.\d+))\s*,\s*(?<magenta>(?:\d+(?:\.\d+)?%)|(?:0(?:\.0+)?|1(?:\.0+)?|0?\.\d+))\s*,\s*(?<yellow>(?:\d+(?:\.\d+)?%)|(?:0(?:\.0+)?|1(?:\.0+)?|0?\.\d+))\s*,\s*(?<black>(?:\d+(?:\.\d+)?%)|(?:0(?:\.0+)?|1(?:\.0+)?|0?\.\d+))\s*\)?\s*$/i

  /**
   * @param {HTMLInputElement} input 
   * @param {string} initial 
   */
  constructor(input, initial) {
    super(input, initial)
    this.isCMYKValidator = true

    this.regex = CMYKValidator.Regex
  }

  /**
   * @returns {Color | null}
   */
  validate() {
    const m = this.input.value.match(this.regex)
    if (m === null) return null

    const c = new Color(`cmyk(${m[0]})`)
    const [cyan, magenta, yellow, black] = RGBToCMYK(c.r, c.g, c.b)
    this.lastValid = `${Math.floor(cyan * 100)}%, ${Math.floor(magenta * 100)}%, ${Math.floor(yellow * 100)}%, ${Math.floor(black * 100)}%`

    return c
  }
}

class HexValidator extends Validator {
  static Regex = /\s*#?(?:(?:(?<red>[0-9a-f]{2})(?<green>[0-9a-f]{2})(?<blue>[0-9a-f]{2}))|(?:(?<red>[0-9a-f])(?<green>[0-9a-f])(?<blue>[0-9a-f])))\s*$/i

  /**
   * @param {HTMLInputElement} input 
   * @param {string} initial 
   */
  constructor(input, initial) {
    super(input, initial)
    this.isHexValidator = true

    this.regex = HexValidator.Regex
  }

  /**
   * @returns {Color | null}
   */
  validate() {
    const m = this.input.value.match(this.regex)
    if (m === null) return null

    const c = new Color(m[0])
    this.lastValid = RGBToHexString(c.r, c.g, c.b)

    return c
  }
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

    // const hexValidator = {
    //   hex6: /\s*#?(?<red>[0-9a-f]{2})(?<green>[0-9a-f]{2})(?<blue>[0-9a-f]{2})\s*$/i,
    //   hex3: /\s*#?(?<red>[0-9a-f])(?<green>[0-9a-f])(?<blue>[0-9a-f])\s*$/i,

    //   /**
    //    * @param {RegExpMatchArray} match 
    //    * @returns {string} #RRGGBB
    //    */
    //   createString(match) {
    //     return new Color(match[0]).toHexString()
    //   },

    //   /** @type {string} */
    //   lastValid: null,

    //   /**
    //    * @param {string} input 
    //    */
    //   setLastValid(input) {
    //     hexValidator.lastValid = input
    //   },

    //   /**
    //    * @param {string} input 
    //    */
    //   validate: input => {
    //     const trimmed = input.trim()

    //     const m = trimmed.match(trimmed.length >= 6 ? hexValidator.hex6 : hexValidator.hex3)
    //     // const m = trimmed.length >= 6 ? input.match(hexValidator.hex6) : input.match(hexValidator.hex3)
    //     // let m = null
    //     // if (trimmed.length >= 6) {
    //     //   m = input.match(hexValidator.hex6)
    //     // } else {
    //     //   m = input.match(hexValidator.hex3)
    //     // }

    //     if (m !== null) hexValidator.setLastValid(hexValidator.createString(m))
    //     return m
    //   }
    // }

    this.addEventListener('fieldchange-hex', () => {
      const valid = this.fieldHexValidator.validate()
      if (valid !== null) this.setColor(valid, 'HEX')
    })
    this.addEventListener('fieldchange-rgb', () => {
      const valid = this.fieldRGBValidator.validate()
      if (valid !== null) this.setColor(valid, 'RGB')
    })
    this.addEventListener('fieldchange-hsv', () => {
      const valid = this.fieldHSVValidator.validate()
      if (valid !== null) this.setColor(valid, 'HSV')
    })
    this.addEventListener('fieldchange-hsl', () => {
      const valid = this.fieldHSLValidator.validate()
      if (valid !== null) this.setColor(valid, 'HSL')
    })
    this.addEventListener('fieldchange-cmyk', () => {
      const valid = this.fieldCMYKValidator.validate()
      if (valid !== null) this.setColor(valid, 'CMYK')
    })

    this.addEventListener('fieldblur-hex', () => this.fieldHexValidator.onBlur())
    this.addEventListener('fieldblur-rgb', () => this.fieldRGBValidator.onBlur())
    this.addEventListener('fieldblur-hsv', () => this.fieldHSVValidator.onBlur())
    this.addEventListener('fieldblur-hsl', () => this.fieldHSLValidator.onBlur())
    this.addEventListener('fieldblur-cmyk', () => this.fieldCMYKValidator.onBlur())

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
      input.addEventListener('blur', () => this.dispatchEvent(new CustomEvent('fieldblur-hex')))
      fieldset.append(legend, input)
      conversionHexContainer.appendChild(fieldset)
      this.fieldHex = input
      this.fieldHexValidator = new HexValidator(input)
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
        this.dispatchEvent(new CustomEvent('fieldchange-rgb'))
      })
      input.addEventListener('blur', () => this.dispatchEvent(new CustomEvent('fieldblur-rgb')))
      fieldset.append(legend, input)
      conversionRGBContainer.appendChild(fieldset)
      this.fieldRGB = input
      this.fieldRGBValidator = new RGBValidator(input)
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
      input.addEventListener('blur', () => this.dispatchEvent(new CustomEvent('fieldblur-cmyk')))
      fieldset.append(legend, input)
      conversionCMYKContainer.appendChild(fieldset)
      this.fieldCMYK = input
      this.fieldCMYKValidator = new CMYKValidator(input)
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
      input.addEventListener('blur', () => this.dispatchEvent(new CustomEvent('fieldblur-hsv')))
      fieldset.append(legend, input)
      conversionHSVContainer.appendChild(fieldset)
      this.fieldHSV = input
      this.fieldHSVValidator = new HSVValidator(input)
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
      input.addEventListener('blur', () => this.dispatchEvent(new CustomEvent('fieldblur-hsl')))
      fieldset.append(legend, input)
      conversionHSLContainer.appendChild(fieldset)
      this.fieldHSL = input
      this.fieldHSLValidator = new HSLValidator(input)
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
      this.fieldHex.value = c.toHexString()
      this.fieldHexValidator.lastValid = this.fieldHex.value
    }

    if (exclude !== 'RGB') {
      let s = c.toRGBString()
      this.fieldRGB.value = s.substring(4, s.length - 1)
      this.fieldRGBValidator.lastValid = this.fieldRGB.value
    }

    if (exclude !== 'CMYK') {
      let s = c.toCMYKString()
      this.fieldCMYK.value = s.substring(5, s.length - 1)
      this.fieldCMYKValidator.lastValid = this.fieldCMYK.value
    }

    if (exclude !== 'HSV') {
      let s = c.toHSVString(true)
      this.fieldHSV.value = s.substring(4, s.length - 1)
      this.fieldHSVValidator.lastValid = this.fieldHSV.value
    }

    if (exclude !== 'HSL') {
      let s = c.toHSLString(true)
      this.fieldHSL.value = s.substring(4, s.length - 1)
      this.fieldHSLValidator.lastValid = this.fieldHSL.value
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
   * @param {Color} c 
   * @param {'HEX' | 'RGB' | 'CMYK' | 'HSV' | 'HSL' | ''} [exclude=''] 
   */
  setColor(c, exclude = '') {
    {
      const str = c.toHexString()
      this.fieldHexValidator.lastValid = str
    }

    {
      const str = c.toRGBString()
      const start = str.indexOf('(') + 1
      const end = str.lastIndexOf(')')
      this.fieldRGBValidator.lastValid = str.substring(start, end)
    }

    {
      const str = c.toCMYKString()
      const start = str.indexOf('(') + 1
      const end = str.lastIndexOf(')')
      this.fieldCMYKValidator.lastValid = str.substring(start, end)
    }

    {
      const str = c.toHSVString(true)
      const start = str.indexOf('(') + 1
      const end = str.lastIndexOf(')')
      this.fieldHSVValidator.lastValid = str.substring(start, end)
    }

    {
      const str = c.toHSLString(true)
      const start = str.indexOf('(') + 1
      const end = str.lastIndexOf(')')
      this.fieldHSLValidator.lastValid = str.substring(start, end)
    }

    const [h, s, v] = RGBToHSV(c.r, c.g, c.b)

    this.setHue(h, false)
    this.setSV(s, v)
    this.setDropperPosPalette(s, 1 - v)
    this.setDropperPosSlider(h / 360)

    this.updateConversionFields(exclude)
  }

  /**
   * @param {string} [initialColor='rgb(204, 40, 40)'] 
   * @returns {ColorPicker}
   */
  initialize(initialColor = 'rgb(204, 40, 40)') {
    const c = new Color(initialColor)
    this.setColor(c)
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