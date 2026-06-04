# HIV Spread Simulation: A Stochastic SIRD Modeling Approach

An interactive web-based simulation application for modeling HIV transmission using a stochastic SIRD (Susceptible-Infected-Recovered-Deceased) compartmental model with the effect of Antiretroviral Therapy (ART).

---

## SIRD Model

### Differential Equations

```
dS/dt = -betaeff * S * I / N
dI/dt = betaeff * S * I / N - gammaeff * I - delta * I
dR/dt = gammaeff * I
dD/dt = delta * I
```

### ART (Antiretroviral Therapy) Effect

```
betaeff  = beta  * (1 - art_coverage * 0.7)
gammaeff = gamma * (1 + art_coverage * 2.5)
```

### Basic Reproduction Number

```
R0 = betaeff / (gammaeff + delta)
```

- If R0 < 1 -> outbreak is controlled; the disease will naturally disappear
- If R0 > 1 -> outbreak is spreading; intervention is required

### Stochastic Process (Gillespie Approximation)

Each time step uses a Gaussian approximation of the Gillespie algorithm:

```
deltaX ~ round(rate + sqrt(rate) * Z),  Z ~ N(0,1)
```

---

## Installation & Running

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
hiv-simulation/
├── app/
│   ├── layout.jsx            # Root layout
│   ├── page.jsx              # Main page + tab navigation
│   └── globals.css           # Global styles
├── components/
│   ├── ControlSlider.jsx     # Interactive parameter sliders
│   ├── LineChart.jsx         # S/I/R/D line chart (Chart.js)
│   ├── MetricCard.jsx        # Per-compartment metric cards
│   ├── PopulationCanvas.jsx  # Animated population visualization
│   └── SensitivityPanel.jsx  # R0 sensitivity analysis panel
├── hooks/
│   └── useSimulation.js      # State management + rAF animation loop
└── lib/
    └── simulation.js         # Stochastic SIRD simulation engine
```

---

## Key Features

- **Simulation Tab**: Control 6 parameters (beta, gamma, delta, N, I0, ART coverage), real-time dynamic chart, metric cards, speed control, and insight box
- **Population Tab**: Real-time animated emoji visualization of 400 individuals proportionally representing each compartment
- **Sensitivity Tab**: R0 banner with plain-language explanation, parameter bar charts, and peak infection summary

---

## References

1. Anderson, R.M. & May, R.M. (1991). *Infectious Diseases of Humans: Dynamics and Control*. Oxford University Press.
2. Gillespie, D.T. (1977). Exact stochastic simulation of coupled chemical reactions. *Journal of Physical Chemistry*, 81(25), 2340-2361.
3. UNAIDS (2023). Global HIV & AIDS statistics — Fact sheet. https://www.unaids.org/en/resources/fact-sheet

---

## Group Members

Course: Stochastic Modeling — Universitas Gadjah Mada

| No | Name | Student ID | Role |
|----|------|------------|------|
| 1  | Akhnaf Fawzan Yogatrisna | 24/536720/TK/59561 | Leader |
| 2  | Akmal Rafli Fauzan | 24/533033/TK/59053 | Member |
| 3  | Altaf Parves Shua Ilham | 24/536741/TK/59565 | Member |
