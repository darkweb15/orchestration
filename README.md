# Agentic Scraper - Login Page

A modern, responsive login page for the Agentic Scraper platform, built with Next.js, React, and Tailwind CSS.

## Features

- **Two-column responsive layout** - Hero section on the left, login form on the right
- **Dual authentication modes** - Email/password and API key login options
- **Hero section** - Eye-catching branding with features, statistics, and value proposition
- **Login form with tabs** - Switch between Email and API Key authentication methods
- **Social authentication buttons** - Google, GitHub, and Microsoft integration ready
- **Modern UI components** - Clean, professional design with purple color scheme
- **Password visibility toggle** - Eye icon to show/hide password
- **Remember me checkbox** - User preference persistence
- **Forgot password link** - Password recovery option
- **Enterprise security section** - Trust badges and compliance information
- **Mobile responsive** - Graceful fallback for smaller screens

## Tech Stack

- **Framework**: Next.js 15
- **UI**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── LoginPage.tsx       # Main login page container
│   ├── HeroSection.tsx     # Left side hero section
│   ├── LoginForm.tsx       # Right side login form
│   └── SocialButtons.tsx   # Social authentication buttons
```

## Customization

### Colors

Update the color scheme in `tailwind.config.js` and `src/app/globals.css`:

```js
colors: {
  primary: '#6B4FD4',           // Purple
  'primary-light': '#7C5FE8',
  background: '#F5F3FF',        // Light purple background
  'card-bg': '#FFFFFF',
  text: '#1F2937',
  'text-light': '#6B7280',
}
```

### Features (Hero Section)

Edit the `features` array in `HeroSection.tsx` to customize the feature cards displayed on the left.

### Statistics

Update the `stats` array in `HeroSection.tsx` to change the metrics displayed at the bottom of the hero section.

## Next Steps

To integrate this login page with your backend:

1. Connect a database for user management (Neon, Supabase, etc.)
2. Implement authentication logic (Better Auth, Auth.js, etc.)
3. Update the `handleSubmit` function in `LoginForm.tsx` to call your API
4. Implement social authentication integrations
5. Add password recovery flow
6. Set up form validation

## License

MIT
