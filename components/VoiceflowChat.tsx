'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    voiceflow: any;
  }
}

export function VoiceflowChat() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
    script.type = 'text/javascript';
    
    script.onload = function() {
      window.voiceflow.chat.load({
        verify: { projectID: '682f764bb73d1bcb8047160b' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production',
        voice: {
          url: "https://runtime-api.voiceflow.com"
        }
      });
    };

    const existingScript = document.getElementsByTagName('script')[0];
    existingScript.parentNode?.insertBefore(script, existingScript);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
} 