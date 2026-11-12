/* Plain JavaScript: no installation or build step. */
const config = window.STUDY;
const storageKey = 'uic-study-state-v1';
const screen = document.getElementById('screen');
const notice = document.getElementById('notice');
let state = null, startTime = null;
window.addEventListener('message', event => {
  if(event.origin !== location.origin || event.data?.type !== 'study-chart-ready') return;
  for(const frame of document.querySelectorAll('iframe')) {
    if(event.source === frame.contentWindow && Number.isFinite(event.data.height))
      frame.style.height = Math.max(620, Math.min(2000, event.data.height)) + 'px';
  }
});
const sequences = [
  [['Static','1A'],['Static','2A'],['Interactive','1B'],['Interactive','2B']],
  [['Interactive','1A'],['Interactive','2A'],['Static','1B'],['Static','2B']],
  [['Static','1B'],['Static','2B'],['Interactive','1A'],['Interactive','2A']],
  [['Interactive','1B'],['Interactive','2B'],['Static','1A'],['Static','2A']]
];
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(e){notice.textContent='Browser storage is unavailable. Keep this page open and download your results before closing it.';}}
function csvCell(v){let s=String(v??'');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
function download(){
  const fields=['study_version','demo','participant_id','sequence_id','part_number','condition','task_id','variant','question_id','question_text','response','numeric_question_text','numeric_response','numeric_unit','completion_seconds','question_difficulty','visualization_difficulty'];
  const rows=state.rows.map(row=>fields.map(f=>csvCell(row[f])).join(','));
  const blob=new Blob(['\uFEFF'+[fields.join(','),...rows].join('\r\n')],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob), a=document.createElement('a');a.href=url;a.download=`${state.demo?'DEMO_':''}participant_${state.id}_${state.runId}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function introduction(){
 screen.innerHTML=`<h2>Before you begin</h2><p>You will complete four parts: two using a static chart and two using an interactive chart. Each part asks you to select a location and enter a numerical estimate. Submit both answers together, then rate the difficulty of the pair and how difficult the chart was to use.</p><p>Read the chart legends first. The horizontal axis shows chair occupancy and the vertical axis shows table occupancy. The dashed diagonal marks equal percentages. Interactive checkboxes hide or show subsets. Numerical answers estimate the average chair occupancy for the location you select.</p><p>Work at your own pace without outside help or external devices. Ask the researcher if you need clarification of the instructions. Your answer is locked when submitted. You will not receive correctness feedback during the study.</p><form id="entry"><label for="participant">Assigned participant number</label><p><input id="participant" type="number" min="1" max="999999" step="1" required></p><button>Continue to practice</button></form>`;
 document.getElementById('entry').onsubmit=e=>{e.preventDefault();const id=Number(document.getElementById('participant').value);if(!Number.isSafeInteger(id)||id<1)return;state={id,runId:crypto.randomUUID(),version:config.version,demo:config.demo,sequence:(id-1)%4,part:0,phase:'practice',practice:0,rows:[]};save();practice();};
}
function practice(){
 const first=sequences[state.sequence][0][0];const condition=state.practice===0?first:(first==='Static'?'Interactive':'Static');
 screen.innerHTML=`<h2>Practice ${state.practice+1} of 2: ${condition}</h2><p>Unscored practice: identify the axes and time-of-day symbols. ${condition==='Interactive'?'Try hiding a location, then showing it again.':'Find a location using the color legend.'}</p><iframe id="practice-chart" title="${condition} practice visualization"></iframe><p>Tell the researcher when you understand the chart. Practice is not timed.</p><button id="practice-next">${state.practice===0?'Next practice':'Finish practice'}</button>`;
 document.getElementById('practice-chart').src=config.charts[condition];
 document.getElementById('practice-next').onclick=()=>{state.practice++;if(state.practice===2){state.phase='ready';save();ready();}else{save();practice();}};
}
function ready(){
 const [condition]=sequences[state.sequence][state.part];
 screen.innerHTML=`<h2>Part ${state.part+1} of 4</h2><p>The next pair of questions uses the <strong>${condition.toLowerCase()}</strong> visualization.</p><p>Prepare the chart, then start when you are ready. Timing includes reading and answering both questions, but excludes loading the chart.</p><button id="prepare">Prepare question</button>`;
 document.getElementById('prepare').onclick=prepare;
}
async function prepare(){
 const [condition,qid]=sequences[state.sequence][state.part], question=config.questions[qid];
 screen.innerHTML=`<h2>Part ${state.part+1} of 4 · ${condition}</h2><p id="loading">Loading the visualization…</p><div id="chart-wrap" hidden><iframe id="chart" title="${condition} study visualization"></iframe></div><button id="start" disabled>Start part</button><div id="question" hidden><h2>${escapeHTML(question.prompt)}</h2><form id="answer"><fieldset><legend>Question 1: Select a location</legend>${question.options.map((option,i)=>`<label class="option"><input type="radio" name="answer" value="${i}" required> ${escapeHTML(option)}</label>`).join('')}</fieldset><fieldset><legend>Question 2: Enter a number</legend><label for="numeric-answer">${escapeHTML(question.numeric.prompt)}</label><p><input id="numeric-answer" name="numeric_answer" type="number" min="${escapeHTML(question.numeric.min)}" max="${escapeHTML(question.numeric.max)}" step="${escapeHTML(question.numeric.step)}" required aria-describedby="numeric-help"> ${escapeHTML(question.numeric.unit)}</p><p id="numeric-help" class="muted">Enter an average chair occupancy estimate from 0 to 100 without a percent sign. Decimals are allowed.</p></fieldset><button>Submit both answers</button></form></div>`;
 const frame=document.getElementById('chart'), start=document.getElementById('start'), loading=document.getElementById('loading');
 let loaded=false;
 // Real chart files must announce readiness after Vega finishes rendering.
 function message(event){if(event.source!==frame.contentWindow||event.origin!==location.origin||event.data?.type!=='study-chart-ready')return;loaded=true;start.disabled=false;loading.textContent='Visualization ready. Select Start part to reveal it and begin timing.';window.removeEventListener('message',message);}
 window.addEventListener('message',message);
 try{const result=await fetch(config.charts[condition],{cache:'no-store'});if(!result.ok)throw Error('not found');frame.src=config.charts[condition];}catch(e){loading.textContent='Chart file could not be loaded. Check config.js and use a local web server or GitHub Pages.';window.removeEventListener('message',message);return;}
 setTimeout(()=>{if(!loaded&&document.contains(frame))loading.textContent='Still waiting for the chart to finish rendering. Check its readiness message (see README).';},15000);
 start.onclick=()=>{
   if(!loaded)return;state.phase='answer';save();
   document.getElementById('chart-wrap').hidden=false;document.getElementById('question').hidden=false;start.hidden=true;loading.hidden=true;
   requestAnimationFrame(()=>{startTime=performance.now();});
 };
 document.getElementById('answer').onsubmit=e=>{
   e.preventDefault();if(state.phase!=='answer'||startTime===null)return;
   if(!e.target.reportValidity())return;
   const form=new FormData(e.target);
   const response=question.options[Number(form.get('answer'))];
   const rawNumber=String(form.get('numeric_answer')??'').trim();
   const numericResponse=Number(rawNumber);
   if(!rawNumber || !Number.isFinite(numericResponse) || numericResponse<question.numeric.min || numericResponse>question.numeric.max)return;
   state.rows.push({study_version:state.version,demo:state.demo,participant_id:state.id,sequence_id:state.sequence+1,part_number:state.part+1,condition,task_id:qid[0],variant:qid[1],question_id:qid,question_text:question.prompt,response,numeric_question_text:question.numeric.prompt,numeric_response:numericResponse,numeric_unit:question.numeric.unit,completion_seconds:Number(((performance.now()-startTime)/1000).toFixed(3)),question_difficulty:'',visualization_difficulty:''});
   startTime=null;state.phase='rating';save();ratings();
 };
}
function ratings(){
 screen.innerHTML=`<h2>Both answers saved</h2><p>These ratings are separate from your completion time.</p><form id="ratings">${[['difficulty','How difficult were the two questions overall?','very easy','very difficult'],['usability','How difficult was the visualization to use?','very easy to use','very difficult to use']].map(([id,label,low,high])=>`<div class="rating"><label for="${id}">${label}</label><select id="${id}" required><option value="">Choose a rating</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n}${n===1?' — '+low:n===5?' — '+high:''}</option>`).join('')}</select></div>`).join('')}<button>${state.part===3?'Finish study':'Next part'}</button></form>`;
 document.getElementById('ratings').onsubmit=e=>{e.preventDefault();const row=state.rows[state.rows.length-1];row.question_difficulty=Number(document.getElementById('difficulty').value);row.visualization_difficulty=Number(document.getElementById('usability').value);state.part++;state.phase=state.part===4?'complete':'ready';save();render();};
}
function complete(){screen.innerHTML='<h2>Study complete</h2><p>Thank you. Download the CSV and ask the researcher to confirm it was saved before starting another participant.</p><button id="download">Download results CSV</button><p><label><input id="confirmed" type="checkbox"> Researcher confirmed the CSV is saved</label></p><button id="reset" class="secondary" disabled>Start another participant</button>';document.getElementById('download').onclick=download;document.getElementById('confirmed').onchange=e=>document.getElementById('reset').disabled=!e.target.checked;document.getElementById('reset').onclick=()=>{localStorage.removeItem(storageKey);state=null;introduction();};}
function render(){if(state.phase==='practice')practice();else if(state.phase==='rating')ratings();else if(state.phase==='complete')complete();else ready();}

document.getElementById('mode').innerHTML=config.demo?'<span class="badge">Pilot mode — practice results</span>':'';
try{state=JSON.parse(localStorage.getItem(storageKey));}catch(e){}
if(state){
 if(state.version!==config.version||state.demo!==config.demo){screen.innerHTML='<h2>Saved session uses a different configuration</h2><p>Download the saved answers before clearing this session.</p><button id="old-download">Download saved CSV</button><button id="old-reset" class="secondary">Clear saved session</button>';document.getElementById('old-download').onclick=download;document.getElementById('old-reset').onclick=()=>{if(confirm('Have you saved the results? Clear this session?')){localStorage.removeItem(storageKey);location.reload();}};}
 else{if(state.phase==='answer'){state.phase='ready';save();notice.textContent='The interrupted part will start again with a new timer.';}render();}
}else introduction();
