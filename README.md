# Instagram Post Carousel Generator

A static, no-build web tool that generates an Instagram post/reel carousel from Instagram URLs or IDs.

## What it does

- Accepts Instagram post URLs, reel URLs, `p:POST_ID`, `reel:REEL_ID`, or bare IDs.
- Removes duplicate post/reel entries.
- Generates a responsive carousel using standard CSS and JavaScript.
- Does not require Slick.js or another carousel library.
- Includes a live preview area and a copy-code button.

## Project structure

```text
instagram-post-carousel-generator/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── demo-output.html
├── README.md
└── .gitignore
```

## How to run locally

Because Instagram embeds are loaded from Instagram's embed script, the preview is most reliable when served from a local server or a live URL.

From the project folder, you can run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How to use

1. Open the generator page.
2. Paste one Instagram post or reel URL per line.
3. Click **Generate Carousel Code**.
4. Click **Update Preview** to test the output.
5. Click **Copy Code** and paste the generated carousel code where it needs to be used.

## Demo URLs included

The **Load Demo URLs** button adds these demo items:

```text
https://www.instagram.com/ford/reel/DZ7nrziALx6/?hl=en
https://www.instagram.com/fordtrucks/p/DZ3fT3oFfW6/
https://www.instagram.com/zacbrownband/reel/DZvdHTlyqY-/
https://www.instagram.com/fordmustang/p/DZuuMLdkc3a/
https://www.instagram.com/ford/reel/DZtLcbkAXcg/?hl=en
https://www.instagram.com/fordmustang/p/DZgNWPmDw5r/
```

## Design notes

The generator page uses a simple neutral color palette with basic blue and dark gray accents. The generated carousel code also uses neutral arrow button colors so it does not output Instagram brand colors.

## GitHub Pages setup

1. Create a new GitHub repository.
2. Upload all files from this project folder.
3. Go to **Settings > Pages**.
4. Set the source to the `main` branch and root folder.
5. Save and wait for GitHub Pages to publish the site.

## Notes

- The final generated carousel uses Instagram's official embed script: `https://www.instagram.com/embed.js`.
- Private, deleted, restricted, or unavailable Instagram posts may not render.
- Instagram embeds can take a few seconds to fully load.
- This project is designed as a static front-end tool and does not need Node, npm, or a build process.
