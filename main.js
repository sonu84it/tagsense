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
