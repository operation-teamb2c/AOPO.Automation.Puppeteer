export function countStatus(statusObject = {}) {
   let result = {
      pass: 0,
      fail: 0,
      skip: 0,
      warning: 0
   };

   for (let key in statusObject) {
      const code = statusObject[key];

      switch (code) {
         case 200:
            result.pass++;
            break;

         case 206:
            result.warning++;
            break;

         case 204:
            result.skip++;
            break;

         case 400:
         case 500:
            result.fail++;
            break;

         default:
            console.warn(`Unknown status code '${code}' at step '${key}'`);
            result.fail++;
      }
   }

   return result;
}

export const constructSummary = async (data) => {
   // console.log('data >>', data);

   let scenarioStatus = data.dbScenario.status || 'N/A';
   scenarioStatus = scenarioStatus === 'Passed'
      ? '✅ Passed'
      : scenarioStatus === 'Skipped'
         ? '⏭️ Skipped'
         : scenarioStatus === 'Warning'
            ? '⚠️ Warning'
            : '❌ Failed';
   const badgeStatus = scenarioStatus.includes('Passed')
      ? 'pass'
      : scenarioStatus.includes('Skipped')
         ? 'skip'
         : scenarioStatus.includes('Warning')
            ? 'warn'
            : 'fail';

   const startTime = new Date(data.dbScenario.start_time).toISOString().slice(11, 19);
   const endTime = new Date(data.dbScenario.end_time).toISOString().slice(11, 19);

   // let { pass, fail, skip, warning } = countStatus(data.status);

   let eachData =
      `                    <tr>
                        <td style="width: 10%;"><a href="#${data.input.testCase}">${data.input.testCase}</a></td>
                        <td style="text-align: left;">${data.input.scenario}</td>
                        <td style="color: ${data.input.type === 'Positive' ? '#1a56db' : '#e02424'};">${data.input.type}</td>
                        <td style="text-align: center;">${startTime} → ${endTime} ( ${data.timeExecution} )</td>
                        <td><span class="badge ${badgeStatus}">${scenarioStatus}</span></td>
                     </tr>`
   return eachData;
}

export const constructDetail = async (data) => {
   const { testCase, type, password, scenario, urlKey, qty, ...screeningData } = data.input;
   const newData = Object.fromEntries(
      Object.entries(screeningData).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
   );
      
   console.log('data >>', data);
   
   let section1 = await constructFirstSection(data, newData);
   let section2 = '';

   if (data?.status['Create Order'] === 200 && data?.orderDetail?.summary) {
      section2 = await secondSection(data);
   }
   let finalResult = section1 + section2;
   return finalResult
}

