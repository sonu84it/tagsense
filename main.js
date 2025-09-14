let selectedImageBase = "";

function selectImage(imgElement) {
  const thumbnails = document.querySelectorAll('#image-selector img');
  thumbnails.forEach(img => img.classList.remove('selected'));
  imgElement.classList.add('selected');
  document.getElementById('preview').src = imgElement.src;
  document.getElementById('preview').style.display = 'block';
  selectedImageBase = imgElement.src.replace(/^.*\/(.*)\.[^.]+$/, '$1');
  document.getElementById('actionSelect').disabled = false;
  document.getElementById('applyBtn').disabled = false;
  document.getElementById('outputImage').style.display = 'none';
}

function applyAction() {
  const action = document.getElementById('actionSelect').value;
  if (!selectedImageBase) return;
  const outputPath = `images/${selectedImageBase}_${action}.png`;
  const outImg = document.getElementById('outputImage');
  outImg.src = outputPath;
  outImg.style.display = 'block';
  compareImages();
}

async function analyzeImage(imgElement) {
  if (!window.chrome?.ai?.prompt) {
    alert('Prompt API not available');
    return;
  }
  try {
    const blob = await fetch(imgElement.src).then(r => r.blob());
    const result = await chrome.ai.prompt({
      prompt: `Analyze the given image to identify any items that may pose privacy, security, or compliance risks. Exclude faces from detection and focus strictly on objects such as:

Credit cards or ID cards

Laptops or screens displaying sensitive information

Documents, papers, or files with visible text

Whiteboards containing meeting notes, client details, or other material information

For each identified item, suggest appropriate remediation options — blur, hide, or replace — before the image is shared on any public or social platform. The goal is to ensure the image is compliance-safe and free from unintended data exposure. If no such sensitive items are found, clearly state that the image is compliant and the user may proceed with upload.`,
      images: [blob]
    });
    const message = result?.output?.[0]?.content?.[0]?.text || 'No sensitive items found. The image is compliant and may be uploaded.';
    alert(message);
  } catch (err) {
    console.error(err);
    alert('Error analyzing image');
  }
}

async function compareImages() {
  if (typeof LanguageModel === 'undefined') {
    console.warn('LanguageModel API not available');
    return;
  }
  try {
    const session = await LanguageModel.create({
      // { type: 'text' } only required when including expected input languages.
      expectedInputs: [{ type: 'image' }],
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

    console.log(response1);
    const analysisText =
      response1?.output?.[0]?.content?.map((c) => c.text).join('\n') ||
      'No response';
    document.getElementById('analysisResult').textContent = analysisText;

    const audioBlob = await captureMicrophoneInput({ seconds: 10 });
    const response2 = await session.prompt([
      {
        role: 'user',
        content: [
          { type: 'text', value: 'My response to your critique:' },
          { type: 'audio', value: audioBlob },
        ],
      },
    ]);
    console.log(response2);
  } catch (err) {
    console.error(err);
  }
}

async function captureMicrophoneInput({ seconds }) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.start();
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  recorder.stop();
  await new Promise((resolve) => (recorder.onstop = resolve));
  return new Blob(chunks, { type: 'audio/webm' });
}
