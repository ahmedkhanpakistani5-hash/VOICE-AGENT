import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'NEXUS AI Operating System',
  description: 'A futuristic JARVIS-style personal AI agent with natural voice conversation, multi-step planning, tool orchestration, and cognitive memory.',
  openGraph: {
    title: 'NEXUS AI Operating System',
    description: 'A futuristic JARVIS-style personal AI agent with natural voice conversation, multi-step planning, tool orchestration, and cognitive memory.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXUS AI Operating System',
    description: 'A futuristic JARVIS-style personal AI agent with natural voice conversation, multi-step planning, tool orchestration, and cognitive memory.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
