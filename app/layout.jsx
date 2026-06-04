import './globals.css';

export const metadata = {
  title: 'HIV Spread Simulation — Stochastic SIRD Model',
  description: 'Interactive HIV spread simulation using a stochastic SIRD model with ART and prevention effects.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
