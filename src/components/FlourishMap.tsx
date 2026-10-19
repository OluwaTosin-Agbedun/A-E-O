import React, { useEffect, useRef } from 'react';

interface FlourishMapProps {
  id?: string;
  className?: string;
  title?: string;
}

export const FlourishMap: React.FC<FlourishMapProps> = ({
  id = '30596006',
  className = '',
  title = 'AEO Democratic Competitiveness Map'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Prevent duplicate iframes inside this container
    if (el.querySelector('iframe')) return;

    const loadFlourishEmbed = () => {
      const win = window as any;
      if (win.Flourish && typeof win.Flourish.loadEmbed === 'function') {
        win.Flourish.loadEmbed(el);
      } else if (win.Flourish && typeof win.Flourish.load === 'function') {
        win.Flourish.load();
      }
    };

    let script = document.querySelector('script[src="https://public.flourish.studio/resources/embed.js"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://public.flourish.studio/resources/embed.js';
      script.async = true;
      script.onload = () => {
        loadFlourishEmbed();
      };
      document.body.appendChild(script);
    } else {
      // Script is already in the document
      loadFlourishEmbed();
    }
  }, [id]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div
        ref={containerRef}
        className="flourish-embed flourish-map w-full"
        data-src={`visualisation/${id}`}
        style={{ minHeight: '650px' }}
      >
        <noscript>
          <img
            src={`https://public.flourish.studio/visualisation/${id}/thumbnail`}
            width="100%"
            alt={title}
          />
        </noscript>
      </div>
    </div>
  );
};

export default FlourishMap;
