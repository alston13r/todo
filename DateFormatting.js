const DaysOfWeekArray = Object.freeze(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])

/**
 * @param {Date} date 
 * 
 * @returns {string} Day of week MM/DD/YYYY HH:MM
 */
function prettyPrintDate(date) {
  const day = DaysOfWeekArray[date.getDay()]
  const dayOfMonth = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${day} ${month}/${dayOfMonth}/${year} ${hour}:${minute}`
}