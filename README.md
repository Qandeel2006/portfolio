<div align="center">

# ✦ Qandeel Qudsia · Portfolio ✦

**Turning data into clear, useful stories.**

A soft, claymorphism portfolio for a data science student: dashboards, small experiments and a few surprises.

[![Live site](https://img.shields.io/badge/Live-qandeelqudsiaportfolio.netlify.app-8fc8ed?style=for-the-badge)](https://qandeelqudsiaportfolio.netlify.app)
![HTML5](https://img.shields.io/badge/HTML5-ffb3c7?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-c9a7f5?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ffd23f?style=flat-square&logo=javascript&logoColor=black)
![No frameworks](https://img.shields.io/badge/No_frameworks-8fc8ed?style=flat-square)

[**Visit the site →**](https://qandeelqudsiaportfolio.netlify.app)

</div>

---

## 📖 Contents

[✨ Features](#-features) · [🗺️ Pages](#️-pages) · [🚀 Run it locally](#-run-it-locally) · [📬 Contact form setup](#-contact-form-setup) · [🔍 SEO and analytics](#-seo-and-analytics) · [🎨 Customize](#-customize) · [📁 Project structure](#-project-structure) · [✅ Launch checklist](#-launch-checklist) · [💌 Contact](#-contact)

---

## ✨ Features

| | |
|---|---|
| 🎨 **Look and feel** | Claymorphism design, warm-peach light mode and lavender dark mode (your choice is remembered) |
| 💡 **Theme switch** | Click ✦ and a little stick man walks in and pulls the lamp string |
| 🐾 **Qandi, the screen pet** | Walks along the page, naps when idle, comments on sections, and opens a help panel with a quick FAQ |
| 🌟 **Sparkle cursor** | A star-shaped cursor with a twinkling trail that keeps sparkling when the mouse stops |
| 🧭 **Navigation** | Icon menu with bounce animation, active-section highlight and a scroll progress bar |
| 🃏 **About cards** | A scrollable stack of cards linking to Education, Experience, Toolkit and Certificates |
| 📊 **Projects** | Power BI and Tableau dashboards, an AI hospital-routing project and this site, each with its own story page |
| 🎓 **Certificates** | A gallery with larger previews on click |
| 📨 **Contact form** | Validated, protected by Cloudflare Turnstile, and redirects to a thank-you page |
| ♿ **Accessible** | Semantic HTML, skip link, alt text on images and reduced-motion support |

<details>
<summary><b>🎬 More details</b> (click to open)</summary>

- Cinematic HLS video hero background, with native playback or HLS.js depending on the browser
- Custom favicon and a 404 page that also opens when an internal link or file cannot be found
- Smooth page transitions between pages
- Project story pages with chapter pills, quick questions and a tools explorer
- Sparkles and the screen pet pause for visitors who have reduced motion turned on

</details>

---

## 🗺️ Pages

| Page | What it is |
|---|---|
| `index.html` | Home: hero, About cards, projects, experiments and contact form |
| `about.html` | Education, experience, toolkit, certificates and direction |
| `project-sales.html` | Sales Performance Dashboard (Power BI) |
| `project-hr.html` | HR Analytics Dashboard (Tableau) |
| `project-routing.html` | Smart Emergency Hospital Routing (Python, A*) |
| `project-portfolio.html` | This website |
| `privacy.html` | Privacy policy (linked in every footer) |
| `thank-you.html` | Shown after the contact form is sent |
| `404.html` | Custom "page not found" page |

---

## 🚀 Run it locally

No build step and no installs needed. It's plain HTML, CSS and JavaScript.

```bash
# Option 1: open index.html in your browser
# Option 2: serve the folder
npx serve .
```

> The contact form only sends from a site served over `http(s)`, so test it on the live site.

---

## 📬 Contact form setup

The form is protected by **Cloudflare Turnstile**. A small **Cloudflare Worker** checks the spam token and then forwards the message by email.

```
Visitor ─► Form + Turnstile ─► Cloudflare Worker ─► FormSubmit ─► Your inbox
                                     │
                                     └─► thank-you.html on success
```

<details>
<summary><b>🔧 Step-by-step setup</b> (click to open)</summary>

1. **Turnstile:** in the Cloudflare dashboard open **Turnstile**, add a widget, and set the hostname to your site (for example `qandeelqudsiaportfolio.netlify.app`, with no `https://`). Copy the **Site Key** and **Secret Key**.
2. **Site key:** in `index.html`, put the Site Key in the `data-sitekey` attribute.
3. **Worker:** create a Worker, paste in `worker/contact-worker.js`, and deploy it.
4. **Worker variables:** add `TURNSTILE_SECRET` (as a secret), `CONTACT_EMAIL` and `ALLOWED_ORIGIN` (your full site address, with no trailing slash).
5. **Worker URL:** in `script.js`, put the Worker's URL in `FORM_ENDPOINT`.
6. **FormSubmit:** the first message triggers an activation email. Click the link once, and check spam.

> 🔒 Never put the Secret Key in a file. It belongs only in the Worker's settings.

</details>

---

## 🔍 SEO and analytics

- Every page has its own **meta description**, canonical link and **preview image** (`assets/og-*.jpg`) for link sharing
- All images have descriptive **alt text**
- `sitemap.xml` and `robots.txt` are ready to submit in **Google Search Console**
- **Google Analytics 4** runs on every page, and the thank-you page records a `generate_lead` event for each sent form
- A **privacy policy** explains analytics, the contact form and spam protection

> The `og-*.jpg` images never appear on the pages. They're the picture shown when someone shares a link on WhatsApp, LinkedIn or X.

---

## 🎨 Customize

| I want to change… | Edit |
|---|---|
| Text, links and project details | The matching `.html` file |
| Colors and spacing | The variables at the top of `styles.css` |
| Theme, pet, cursor sparkles and form behaviour | `script.js` |
| Certificates | Replace `assets/c1.jpg` to `c4.jpg` and update the titles in `about.html` |
| Sparkle amount | Search `script.js` for `220` (frequency while the mouse is still) |
| About card box height | Search `styles.css` for `max-height:26rem` |

---

## 📁 Project structure

```text
Portfolio/
├── index.html              # Home
├── about.html              # About page
├── project-*.html          # Four project story pages
├── privacy.html            # Privacy policy
├── thank-you.html          # After the contact form
├── 404.html                # Not-found page
├── styles.css              # Theme, layout, animations
├── script.js               # Interactions, pet, form, sparkles
├── sitemap.xml             # For search engines
├── robots.txt              # Crawl rules
├── worker/
│   └── contact-worker.js   # Cloudflare Worker for the contact form
└── assets/
    ├── favicon.svg         # Browser tab icon
    ├── resume.pdf          # Downloadable resume
    ├── *-dashboard.jpg     # Project previews
    ├── c1–c4.jpg           # Certificates
    └── og-*.jpg            # Link-sharing preview images
```

---

## ✅ Launch checklist

- [ ] Turnstile site key added in `index.html`
- [ ] Worker deployed and its URL set in `script.js`
- [ ] Worker variables set (`TURNSTILE_SECRET`, `CONTACT_EMAIL`, `ALLOWED_ORIGIN`)
- [ ] FormSubmit activation link clicked
- [ ] Real certificates replace `c3.jpg` and `c4.jpg`
- [ ] Site verified in Google Search Console and `sitemap.xml` submitted
- [ ] Google Analytics Realtime shows a visit

---

## 💌 Contact

- 📧 [qandeelqudsia@gmail.com](mailto:qandeelqudsia@gmail.com)
- 💻 [github.com/Qandeel2006](https://github.com/Qandeel2006)
- 💼 [linkedin.com/in/qandeel-qudsia](https://www.linkedin.com/in/qandeel-qudsia)

<div align="center">

*Built with curiosity, one project at a time.* ✦

</div>
