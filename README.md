# TagSense Demo

This repository contains a simple demo for an image privacy pre-processor. The web page in `index.html` lets you choose an image and apply an action (blur, hide, or replace) to reveal the processed result.

## Adding Images

1. Place all input and output images in the [`images/`](images/) folder.
2. The app expects the following naming convention:
   - Input: `security.png`, `privacy.png`, `compliance.png`
   - Output: `<name>_blur.png`, `<name>_hide.png`, `<name>_replace.png`
3. After adding your images, commit and push:
```bash
git add images/
git commit -m "Add privacy demo images"
git push
```

## Running Locally
Open `index.html` in your browser to test the demo locally.

Got it ✅
Here’s the same prompt in a **GitHub-friendly Markdown format** (with proper headings, lists, and spacing). You can copy-paste it directly into your repo `README.md` or any `.md` file:

---
## Objective : Input Prompt
Analyze the given input image to identify any items that may pose **privacy**, **security**, or **compliance** risks.  
Exclude faces from detection and focus strictly on **objects** such as:

- Credit cards or ID cards  
- Laptops or screens displaying sensitive information  
- Documents, papers, or files with visible text  
- Whiteboards containing meeting notes, client details, or other material information  

## Processing Instructions
Use the **Chrome Prompt API** with the local on-device model to generate a processed output image.  

For each identified item:  
- Apply and **document** the remediation action taken — whether it was:
  - **Blurred**  
  - **Hidden**  
  - **Replaced** with a safe placeholder  

## Post-Processing Steps
After generating the output image:  

1. **Comparison Summary**  
   - Provide a summary between **input** and **output**  
   - Explicitly note the changes applied to sensitive objects  

2. **Compliance Evaluation**  
   - State clearly whether the processed image is now **compliant for upload**  
   - Or, identify if **further improvements** are still needed before sharing on any public or social platform  

---
# Example Secruity Risk - Blurr :  Raw Output
Here's an analysis of the provided image, focusing on potential privacy, security, and compliance risks.

## 1. Identified Risks

- **Laptop Screen**  
  The laptop screen displays a spreadsheet with numerous rows and columns of data.  
  This represents sensitive information, including potentially financial or business-related details.  

- **Documents**  
  There are multiple documents visible on the table.  
  One is labeled **"Confidential"** and appears to contain textual information.  
  Another document is partially visible, but its content is unclear.  

## 2. Remediation Actions & Output Image

The **Chrome Prompt API** with the local on-device model was used to process the image.  
The following remediation actions were applied:

- **Laptop Screen**  
  The laptop screen was **blurred**.  
  This obscures the specific data on the screen while maintaining the overall visual context.  

- **Documents**  
  - The **"Confidential"** document was replaced with a **generic placeholder image** (e.g., a blurred document or a generic document icon) to hide the text content.  
  - The remaining documents were **blurred** to obscure their details.  

**Output Image:**  
*(Image of the processed image is unavailable as this is a text-based AI output.)*  

## 3. Comparison Summary (Input vs. Output)

| Feature       | Input Image                                  | Output Image                                                                 |
|---------------|----------------------------------------------|------------------------------------------------------------------------------|
| Laptop Screen | Displays a spreadsheet with detailed data.   | Blurred to obscure the specific data, but the laptop is still recognizable.  |
| Documents     | Multiple visible documents.                  | "Confidential" document replaced with a placeholder; others blurred.         |

The primary changes applied were:  
- **Blurring of the laptop screen**  
- **Replacement of the "Confidential" document's content**  

This effectively reduces the visibility of sensitive information.  

## 4. Image Compliance Evaluation

The processed image appears **compliant for upload** to many public or social platforms.  
The sensitive information (spreadsheet details and confidential document text) has been obscured.  

However, it is **not fully compliant** if the platform has strict data privacy policies or requires a completely transparent image without any blurring.  

**Further improvements could include:**  
- **Redaction:** Specific data points on the blurred spreadsheet could be fully redacted for complete anonymity.  
- **Placeholder Content:** A more visually distinct placeholder for the "Confidential" document could reinforce confidentiality.  

✅ **Conclusion:**  
While the image is significantly improved, a **final review against platform-specific policies** is recommended before upload.

---
# Summarize API Output

## Description
The image contains sensitive data, including a spreadsheet with financial or business information and confidential documents.  

## Remediation
To mitigate privacy risks, the laptop screen and documents were **blurred** to obscure the specific content.  

## Compliance Evaluation
The processed image is **compliant for many public platforms**, but further redaction or more distinct placeholders could improve its compliance with strict data privacy policies.  


