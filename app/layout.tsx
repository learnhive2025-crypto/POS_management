import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Sidebar from "./components/Sidebar";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "20px" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
