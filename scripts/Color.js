/**
 * @param {number} h 0 <= hue < 360
 * @param {number} s 0 <= saturation <= 1
 * @param {number} v 0 <= value <= 1
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= red <= 1, 0 <= green <= 1, 0 <= blue <= 1]
 */
function HSVToRGB(h = 0, s = 0, v = 0, arr = []) {
  h %= 360

  const C = v * s
  const X = C * (1 - Math.abs((h / 60) % 2 - 1))
  const m = v - C

  let rp = 0
  let gp = 0
  let bp = 0
  if (h < 60) {
    [rp, gp, bp] = [C, X, 0]
  } else if (h < 120) {
    [rp, gp, bp] = [X, C, 0]
  } else if (h < 180) {
    [rp, gp, bp] = [0, C, X]
  } else if (h < 240) {
    [rp, gp, bp] = [0, X, C]
  } else if (h < 300) {
    [rp, gp, bp] = [X, 0, C]
  } else if (h < 360) {
    [rp, gp, bp] = [C, 0, X]
  }

  arr[0] = rp + m
  arr[1] = gp + m
  arr[2] = bp + m

  return arr
}

/**
 * @param {number} r 0 <= red <= 1
 * @param {number} g 0 <= green <= 1
 * @param {number} b 0 <= blue <= 1
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= hue < 360, 0 <= saturation <= 1, 0 <= value <= 1]
 */
function RGBToHSV(r = 0, g = 0, b = 0, arr = []) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  const v = max
  let h = 0
  let s = 0
  if (delta !== 0) {
    switch (max) {
      case r:
        h = 60 * ((g - b) / delta % 6)
        break
      case g:
        h = 60 * ((b - r) / delta + 2)
        break
      case b:
        h = 60 * ((r - g) / delta + 4)
        break
    }
  }

  if (max !== 0) {
    s = delta / max
  }

  arr[0] = h
  arr[1] = s
  arr[2] = v

  return arr
}

/**
 * @param {number} h 0 <= hue < 360
 * @param {number} s 0 <= saturation <= 1
 * @param {number} l 0 <= light <= 1
 * @param {number} arr 
 * @returns {number[]} [0 <= red <= 1, 0 <= green <= 1, 0 <= blue <= 1]
 */
function HSLToRGB(h = 0, s = 0, l = 0, arr = []) {
  h %= 360

  const C = (1 - Math.abs(2 * l - 1)) * s
  const X = C * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - C / 2

  let rp = 0
  let gp = 0
  let bp = 0
  if (h < 60) {
    [rp, gp, bp] = [C, X, 0]
  } else if (h < 120) {
    [rp, gp, bp] = [X, C, 0]
  } else if (h < 180) {
    [rp, gp, bp] = [0, C, X]
  } else if (h < 240) {
    [rp, gp, bp] = [0, X, C]
  } else if (h < 300) {
    [rp, gp, bp] = [X, 0, C]
  } else if (h < 360) {
    [rp, gp, bp] = [C, 0, X]
  }

  arr[0] = rp + m
  arr[1] = gp + m
  arr[2] = bp + m

  return arr
}

/**
 * @param {number} r 0 <= red <= 1
 * @param {number} g 0 <= green <= 1
 * @param {number} b 0 <= blue <= 1
 * @param {number} arr 
 * @returns {number[]} [0 <= hue < 360, 0 <= saturation <= 1, 0 <= light <= 1]
 */
function RGBToHSL(r = 0, g = 0, b = 0, arr = []) {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (delta !== 0) {
    switch (max) {
      case r:
        h = 60 * ((g - b) / delta % 6)
        break
      case g:
        h = 60 * ((b - r) / delta + 2)
        break
      case b:
        h = 60 * ((r - g) / delta + 4)
        break
    }

    s = delta / (1 - Math.abs(2 * l - 1))
  }

  arr[0] = h
  arr[1] = s
  arr[2] = l

  return arr
}

/**
 * @param {number} c 0 <= cyan <= 1
 * @param {number} m 0 <= magenta <= 1
 * @param {number} y 0 <= yellow <= 1
 * @param {number} k 0 <= black <= 1
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= red <= 1, 0 <= green <= 1, 0 <= blue <= 1]
 */
function CMYKToRGB(c = 0, m = 0, y = 0, k = 0, arr = []) {
  arr[0] = (1 - c) * (1 - k)
  arr[1] = (1 - m) * (1 - k)
  arr[2] = (1 - y) * (1 - k)

  return arr
}

