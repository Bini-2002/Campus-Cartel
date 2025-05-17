"use client"

import { useEffect } from "react"

export default function VoiceflowChat() {
  useEffect(() => {
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.onload = () => {
      if (window.voiceflow) {
        window.voiceflow.chat.load({
          verify: { projectID: "682f764bb73d1bcb8047160b" },
          url: "https://general-runtime.voiceflow.com",
          versionID: "production",
          voice: {
            url: "https://runtime-api.voiceflow.com",
          },
        })
      }
    }
    script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"
    document.head.appendChild(script)

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return null
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    voiceflow: any
  }
}
