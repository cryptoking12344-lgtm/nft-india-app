# NFT INDIA — Demo App (Android)

India-first digital collectibles marketplace — demo APK of the MVP described in the case study.

**Demo only:** OTP, UPI payments and blockchain delivery are simulated. No real money is charged.

## Get the APK
Every push to `main` builds the app via GitHub Actions:
- **Releases → "NFT India demo (latest build)"** → download `NFT-India-demo.apk`, or
- **Actions → latest run → Artifacts → NFT-India-demo-apk**

Install on any Android 7+ phone (allow "Install unknown apps").

## Demo flow
Splash (animated) → Onboarding → Mobile number → OTP (**123456**, or tap *Auto-fill*) → Profile & interests →
Home / Explore / Search → Collection → NFT detail (attributes, provenance, blockchain details) →
Checkout (UPI) → Approve/Decline → Processing → Success → My Collection → Order history / Notifications.

**Owned collectibles** can be **Sold** (fixed price), **Auctioned** (2-min demo auction with live bids) or **Gifted** by mobile number. Sale earnings (after 2.5% platform fee + 5% creator royalty) show in My Wallet and can be withdrawn via UPI.

**Light / Dark / Auto theme** — toggle at the top of the side menu or in Settings → Appearance.

**Demo resets on close** — all data lives in memory, so every fresh launch starts from the splash screen (theme choice is kept).
Settings → **Simulate delayed delivery** shows the "payment succeeded, delivery pending" flow.

## Structure
- `app/src/main/assets/www/` — the app UI (HTML/CSS/JS, no build step). Open `index.html` in Chrome (mobile view) to preview.
- `app/src/main/java/com/nftindia/app/MainActivity.java` — WebView shell + native bridge (share, haptics, status bar, back button).
- `.github/workflows/build.yml` — builds debug + release APKs.
