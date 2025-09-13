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
