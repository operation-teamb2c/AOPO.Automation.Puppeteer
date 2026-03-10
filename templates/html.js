import { convertToBase64, coverDate } from "../helper/baseService.js";

const coverPath = await convertToBase64('./assets/images/cover-1.png');

const createHtmlHeader = (coverPath, date, caseName, duration, runId) => {
   const htmlHeader =
      `<!DOCTYPE html>
<html lang="en">

<head>
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0">
   <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" media="all">
   <title>Automation Testing Result</title>
   <meta charset="UTF-8">
   <style>
      /* 🎨 Root Color Variables */
      :root {
         --primary: #1a56db;
         --success: #057a55;
         --danger: #e02424;
         --warning: #FF7F00;
         --info: #1e429f;
         --light: #f8fafc;
         --dark: #1f2937;
         --gray: #6b7280;
         --border: #e5e7eb;
         --pass: #16a34a;
         --fail: #dc2626;
         --skip: #6b7280;
         --warn: #f59e0b;
      }

      /* 🌐 Base Layout */
      body {
         font-family: system-ui;
         font-size: 10px;
         color: #333;
         margin: 0 auto;
         padding: 0;
         font-style: normal;
         max-width: 210mm; /* A4 width */
         width: 100%;
      }

      * {
         margin: 0;
         padding: 0;
         box-sizing: border-box;
      }

      @page {
         size: A4;
         margin: 50px 15px 30px 15px; /* tambahkan margin-bottom untuk footer */
         @top-center {
            content: element(pageHeader);
         }
         @bottom-center {
            content: element(pageFooter);
         }
      }

      .page-header {
         position: running(pageHeader);
      }

      .page-footer {
         position: running(pageFooter);
      }

      @page :first {
         margin: 0;
      }

      @media print {
         .pagebreak {
            page-break-after: always;
         }

         .no-break {
            page-break-inside: avoid;
         }
      }
         
      /* 🧾 Generic Typography */
      .text {
         font-family: Helvetica, sans-serif;
         position: absolute;
         color: rgb(9, 53, 79);
         font-size: 14px;
         font-weight: bold;
         z-index: 10;
      }



      /* 📊 Steps Table */
      .steps-table {
         width: 100%;
         border-collapse: collapse;
         margin-top: 5px;
         font-size: 10px;
      }

      .steps-table th {
         background: var(--light);
         padding: 10px 0px;
         text-align: center;
         font-weight: 600;
         font-size: 12px;
         color: var(--dark);
         border-bottom: 2px solid var(--border);
      }

      .steps-table td {
         padding: 3px;
         vertical-align: top;
      }

      .steps-table tr:last-child td {
         border-bottom: none;
      }

      /* 🧩 Step Details */
      .step-number {
         color: var(--dark);
         width: 40px;
         text-align: center;
      }

      .step-details {
         min-width: 150px;
      }

      .step-title {
         color: #007bff;
      }

      .step-description {
         color: var(--gray);
         line-height: 1.4;
      }

      .step-duration {
         text-align: center;
         color: var(--gray);
      }

      td.step-duration {
         vertical-align: middle;
      }

      .step-status {
         display: flex;
         align-items: center;
         justify-content: center;
         align-items: center;
         width: 100%;
         padding: 4px 0;
      }

      td.status-step {
         vertical-align: middle;
      }


      .status {
         display: inline-flex;
         align-items: center;
         justify-content: center;
         gap: 6px;
         padding: 4px;
         border-radius: 20px;
         font-weight: 500;
         text-align: center;
      }


      .status.pass {
         background: #d1fae5;
         color: var(--success);
      }

      .status.fail {
         background: #fee2e2;
         color: var(--danger);
      }

      .status.skip {
         background: #d1d0caff;
         color: var(--gray);
      }

      .status.warning {
         background: #fef3c7;
         color: var(--warning);
      }



      /* 🧱 Summary Section */
      .section-title {
         font-size: 14px;
         font-weight: 600;
         margin-bottom: 5px;
         color: var(--dark);
         // padding-bottom: 8px;
         // border-bottom: 1px solid var(--border);
      }



      .summary-table {
         width: 100%;
         border-collapse: collapse;
      }

      .summary-table,
      .summary-table th,
      .summary-table td {
         border-left: none;
         border-right: none;
         padding: 8px;
      }

      .summary-table tr {
         border-bottom: 1px solid rgb(199, 199, 199);
      }

      .summary-table th {
         background-color: #022A5A;
         color: white;
         border: none;
         height: 15px;
         font-size: 12px;
      }

      .summary-table td {
         padding: 8px;
         text-align: left;
         height: 25px;
         font-size: 10px;
      }



      /* 📊 Summary Cards */
      .summary-section {
         margin: 15px 0;
      }

      .summary-grid {
         display: grid;
         grid-template-columns: repeat(5, 1fr);
         gap: 15px;
      }

      .summary-card {
         border: 1px solid var(--border);
         border-radius: 8px;
         padding: 5px;
         text-align: center;
         background: white;
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         min-height: 65px;
      }

      /* Warna garis atas */
      .summary-card.pass {
         border-top: 4px solid var(--success);
      }

      .summary-card.fail {
         border-top: 4px solid var(--danger);
      }

      .summary-card.warning {
         border-top: 4px solid var(--warning);
      }

      .summary-card.skip {
         border-top: 4px solid var(--gray);
      }

      .summary-card.time {
         border-top: 4px solid var(--info);
      }

      /* Ikon */
      .summary-icon {
         font-size: 18px;
         line-height: 1;
         margin-top: 3px;
      }

      /* Warna ikon */
      .summary-card.pass .summary-icon {
         color: var(--success);
      }

      .summary-card.fail .summary-icon {
         color: var(--danger);
      }

      .summary-card.warning .summary-icon {
         color: var(--warning);
      }

      .summary-card.skip .summary-icon {
         color: var(--gray);
      }

      .summary-card.time .summary-icon {
         color: var(--info);
      }


      /* Label di bawah angka */
      .summary-label {
         font-size: 11px;
         color: var(--gray);
      }

      .summary-value {
         font-size: 16px;
         font-weight: 700;
         line-height: 1;
         margin: 3px;
      }

      .table-content td,
      .table-content th {
         text-align: center;
         vertical-align: top;
      }


      /* Header Styles */
      .report-header {
         /* border-bottom: 2px solid var(--primary); 
         padding: 35px 0px 0px;
         margin-bottom: 25px;*/
      }

      .title-section h1 {
         font-size: 20px;
         font-weight: 700;
         color: var(--dark);
         // margin-bottom: 5px;
      }

      .title-section .subtitle {
         font-size: 12px;
         color: var(--gray);
      }

      .header-main {
         display: flex;
         justify-content: space-between;
         align-items: flex-start;
         // margin-bottom: 16px;
      }

      .logo-section {
         display: flex;
         align-items: center;
         gap: 15px;
      }

      .logo {
         width: 70px;
         height: 40px;
         background: var(--primary);
         border-radius: 8px;
         display: flex;
         align-items: center;
         justify-content: center;
         color: white;
         font-weight: bold;
         font-size: 16px;
      }



      .page-2-section h2 {
         padding: 8px 5px;
         font-size: 13px;
         font-weight: 600;
         margin-bottom: 5px;
         color: var(--light);
         background: #022A5A;
      }

      .page-2-section table {
         width: 100%;
         border-collapse: collapse;
         font-size: 10px;
         border-radius: 6px;
         overflow: hidden;
      }

      .page-2-section td {
         padding: 1px 0px;
         background-color: #ffffff;
         transition: background-color 0.2s ease-in-out;
      }

      .page-2-section tr:last-child td {
         padding-bottom: 15px;
      }

      .section-wrapper {
         display: flex;
         gap: 20px;
         margin-bottom: 20px;
      }

      .section-box {
         flex: 1;
      }

      .section-box table {
         width: 100%;
         border-collapse: collapse;
      }

      .section-box td {
         padding: 4px 0;
      }

      .validation-table td {
         text-align: center;
      }

      .validation-table td:first-child {
         text-align: left
      }

      /* CSS untuk child steps di description */
      /* .child-step-item {
    padding: 8px 10px;
    margin-bottom: 8px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border-left: 3px solid #3498db;
} */

      /* .child-step-item.pass {
    border-left-color: #2ecc71;
    background-color: rgba(46, 204, 113, 0.05);
}

.child-step-item.fail {
    border-left-color: #e74c3c;
    background-color: rgba(231, 76, 60, 0.05);
}

.child-step-item.warning {
    border-left-color: #f39c12;
    background-color: rgba(243, 156, 18, 0.05);
}

.child-step-item.skip {
    border-left-color: #95a5a6;
    background-color: rgba(149, 165, 166, 0.05);
} */

      .child-step-header {
         display: flex;
         /* justify-content: space-between; */
         align-items: baseline;
         margin-bottom: 4px;
      }

      .child-step-name {
         width: 115px;
      }

      .child-step-status {
         display: flex;
         align-items: center;
         justify-content: left;
         border-radius: 50%;
         font-weight: bold;
         padding-right: 5px;
         width: 10px;

      }

      .child-step-status.pass {
         color: #2ecc71;
      }

      .child-step-status.fail {
         color: #e74c3c;
      }

      .child-step-status.warning {
         color: #f39c12;
      }

      .child-step-status.skip {
         background-color: rgba(149, 165, 166, 0.1);
         color: #95a5a6;
      }

      .child-step-message {
         color: #6c757d;
         width:90%
      }

      .child-step-message.warning {
         color: #f39c12;
      }

      .child-step-name.warning {
         color: #f39c12;
      }
         
      .child-step-message::before {
         content: ":  ";
      }

      .warning-text {
         color: #f39c12;
         font-weight: 500;
      }

      .container-summary {
         max-width: 1200px;
         // margin: 28px auto;
         // padding: 0 16px;
      }

      .header-summary {
         display: flex;
         align-items: flex-end;
         justify-content: space-between;
         gap: 16px;
         margin-bottom: 14px;
      }

      .title-summary h1 {
         margin: 0;
         font-size: px;
         font-weight: 700;
         letter-spacing: .2px;
      }

      .title-summary p {
         margin: 6px 0 0;
         font-size: 11px;
         color: var(--muted);
      }

      .meta-summary {
         display: flex;
         gap: 10px;
         flex-wrap: wrap;
         justify-content: flex-end;
      }

      .pill {
         background: #fff;
         border: 1px solid var(--border);
         border-radius: 999px;
         padding: 8px 10px;
         font-size: 12px;
         color: var(--muted);
         box-shadow: 0 4px 10px rgba(0, 0, 0, .03);
         display: flex;
         gap: 8px;
         align-items: center;
         white-space: nowrap;
      }

      .result-group {
         display: flex;
         gap: 8px;
         flex-wrap: wrap;
         justify-content: flex-start;
         align-items: center;
      }

      .badge {
         display: inline-flex;
         align-items: center;
         padding: 3px 5px;
         border-radius: 999px;
         font-size: 10px;
         border: 1px solid transparent;
         white-space: nowrap;
      }

      .badge.pass {
         background: rgba(22, 163, 74, .10);
         color: var(--pass);
         border-color: rgba(22, 163, 74, .25);
      }

      .badge.fail {
         background: rgba(220, 38, 38, .10);
         color: var(--fail);
         border-color: rgba(220, 38, 38, .25);
      }

      .badge.skip {
         background: rgba(107, 114, 128, .10);
         color: var(--skip);
         border-color: rgba(107, 114, 128, .25);
      }

      .badge.warn {
         background: rgba(245, 158, 11, .12);
         color: var(--warn);
         border-color: rgba(245, 158, 11, .25);
      }

   </style>
</head>
<body>
   <!--Cover-->
   <div style="position: relative;">
      <img 
      src="${coverPath}" style="width: 100%; height: auto; max-width: 794px; object-fit: cover;">
      <div class="text" style="top: 80%; left: 3%;">
         <div style="font-size: 26px">Testing Strategy Documentation</div>
         <div style="font-size: 18px; margin-top: 5px; color: rgb(255, 136, 0)">${caseName}</div>
         <div style="margin-top: 10px">${date}</div>
         <div style="margin-top: 75px;">prepared by : Ops Team</div>
      </div>
   </div>
   <div class="page-header"></div>
   <div class="page-footer"></div>
   <!--All Task Summary-->
   <div class="pagebreak">
      <div class="container-summary">
         <div class="header-summary">
            <div class="title-summary">
                <h1>Automation Test Report</h1>
                <p>• Last run: ${date} • Duration: ${duration}</p>
            </div>

            <div class="meta-summary">
                <div class="pill">🌐 <b>Env</b> ${process.env.ENVIRONMENT}</div>
            </div>
        </div>
      </div>
      <div style="padding-top: 5px;">
         <div>
            <div style="border-radius: 9px;overflow: hidden;">
               <table class="summary-table table-content">
                  <thead>
                     <tr style="border: none;">
                        <th colspan="2">Test Case</th>
                        <th style="width: 3%;">Type</th>
                        <th style="width: 22%;">Time Execution</th>
                        <th style="width: 10%;">Result</th>
                     </tr>
                  </thead>
                  <tbody>
   `
   return htmlHeader;
}


const htmlHeader = (testCase, duration, runId) => {
   let caseName;
   switch (testCase) {
      case 'LOG':
         caseName = "Login";
         break;
      case 'ODR':
         caseName = "Order";
         break;
      default:
         caseName = "Smoke Test";
   }

   const todayDate = coverDate(new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Jakarta" }));
   const result = createHtmlHeader(coverPath, todayDate, caseName, duration, runId);

   return result
}
const endOfSummary =
   `          
                  </tbody>
               </table>
           </div>
         </div>
      </div>
   </div>`

const endOfHTML =
   `  
   </body>
   </html>`

export { htmlHeader, endOfHTML, endOfSummary };