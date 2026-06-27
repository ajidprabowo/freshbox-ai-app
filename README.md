# FreshBox AI App 📦❄️

FreshBox AI is a modular, AI-powered cold box rental application designed to reduce food loss and optimize thermal energy waste in agricultural storage and distribution networks.

Designed as a modern full-stack MVP, the application allows smallholders, farmers, and distributors to rent insulated high-efficiency FreshBox containers, register harvested agricultural loads, retrieve precise AI-driven microclimate configurations, monitor active containers in real-time, compute invoices, and export comprehensive supply chain compliance audit reports.

---

## 🚀 Key Features

1. **System Monitor**: A central dashboard showcasing live performance indicators, including Available Containers, Active Rented Units, Protected Volumes, Compliance Scores, and an immersive, real-time Sustainability Offset ledger.
2. **FreshBox Container Fleet**: A detailed list of available container sizes (S, M, L) with current location tracking, sanitization states, battery levels, and intuitive, click-to-rent hooks.
3. **Interactive Booking Engine**: Form to assign and lease box units to specific routes (Warehouse static storage vs. Logistics distribution fleets).
4. **Harvest Product Registration & Gemini AI Recomendations**: A crop registration console that leverages the Gemini API to retrieve expert scientific configurations (Temperature, Humidity, Airflow, and Spoilage Risk) with automatic, rule-based fallback logic.
5. **AI Box Recommendation**: An interactive logistics planner that computes optimal container sizes (S, M, L) and quantities, maps spatial cargo density (color-coded Green/Yellow/Red indicators), and pre-fills the lease agreement directly from the recommended suggestion card.
6. **Product Photo Upload & AI Vision Diagnostics**: A secure crop image-processing terminal. Automatically compresses raw crop images client-side via canvas, transmits them to the server-side Gemini 3.5 Vision API, and outputs structured freshness grades, ripeness states, mechanical bruising risk signs, and handling tips visible in both audit details and print sheets.
7. **IoT Sensor Telemetry Simulator**: Simulated live sensor arrays updating temperature, humidity, battery discharge rates, and warning parameters in 5-second intervals.
8. **Rental Cost Estimator**: A live, side-by-side invoice sheet calculator that computes base rental rates, fleet transport fees, sanitization surcharges, energy usage costs, and late penalties.
9. **Quality Audit Reports**: A supply-chain compliance reporting portal designed to export thermal metrics, biological waste-reduction audits, and registered harvest quality photo logs.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animation**: [Motion / Motion-React](https://motion.dev/)
- **AI Integration**: [@google/genai TypeScript SDK](https://github.com/google/generative-ai-js)
- **Data Persistence**: Client-side storage via `localStorage` with automated state hydration.

---

## 🔒 Environment Variables

Ensure your `.env` contains the required credentials:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-3.5-flash
```

*Note: If `GEMINI_API_KEY` is missing or invalid, the server-side API route automatically utilizes the built-in rule-based expert recommendation engine.*

---

## 📦 Installation & Local Development

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   *The application will boot on port 3000.*

3. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🌿 Sustainability Impact Assumptions

- **CO2e Avoided**: Multiplier of 2.5 kgCO2e saved per Kilogram of food waste prevented (based on IPCC food-waste emissions estimates).
- **Economic Value Prevented**: Estimated flat recovery of Rp20,000 per Kg of agricultural crops protected.
- **Energy Saved**: Evaluated flat energy savings of 1.2 kWh per operating hour of localized modular compartment grids vs. standard, inefficient full-trailer thermal cooling layouts.
