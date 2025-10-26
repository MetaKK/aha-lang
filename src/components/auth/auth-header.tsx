'use client';

import { memo } from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export const AuthHeader = memo<AuthHeaderProps>(({ title, subtitle }) => {
  return (
    <div className="font-bold mb-6 text-center leading-tight max-w-sm flex flex-col items-center">
      <div className="flex flex-col text-left w-80">
        <h1 className="font-semibold text-xl leading-6 m-0 text-balance text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
});

AuthHeader.displayName = 'AuthHeader';
