# OVIRON ONE — Hardware admin template

Maroon & royal purple design system (light canvas, black nav).

## Auth flows

**Sign in:** email + password → splash → admin (no OTP).

**Forgot password:** email → OTP screen (demo shows code in “email preview”) → enter `123456` → reset password → sign in.

## Demo accounts

- Shop: `owner@amburpaint.demo`
- Super: `super@oviron.demo`

## Theme tokens

Use Tailwind classes such as `bg-brand-primary`, `bg-brand-secondary`, `bg-nav`, `bg-surface`, `text-charcoal`, `text-muted`, `card-widget`, `data-table`, `btn-primary`, `btn-danger`, `btn-secondary`.

## Run

```bash
npm install
npm run dev
```