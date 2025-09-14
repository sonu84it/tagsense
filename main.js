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
  document.getElementById('summaryHeading').style.display = 'none';
  document.getElementById('analysisResult').style.display = 'none';
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
  if (typeof LanguageModel === 'undefined') {
    console.warn('LanguageModel API not available');
    return;
  }
  try {
    const session = await LanguageModel.create({
      // { type: 'text' } only required when including expected input languages.
      expectedInputs: [{ type: 'image' }],
      outputLanguage: 'en',
    });

    const inputimage = await (await fetch(document.getElementById('preview').src)).blob();
    const outputimage = await (await fetch(document.getElementById('outputImage').src)).blob();

    const responseStream1 = await session.promptStreaming([
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
    for await (const c of responseStream1) document.getElementById("analysisResult").value += "\n" + JSON.stringify(c,null,2);
  } catch (err) {
    console.error(err);
  }
}
