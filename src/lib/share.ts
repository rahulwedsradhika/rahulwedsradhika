/**
 * Cross-platform WhatsApp sharing and clipboard helpers with toast notification.
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

export function getWhatsAppShareUrl(message: string, url?: string): string {
  const fullText = url ? `${message} ${url}` : message;
  return `https://wa.me/?text=${encodeURIComponent(fullText)}`;
}

export async function shareViaWebShareApi(data: {
  title: string;
  text: string;
  url?: string;
  files?: File[];
}): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (data.files && navigator.canShare && navigator.canShare({ files: data.files })) {
        await navigator.share(data);
        return true;
      }
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return true;
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'AbortError') {
        return false;
      }
    }
  }
  return false;
}
