import "./globals.css";
import type { Metadata } from "next";

import Footer from "./components/Footer/footer";
import AuthProvider from "./providers/authProvider";
import StoreProvider from "@/app/providers/storeProvider";
import Header from "./components/HeaderNavigationBar/header";
import SideNavBar from "./components/SideNavigationBar/SideNavBar";
import BottomNavBar from "./components/BottomNavigationBar/BottomNavBar";
import DisableInteractions from "./lib/utils/DisableInteractions";

export const metadata: Metadata = {
  title: "ROOM RENTAL",
  description: "TO RENT ROOM",
  keywords: ["rent", "room", "accommodation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AuthProvider>
            {/* <DisableInteractions /> */}
            <Header />
            {/* <SideNavBar /> */}
            {children}
            <Footer />
            <BottomNavBar />
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
