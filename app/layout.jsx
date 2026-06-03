import './globals.css';

export const metadata = {
  title: 'Simulasi HIV — Model SIRD Stokastik',
  description: 'Simulasi interaktif penyebaran HIV menggunakan model SIRD stokastik dengan efek ART.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
