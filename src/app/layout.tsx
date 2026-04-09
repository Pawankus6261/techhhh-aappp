import './globals.css';
export const metadata = { title: 'Tech Escape Room 2K26' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#02050f] min-h-screen flex flex-col">
        <div className="scanline"></div>
        {children}
      </body>
    </html>
  );
}