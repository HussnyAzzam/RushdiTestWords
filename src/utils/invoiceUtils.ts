// Invoice calculation utilities
export const calculateLineTotal = (quantity, unitPrice, discountType, discountValue) => {
  const gross = quantity * unitPrice
  const discount = discountType === 'percentage' 
    ? (gross * discountValue) / 100 
    : discountValue
  return Math.max(0, gross - discount)
}

export const calculateInvoiceTotals = (items, globalDiscount, globalDiscountType, vatRate) => {
  let subtotal = 0
  let itemDiscounts = 0

  items.forEach(item => {
    const gross = item.quantity * item.unitPrice
    const discount = item.discountType === 'percentage'
      ? (gross * item.discountValue) / 100
      : item.discountValue
    itemDiscounts += discount
    subtotal += gross - discount
  })

  const globalDiscountAmount = globalDiscountType === 'percentage'
    ? (subtotal * globalDiscount) / 100
    : globalDiscount

  const subtotalAfterDiscount = subtotal - globalDiscountAmount
  const vatAmount = (subtotalAfterDiscount * vatRate) / 100
  const total = subtotalAfterDiscount + vatAmount

  return {
    subtotal,
    itemDiscounts,
    globalDiscount: globalDiscountAmount,
    subtotalAfterDiscount,
    vatAmount,
    total
  }
}

export const formatCurrency = (amount, symbol = '₪') => {
  return `${symbol} ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

export const formatDate = (date, format = 'DD/MM/YYYY') => {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  
  let result = format
  result = result.replace('DD', day)
  result = result.replace('MM', month)
  result = result.replace('YYYY', String(year))
  
  return result
}

export const exportToJSON = (data) => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-${new Date().getTime()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export const importFromJSON = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        if (!e.target || !e.target.result) {
          reject(new Error('Failed to read file'))
          return
        }
        const result = e.target.result
        if (typeof result !== 'string') {
          reject(new Error('Invalid file content'))
          return
        }
        const data = JSON.parse(result)
        resolve(data)
      } catch (err) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
