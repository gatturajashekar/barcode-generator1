type LotusLogoProps = {
  className?: string;
  size?: number;
};

export default function LotusLogo({ className = '', size = 40 }: LotusLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path d="M32 6c-1.8 4.2-1.8 8.4 0 12.6 1.8-4.2 1.8-8.4 0-12.6Z" fill="currentColor" opacity="0.85" />
      <path d="M32 58c-1.8-4.2-1.8-8.4 0-12.6 1.8 4.2 1.8 8.4 0 12.6Z" fill="currentColor" opacity="0.75" />
      <path d="M14 18c3.6 2.6 5.6 6.4 6 11.2-4.2-1.4-7.2-4.4-8.4-9 .8-.8 1.6-1.6 2.4-2.2Z" fill="currentColor" opacity="0.8" />
      <path d="M50 18c-3.6 2.6-5.6 6.4-6 11.2 4.2-1.4 7.2-4.4 8.4-9-.8-.8-1.6-1.6-2.4-2.2Z" fill="currentColor" opacity="0.8" />
      <path d="M6 38c4.4-1.2 8.6-.4 12.4 2.2-3.8 2.2-8.4 2.4-13 .6.2-1 .3-1.9.6-2.8Z" fill="currentColor" opacity="0.75" />
      <path d="M58 38c-4.4-1.2-8.6-.4-12.4 2.2 3.8 2.2 8.4 2.4 13 .6-.2-1-.3-1.9-.6-2.8Z" fill="currentColor" opacity="0.75" />
      <path d="M32 18c-3 5-4.5 10.5-4.5 16 0 2.2.3 4.3.9 6.3 1.2-2 2.4-4 3.6-6 1.2 2 2.4 4 3.6 6 .6-2 .9-4.1.9-6.3 0-5.5-1.5-11-4.5-16Z" fill="currentColor" />
      <path d="M18 30c-1.5 4-1.8 8-.9 12 .9 4 3 7.4 6.3 10.2 2-3.6 4.6-6.6 7.6-9-3-2.2-6-4-9.3-5.4-1.5-.6-2.7-1.6-3.7-2.8Z" fill="currentColor" opacity="0.82" />
      <path d="M46 30c1.5 4 1.8 8 .9 12-.9 4-3 7.4-6.3 10.2-2-3.6-4.6-6.6-7.6-9 3-2.2 6-4 9.3-5.4 1.5-.6 2.7-1.6 3.7-2.8Z" fill="currentColor" opacity="0.82" />
      <circle cx="32" cy="34" r="3.2" fill="currentColor" />
    </svg>
  );
}