/**
 * @param {number} r 0 <= red <= 1
 * @param {number} g 0 <= green <= 1
 * @param {number} b 0 <= blue <= 1
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= cyan <= 1, 0 <= magenta <= 1, 0 <= yellow <= 1, 0 <= black <= 1]
 */
function RGBToCMYK(r = 0, g = 0, b = 0, arr = []) {
  const max = Math.max(r, g, b)

  arr[0] = max - r
  arr[1] = max - g
  arr[2] = max - b
  arr[3] = 1 - max

  if (max !== 0) {
    arr[0] /= max
    arr[1] /= max
    arr[2] /= max
  }

  return arr
}

/**
 * @param {number} r 0 <= red <= 1
 * @param {number} g 0 <= green <= 1
 * @param {number} b 0 <= blue <= 1
 * @returns {string}
 */
function RGBToHexString(r = 0, g = 0, b = 0) {
  /**
   * @param {number} v 
   * @returns {string}
   */
  function ensureLength(v) {
    const s = v.toString(16)
    return s.length === 1 ? '0' + s : s
  }

  const rs = ensureLength(Math.floor(r * 255))
  const gs = ensureLength(Math.floor(g * 255))
  const bs = ensureLength(Math.floor(b * 255))

  return '#' + rs + gs + bs
}

/**
 * @param {string} str #RRGGBB
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= red <= 1, 0 <= green <= 1, 0 <= blue <= 1]
 */
function HexStringToRGB(str, arr = []) {
  const rs = str.substring(1, 3)
  const gs = str.substring(3, 5)
  const bs = str.substring(5, 7)

  const rv = parseInt(rs, 16) / 255
  const gv = parseInt(gs, 16) / 255
  const bv = parseInt(bs, 16) / 255

  arr[0] = rv
  arr[1] = gv
  arr[2] = bv

  return arr
}

/**
 * @param {number} hex 0xRRGGBB
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= red <= 1, 0 <= green <= 1, 0 <= blue <= 1]
 */
function HexNumberToRGB(hex, arr = []) {
  const rv = (hex >> 16) & 0xff
  const gv = (hex >> 8) & 0xff
  const bv = hex & 0xff

  arr[0] = rv / 255
  arr[1] = gv / 255
  arr[2] = bv / 255

  return arr
}

/**
 * @param {string} str hsl(hue°, saturation%, light%)
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= hue < 360, 0 <= saturation <= 1, 0 <= light <= 1]
 */
