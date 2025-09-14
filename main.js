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

async function applyAction() {
  const action = document.getElementById('actionSelect').value;
  if (!selectedImageBase) return;
  const outputPath = `images/${selectedImageBase}_${action}.png`;
  const outImg = document.getElementById('outputImage');
  outImg.src = outputPath;
  outImg.style.display = 'block';
  const analysisBox = document.getElementById('analysisResult');
  analysisBox.style.display = 'block';
  analysisBox.value = '';
  const summaryHeading = document.getElementById('summaryHeading');
  if (summaryHeading) summaryHeading.style.display = 'block';
  await compareImages();
}

async function compareImages() {
  if (typeof LanguageModel === 'undefined' || !LanguageModel.create) {
    console.warn('LanguageModel API not available');
    return;
  }
  try {
    const session = await LanguageModel.create({
      model: 'models/gemini-1.5-flash',
      expectedInputs: [{ type: 'image' }],
      outputLanguage: 'en',
    });

    const inputBlob = await (await fetch(document.getElementById('preview').src)).blob();
    const outputBlob = await (await fetch(document.getElementById('outputImage').src)).blob();

    const inputFile = new File([inputBlob], 'input.png', { type: inputBlob.type || 'image/png' });
    const outputFile = new File([outputBlob], 'output.png', { type: outputBlob.type || 'image/png' });

    const analysisBox = document.getElementById('analysisResult');
    const stream = await session.promptStreaming([
      {
        role: 'user',
        content: [
          {
            type: 'text',
            value:
              'Analyze the given input image to identify any items that may pose privacy, security, or compliance risks. Exclude faces from detection and focus strictly on objects such as:\n\nCredit cards or ID cards\n\nLaptops or screens displaying sensitive information\n\nDocuments, papers, or files with visible text\n\nWhiteboards containing meeting notes, client details, or other material information\n\nUse the Chrome Prompt API with the local on-device model to generate a processed output image. For each identified item, apply and document the remediation action taken — whether it was blurred, hidden, or replaced with a safe placeholder.\n\nAfter generating the output image, provide a comparison summary between input and output, explicitly noting the changes applied to sensitive objects. Finally, evaluate the processed image and state clearly whether it is now compliant for upload, or if further improvements are still needed before sharing on any public or social platform.',
          },
          { type: 'image', value: inputFile },
          { type: 'image', value: outputFile },
        ],
      },
    ]);

    for await (const chunk of stream) {
      for (const part of chunk.output[0].content) {
        if (part.type === 'text') {
          analysisBox.value += part.text;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function demoPrompt() {
  if (typeof LanguageModel === 'undefined' || !LanguageModel.create) {
    console.warn('LanguageModel API not available');
    return;
  }
  try {
    const session = await LanguageModel.create({
      model: 'models/gemini-1.5-flash',
    });
    const stream = await session.promptStreaming('Hello from TagSense!');
    let text = '';
    for await (const chunk of stream) {
      for (const part of chunk.output[0].content) {
        if (part.type === 'text') {
          text += part.text;
        }
      }
    }
    console.log(text);
  } catch (err) {
    console.error(err);
  }
}

demoPrompt();
