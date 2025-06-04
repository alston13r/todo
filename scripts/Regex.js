function regex(strings, ...values) {
  return new RegExp(
    strings.raw
      .map((s, i) => s + (values[i] ?? ''))
      .join('')
      .replace(/\s*#.*$/gm, '')
      .replace(/\s+/g, ''),
    'i'
  )
}

const HSLRegex = regex`
  \s*hsl\(\s*                    # start
    (?<hue>\d+(?:\.\d+)?)°?   # hue(.hue)?°?
    \s*,\s*
    (?<sat>                   # saturation
      (?:\d+(?:\.\d+)?%)      # percentage value
      |                       # or
      (?:                     # decimals 0.0 to 1.0
        0(?:\.0+)?              # 0(.0+)?
        |                       # or
        1(?:\.0+)?              # 1(.0+)?
        |                       # or
        0?\.\d+                 # 0?.digits
      )
    )\s*,\s*
    (?<light>                 # light
      (?:\d+(?:\.\d+)?%)      # percentage value
      |                       # or
      (?:                     # decimals 0.0 to 1.0
        0(?:\.0+)?              # 0(.0+)?
        |                       # or
        1(?:\.0+)?              # 1(.0+)?
        |                       # or
        0?\.\d+                 # 0?.digits
      )
    )\s*
  \)\s*$    # end
`