function HSLStringToHSL(str, arr = []) {
  let m

  if (m = str.match(/\s*hsl\s*\(\s*(\d+)°?\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/)) {
    arr[0] = parseInt(m[1]) % 360
    arr[1] = parseInt(m[2]) / 100
    arr[2] = parseInt(m[3]) / 100
  } else {
    arr[0] = 0
    arr[1] = 0
    arr[2] = 0
  }

  return arr
}

/**
 * @param {number} h 0 <= hue < 360
 * @param {number} s 0 <= saturation <= 1
 * @param {number} l 0 <= light <= 1
 * @param {boolean} [includeDegrees=false] 
 * @returns {string} hsv(hue°, saturation%, light%)
 */
function HSLToHSLString(h = 0, s = 0, l = 0, includeDegrees = false) {
  const hf = Math.round(h) % 360
  const sf = Math.floor(s * 100)
  const lf = Math.floor(l * 100)
  return `hsl(${hf}${includeDegrees ? '°' : ''}, ${sf}%, ${lf}%)`
}

/**
 * @param {string} str hsv(hue°, saturation%, value%)
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= hue <= 360, 0 <= saturation <= 1, 0 <= value <= 1]
 */
function HSVStringToHSV(str, arr = []) {
  let m

  if (m = str.match(/\s*hsv\s*\(\s*(\d+)°?\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/)) {
    arr[0] = parseInt(m[1]) % 360
    arr[1] = parseInt(m[2]) / 100
    arr[2] = parseInt(m[3]) / 100
  } else {
    arr[0] = 0
    arr[1] = 0
    arr[2] = 0
  }

  return arr
}

/**
 * @param {number} h 0 <= hue < 360
 * @param {number} s 0 <= saturation <= 1
 * @param {number} v 0 <= value <= 1
 * @param {boolean} [includeDegrees=false] 
 * @returns {string} hsv(hue°, saturation%, value%)
 */
function HSVToHSVString(h = 0, s = 0, v = 0, includeDegrees = false) {
  const hf = Math.round(h) % 360
  const sf = Math.floor(s * 100)
  const vf = Math.floor(v * 100)
  return `hsv(${hf}${includeDegrees ? '°' : ''}, ${sf}%, ${vf}%)`
}

/**
 * @param {string} str rgb(red, green, blue)
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= red <= 1, 0 <= green <= 1, 0 <= blue <= 1]
 */
function RGBStringToRGB(str, arr = []) {
  let m

  if (m = str.match(/\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/)) {
    arr[0] = parseInt(m[1]) / 255
    arr[1] = parseInt(m[2]) / 255
    arr[2] = parseInt(m[3]) / 255
  } else {
    arr[0] = 0
    arr[1] = 0
    arr[2] = 0
  }

  return arr
}

/**
 * @param {number} r 0 <= red <= 1
 * @param {number} g 0 <= green <= 1
 * @param {number} b 0 <= blue <= 1
 * @returns {string} rgb(red, green, blue)
 */
function RGBToRGBString(r = 0, g = 0, b = 0) {
  const rf = Math.floor(r * 255)
  const gf = Math.floor(g * 255)
  const bf = Math.floor(b * 255)
  return `rgb(${rf}, ${gf}, ${bf})`
}

/**
 * @param {string} str cmyk(cyan%, magenta%, yellow%, black%)
 * @param {number[]?} arr 
 * @returns {number[]} [0 <= cyan <= 1, 0 <= magenta <= 1, 0 <= yellow <= 1, 0 <= black <= 1]
 */
function CMYKStringToCMYK(str, arr = []) {
  let m

  if (m = str.match(/\s*cmyk\s*\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/)) {
    arr[0] = parseInt(m[1]) / 100
    arr[1] = parseInt(m[2]) / 100
    arr[2] = parseInt(m[3]) / 100
    arr[3] = parseInt(m[4]) / 100
  } else {
    arr[0] = 0
    arr[1] = 0
    arr[2] = 0
    arr[3] = 0
  }

  return arr
}

/**
 * @param {number} c 0 <= cyan <= 1
 * @param {number} m 0 <= magenta <= 1
 * @param {number} y 0 <= yellow <= 1
 * @param {number} k 0 <= black <= 1
 * @returns {string} cmyk(cyan%, magenta%, yellow%, black%)
 */
function CMYKToCMYKString(c = 0, m = 0, y = 0, k = 0) {
  const cf = Math.floor(c * 100)
  const mf = Math.floor(m * 100)
  const yf = Math.floor(y * 100)
  const kf = Math.floor(k * 100)
  return `cmyk(${cf}%, ${mf}%, ${yf}%, ${kf}%)`
}






class Color {
  /**
   * @param {number | string | Color} r
   * @param {number} g
   * @param {number} b
   */
  constructor(r, g, b) {
    this.r = 1
    this.g = 1
    this.b = 1
    this.set(r, g, b)
  }

  /**
   * @param {number | string | Color} r
   * @param {number} g
   * @param {number} b
   * @returns {Color} a reference to this color
   */
  set(r, g, b) {
    if (r === undefined) return this
    if (g === undefined && b === undefined) {
      if (typeof r === 'number') return this.fromHex(r)
      if (typeof r === 'string') {
        const str = r.trim()
        if (str.startsWith('#')) return this.fromHex(str)
        if (str.startsWith('rgb')) return this.fromRGBString(str)
        if (str.startsWith('hsl')) return this.fromHSL(str)
        if (str.startsWith('hsv')) return this.fromHSV(str)
        if (str.startsWith('cmyk')) return this.fromCMYK(str)
      }
      if (r instanceof Color) return this.copy(r)
      return this
    }
    this.r = r
    this.g = g
    this.b = b
    return this
  }

  /**
   * @param {Color} color the color to copy
   * @returns {Color} a reference to this color
   */
  copy(color) {
    this.r = color.r
    this.g = color.g
    this.b = color.b
    return this
  }

  /**
   * @returns {Color} a reference to this color
   */
  clone() {
    return new Color(this)
  }

  /**
   * @param {number | string} hex 0xRRGGBB | #RRGGBB
   */
  fromHex(hex) {
    if (typeof hex === 'string') {
      [this.r, this.g, this.b] = HexStringToRGB(hex)
      return this
    }

    [this.r, this.g, this.b] = HexNumberToRGB(hex)
    return this
  }

  /**
   * @returns {number} 0xRRGGBB
   */
  toHexNumber() {
    const r = Math.floor(this.r * 255) << 16
    const g = Math.floor(this.g * 255) << 8
    const b = Math.floor(this.b * 255)

    return r + g + b
  }

  /**
   * @returns {string} #RRGGBB
   */
  toHexString() {
    return RGBToHexString(this.r, this.g, this.b)
  }

  /**
   * @param {string} str rgb(red, green, blue)
   * @returns {Color} a reference to this color
   */
  fromRGBString(str) {
    [this.r, this.g, this.b] = RGBStringToRGB(str)
    return this
  }

  /**
   * @returns {string} rgb(red, green, blue)
   */
  toRGBString() {
    return RGBToRGBString(this.r, this.g, this.b)
  }

  /**
   * @param {number | string} h 0 <= hue < 360 | hsl(hue, saturation%, light%)
   * @param {number} s 0 <= saturation <= 1
   * @param {number} l 0 <= light <= 1
   * @returns {Color} a reference to this color
   */
  fromHSL(h, s, l) {
    if (s === undefined && l === undefined) {
      if (typeof h === 'string') {
        [this.r, this.g, this.b] = HSLToRGB(...HSLStringToHSL(h))
      } else {
        [this.r, this.g, this.b] = HSLToRGB(h, 1, 0.5)
      }
      return this
    }

    [this.r, this.g, this.b] = HSLToRGB(h, s, l)
    return this
  }

  /**
   * @param {boolean} [includeDegrees=false] 
   * @returns {string} hsl(hue, saturation%, light%)
   */
  toHSLString(includeDegrees = false) {
    return HSLToHSLString(...RGBToHSL(this.r, this.g, this.b), includeDegrees)
  }

  /**
   * @param {number | string} h 0 <= hue < 360 | hsv(hue, saturation%, value%)
   * @param {number} s 0 <= saturation <= 1
   * @param {number} v 0 <= value <= 1
   * @returns {Color}
   */
  fromHSV(h, s, v) {
    if (s === undefined && v === undefined) {
      if (typeof h === 'string') {
        [this.r, this.g, this.b] = HSVToRGB(...HSVStringToHSV(h))
      } else {
        [this.r, this.g, this.b] = HSVToRGB(h, 1, 1)
      }
      return this
    }

    [this.r, this.g, this.b] = HSVToRGB(h, s, v)
    return this
  }

  /**
   * @param {boolean} [includeDegrees=false] 
   * @returns {string} hsv(hue, saturation%, value%)
   */
  toHSVString(includeDegrees = false) {
    return HSVToHSVString(...RGBToHSV(this.r, this.g, this.b), includeDegrees)
  }

  /**
   * @param {number[]?} arr
   * @returns {number[]} [hue, saturation, value]
   */
  getHSV(arr = []) {
    const max = Math.max(this.r, this.g, this.b)
    const min = Math.min(this.r, this.g, this.b)
    const delta = max - min

    const v = max
    let h = 0
    let s = 0
    if (delta !== 0) {
      switch (max) {
        case this.r:
          h = 60 * ((this.g - this.b) / delta % 6)
          break
        case this.g:
          h = 60 * ((this.b - this.r) / delta + 2)
          break
        case this.b:
          h = 60 * ((this.r - this.g) / delta + 4)
          break
      }
    }

    if (max !== 0) {
      s = delta / max
    }

    arr[0] = h
    arr[1] = s
    arr[2] = v
    return arr
  }

  /**
   * @param {number | string} c 0 <= cyan <= 1 | cmyk(cyan%, magenta%, yellow%, black%)
   * @param {number} m 0 <= magenta <= 1
   * @param {number} y 0 <= yellow <= 1
   * @param {number} k 0 <= black <= 1
   */
  fromCMYK(c, m, y, k) {
    if (m === undefined && y === undefined && k === undefined) {
      if (typeof c === 'string') {
        [this.r, this.g, this.b] = CMYKToRGB(...CMYKStringToCMYK(c))
      }
      return this
    }

    [this.r, this.g, this.b] = CMYKToRGB(c, m, y, k)
    return this
  }

  /**
   * @returns {string} cmyk(cyan%, magenta%, yellow%, black%)
   */
  toCMYKString() {
    return CMYKToCMYKString(...RGBToCMYK(this.r, this.g, this.b))
  }

  /**
   * @param {number[]?} arr
   * @returns {number[]} [red, green, blue]
   */
  toArray(arr = []) {
    arr[0] = this.r
    arr[1] = this.g
    arr[2] = this.b
    return arr
  }
}