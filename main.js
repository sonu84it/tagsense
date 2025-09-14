let selectedImageBase = "";
let summaryGenerated = false;
let rawOutputText = "";
const runningMessagePromptAPI = 'Chrome Prompt AI model Running...';
const runningMessageSummaryAPI = 'Chrome Summary AI model Running...';

function selectImage(imgElement) {
  const cards = document.querySelectorAll('.risk-card');
  cards.forEach(card => card.classList.remove('selected'));
  const card = imgElement.closest('.risk-card');
  if (card) card.classList.add('selected');
  const preview = document.getElementById('preview');
  preview.src = imgElement.src;
  preview.style.display = 'block';
  selectedImageBase = imgElement.src.replace(/^.*\/(.*)\.[^.]+$/, '$1');
  document.getElementById('actionSelect').disabled = false;
  document.getElementById('applyBtn').disabled = false;
  document.getElementById('outputImage').style.display = 'none';
  document.getElementById('summarySection').style.display = 'none';
  document.getElementById('summaryBox').innerHTML = '';
  document.getElementById('rawBox').textContent = '';
  document.getElementById('summaryTab').disabled = true;
  summaryGenerated = false;
  rawOutputText = '';
}

async function applyAction() {
  const action = document.getElementById('actionSelect').value;
  if (!selectedImageBase) return;
  const outputPath = `images/${selectedImageBase}_${action}.png`;
  const outImg = document.getElementById('outputImage');
  outImg.src = outputPath;
  outImg.style.display = 'block';
  document.getElementById('summarySection').style.display = 'block';
  document.getElementById('summaryHeading').style.display = 'block';
  document.getElementById('summaryBox').innerHTML = '';
  document.getElementById('rawBox').textContent = '';
  document.getElementById('summaryTab').disabled = true;
  summaryGenerated = false;
  rawOutputText = '';
  await compareImages();
}

function markdownToHTML(md) {
  const lines = md.split(/\r?\n/);
  let html = '';
  let inList = false;
  lines.forEach(line => {
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${line.substring(2)}</li>`;
    } else if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${line.substring(4)}</h3>`;
    } else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${line.substring(3)}</h2>`;
    } else if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${line.substring(2)}</h1>`;
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${line}</p>`;
    }
  });
  if (inList) html += '</ul>';
  return html;
}

const defaultMessage =
  'Chrome AI model not available on this device. To use TagSense, please enable and download the local Prompt API model in Chrome.';

async function compareImages() {
  const summaryBox = document.getElementById('summaryBox');
  const rawBox = document.getElementById('rawBox');
  if (summaryBox) summaryBox.innerText = runningMessageSummaryAPI;
  if (rawBox) rawBox.textContent = runningMessagePromptAPI;
  if (typeof LanguageModel === 'undefined') {
    console.warn('LanguageModel API not available');
    if (summaryBox) summaryBox.innerText = defaultMessage;
    if (rawBox) rawBox.textContent = defaultMessage;
    return;
  }
  try {
    const session = await LanguageModel.create({
      expectedInputs: [{ type: 'image' }],
      outputLanguage: 'en',
    });

    const inputimage = await (await fetch(document.getElementById('preview').src)).blob();
    const outputimage = await (await fetch(document.getElementById('outputImage').src)).blob();

    const response1 = await session.prompt([
      {
        role: 'user',
        content: [
          {
            type: 'text',
            value:
              'Analyze the given input image to identify any items that may pose privacy, security, or compliance risks. Exclude faces from detection and focus strictly on objects such as:\n\nCredit cards or ID cards\n\nLaptops or screens displaying sensitive information\n\nDocuments, papers, or files with visible text\n\nWhiteboards containing meeting notes, client details, or other material information\n\nUse the Chrome Prompt API with the local on-device model to generate a processed output image. For each identified item, apply and document the remediation action taken — whether it was blurred, hidden, or replaced with a safe placeholder.\n\nAfter generating the output image, provide a comparison summary between input and output, explicitly noting the changes applied to sensitive objects. Finally, evaluate the processed image and state clearly whether it is now compliant for upload, or if further improvements are still needed before sharing on any public or social platform.',
          },
          { type: 'image', value: inputimage },
          { type: 'image', value: outputimage },
        ],
      },
    ]);
    rawOutputText = extractTextFromResponse(response1).trim();
    if (rawBox) rawBox.textContent = JSON.stringify(response1, null, 2);
    document.getElementById('summaryTab').disabled = !rawOutputText;
  } catch (err) {
    console.error(err);
    if (summaryBox) summaryBox.innerText = defaultMessage;
    if (rawBox) rawBox.textContent = defaultMessage;
  }
}

function extractTextFromResponse(response) {
  if (!response) return '';
  if (typeof response === 'string') return response;
  if (Array.isArray(response)) {
    return response.map(extractTextFromResponse).join(' ');
  }
  if (typeof response === 'object') {
    if (typeof response.text === 'string') return response.text;
    if (typeof response.value === 'string') return response.value;
    return Object.values(response).map(extractTextFromResponse).join(' ');
  }
  return '';
}

async function generateSummary() {
  const summaryBox = document.getElementById('summaryBox');
  if (summaryGenerated) return;
  if (!rawOutputText.trim()) return;
  if (summaryBox) summaryBox.innerText = runningMessageSummaryAPI;
  if (typeof Summarizer === 'undefined') {
    console.warn('Summarizer API not available');
    if (summaryBox) summaryBox.innerText = defaultMessage;
    return;
  }
  try {
    const summarizer = await Summarizer.create({ language: 'en' });
    const result = await summarizer.summarize({ text: rawOutputText });
    console.log(result);
    const summaryText = (result && result.summary) || '';
    if (summaryBox) {
      if (summaryText.trim()) {
        summaryBox.innerHTML = markdownToHTML(summaryText);
      } else {
        summaryBox.innerText = defaultMessage;
      }
    }
    summaryGenerated = true;
  } catch (err) {
    console.error(err);
    if (summaryBox) summaryBox.innerText = defaultMessage;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add('active');
      if (btn.dataset.target === 'summaryBox') {
        await generateSummary();
      }
    });
  });
});

