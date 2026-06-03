# Simulasi Penyebaran HIV — Model SIRD Stokastik

Aplikasi simulasi interaktif berbasis web untuk memodelkan penyebaran HIV menggunakan model SIRD (Susceptible-Infected-Recovered-Deceased) stokastik dengan efek terapi antiretroviral (ART).

---

## Model SIRD

### Persamaan Diferensial

```
dS/dt = -betaeff * S * I / N
dI/dt = betaeff * S * I / N - gammaeff * I - delta * I
dR/dt = gammaeff * I
dD/dt = delta * I
```

### Efek ART (Antiretroviral Therapy)

```
betaeff  = beta  * (1 - cakupan_ART * 0.7)
gammaeff = gamma * (1 + cakupan_ART * 2.5)
```

### Bilangan Reproduksi Dasar

```
R0 = betaeff / (gammaeff + delta)
```

- Jika R0 < 1 -> wabah terkendali, penyakit akan hilang secara alami
- Jika R0 > 1 -> wabah menyebar, intervensi diperlukan

### Proses Stokastik (Aproksimasi Gillespie)

Setiap langkah waktu menggunakan aproksimasi Gaussian dari proses Gillespie:

```
deltaX ~ round(rate + sqrt(rate) * Z),  Z ~ N(0,1)
```

---

## Instalasi & Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000 di browser.

### Build Produksi

```bash
npm run build
npm start
```

---

## Struktur Proyek

```
hiv-simulation/
├── app/
│   ├── layout.jsx            # Root layout
│   ├── page.jsx              # Halaman utama + tab navigation
│   └── globals.css           # Global styles
├── components/
│   ├── ControlSlider.jsx     # Slider parameter interaktif
│   ├── LineChart.jsx         # Grafik garis S/I/R/D (Chart.js)
│   ├── MetricCard.jsx        # Kartu metrik per kompartemen
│   ├── PopulationCanvas.jsx  # Visualisasi partikel populasi
│   └── SensitivityPanel.jsx  # Panel analisis sensitivitas R0
├── hooks/
│   └── useSimulation.js      # State management + rAF animation loop
└── lib/
    └── simulation.js         # Engine simulasi SIRD stokastik
```

---

## Fitur Utama

- **Tab Simulasi**: Kontrol 6 parameter, grafik dinamis real-time, kartu metrik, dan kotak wawasan
- **Tab Populasi**: Visualisasi 400 titik bergerak yang mewakili individu secara proporsional
- **Tab Sensitivitas**: Banner R0 dengan penjelasan, grafik batang parameter, dan ringkasan puncak infeksi

---

## Referensi

1. Anderson, R.M. & May, R.M. (1991). Infectious Diseases of Humans: Dynamics and Control. Oxford University Press.
2. Gillespie, D.T. (1977). Exact stochastic simulation of coupled chemical reactions. Journal of Physical Chemistry, 81(25), 2340-2361.
3. UNAIDS (2023). Global HIV & AIDS statistics — Fact sheet. https://www.unaids.org/en/resources/fact-sheet

---

## Anggota Kelompok

Mata Kuliah: Pemodelan Stokastik — Universitas Gadjah Mada

| No | Nama             | NIM   |
|----|------------------|-------|
| 1  | [Nama Anggota 1] | [NIM] |
| 2  | [Nama Anggota 2] | [NIM] |
| 3  | [Nama Anggota 3] | [NIM] |
