import { format } from "date-fns"

export const printGatepass = (gatepass) => {
  if (!gatepass) return

  const formatDateTime = (dateTimeRange) => {
    if (!dateTimeRange) return { from: "N/A", to: "N/A" }
    return {
      from: dateTimeRange.from || "N/A",
      to: dateTimeRange.to || "N/A",
    }
  }

  const createEmployeeGrid = (employees) => {
    if (!employees || employees.length === 0) return '<div class="employee-item">None</div>'
    const empList = Array.isArray(employees) ? employees : [employees]
    let html = '<div class="employee-grid">'
    for (let i = 0; i < empList.length; i++) {
      html += `<div class="employee-item">${empList[i]}</div>`
    }
    html += "</div>"
    return html
  }

  const dateTime = formatDateTime(gatepass.dateTimeRange)
  const printWindow = window.open("", "_blank", "width=1000,height=800")

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Gatepass ${gatepass.id}</title>
      <style>
        @page {
          size: legal landscape;
          margin: 0.5cm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          font-family: Arial, sans-serif;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        .print-container {
          display: flex;
          width: 100%;
          height: 100vh;
          min-height: 100%; 
          position: relative; 
        }
        .print-container::after {
          content: '';
          display: block;
          width: 2px; 
          background-color: #000; 
          height: 100%; 
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          border-left: 2px dashed #000;
          z-index: 1;
        }
        .gatepass-card {
          flex: 1;
          padding: 20px;
          font-size: 14px;
          height: 100%;
          position: relative;
        }
        .print-divider {
          width: 1px;
          background-color: #000; 
          height: 100vh;
          margin: 0; 
          position: relative; 
        }
        .gatepass-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }
        .gatepass-header img {
          height: 45px;
          width: auto;
        }
        .header-text {
          text-align: left;
        }
        .gatepass-title {
          font-size: 16px;
          font-weight: bold;
          line-height: 1.2;
        }
        .gatepass-subtitle {
          font-size: 13px;
          margin-top: 2px;
          line-height: 1.2;
        }
        .gatepass-content {
          margin-bottom: 30px;
        }
        .gatepass-row {
          display: flex;
          margin-bottom: 10px;
          align-items: flex-start;
        }
        .gatepass-label {
          font-weight: bold;
          width: 140px;
          flex-shrink: 0;
        }
        .gatepass-value {
          flex: 1;
        }
        .employee-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .purpose-box {
          min-height: 60px;
        }
        .bottom-sections {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
        }
        .signature-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .signature-box {
          text-align: center;
          width: 220px;
        }
        .signature-label {
          font-weight: bold;
          margin-bottom: 15px;
        }
        .signature-name {
          margin-bottom: 8px;
        }
        .signature-line {
          border-top: 1px solid #000;
          width: 100%;
          margin: 5px 0;
        }
        .signature-title {
          margin-top: 5px;
        }
        .time-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .time-box {
          width: 48%;
        }
        .guard-signature {
          width: 48%;
          text-align: center;
        }
        .travel-verification {
          margin-bottom: 0;
        }
        .verification-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .gatepass-card * {
          font-family: Arial, sans-serif;
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <div class="gatepass-card">
          <div class="gatepass-header">
            <img src="/src/assets/LOGO.svg" alt="Logo">
            <div class="header-text">
              <div class="gatepass-title">QUEZON 1 ELECTRIC COOPERATIVE, INC.</div>
              <div class="gatepass-subtitle">EMPLOYEE GATEPASS</div>
              <div class="gatepass-subtitle">Reference No: ${gatepass.id}</div>
            </div>
          </div>

          <div class="gatepass-content">
            <div class="gatepass-row">
              <div class="gatepass-label">Employee(s):</div>
              <div class="gatepass-value">
                ${createEmployeeGrid(gatepass.employees)}
              </div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Department:</div>
              <div class="gatepass-value">${gatepass.department}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Service Vehicle:</div>
              <div class="gatepass-value">${gatepass.serviceVehicle || "N/A"}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">From:</div>
              <div class="gatepass-value">${dateTime.from}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">To:</div>
              <div class="gatepass-value">${dateTime.to}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Destination:</div>
              <div class="gatepass-value">${gatepass.destination}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Purpose:</div>
              <div class="gatepass-value purpose-box">${gatepass.purpose}</div>
            </div>
          </div>

          <div class="bottom-sections">
            <div class="signature-container">
              <div class="signature-box">
                <div class="signature-label">Prepared by:</div>
                <div class="signature-name">${gatepass.preparedBy || "User's Full Name"}</div>
                <div class="signature-line"></div>
                <div class="signature-title">${gatepass.preparedByPosition || "Position"}</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">Approved by:</div>
                <div class="signature-name">${gatepass.assignatory || "Approver's Name"}</div>
                <div class="signature-line"></div>
                <div class="signature-title">${gatepass.assignatoryPosition || "Position"}</div>
              </div>
            </div>

            <div class="time-section">
              <div class="time-box">
                <div class="gatepass-row">
                  <div class="gatepass-label">Time Out:</div>
                  <div class="gatepass-value">${gatepass.timeOut || "____:____"}</div>
                </div>
                <div class="gatepass-row">
                  <div class="gatepass-label">Time In:</div>
                  <div class="gatepass-value">${gatepass.timeIn || "____:____"}</div>
                </div>
              </div>
              <div class="guard-signature">
                <div class="signature-label">Guard on Duty:</div>
                <div class="signature-line"></div>
                <div class="signature-title">Signature</div>
              </div>
            </div>

            <div class="travel-verification">
              <div class="verification-title">TRAVEL VERIFICATION</div>
              <div class="gatepass-row">
                <div class="gatepass-label">Person/s Visited:</div>
                <div class="gatepass-value">________________________________________</div>
              </div>
              <div class="gatepass-row">
                <div class="gatepass-label">Date and Time:</div>
                <div class="gatepass-value">________________________________________</div>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <div class="signature-line" style="margin: 0 auto; width: 220px;"></div>
                <div class="signature-title">Signature</div>
              </div>
            </div>
          </div>
        </div>

        <div class="print-divider"></div>

        <div class="gatepass-card">
          <div class="gatepass-header">
            <img src="/src/assets/LOGO.svg" alt="Logo">
            <div class="header-text">
              <div class="gatepass-title">QUEZON 1 ELECTRIC COOPERATIVE, INC.</div>
              <div class="gatepass-subtitle">EMPLOYEE GATEPASS</div>
              <div class="gatepass-subtitle">Reference No: ${gatepass.id}</div>
            </div>
          </div>

          <div class="gatepass-content">
            <div class="gatepass-row">
              <div class="gatepass-label">Employee(s):</div>
              <div class="gatepass-value">
                ${createEmployeeGrid(gatepass.employees)}
              </div>
            </div>


            <div class="gatepass-row">
              <div class="gatepass-label">Department:</div>
              <div class="gatepass-value">${gatepass.department}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Service Vehicle:</div>
              <div class="gatepass-value">${gatepass.serviceVehicle || "N/A"}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">From:</div>
              <div class="gatepass-value">${dateTime.from}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">To:</div>
              <div class="gatepass-value">${dateTime.to}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Destination:</div>
              <div class="gatepass-value">${gatepass.destination}</div>
            </div>

            <div class="gatepass-row">
              <div class="gatepass-label">Purpose:</div>
              <div class="gatepass-value purpose-box">${gatepass.purpose}</div>
            </div>
          </div>

          <div class="bottom-sections">
            <div class="signature-container">
              <div class="signature-box">
                <div class="signature-label">Prepared by:</div>
                <div class="signature-name">${gatepass.preparedBy || "User's Full Name"}</div>
                <div class="signature-line"></div>
                <div class="signature-title">${gatepass.preparedByPosition || "Position"}</div>
              </div>
              <div class="signature-box">
                <div class="signature-label">Approved by:</div>
                <div class="signature-name">${gatepass.assignatory || "Approver's Name"}</div>
                <div class="signature-line"></div>
                <div class="signature-title">${gatepass.assignatoryPosition || "Position"}</div>
              </div>
            </div>

            <div class="time-section">
              <div class="time-box">
                <div class="gatepass-row">
                  <div class="gatepass-label">Time Out:</div>
                  <div class="gatepass-value">${gatepass.timeOut || "____:____"}</div>
                </div>
                <div class="gatepass-row">
                  <div class="gatepass-label">Time In:</div>
                  <div class="gatepass-value">${gatepass.timeIn || "____:____"}</div>
                </div>
              </div>
              <div class="guard-signature">
                <div class="signature-label">Guard on Duty:</div>
                <div class="signature-line"></div>
                <div class="signature-title">Signature</div>
              </div>
            </div>

            <div class="travel-verification">
              <div class="verification-title">TRAVEL VERIFICATION</div>
              <div class="gatepass-row">
                <div class="gatepass-label">Person/s Visited:</div>
                <div class="gatepass-value">________________________________________</div>
              </div>
              <div class="gatepass-row">
                <div class="gatepass-label">Date and Time:</div>
                <div class="gatepass-value">________________________________________</div>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <div class="signature-line" style="margin: 0 auto; width: 220px;"></div>
                <div class="signature-title">Signature</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

export const printLeaveRequest = (leave) => {
  if (!leave) return
  const formatDate = (date) => date ? format(new Date(date), "PPP") : "N/A"
  const printWindow = window.open("", "_blank", "width=1000,height=800")
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Leave Request ${leave.id}</title>
      <style>
        @page { size: A4; margin: 1cm; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .leave-container { max-width: 800px; margin: 0 auto; padding: 32px; border: 1px solid #ccc; }
        .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .header img { height: 45px; }
        .header-text { }
        .title { font-size: 20px; font-weight: bold; }
        .subtitle { font-size: 14px; margin-top: 2px; }
        .section { margin-bottom: 24px; }
        .row { display: flex; margin-bottom: 10px; }
        .label { font-weight: bold; width: 180px; }
        .value { flex: 1; }
        .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
        .signature-box { text-align: center; width: 220px; }
        .signature-line { border-top: 1px solid #000; width: 100%; margin: 20px 0 5px 0; }
        .signature-title { margin-top: 5px; }
      </style>
    </head>
    <body>
      <div class="leave-container">
        <div class="header">
          <img src="/src/assets/LOGO.svg" alt="Logo">
          <div class="header-text">
            <div class="title">QUEZON 1 ELECTRIC COOPERATIVE, INC.</div>
            <div class="subtitle">EMPLOYEE LEAVE REQUEST</div>
            <div class="subtitle">Reference No: ${leave.id}</div>
          </div>
        </div>
        <div class="section">
          <div class="row"><div class="label">Employee Name:</div><div class="value">${leave.name}</div></div>
          <div class="row"><div class="label">I.D. No.:</div><div class="value">${leave.idNumber || "N/A"}</div></div>
          <div class="row"><div class="label">Date Range:</div><div class="value">From: ${formatDate(leave.from)} To: ${formatDate(leave.to)}</div></div>
          <div class="row"><div class="label">Shift:</div><div class="value">${leave.shift}</div></div>
          <div class="row"><div class="label">Total Days:</div><div class="value">${leave.totalDays}</div></div>
          <div class="row"><div class="label">Leave Type:</div><div class="value">${leave.type === "Others" ? leave.othersType : leave.type}</div></div>
        </div>
        <div class="section">
          <div class="row"><div class="label">Prepared by:</div><div class="value">${leave.preparedBy}</div></div>
          <div class="row"><div class="label">Recommending Approval:</div><div class="value">${leave.recommendingApproval}</div></div>
        </div>
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Employee Signature</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Approver Signature</div>
          </div>
        </div>
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `
  printWindow.document.write(htmlContent)
  printWindow.document.close()
} 