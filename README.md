# billing-dashboard# SRS-Premium Billing System 🧾✨

An elegant, client-side dynamic invoice generation system and billing dashboard designed for retail, wholesale, and multi-sector distribution management. Engineered specifically for operations dealing across multiple core product ranges (Wellness, Skincare, Personalcare, Oralcare, and Homecare).

---

## 🚀 Key Functional Modules

### 1. Real-Time Invoice View Mirror
*   **Dual-Panel Workspace:** A split configuration offering an intuitive **Control Panel** on the left and a live, pixel-perfect **A4-Formatted Print Sheet Mirror** on the right. 
*   **Reactive Data Mapping:** Modifying client details, invoice IDs, or payment options immediately broadcasts updates over to the live render document dynamically.

### 2. Line Item Queue Architecture
*   **Structured Schema Compounding:** Easily append entries with fields for product sector category, specific product titles, quantities, unit prices, and custom percentage-based discount logic.
*   **State Tracking Metrics:** Built-in dynamic item counters (`queue-count-badge`) and toggleable placeholder empty-states to track row indexes visually.
*   **Live Math Ledger:** Automatic item computations processing values:
    $$\text{Item Amount} = (\text{Rate} \times \text{Qty}) \times \left(1 - \frac{\text{Discount \%}}{100}\right)$$

### 3. Transaction Summary & Savings Engine
*   **Dynamic Savings Alert Box:** Automatically reveals a distinct discount scheme badge highlighting exactly how much money was saved across applied item promotions.
*   **Financial Aggregation Block:** Breaks down financial totals dynamically across Subtotals, Accumulative Deductions, and final Grand Totals.

### 4. Enterprise-Ready Utility Actions
*   **Native Engine UI Theme Shifting:** Built with an optimized data-attribute theme switcher (`data-theme="light"`) to toggle styling contexts smoothly.
*   **Print Layout Formatting:** Seamless execution matching native A4 CSS print guidelines via `window.print()` wrappers to hide dashboard controls and isolate only the Tax Invoice sheet.

---

## 🛠️ Tech Stack & Dependencies

*   **View Layer Engine:** Semantic HTML5 Template Architecture
*   **Styling Architecture:** Modern CSS3 Custom Variables (CSS Variables), Flexbox, and CSS Grid Frameworks.
*   **Icon Elements:** FontAwesome v6.4.0 CDN core glyphs.
*   **Typography:** Google Web Fonts Integration (`Outfit` for dashboard interfaces, `JetBrains Mono` for precise accounting tables).
*   **Logic Pipeline:** Vanilla ECMAScript 6+ DOM event observers and transactional dataset rendering (`app.js`).

---

## 📂 Project Blueprint

```text
├── index.html       # Structural View Layers, Input Nodes & Invoice Layout Sheet
├── style.css        # Theme Variables, Split-Screen Layout & CSS Media Print Rules
└── app.js           # Arithmetic Controllers, Row State Mutations & DOM Sync Handlers
