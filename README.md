# Arooj Saleem — AI/ML Portfolio

A personal portfolio showcasing my background as a Software Engineering student, my interests in Artificial Intelligence and Machine Learning, selected projects, technical skills, and professional experience.

**Portfolio:** [View Live Portfolio](https://arooj-portfolio-jet.vercel.app/)

## About the Project

This portfolio is designed to present my technical work and learning journey in AI/ML and software engineering through a clean, responsive interface.

## Features

- Personal introduction and professional profile
- Technical skills organized by category
- Selected projects with relevant links
- Profile image and downloadable résumé
- Contact options, including email and WhatsApp
- Responsive layout for desktop and mobile screens
- Animations and interactive UI elements

## Tech Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **UI:** React
- **Styling:** CSS
- **Animations:** Motion for React
- **Contact integration:** EmailJS

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/) and npm.

### Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/AroojSaleem-995/Arooj-Portfolio.git
cd Arooj-Portfolio
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command         | Purpose                       |
| --------------- | ----------------------------- |
| `npm run dev`   | Starts the development server |
| `npm run build` | Creates a production build    |
| `npm run start` | Runs the production server    |
| `npm run lint`  | Checks code with ESLint       |

## Project Structure

```text
Arooj-Portfolio/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── avatar.png
│   └── resume.pdf
├── package.json
├── package-lock.json
├── next.config.ts
└── README.md
```

## Environment Variables

The project uses a local `.env.local` file for any required private configuration.

- Never commit `.env.local` or expose API keys and private credentials.
- If the contact form requires EmailJS credentials, configure the necessary variables in your local environment and in your deployment platform.
- Only expose values in client-side code when they are explicitly intended to be public.

## Production Build

Verify the project before deployment:

```bash
npm run build
```

## Deployment

This project is intended to be deployed on [Vercel](https://vercel.com/).

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Confirm that Vercel detects Next.js.
4. Configure any required environment variables.
5. Deploy and test the live website.

For details, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contact

- **LinkedIn:** [Arooj Saleem](https://www.linkedin.com/in/arooj-saleem/)
- **GitHub:** [AroojSaleem-995](https://github.com/AroojSaleem-995)

For other contact options, please visit the portfolio.

---

Built with Next.js and TypeScript.
