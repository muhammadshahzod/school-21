import AuthProvider from "@/components/AuthProvider";
import { DemoProvider } from "@/components/DemoProvider";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <DemoProvider>
        <Header />
        <main id="main-content">{children}</main>
        <BottomNav />
      </DemoProvider>
    </AuthProvider>
  );
}
