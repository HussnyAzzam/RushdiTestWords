import React, { useState, useRef } from 'react'
import { jsPDF } from 'jspdf'
import './InvoiceBuilder.css'

export default function InvoiceBuilder({ onBack }) {
  const [step, setStep] = useState('template')
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [selectedDocType, setSelectedDocType] = useState('')
  const [lineItems, setLineItems] = useState([])
  const [footerText, setFooterText] = useState('נוצר עי The Ultimate Tools Hub')
  const [businessDetails, setBusinessDetails] = useState({
    name: '', type: 'licensed', id: '', address: '', phone: '', email: '',
    website: '', bankName: '', branchNumber: '', accountNumber: '', logoUrl: '', logoBase64: ''
  })
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: '', allocationNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '', paymentMethod: 'bank_transfer', notes: ''
  })
  const [taxRate, setTaxRate] = useState(18)
  const [discountPercent, setDiscountPercent] = useState(0)
  const itemDescRef = useRef(null)

  const templates = [
    { id: 'classic', name: 'Classic Official', emoji: '📋', desc: 'Clean & formal' },
    { id: 'modern', name: 'Modern Green', emoji: '🌿', desc: 'Modern & colorful' },
    { id: 'minimal', name: 'Minimal Clean', emoji: '✨', desc: 'Simple & clean' },
    { id: 'colorHeader', name: 'Color Header', emoji: '🎨', desc: 'Branded design' }
  ]

  const getDocumentTypes = () => {
    if (businessDetails.type === 'exempt')
      return ['קבלה', 'חשבון עסקה', 'הצעת מחיר', 'דרישת תשלום', 'הזמנת עבודה']
    return ['חשבונית מס', 'קבלה', 'חשבונית מס/קבלה', 'הצעת מחיר', 'חשבון עסקה', 'דרישת תשלום', 'הזמנת עבודה']
  }
  const documentTypes = getDocumentTypes()

  const handleBusinessChange = (field, value) => {
    setBusinessDetails({ ...businessDetails, [field]: value })
    if (field === 'type') setSelectedDocType('')
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setBusinessDetails({ ...businessDetails, logoBase64: e.target.result, logoUrl: file.name })
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const clearLogo = () => setBusinessDetails({ ...businessDetails, logoBase64: '', logoUrl: '' })

  const getBusinessTypeLabel = () => {
    if (businessDetails.type === 'exempt') return 'עוסק פטור'
    if (businessDetails.type === 'licensed') return 'עוסק מורשה'
    return 'חברה בע״מ'
  }

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0)
    const discountAmount = subtotal * (Number(discountPercent) || 0) / 100
    const taxableAmount = subtotal - discountAmount
    const taxAmount = taxableAmount * (Number(taxRate) || 0) / 100
    const total = taxableAmount + taxAmount
    return { subtotal, discountAmount, taxableAmount, taxAmount, total }
  }

  const money = (value) => {
    const num = Number(value || 0).toFixed(2)
    return `₪${num.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
  }

  const getHeaderColor = () =>
    selectedTemplate === 'modern' ? '#16a34a' :
    selectedTemplate === 'colorHeader' ? '#2563eb' :
    selectedTemplate === 'minimal' ? '#111827' : '#1f2937'

  const drawText = (ctx, text, x, y, options = {}) => {
    const { size = 28, weight = '400', color = '#222', align = 'right' } = options
    ctx.save()
    ctx.direction = 'rtl'
    ctx.textAlign = align
    ctx.textBaseline = 'top'
    ctx.fillStyle = color
    ctx.font = `${weight} ${size}px Arial, "Noto Sans Hebrew", sans-serif`
    ctx.fillText(String(text || ''), x, y)
    ctx.restore()
  }

  const drawWrappedText = (ctx, text, x, startY, opts = {}) => {
    const { size = 18, weight = '400', color = '#444', maxWidth = 380, lineHeight = 26 } = opts
    ctx.save()
    ctx.direction = 'rtl'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'top'
    ctx.fillStyle = color
    ctx.font = `${weight} ${size}px Arial, "Noto Sans Hebrew", sans-serif`
    let y = startY
    for (const userLine of String(text || '').split('\n')) {
      if (userLine.trim() === '') { y += lineHeight; continue }
      let cur = ''
      for (const word of userLine.split(' ')) {
        const test = cur ? `${cur} ${word}` : word
        if (ctx.measureText(test).width > maxWidth && cur) {
          ctx.fillText(cur, x, y); y += lineHeight; cur = word
        } else {
          cur = test
        }
      }
      if (cur) { ctx.fillText(cur, x, y); y += lineHeight }
    }
    ctx.restore()
    return y
  }

  const drawPageHeader = async (ctx, { width, margin, headerColor, pageNum, totalPages, logoBase64 }) => {
    const right = width - margin
    const HEADER_H = 145
    ctx.fillStyle = headerColor
    ctx.fillRect(0, 0, width, HEADER_H)
    if (logoBase64) {
      await new Promise((resolve) => {
        const img = new Image()
        img.onload = () => { ctx.drawImage(img, 65, 22, 60, 60); resolve() }
        img.onerror = resolve
        img.src = logoBase64
      })
    }
    drawText(ctx, selectedDocType || 'מסמך', right, 18, { size: 36, weight: '700', color: '#fff' })
    drawText(ctx, `${businessDetails.name || 'שם העסק'} | ${getBusinessTypeLabel()}`, right, 65, { size: 20, color: '#fff' })
    const docNumStr = invoiceDetails.invoiceNumber ? `מס׳ ${invoiceDetails.invoiceNumber}` : ''
    const dateStr = invoiceDetails.issueDate ? new Date(invoiceDetails.issueDate).toLocaleDateString('he-IL') : ''
    const headerMeta = [docNumStr, dateStr].filter(Boolean).join('   |   ')
    if (headerMeta) drawText(ctx, headerMeta, right, 100, { size: 18, color: '#fff' })
    if (totalPages > 1)
      drawText(ctx, `עמוד ${pageNum} / ${totalPages}`, margin + 10, 100, { size: 16, color: '#fff', align: 'left' })
    return HEADER_H
  }

  const drawFooterLine = (ctx, width, height) => {
    drawText(ctx, footerText, width / 2, height - 55, { size: 16, color: '#999', align: 'center' })
  }

  const getColGeom = (width, margin) => {
    const tableX = margin, tableW = width - margin * 2, rowH = 42
    const colNum = tableW * 0.07, colTotal = tableW * 0.21, colPrice = tableW * 0.21, colQty = tableW * 0.14, colDesc = tableW * 0.37
    const xTotal = tableX, xPrice = xTotal + colTotal, xQty = xPrice + colPrice, xDesc = xQty + colQty, xNum = xDesc + colDesc
    return { tableX, tableW, rowH, colNum, colTotal, colPrice, colQty, colDesc, xTotal, xPrice, xQty, xDesc, xNum }
  }

  const drawTableHeaderRow = (ctx, y, cg) => {
    const { tableX, tableW, rowH, xTotal, colTotal, xPrice, colPrice, xQty, colQty, xDesc, colDesc, xNum, colNum } = cg
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(tableX, y, tableW, rowH)
    drawText(ctx, 'סכום',        xTotal + colTotal / 2, y + 10, { size: 16, weight: '700', align: 'center' })
    drawText(ctx, 'מחיר יחידה', xPrice + colPrice / 2, y + 10, { size: 15, weight: '700', align: 'center' })
    drawText(ctx, 'כמות',        xQty   + colQty / 2,  y + 10, { size: 16, weight: '700', align: 'center' })
    drawText(ctx, 'תיאור',       xDesc  + colDesc / 2, y + 10, { size: 16, weight: '700', align: 'center' })
    drawText(ctx, '#',            xNum   + colNum / 2,  y + 10, { size: 16, weight: '700', align: 'center' })
    return y + rowH
  }

  const drawItemRow = (ctx, item, globalIdx, rowIdx, y, cg) => {
    const { tableX, tableW, rowH, xTotal, colTotal, xPrice, colPrice, xQty, colQty, xDesc, colDesc, xNum, colNum } = cg
    ctx.fillStyle = rowIdx % 2 === 0 ? '#f9fafb' : '#ffffff'
    ctx.fillRect(tableX, y, tableW, rowH)
    ctx.strokeStyle = '#e5e7eb'
    ctx.strokeRect(tableX, y, tableW, rowH)
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 0.5
    ;[xPrice, xQty, xDesc, xNum].forEach(xv => {
      ctx.beginPath(); ctx.moveTo(xv, y); ctx.lineTo(xv, y + rowH); ctx.stroke()
    })
    const t = Number(item.quantity) * Number(item.unitPrice)
    drawText(ctx, money(t),               xTotal + colTotal / 2, y + 10, { size: 16, align: 'center' })
    drawText(ctx, money(item.unitPrice),  xPrice + colPrice / 2, y + 10, { size: 16, align: 'center' })
    drawText(ctx, String(item.quantity),  xQty   + colQty / 2,  y + 10, { size: 16, align: 'center' })
    drawText(ctx, item.description,       xDesc  + colDesc / 2, y + 10, { size: 16, align: 'center' })
    drawText(ctx, String(globalIdx + 1),  xNum   + colNum / 2,  y + 10, { size: 16, align: 'center' })
    return y + rowH
  }

  const drawSummaryBlock = (ctx, startY, width, margin, headerColor) => {
    const right = width - margin
    const { subtotal, discountAmount, taxAmount, total } = calculateTotals()
    let y = startY
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(width - margin - 360, y, 360, 210)
    y += 25
    drawText(ctx, `סהכ לפני מעמ והנחות: ${money(subtotal)}`, right - 20, y, { size: 20 }); y += 35
    drawText(ctx, `הנחה (${discountPercent}%): -${money(discountAmount)}`, right - 20, y, { size: 20 }); y += 35
    drawText(ctx, `מעמ (${taxRate}%): ${money(taxAmount)}`, right - 20, y, { size: 20 }); y += 45
    drawText(ctx, `סהכ לתשלום: ${money(total)}`, right - 20, y, { size: 25, weight: '700', color: headerColor }); y += 45
    if (invoiceDetails.notes) {
      drawText(ctx, 'הערות:', right, y, { size: 22, weight: '700' }); y += 32
      y = drawWrappedText(ctx, invoiceDetails.notes, right, y, {
        size: 18, color: '#444', maxWidth: (width - margin * 2) * 0.5, lineHeight: 28
      })
    }
    return y
  }

  const estimateSummaryH = () => {
    const base = 45 + 210
    if (!invoiceDetails.notes) return base
    const lines = invoiceDetails.notes.split('\n').reduce(
      (t, l) => t + (l.trim() === '' ? 1 : Math.ceil(l.length / 22) || 1), 0
    )
    return base + 32 + lines * 28 + 20
  }

  const generatePDFBlob = async () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
    const scale = 3, W = 794, H = 1123, PW = 210, PH = 297
    const margin = 55
    const headerColor = getHeaderColor()
    const logoBase64 = businessDetails.logoBase64
    const cg = getColGeom(W, margin)
    const FOOTER_SPACE = 70
    const summaryH = estimateSummaryH()
    const payMap = {
      immediate: 'תשלום מיידי', bank_transfer: 'העברה בנקאית',
      check: 'ציק', cash: 'מזומן', credit_card: 'כרטיס אשראי'
    }
    const ITEMS_PER_P1 = 5
    const SUMMARY_ON_P1_THRESHOLD = 2   // ≤2 items → summary stays on page 1
    const maxRowsPerAddPage = Math.floor((H - 175 - cg.rowH - FOOTER_SPACE) / cg.rowH)
    const itemsAfterP1 = Math.max(0, lineItems.length - ITEMS_PER_P1)
    const addItemPages = itemsAfterP1 > 0 ? Math.ceil(itemsAfterP1 / maxRowsPerAddPage) : 0

    // Accurately pre-calculate totalPages so page headers show correct "X / Y"
    let totalPages
    if (lineItems.length <= SUMMARY_ON_P1_THRESHOLD) {
      // ≤2 items: summary on page 1
      totalPages = 1
    } else if (lineItems.length <= ITEMS_PER_P1) {
      // 3–5 items: all items on page 1, summary always on page 2
      totalPages = 2
    } else {
      // 6+ items: simulate y after items on the last continuation page to see if summary fits
      const lastPageItemCount = ((itemsAfterP1 - 1) % maxRowsPerAddPage) + 1
      // 175 = approx header(145) + top gap(20) + "המשך" title(34) ≈ but use exact:
      const lastPageYAfterItems = 165 + 34 + cg.rowH + lastPageItemCount * cg.rowH
      const summaryFitsOnLastItemsPage = (H - lastPageYAfterItems - FOOTER_SPACE) >= summaryH
      totalPages = summaryFitsOnLastItemsPage ? 1 + addItemPages : 1 + addItemPages + 1
    }

    const makeBlankCanvas = () => {
      const c = document.createElement('canvas')
      c.width = W * scale
      c.height = H * scale
      const ctx = c.getContext('2d')
      ctx.scale(scale, scale)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)
      return { canvas: c, ctx }
    }

    const addPageToDoc = (canvas, first) => {
      if (first) pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, PW, PH)
      else { pdf.addPage(); pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, PW, PH) }
    }

    // Page 1
    const { canvas: c1, ctx: ctx1 } = makeBlankCanvas()
    const hh = await drawPageHeader(ctx1, { width: W, margin, headerColor, pageNum: 1, totalPages, logoBase64 })
    let y = hh + 20
    const right = W - margin

    drawText(ctx1, 'פרטי העסק', right, y, { size: 24, weight: '700' }); y += 36
    const bizLines = [
      businessDetails.id && `מ.ז / ח.פ: ${businessDetails.id}`,
      businessDetails.address && `כתובת: ${businessDetails.address}`,
      businessDetails.phone && `טלפון: ${businessDetails.phone}`,
      businessDetails.email && `דוא"ל: ${businessDetails.email}`,
      businessDetails.website && `אתר: ${businessDetails.website}`,
      (businessDetails.bankName || businessDetails.accountNumber) &&
        `בנק: ${businessDetails.bankName} | סניף: ${businessDetails.branchNumber} | חשבון: ${businessDetails.accountNumber}`
    ].filter(Boolean)
    bizLines.forEach(l => { drawText(ctx1, l, right, y, { size: 19 }); y += 28 })

    y += 20
    const extraLines = [
      (selectedDocType === 'חשבונית מס' || selectedDocType === 'חשבונית מס/קבלה') &&
        invoiceDetails.allocationNumber && `מספר הקצאה: ${invoiceDetails.allocationNumber}`,
      invoiceDetails.dueDate && `תאריך פרעון: ${new Date(invoiceDetails.dueDate).toLocaleDateString('he-IL')}`,
      invoiceDetails.paymentMethod && `אמצעי תשלום: ${payMap[invoiceDetails.paymentMethod] || invoiceDetails.paymentMethod}`
    ].filter(Boolean)
    if (extraLines.length) {
      drawText(ctx1, 'פרטי תשלום', right, y, { size: 24, weight: '700' }); y += 36
      extraLines.forEach(l => { drawText(ctx1, l, right, y, { size: 19 }); y += 28 })
      y += 16
    }

    drawText(ctx1, 'פרטי פריטים / שירותים', right, y, { size: 24, weight: '700' }); y += 36
    y = drawTableHeaderRow(ctx1, y, cg)
    lineItems.slice(0, ITEMS_PER_P1).forEach((item, idx) => { y = drawItemRow(ctx1, item, idx, idx, y, cg) })

    // Show summary on page 1 only if ≤2 items AND it fits
    const showSummaryP1 = lineItems.length <= SUMMARY_ON_P1_THRESHOLD && (H - y - FOOTER_SPACE) >= summaryH
    if (showSummaryP1) drawSummaryBlock(ctx1, y + 40, W, margin, headerColor)

    drawFooterLine(ctx1, W, H)
    addPageToDoc(c1, true)

    // Additional item pages (3+ items always need a continuation/summary page)
    let remaining = lineItems.slice(ITEMS_PER_P1)
    // For 3+ items with ≤5 total, we still create a page 2 for the summary
    // Track the last items page canvas so we can try fitting summary on it
    let lastItemsCtx = null
    let lastItemsCanvas = null
    let lastItemsY = y
    let currentPage = 2
    let summaryDone = showSummaryP1

    if (!summaryDone && lineItems.length > SUMMARY_ON_P1_THRESHOLD && remaining.length === 0) {
      // 3–5 items: all on page 1, but summary goes to page 2
      const { canvas: cp2, ctx: cp2ctx } = makeBlankCanvas()
      const hh2 = await drawPageHeader(cp2ctx, { width: W, margin, headerColor, pageNum: currentPage, totalPages, logoBase64 })
      const startY2 = hh2 + 20
      if ((H - startY2 - FOOTER_SPACE) >= summaryH) {
        drawSummaryBlock(cp2ctx, startY2 + 20, W, margin, headerColor)
        summaryDone = true
      }
      drawFooterLine(cp2ctx, W, H)
      addPageToDoc(cp2, false)
      currentPage++
    }

    while (remaining.length > 0) {
      const { canvas: cp, ctx } = makeBlankCanvas()
      const hh2 = await drawPageHeader(ctx, { width: W, margin, headerColor, pageNum: currentPage, totalPages, logoBase64 })
      let y2 = hh2 + 20
      drawText(ctx, 'פרטי פריטים / שירותים (המשך)', right, y2, { size: 22, weight: '700' }); y2 += 34
      y2 = drawTableHeaderRow(ctx, y2, cg)
      const batch = remaining.splice(0, maxRowsPerAddPage)
      const globalStart = lineItems.length - remaining.length - batch.length
      batch.forEach((item, ri) => { y2 = drawItemRow(ctx, item, globalStart + ri, ri, y2, cg) })
      if (remaining.length === 0 && !summaryDone && (H - y2 - FOOTER_SPACE) >= summaryH) {
        drawSummaryBlock(ctx, y2 + 40, W, margin, headerColor)
        summaryDone = true
      }
      drawFooterLine(ctx, W, H)
      addPageToDoc(cp, false)
      currentPage++
    }

    // Summary page if not yet placed
    if (!summaryDone) {
      const { canvas: cs, ctx: ctxs } = makeBlankCanvas()
      await drawPageHeader(ctxs, { width: W, margin, headerColor, pageNum: currentPage, totalPages, logoBase64 })
      drawSummaryBlock(ctxs, 185, W, margin, headerColor)
      drawFooterLine(ctxs, W, H)
      addPageToDoc(cs, false)
    }

    return pdf.output('blob')
  }

  const generatePDF = async () => {
    try {
      const blob = await generatePDFBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF export error:', error)
      alert('❌ שגיאה בייצוא ה-PDF: ' + error.message)
    }
  }

  const exportSettings = () => {
    const settings = {
      businessDetails, selectedTemplate, selectedDocType,
      taxRate, discountPercent, footerText,
      exportDate: new Date().toISOString()
    }
    const dataBlob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-template-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    alert('✅ התבנית הורדה בהצלחה!')
  }

  const importSettings = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const s = JSON.parse(e.target.result)
        setBusinessDetails(s.businessDetails || businessDetails)
        setSelectedTemplate(s.selectedTemplate || selectedTemplate)
        setSelectedDocType(s.selectedDocType || selectedDocType)
        setTaxRate(s.taxRate !== undefined ? s.taxRate : 18)
        setDiscountPercent(s.discountPercent !== undefined ? s.discountPercent : 0)
        if (s.footerText) setFooterText(s.footerText)
        alert('✅ התבנית יובאה בהצלחה!')
        setStep('business')
      } catch (error) {
        alert('❌ שגיאה בייבוא התבנית: ' + error.message)
      }
    }
    reader.readAsText(file, 'utf-8')
    event.target.value = ''
  }

  const shareWhatsApp = async () => {
    const { total } = calculateTotals()
    const text = `🧾 חשבונית\n\nעסק: ${businessDetails.name}\nסוג מסמך: ${selectedDocType}\nסה״כ: ${money(total)}\n\nלפרטים נוספים צרו איתי קשר`
    try {
      const blob = await generatePDFBlob()
      const file = new File([blob], `invoice-${new Date().toISOString().slice(0, 10)}.pdf`, { type: 'application/pdf' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text, title: `חשבונית - ${businessDetails.name}` })
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = file.name; a.click()
        URL.revokeObjectURL(url)
        alert('✅ WhatsApp נפתח וה-PDF מוכן להורדה')
      }
    } catch (error) {
      alert('שגיאה בשיתוף: ' + error.message)
    }
  }

  const shareEmail = async () => {
    const { total } = calculateTotals()
    const subject = `חשבונית מ-${businessDetails.name}`
    const body = `שלום,\n\nמצורפת חשבונית.\n\nעסק: ${businessDetails.name}\nסוג מסמך: ${selectedDocType}\nמע"מ: ${taxRate}%\nהנחה: ${discountPercent}%\nסה״כ: ${money(total)}\n\nפרטי פריטים:\n${lineItems.map(i => `- ${i.description}: ${i.quantity} x ${money(i.unitPrice)} = ${money(Number(i.quantity) * Number(i.unitPrice))}`).join('\n')}`
    try {
      const blob = await generatePDFBlob()
      const file = new File([blob], `invoice-${new Date().toISOString().slice(0, 10)}.pdf`, { type: 'application/pdf' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], subject, text: body, title: subject })
      } else {
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = file.name; a.click()
        URL.revokeObjectURL(url)
        alert('✅ דוא״ל נפתח וה-PDF מוכן להורדה')
      }
    } catch (error) {
      alert('שגיאה בשיתוף: ' + error.message)
    }
  }

  const copySummary = async () => {
    const { total } = calculateTotals()
    const summary = `חשבונית - ${businessDetails.name}\n${selectedDocType}\nסה״כ: ${money(total)}`
    try {
      await navigator.clipboard.writeText(summary)
      const blob = await generatePDFBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      alert('✅ הסיכום הועתק ללוח וה-PDF הורד')
    } catch (error) {
      alert('שגיאה: ' + error.message)
    }
  }

  const addLineItem = () => {
    const d = itemDescRef.current
    const q = document.getElementById('itemQty')
    const p = document.getElementById('itemPrice')
    const desc = d.value.trim()
    const qty = parseFloat(q.value)
    const price = parseFloat(p.value)
    if (desc && qty > 0 && price >= 0) {
      setLineItems(prev => [...prev, { description: desc, quantity: qty, unitPrice: price }])
      d.value = ''; q.value = ''; p.value = ''
      setTimeout(() => d.focus(), 50)
    } else {
      alert('אנא מלא את כל השדות נכון')
    }
  }

  const handleAddKeyDown = (e) => { if (e.key === 'Enter') addLineItem() }

  return (
    <div className="invoice-builder" dir="rtl">
      <button className="back-btn" onClick={onBack}>← חזור</button>

      <div className="invoice-header">
        <h1>🧾 בניית חשבוניות ודוחות עסקיים</h1>
        <p>יצירת חשבוניות מקצועיות, קבלות וחשבונות בעברית ישירות מהדפדפן</p>
      </div>

      {step === 'template' && (
        <div className="template-selection">
          <h2>בחר עיצוב</h2>
          <div className="template-grid">
            {templates.map((t) => (
              <div
                key={t.id}
                className={`template-card ${selectedTemplate === t.id ? 'active' : ''}`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                <div className="template-emoji">{t.emoji}</div>
                <h3>{t.name}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
          <div className="template-actions">
            <label className="import-btn">
              📥 ייבא תבנית
              <input type="file" accept=".json" onChange={importSettings} style={{ display: 'none' }} />
            </label>
          </div>
          <button className="btn-primary" onClick={() => setStep('business')}>המשך →</button>
        </div>
      )}

      {step === 'business' && (
        <div className="business-setup">
          <h2>פרטי העסק שלך</h2>
          <form className="business-form">
            <div className="form-row">
              <input type="text" placeholder="שם העסק" value={businessDetails.name}
                onChange={(e) => handleBusinessChange('name', e.target.value)} className="form-input" />
              <select value={businessDetails.type}
                onChange={(e) => handleBusinessChange('type', e.target.value)} className="form-select">
                <option value="exempt">עוסק פטור</option>
                <option value="licensed">עוסק מורשה</option>
                <option value="company">חברה בע״מ</option>
              </select>
            </div>
            <div className="form-row">
              <input type="text" placeholder="מספר זהות / מספר חברה" value={businessDetails.id}
                onChange={(e) => handleBusinessChange('id', e.target.value)} className="form-input" />
              <input type="text" placeholder="כתובת" value={businessDetails.address}
                onChange={(e) => handleBusinessChange('address', e.target.value)} className="form-input" />
            </div>
            <div className="form-row">
              <input type="tel" placeholder="טלפון" value={businessDetails.phone}
                onChange={(e) => handleBusinessChange('phone', e.target.value)} className="form-input" />
              <input type="email" placeholder="דוא״ל" value={businessDetails.email}
                onChange={(e) => handleBusinessChange('email', e.target.value)} className="form-input" />
            </div>
            <div className="form-row">
              <input type="text" placeholder="אתר אינטרנט (רשות)" value={businessDetails.website}
                onChange={(e) => handleBusinessChange('website', e.target.value)} className="form-input" />
            </div>
            <div className="form-row">
              <input type="text" placeholder="שם הבנק" value={businessDetails.bankName}
                onChange={(e) => handleBusinessChange('bankName', e.target.value)} className="form-input" />
              <input type="text" placeholder="מספר סניף" value={businessDetails.branchNumber}
                onChange={(e) => handleBusinessChange('branchNumber', e.target.value)} className="form-input" />
            </div>
            <div className="form-row">
              <input type="text" placeholder="מספר חשבון" value={businessDetails.accountNumber}
                onChange={(e) => handleBusinessChange('accountNumber', e.target.value)} className="form-input" />
            </div>
            <div className="form-row">
              <input type="text" placeholder="טקסט תחתית עמוד (פוטר)" value={footerText}
                onChange={(e) => setFooterText(e.target.value)} className="form-input" />
            </div>
            <div className="form-row">
              <label className="logo-upload-label">
                📸 בחר לוגו (רשות)
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
              {businessDetails.logoBase64 && (
                <div className="logo-preview">
                  <img src={businessDetails.logoBase64} alt="Logo Preview" />
                  <button type="button" className="btn-small btn-delete" onClick={clearLogo}>הסר לוגו</button>
                </div>
              )}
            </div>
          </form>
          <div className="button-group">
            <button className="btn-secondary" onClick={() => setStep('template')}>← חזור</button>
            <button className="btn-primary" onClick={() => setStep('create')}>תחל יצירת חשבונית →</button>
          </div>
        </div>
      )}

      {step === 'create' && (
        <div className="invoice-creator">
          <h2>יצירת חשבונית חדשה</h2>
          <div className="document-type-selector">
            <h3>בחר סוג מסמך:</h3>
            <div className="doc-types">
              {documentTypes.map((docType) => (
                <button
                  key={docType}
                  className={`doc-type-btn ${selectedDocType === docType ? 'active' : ''}`}
                  onClick={() => setSelectedDocType(docType)}
                >
                  {docType}
                </button>
              ))}
            </div>
          </div>
          <div className="button-group">
            <button className="btn-secondary" onClick={() => setStep('business')}>← חזור</button>
            <button
              className="btn-primary"
              onClick={() => selectedDocType && setStep('preview')}
              disabled={!selectedDocType}
              style={{ opacity: selectedDocType ? 1 : 0.5, cursor: selectedDocType ? 'pointer' : 'not-allowed' }}
            >
              המשך →
            </button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="invoice-preview">
          <h2>בנייה ועריכת החשבונית</h2>
          <div className="preview-content">
            <div className="preview-section">
              <h3>פרטי העסק:</h3>
              <p><strong>{businessDetails.name}</strong></p>
              <p>סוג עסק: {getBusinessTypeLabel()}</p>
            </div>
            <div className="preview-section">
              <h3>סוג המסמך:</h3>
              <p><strong>{selectedDocType}</strong></p>
            </div>
            <div className="preview-section">
              <h3>פרטי החשבונית:</h3>
              <div className="form-row">
                <input type="text" placeholder="מספר חשבונית" value={invoiceDetails.invoiceNumber}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
                  className="form-input" />
                <input type="date" value={invoiceDetails.issueDate}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, issueDate: e.target.value })}
                  className="form-input" />
              </div>
              {(selectedDocType === 'חשבונית מס' || selectedDocType === 'חשבונית מס/קבלה') && (
                <div className="form-row">
                  <input type="text" placeholder="מספר הקצאה (רשות - אופציונלי)"
                    value={invoiceDetails.allocationNumber}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, allocationNumber: e.target.value })}
                    className="form-input" />
                </div>
              )}
              <div className="form-row">
                <input type="date" placeholder="תאריך תשלום" value={invoiceDetails.dueDate}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })}
                  className="form-input" />
                <select value={invoiceDetails.paymentMethod}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, paymentMethod: e.target.value })}
                  className="form-select">
                  <option value="immediate">תשלום מיידי</option>
                  <option value="bank_transfer">העברה בנקאית</option>
                  <option value="check">צ&#39;ק</option>
                  <option value="cash">מזומן</option>
                  <option value="credit_card">כרטיס אשראי</option>
                </select>
              </div>
              <div className="form-row">
                <textarea placeholder="הערות (יופיעו בתחתית המסמך)" value={invoiceDetails.notes}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, notes: e.target.value })}
                  className="form-input" rows={3} style={{ resize: 'vertical', width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="line-items-section">
            <h3>פרטי פריטים / שירותים</h3>
            <table className="items-table">
              <thead>
                <tr>
                  <th>תיאור</th><th>כמות</th><th>מחיר יחידה</th><th>סכום</th><th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{money(item.unitPrice)}</td>
                    <td>{money(Number(item.quantity) * Number(item.unitPrice))}</td>
                    <td>
                      <button className="btn-small btn-delete"
                        onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}>
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="add-item-form">
              <h4>הוסף פריט חדש</h4>
              <div className="form-row-items">
                <input ref={itemDescRef} type="text" placeholder="תיאור המוצר / שירות"
                  id="itemDesc" className="form-input" onKeyDown={handleAddKeyDown} />
                <input type="number" placeholder="כמות" id="itemQty"
                  className="form-input" min="1" onKeyDown={handleAddKeyDown} />
                <input type="number" placeholder="מחיר ליחידה" id="itemPrice"
                  className="form-input" min="0" step="0.01" onKeyDown={handleAddKeyDown} />
                <button className="btn-primary btn-small" onClick={addLineItem}>הוסף</button>
              </div>
            </div>

            {lineItems.length > 0 && (
              <div className="totals-section">
                <h4>סיכום:</h4>
                <div className="summary-row">
                  <label>מע&quot;מ (%)</label>
                  <input type="number" min="0" max="100" value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))} className="small-input" />
                </div>
                <div className="summary-row">
                  <label>הנחה (%)</label>
                  <input type="number" min="0" max="100" value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))} className="small-input" />
                </div>
                {(() => {
                  const { subtotal, discountAmount, taxAmount, total } = calculateTotals()
                  return (
                    <>
                      <p className="total-line">
                        <span>סה&quot;כ לפני מס והנחות:</span><strong>{money(subtotal)}</strong>
                      </p>
                      <p className="total-line">
                        <span>הנחה ({discountPercent}%):</span><strong>-{money(discountAmount)}</strong>
                      </p>
                      <p className="total-line">
                        <span>מע&quot;מ ({taxRate}%):</span><strong>{money(taxAmount)}</strong>
                      </p>
                      <p className="total-line final">
                        <span>סה&quot;כ לתשלום:</span><strong>{money(total)}</strong>
                      </p>
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          <div className="actions-section">
            <div className="button-group">
              <button className="btn-secondary" onClick={() => setStep('create')}>← חזור לבחירת סוג מסמך</button>
              <button
                className="btn-primary"
                disabled={lineItems.length === 0}
                style={{ opacity: lineItems.length > 0 ? 1 : 0.5, cursor: lineItems.length > 0 ? 'pointer' : 'not-allowed' }}
                onClick={generatePDF}
              >
                📥 הורד PDF
              </button>
            </div>
            {lineItems.length > 0 && (
              <div className="sharing-section">
                <h4>שתף את החשבונית:</h4>
                <div className="sharing-buttons">
                  <button className="btn-share whatsapp" onClick={shareWhatsApp}>💬 WhatsApp</button>
                  <button className="btn-share email" onClick={shareEmail}>📧 דוא״ל</button>
                  <button className="btn-share copy" onClick={copySummary}>📋 העתק</button>
                  <button className="btn-share export" onClick={exportSettings}>💾 ייצא תבנית</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}