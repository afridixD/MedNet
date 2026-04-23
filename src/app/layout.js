import { Manrope, Poppins } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ['200', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['200', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata = {
  title: "Medical System",
  description: "CSE370 Project",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn-uicons.flaticon.com/2.1.0/uicons-regular-rounded/css/uicons-regular-rounded.css" 
        />
      </head>
      <body className={`${manrope.variable} ${poppins.variable} font-sans`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
