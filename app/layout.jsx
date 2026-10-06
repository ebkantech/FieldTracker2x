import './globals.css'
export const metadata = {
  title: 'FieldTracker — Daily Progress',
  description: 'Field operations daily progress capture for OmegaERP',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
