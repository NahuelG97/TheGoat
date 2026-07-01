import React, { useRef, useCallback } from 'react';

interface TicketItem {
  productName: string;
  quantity: number;
  notes: string;
  deliveryAmount?: number;
  includeDelivery?: boolean;
}

interface TicketPrinterProps {
  saleNumber: string;
  items: TicketItem[];
  totalAmount: number;
  timestamp?: string;
  userName?: string;
  onClose?: () => void;
}

export const TicketPrinter: React.FC<TicketPrinterProps> = ({
  saleNumber,
  items,
  totalAmount,
  timestamp,
  userName,
  onClose,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const formatTime = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handlePrint = useCallback(() => {
    if (!componentRef.current) return;

    const content = componentRef.current.innerHTML;
    if (!content?.trim()) {
      alert('No hay contenido para imprimir');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) {
      alert('Por favor, habilita las ventanas emergentes para imprimir el ticket');
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket ${saleNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    @page {
      size: 56mm auto;
      margin: 0;
    }

    html, body {
      width: 56mm;
      margin: 0;
      padding: 0;
      background: white;
      color: black;
      font-family: 'Courier New', Courier, monospace;
      font-size: 13pt;
      line-height: 1.5;
      text-align: center;
    }

    .ticket {
      width: 56mm;
      margin: 0;
      padding: 0;
      text-align: center;
    }

    .brand    { font-size: 20pt; font-weight: bold; letter-spacing: 2px; }
    .divider  { font-size: 11pt; margin: 2mm 0; }
    .t-label  { font-size: 12pt; font-weight: bold; letter-spacing: 2px; }
    .t-num    { font-size: 12pt; }
    .meta     { font-size: 10pt; border-bottom: 1px dashed #000; padding-bottom: 2mm; margin-bottom: 2mm; }

    .items-header {
      display: flex;
      justify-content: space-between;
      font-size: 11pt;
      font-weight: bold;
      border-bottom: 1px solid #000;
      margin-bottom: 2mm;
      padding-bottom: 1mm;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      font-size: 12pt;
      margin-bottom: 1mm;
      text-align: left;
    }
    .item-notes {
      font-size: 10pt;
      color: #666;
      margin-left: 2mm;
      margin-bottom: 1mm;
      text-align: left;
    }
    .delivery {
      font-size: 10pt;
      color: #d97706;
      margin-left: 2mm;
      margin-bottom: 1mm;
      text-align: left;
    }
    .total {
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      padding: 2mm 0;
      font-size: 15pt;
      font-weight: bold;
      color: #059669;
      margin: 2mm 0;
    }
    .footer {
      font-size: 10pt;
      color: #666;
      margin-top: 2mm;
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="brand">🍗 THE GOAT</div>
    <div class="divider">─────────────────────</div>
    <div class="t-label">TICKET DE VENTA</div>
    <div class="t-num">Nº ${saleNumber}</div>
    <div class="meta">
      ${formatTime(timestamp)}<br/>
      ${userName ? `Usuario: ${userName}` : ''}
    </div>
    <div class="items-header">
      <div style="flex:1;text-align:left;">PRODUCTO</div>
      <div style="width:30px;text-align:right;">CANT</div>
    </div>
    ${items.map(item => `
      <div class="item-row">
        <div style="flex:1;">${item.productName}</div>
        <div style="width:30px;text-align:right;">${item.quantity}</div>
      </div>
      ${item.notes ? `<div class="item-notes">📝 ${item.notes}</div>` : ''}
      ${item.includeDelivery && item.deliveryAmount ? `<div class="delivery">🚚 Delivery: $${parseFloat(String(item.deliveryAmount)).toFixed(2)}</div>` : ''}
    `).join('')}
    <div class="total">TOTAL $${parseFloat(String(totalAmount)).toFixed(2)}</div>
    <div class="footer">
      ─────────────────────<br/>
      ✓ Venta registrada<br/>
      <span style="font-size:9pt;">Gracias por su compra</span>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 100);
    };
  </script>
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    printWindow.addEventListener('afterprint', () => {
      printWindow.close();
      if (onClose) onClose();
    });

    setTimeout(() => {
      if (onClose) onClose();
      try { printWindow.close(); } catch (_) {}
    }, 3000);
  }, [saleNumber, onClose]);

  // Contenido compartido (impresión + preview)
  const ticketContent = (
    <>
      {/* Header */}
      <div className="brand" style={{ fontSize: '20pt', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px' }}>
        🍗 THE GOAT
      </div>
      <div className="divider" style={{ fontSize: '11pt', textAlign: 'center', margin: '2mm 0' }}>
        ━━━━━━━━━━━━━━━━
      </div>
      <div className="t-label" style={{ fontSize: '12pt', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px' }}>
        TICKET DE VENTA
      </div>
      <div className="t-num" style={{ fontSize: '12pt', textAlign: 'center', marginBottom: '3mm' }}>
        N° {saleNumber}
      </div>

      {/* Meta */}
      <div
        className="meta"
        style={{
          fontSize: '10pt',
          borderBottom: '1px dashed #000',
          paddingBottom: '2mm',
          marginBottom: '2mm',
          textAlign: 'center',
        }}
      >
        <div>{formatTime(timestamp)}</div>
        {userName && <div>Usuario: {userName}</div>}
      </div>

      {/* Items header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11pt',
          fontWeight: 'bold',
          borderBottom: '1px solid #000',
          paddingBottom: '1mm',
          marginBottom: '1mm',
        }}
      >
        <span>PRODUCTO</span>
        <span>CANT</span>
      </div>

      {/* Items */}
      <div style={{ marginBottom: '3mm' }}>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} style={{ borderBottom: '1px dotted #aaa', padding: '2mm 0', textAlign: 'left' }}>
              <div style={{ fontSize: '13pt', fontWeight: 'bold' }}>
                {item.quantity}x {item.productName}
              </div>
              {item.notes && (
                <div style={{ fontSize: '10pt', color: '#333' }}>
                  Nota: {item.notes}
                </div>
              )}
              {item.includeDelivery && item.deliveryAmount && (
                <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>
                  Delivery: ${parseFloat(String(item.deliveryAmount)).toFixed(2)}
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ fontSize: '11pt', textAlign: 'center' }}>Sin productos</div>
        )}
      </div>

      {/* Total */}
      <div
        style={{
          borderTop: '2px solid #000',
          borderBottom: '2px solid #000',
          padding: '3mm 0',
          textAlign: 'center',
          margin: '3mm 0',
        }}
      >
        <div style={{ fontSize: '12pt', letterSpacing: '3px' }}>TOTAL</div>
        <div style={{ fontSize: '24pt', fontWeight: 'bold' }}>
          ${parseFloat(String(totalAmount)).toFixed(2)}
        </div>
      </div>

      {/* Footer — solo divisor */}
      <div style={{ textAlign: 'center', fontSize: '10pt', marginTop: '2mm' }}>
        <div>━━━━━━━━━━━━━━━━</div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xs w-full max-h-[90vh] overflow-y-auto">

        {/* Div oculto para capturar HTML de impresión */}
        <div ref={componentRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '52mm' }}>
          {ticketContent}
        </div>

        {/* Preview en pantalla */}
        <div className="p-4 font-mono text-xs border-b">
          <div className="text-center space-y-1 mb-2">
            <div className="text-lg font-bold">🍗 THE GOAT</div>
            <div className="text-gray-400">━━━━━━━━━━━━━━━━</div>
            <div className="font-bold tracking-widest">TICKET DE VENTA</div>
            <div>N° {saleNumber}</div>
          </div>

          <div className="border-t border-dashed pt-2 pb-2 text-center mb-2">
            <div>{formatTime(timestamp)}</div>
            {userName && <div>Usuario: {userName}</div>}
          </div>

          <div className="flex justify-between font-bold border-b pb-1 mb-1">
            <span>PRODUCTO</span><span>CANT</span>
          </div>

          <div className="space-y-1 max-h-40 overflow-y-auto mb-2">
            {items?.length > 0 ? items.map((item, i) => (
              <div key={i} className="border-b border-dotted pb-1">
                <div className="font-bold">{item.quantity}x {item.productName}</div>
                {item.notes && <div className="text-gray-500">Nota: {item.notes}</div>}
                {item.includeDelivery && item.deliveryAmount && (
                  <div className="font-bold">Delivery: ${parseFloat(String(item.deliveryAmount)).toFixed(2)}</div>
                )}
              </div>
            )) : <div className="text-gray-400 text-center">Sin productos</div>}
          </div>

          <div className="border-t-2 border-b-2 py-2 text-center mb-2">
            <div className="tracking-widest text-gray-500">TOTAL</div>
            <div className="text-2xl font-bold">${parseFloat(String(totalAmount)).toFixed(2)}</div>
          </div>

          <div className="text-center text-gray-400">━━━━━━━━━━━━━━━━</div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 p-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            🖨️ Imprimir Ticket
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
          >
            ✓ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};