const constructFirstSection = async (data) => {

   let { pass, fail, skip, warning } = countStatus(data.status);
   console.log('data.status >>', data.status);
   
   let totalCount = Object.keys(data.status).length;

   const summaryItems = [
      { key: "pass", value: pass, label: "Pass", icon: "✓" },
      { key: "fail", value: fail, label: "Fail", icon: "✗" },
      { key: "warning", value: warning, label: "Warning", icon: "⚠️" },
      { key: "skip", value: skip, label: "Skip", icon: "-" },
      { key: "time", value: data.timeExecution, label: "Total Time", icon: "⏱" }
   ];

   const summaryHTML = summaryItems.map(item => `        
            <div class="summary-card ${item.key}">
               <div class="summary-icon">${item.icon}</div>
               <div class="summary-value">${item.value}</div>
               <div class="summary-label">${item.label}</div>
            </div>`).join("");

   let html = `  
   <!--Detail Pertama-->
   <div class="pagebreak">
      <div class="report-header no-break">
         <div class="header-main">
            <div class="logo-section">
               <div class="logo" id="${data.input.testCase}">${data.input.testCase}</div>
               <div class="title-section">
                  <h1>Automation Test Report</h1>
                  <div class="subtitle">
                     <span style="color: ${data.input.type === 'Positive' ? '#1a56db' : '#e02424'};">${data.input.type}</span> - ${data.input.scenario}
                  </div>
               </div>
            </div>
         </div> 
      </div>
      <!--SUMMARY-->
      <div class="summary-section">
         <h2 class="section-title">Test Summary</h2>
         <div class="summary-grid">
            ${summaryHTML}
         </div>
      </div>
      <!--STEPS-->
      <div class="steps-section">
         <h2 class="section-title">Test Execution Details</h2>
         <table class="steps-table">
            <thead>
               <tr>
                  <th>#</th>
                  <th style="text-align: left;">Test Step</th>
                  <th style="text-align: left;">Message</th>
                  <th style="width:8%">Status</th>
                  <th>Duration</th>
               </tr>
            </thead>
            <tbody>`

   Object.keys(data.status).forEach((key, index) => {
      const status = data.status[key];
      const message = data.message?.[key] || '';
      const duration = data.duration?.[key] || '-';

      const childSteps = data.child?.[key] ?? [];
      let descriptionContent = '';

      if (childSteps.length > 0) {
         descriptionContent = `
                     <div class="step-description">
            ${childSteps.map(childKey => {

            const childStatus = data.childResult?.[key]?.[childKey]?.status ?? '';
            const childMessage = data.childResult?.[key]?.[childKey]?.message ?? '';

            let childStatusHtml = '';
            let childStatusClass = '';
            if (childStatus) {
               if (childStatus === 500 || childStatus === 400) {
                  childStatusHtml = '✗';
                  childStatusClass = 'fail';
               } else if (childStatus === 206) {
                  childStatusHtml = '!';
                  childStatusClass = 'warning';
               } else if (childStatus === 204) {
                  childStatusHtml = '-';
                  childStatusClass = 'skip';
               } else {
                  childStatusHtml = '✓';
                  childStatusClass = 'pass';
               }
            }

            return `                        <div class="child-step-item ${childStatusClass}">
                            <div class="child-step-header">
                                <span class="child-step-status ${childStatusClass}">${childStatusHtml}</span>
                                <span class="child-step-name ${childStatusClass}">${childKey}</span>
                            ${childMessage ? `<span class="child-step-message ${childStatusClass}">${childMessage}</span>` : ''}
                            </div>
                        </div>`;
         }).join('')}
            </div>`;
      } else {
         descriptionContent = `<div class="step-description ${status === 206 ? 'warning-text' : ''}">${message}</div>`;
      }

      let statusClass = '';
      let statusText = '';

      switch (status) {
         case 204:
            statusClass = 'skip';
            statusText = '- Skip';
            break;

         case 206:
            statusClass = 'warning';
            statusText = '⚠️ Warn';
            break;
         case 400:
         case 500:
            statusClass = 'fail';
            statusText = '✗ Fail';
            break;

         default:
            statusClass = 'pass';
            statusText = '✓ Pass';
      }

      html += `
               <tr>
                  <td class="step-number">${index + 1}</td>
                  <td class="step-details">
                        <div class="step-title">${key}</div>
                  </td>
                  <td class="step-details">${descriptionContent}</td>
                  <td class="status-step">
                        <span class="step-status status ${statusClass}">${statusText}</span>
                  </td>
                  <td class="step-duration">${duration}</td>
               </tr>`;
   });


   html += `
            </tbody>
         </table>
      </div>
   </div>
   `

   // Check if images should be included in the report
   const showImages = process.env.REPORT_IMG !== 'false';
   const images = data.image ?? data.img ?? {};
   const hasImages = Object.keys(images).length > 0;

   if (hasImages && showImages) {
      html += `
   <!-- Documentation -->
   <div class="pagebreak">
      <h3 class="report-header no-break">Documentation</h3>
      <div class="content">
         ${Object.entries(images).map(([sectionName, steps]) => `
         ${Object.entries(steps).map(([stepName, base64Image]) => `
            <div class="image-container">
               <p>${sectionName} - ${stepName}</p><br/>
               <img class="picture" src="${base64Image}" alt="${stepName} Image" style="width: 100%;">
            </div>
         `).join('')}
         `).join('')}
      </div>
   </div>`;
   }

   return html;
}
