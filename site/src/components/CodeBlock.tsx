import { useState } from 'react';

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-block">
      <pre><code>{code}</code></pre>
      <button onClick={handleCopy} title="Copy to clipboard">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
