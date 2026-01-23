import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DigitInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  className?: string;
}

export const DigitInput = ({
  length = 6,
  onComplete,
  onChange,
  className,
}: DigitInputProps) => {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Notify parent of change
    const code = newDigits.join('');
    onChange?.(code);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled
    if (newDigits.every((digit) => digit !== '')) {
      onComplete?.(code);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        onChange?.(newDigits.join(''));
      } else {
        // Clear current input
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
        onChange?.(newDigits.join(''));
      }
    }
    // Handle left arrow
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle right arrow
    else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    const pastedDigits = pastedData.split('').filter((char) => /^\d$/.test(char));

    const newDigits = [...digits];
    pastedDigits.forEach((digit, index) => {
      if (index < length) {
        newDigits[index] = digit;
      }
    });
    setDigits(newDigits);

    const code = newDigits.join('');
    onChange?.(code);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newDigits.findIndex((digit) => digit === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
      if (newDigits.every((digit) => digit !== '')) {
        onComplete?.(code);
      }
    }
  };

  const handleFocus = (index: number) => {
    // Select the content on focus for easier editing
    inputRefs.current[index]?.select();
  };

  const isFilled = digits.every((digit) => digit !== '');

  return (
    <div className={cn('flex gap-2 sm:gap-3', className)}>
      {digits.map((digit, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl',
            'bg-zinc-800 dark:bg-zinc-900 text-white',
            'border-2 transition-all duration-200',
            digit
              ? 'border-blue-600 bg-zinc-700 dark:bg-zinc-800'
              : 'border-zinc-700 dark:border-zinc-800',
            'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
            'hover:border-zinc-600 dark:hover:border-zinc-700'
          )}
        />
      ))}
    </div>
  );
};

export default DigitInput;
