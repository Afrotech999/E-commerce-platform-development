import * as React from 'react';

export interface ToasterProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  className?: string;
}

export function Toaster({ position = 'bottom-right', className = '' }: ToasterProps) {
  // This is a placeholder component for toast notifications
  // In a real app, you would use the 'sonner' library
  return null;
}

// Export toast function for showing notifications
export const toast = {
  success: (message: string) => {
    console.log('Success:', message);
  },
  error: (message: string) => {
    console.error('Error:', message);
  },
  info: (message: string) => {
    console.info('Info:', message);
  },
  warning: (message: string) => {
    console.warn('Warning:', message);
  },
};
