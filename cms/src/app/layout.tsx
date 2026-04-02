import React from 'react'

// The (payload) route group layout provides the full <html>/<body> document
// via Payload's RootLayout, so no document shell is needed here.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
