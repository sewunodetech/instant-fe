"use client";

import { useCallback, useRef } from "react";
import Script from "next/script";

export default function DocsPage() {
  const ref = useRef<HTMLDivElement>(null);

  const onLoad = useCallback(() => {
    if (ref.current && typeof window !== "undefined" && "SwaggerUIBundle" in window) {
      ref.current.innerHTML = "";
      // @ts-expect-error swagger-ui global
      window.SwaggerUIBundle({
        url: "/api/docs",
        domNode: ref.current,
        presets: [
          // @ts-expect-error swagger-ui global
          window.SwaggerUIBundle.presets.apis,
          // @ts-expect-error swagger-ui global
          window.SwaggerUIBundle.SwaggerUIStandalonePreset,
        ],
        layout: "BaseLayout",
        deepLinking: true,
        filter: true,
      });
    }
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={onLoad}
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Instant.fun API Documentation</h1>
          <p className="text-gray-600 mb-6">
            Interactive API docs powered by Swagger UI. Base URL: <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:3000</code>
          </p>
          <div ref={ref} />
        </div>
      </div>
    </>
  );
}
