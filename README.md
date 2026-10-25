# Hemanth Varma Kanumuri — Portfolio

A static site: `index.html`, `css/styles.css` and `js/main.js`. There's no build step or framework.

## Run it locally

```bash
python -m http.server 5500
```

Then open http://localhost:5500.

## Add your images and résumé

Every image slot shows a labelled placeholder until a file exists at its path. Drop files in with these exact names. JPG is fine, and around 1600px wide or smaller keeps the page fast.

| Where | File |
| --- | --- |
| Résumé (PDF) | `assets/Hemanth_Varma_Kanumuri_Resume.pdf` (in) |
| Résumé preview image | `assets/images/resume-preview.png` (in, page 1 of the PDF) |
| Your photo (square) | `assets/images/profile.jpg` (in) |
| Achievements | All in: `legalassist.webp`, `ethical-hacking.jpg`, `genai-iith.jpg`, `python-assessment.jpg` |
| Internships | `assets/images/internships/gamuverse-1.jpg` (in). Other internships are text only. |
| Hobbies | All in: `pillhaven.webp`, `bulkman.webp`, `hearthelp.webp` |

Certificate slots use `ph--doc`, which shows the whole page uncropped. Add that class to any `<figure>` holding a scanned document.

To drop a photo slot from an internship, delete its `<figure>` in `index.html`.

## Deploy

- **Vercel:** import the folder or repo. The framework preset is "Other", with no build command.
- **GitHub Pages:** push to a repo, then go to Settings → Pages and deploy from the `main` branch root.

## What's interactive

- A game-engine boot screen that plays on every page load. Any key, click or tap skips it, and it never plays for reduced-motion users. Edit `BOOT_LINES` in `js/main.js` to change the log lines.
- A sticky nav that highlights the current section, and a gold progress bar showing how far down the page you are.
- Keys `1`–`8` jump to a section, and `R` goes to the résumé.
- Project cards switch the details panel. The filter chips and the ← → keys work too.
- Achievement cards light up as they scroll into view.
- Buttons to copy your email and download the résumé, each with a confirmation message.
- One hidden easter egg.
