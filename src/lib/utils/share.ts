// Web Share API utility functions
// Handles AbortError gracefully when user cancels share

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Share content using Web Share API with fallback to clipboard
 * @param data - Share data object
 * @param onSuccess - Callback when share is successful
 * @param onError - Callback when share fails (excluding user cancellation)
 * @returns Promise<boolean> - true if shared successfully, false otherwise
 */
export async function shareContent(
  data: ShareData,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> {
  try {
    // Check if Web Share API is supported
    if (navigator.share) {
      await navigator.share(data);
      onSuccess?.();
      return true;
    } else {
      // Fallback: copy URL to clipboard
      const shareText = data.url || data.text || '';
      if (shareText) {
        await navigator.clipboard.writeText(shareText);
        console.log('Content copied to clipboard');
        onSuccess?.();
        return true;
      } else {
        throw new Error('No content to share');
      }
    }
  } catch (error) {
    // Handle AbortError (user cancelled share) silently
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Share cancelled by user');
      return false;
    }
    
    // Handle other errors
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error('Failed to share:', err);
    onError?.(err);
    return false;
  }
}

/**
 * Check if Web Share API is supported
 */
export function isShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Share a post with proper error handling
 */
export async function sharePost(
  postId: string,
  content: string,
  authorName: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> {
  const shareData: ShareData = {
    title: `Post by ${authorName}`,
    text: content,
    url: `${window.location.origin}/post/${postId}`,
  };

  return shareContent(shareData, onSuccess, onError);
}

/**
 * Share a URL with proper error handling
 */
export async function shareUrl(
  url: string,
  title?: string,
  text?: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<boolean> {
  const shareData: ShareData = {
    title,
    text,
    url,
  };

  return shareContent(shareData, onSuccess, onError);
}
