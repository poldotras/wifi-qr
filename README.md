# 📶 WiFi Cards — Printable WiFi QR Card Generator

**🌐 Live demo: [wifi-qr.poldotras.com](https://wifi-qr.poldotras.com)**

Generate printable cards with your WiFi network credentials and a QR code that connects devices just by scanning it with the phone camera. Everything runs **100% in the browser**: passwords never leave your machine.

Perfect for guest rooms, offices, cafés, classrooms, events — or just to stop spelling out your password letter by letter.

## ✨ Features

- **Unlimited cards**: add as many networks as you want.
- **Standard WiFi QR format** (`WIFI:T:...;S:...;P:...;;`): natively supported by the iOS and Android camera apps, no extra apps needed.
- **Supported encryption**: WPA / WPA2 / WPA3, WEP, and open networks.
- **Hidden networks**: option to flag the SSID as hidden (`H:true`).
- **Proper escaping** of special characters (`\` `;` `,` `"` `:`) in the QR payload.
- **Print**: dedicated print stylesheet with cards laid out in 2 columns and dashed cut-out borders. You can also save them as PDF from the print dialog.
- **Download as PNG**: each card individually or all at once, in high resolution (3x).
- **No backend, no accounts, no tracking**: a single HTML file.

## 🚀 Usage

Use it directly at **[wifi-qr.poldotras.com](https://wifi-qr.poldotras.com)**, or run it yourself — nothing to install or build:

1. Download `tarjetas-wifi.html` (or clone the repo).
2. Open it in any modern browser.
3. Fill in SSID, encryption and password → **Add card**.
4. Print or download your cards.

> **Note:** the two dependencies (QR generation and PNG export) are loaded from a CDN, so you need an internet connection the first time the page loads. The data you enter is never sent anywhere.

You can also serve it statically (GitHub Pages, Nginx, `python -m http.server`...) with zero configuration.

## 🔒 Privacy

- All processing (form, QR, PNG) happens client-side.
- No network requests with your data: no analytics, no cookies, no remote storage.
- Cards live in memory only: reloading the page clears them. This is deliberate — passwords are never persisted in the browser.

## 🛠️ Tech

| Component | Purpose |
|---|---|
| Vanilla HTML + CSS + JavaScript | The whole app, no frameworks |
| [qrcodejs](https://github.com/davidshimjs/qrcodejs) | QR code generation |
| [html2canvas](https://github.com/niklasvh/html2canvas) | Exporting cards to PNG |

## 📄 QR format

Cards use the standard WiFi network configuration QR format:

```
WIFI:T:<WPA|WEP|nopass>;S:<ssid>;P:<password>;H:true;;
```

- `T`: encryption type (`WPA` covers WPA/WPA2/WPA3, `nopass` for open networks).
- `S`: SSID.
- `P`: password (omitted for open networks).
- `H:true`: only present for hidden networks.

## 🤝 Contributing

Issues and pull requests are welcome. Some pending ideas:

- [ ] Optional `localStorage` persistence (with a security warning)
- [ ] Export/import the network list as JSON
- [ ] Dark mode
- [ ] Internationalization (ES/CA/...)

## 📜 License

MIT — use it, modify it and share it freely.
