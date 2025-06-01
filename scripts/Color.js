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
   * @returns {Color}
   */
  set(r, g, b) {
    if (g === undefined && b === undefined) {
      if (typeof r === 'number') {
        // 0xrrggbb
        // console.log('hex')
        return this.fromHex(r)
      } else if (typeof r === 'string') {
        const str = r.trim()
        if (str.startsWith('#')) {
          // '#rrggbb'
          // console.log('hex string')
          return this.fromHexString(str)
        } else if (str.startsWith('rgb')) {
          // 'rgb(r, g, b)'
          // console.log('rgb()')
          return this.fromRGBString(str)
        } else if (str.startsWith('hsl')) {
          // 'hsl(h, s, l)'
          // console.log('hsl()')
          return this.fromHSLString(str)
        } else if (str.startsWith('hsv')) {
          // 'hsv(h, s, v)'
          // console.log('hsv()')
          return this.fromHSVString(str)
        }
      } else if (r instanceof Color) {
        // Color
        return this.copy(r)
      }
    } else {
      this.r = r
      this.g = g
      this.b = b
      return this
    }
  }

  /**
   * @param {Color} color 
   * @returns {Color}
   */
  copy(color) {
    this.r = color.r
    this.g = color.g
    this.b = color.b
    return this
  }

  /**
   * @returns {Color}
   */
  clone() {
    return new Color(this)
  }

  /**
   * @param {number} hex 0xRRGGBB
   * @returns {Color}
   */
  fromHex(hex) {
    const rv = (hex >> 16) & 0xff
    const gv = (hex >> 8) & 0xff
    const bv = hex & 0xff
    this.r = rv / 255
    this.g = gv / 255
    this.b = bv / 255
    return this
  }

  /**
   * @returns {number}
   */
  toHex() {
    const r = Math.floor(this.r * 255) << 16
    const g = Math.floor(this.g * 255) << 8
    const b = Math.floor(this.b * 255)
    return r + g + b
  }

  /**
   * @param {string} str #RRGGBB
   * @returns {Color}
   */
  fromHexString(str) {
    const rs = str.substring(1, 3)
    const gs = str.substring(3, 5)
    const bs = str.substring(5, 7)
    const rv = parseInt(rs, 16)
    const gv = parseInt(gs, 16)
    const bv = parseInt(bs, 16)
    this.r = rv / 255
    this.g = gv / 255
    this.b = bv / 255
    return this
  }

  /**
   * @returns {string} #RRGGBB
   */
  toHexString() {
    /**
     * @param {number} v 
     * @returns {string}
     */
    function ensureLength(v) {
      const s = v.toString(16)
      return s.length === 1 ? '0' + s : s
    }
    const r = ensureLength(Math.floor(this.r * 255))
    const g = ensureLength(Math.floor(this.g * 255))
    const b = ensureLength(Math.floor(this.b * 255))
    return '#' + r + g + b
  }

  /**
   * @param {string} str rgb(r, g, b)
   * @returns {Color}
   */
  fromRGBString(str) {
    let m
    if (m = str.match(/\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/)) {
      const r = m[1]
      const g = m[2]
      const b = m[3]
      this.r = parseInt(r) / 255
      this.g = parseInt(g) / 255
      this.b = parseInt(b) / 255
    }
    return this
  }

  /**
   * @returns {string} rgb(r, g, b)
   */
  toRGBString() {
    const r = Math.floor(this.r * 255)
    const g = Math.floor(this.g * 255)
    const b = Math.floor(this.b * 255)
    return `rgb(${r}, ${g}, ${b})`
  }

  /**
   * @param {number} h 0 <= H < 360
   * @param {number} s 0% <= S <= 100%
   * @param {number} l 0% <= L <= 100%
   * @returns {Color}
   */
  fromHSL(h, s, l) {
    h %= 360
    s /= 100
    l /= 100

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

    this.r = rp + m
    this.g = gp + m
    this.b = bp + m

    return this
  }

  /**
   * @param {string} str hsl(h, s%, l%)
   * @returns {Color}
   */
  fromHSLString(str) {
    let m
    if (m = str.match(/\s*hsl\s*\(\s*(\d+)\s*,\s*(\d+)\s*%\s*,\s*(\d+)\s*%\s*\)\s*$/)) {
      const h = parseInt(m[1]) // 0 to 360
      const s = parseInt(m[2]) // 0 to 100%
      const l = parseInt(m[3]) // 0 to 100%
      return this.fromHSL(h, s, l)
    }

    return this
  }

  /**
   * @returns {string} hsl(h, s%, l%)
   */
  toHSLString() {
    const max = Math.max(this.r, this.g, this.b)
    const min = Math.min(this.r, this.g, this.b)
    const delta = max - min

    const l = (max + min) / 2
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

      s = delta / (1 - Math.abs(2 * l - 1))
    }

    return `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  }

  /**
   * @param {number} h 0 <= H < 360
   * @param {number} s 0% <= S <= 100%
   * @param {number} v 0% <= v <= 100%
   * @returns {Color}
   */
  fromHSV(h, s, v) {
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

    this.r = rp + m
    this.g = gp + m
    this.b = bp + m

    return this
  }

  /**
   * @param {string} str hsl(h, s%, v%)
   * @returns {Color}
   */
  fromHSVString(str) {
    let m
    if (m = str.match(/\s*hsl\s*\(\s*(\d+)\s*,\s*(\d+)\s*%\s*,\s*(\d+)\s*%\s*\)\s*$/)) {
      const h = parseInt(m[1]) // 0 to 360
      const s = parseInt(m[2]) // 0 to 100%
      const v = parseInt(m[3]) // 0 to 100%
      return this.fromHSV(h, s, v)
    }

    return this
  }

  /**
   * @returns {string} hsv(h, s%, v%)
   */
  toHSVString() {
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

    return `hsv(${h}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`
  }

  /**
   * @param {number[]} arr 
   * @returns {[number, number, number]}
   */
  toArray(arr = []) {
    arr[0] = this.r
    arr[1] = this.g
    arr[2] = this.b
    return arr
  }
}