/**
 * Web-compatible report generation utilities.
 * Ported from mobile/src/utils/pdfReport.ts
 */

type ReportColumn = { key: string; label: string };
type ReportRow = Record<string, any>;

const escapeHtml = (value: any): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Generates a styled HTML report and opens the print dialog in the browser.
 */
export async function exportStyledPdfReport(params: {
  title: string;
  subtitle?: string;
  sectionHeading?: string;
  brandFooterLine?: string;
  generatedAt?: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  filename?: string;
}) {
  const { title, subtitle, columns, rows } = params;
  const sectionHeading = params.sectionHeading ?? 'Report Details';
  const brandFooterLine = params.brandFooterLine ?? 'RIT Gate Management System';
  const timeStamp = params.generatedAt || new Date().toLocaleString();

  const headerCols = columns
    .map((c) => `<th>${escapeHtml(String(c.label).toUpperCase())}</th>`)
    .join('');
  
  const bodyRows = rows
    .map((row) => {
      const tds = columns.map((c) => {
        const isName = c.key === 'name' || c.label.toLowerCase() === 'name' || c.key.toLowerCase().includes('name');
        return `<td${isName ? ' class="name-col"' : ''}>${escapeHtml(row[c.key])}</td>`;
      }).join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.5; }

          /* ── Header ── */
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 20px;
            border-bottom: 3px solid #6366f1;
            margin-bottom: 30px;
          }
          .header-text { text-align: left; }
          .header-title { font-size: 28px; font-weight: 800; color: #4338ca; margin-bottom: 4px; letter-spacing: -0.02em; text-transform: uppercase; }
          .header-date { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
          .logo-text { font-size: 32px; font-weight: 900; color: #6366f1; }

          /* ── Section label ── */
          .section-label { font-size: 11px; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px; }

          /* ── Table ── */
          table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 11px; margin-bottom: 40px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
          th {
            background: #f8fafc;
            color: #475569;
            padding: 14px 12px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            font-size: 10px;
            font-weight: 800;
          }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; color: #334155; }
          tr:last-child td { border-bottom: none; }
          tr:nth-child(even) td { background: #fcfdfe; }
          td.name-col { font-weight: 700; color: #1e293b; }

          /* ── Footer ── */
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; }
          .footer-brand { font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
          .footer-note { font-size: 11px; color: #94a3b8; font-weight: 500; }
          .stats { margin-top: 12px; font-size: 12px; font-weight: 700; color: #6366f1; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-text">
            <div class="header-title">${escapeHtml(title)}</div>
            <div class="header-date">Generated: ${escapeHtml(timeStamp)} ${subtitle ? ' · ' + escapeHtml(subtitle) : ''}</div>
          </div>
          <div class="logo-text">RIT</div>
        </div>
        
        <div class="section-label">${escapeHtml(sectionHeading)}</div>
        <table>
          <thead>
            <tr>${headerCols}</tr>
          </thead>
          <tbody>
            ${bodyRows || `<tr><td colspan="${columns.length}" style="text-align:center;padding:40px;color:#94a3b8;font-weight:600;">No records matching the current parameters were found.</td></tr>`}
          </tbody>
        </table>

        <div class="footer">
          <div class="footer-brand">${escapeHtml(brandFooterLine)}</div>
          <div class="footer-note">CONFIDENTIAL INTERNAL RECORD · NODE SECURE INFRASTRUCTURE</div>
          <div class="stats">TOTAL RECORDS SECURED: ${rows.length}</div>
        </div>

        <script>
          window.onload = () => {
            // Slight delay to ensure any dynamic rendering is done
            setTimeout(() => {
              window.print();
              // Note: we don't close automatically so user can save/print
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  // For web, open in a new tab which triggers its own print dialog
  const reportWindow = window.open('', '_blank');
  if (reportWindow) {
    reportWindow.document.write(html);
    reportWindow.document.close();
  } else {
    throw new Error('Please allow popups to view the generated report.');
  }
}

/**
 * Alias for exportStyledPdfReport to maintain compatibility with legacy callers.
 */
export async function exportToPdf(params: {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: ReportRow[];
}) {
  return exportStyledPdfReport(params);
}

/**
 * Generates a CSV file and triggers a browser download.
 */
export async function exportToCsv(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      return `"${val.replace(/"/g, '""')}"`;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
