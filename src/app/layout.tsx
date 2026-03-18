import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Prototype Playground",
  description: "자연어로 B2B SaaS 기능을 프로토타이핑하는 시험장",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-surface-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  P
                </div>
                <h1 className="text-lg font-semibold text-gray-900">
                  SaaS Prototype Playground
                </h1>
              </div>
              <nav className="flex items-center gap-4 text-sm">
                <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  시험장
                </a>
                <a href="/history" className="text-gray-600 hover:text-gray-900 transition-colors">
                  실험 이력
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
