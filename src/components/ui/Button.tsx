import { TextClassContext, Text } from '@/components/ui/Text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable, ActivityIndicator, View } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-xl',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-[#004CFF] active:bg-[#0040E0]',
          Platform.select({
            web: 'hover:bg-[#0040E0] shadow-[0_2px_8px_rgba(0,76,255,0.25)]',
          })
        ),
        destructive: cn(
          'bg-[#B3261E] active:bg-[#991F19]',
          Platform.select({ web: 'hover:bg-[#991F19]' })
        ),
        danger: cn(
          'bg-[#B3261E] active:bg-[#991F19]',
          Platform.select({ web: 'hover:bg-[#991F19]' })
        ),
        outline: cn(
          'border border-[#E4E7EC] bg-white active:bg-[#F8F9FA]',
          Platform.select({ web: 'hover:bg-[#F8F9FA]' })
        ),
        secondary: cn(
          'bg-[#F0F2F5] active:bg-[#E4E7EC]',
          Platform.select({ web: 'hover:bg-[#E4E7EC]' })
        ),
        ghost: cn(
          'bg-transparent active:bg-[#F0F2F5]',
          Platform.select({ web: 'hover:bg-[#F0F2F5]' })
        ),
        link: 'bg-transparent active:bg-transparent',
        soft: cn(
          'bg-[#EEF2FF] active:bg-[#D4DCFF]',
          Platform.select({ web: 'hover:bg-[#D4DCFF]' })
        ),
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-10 gap-1.5 rounded-lg px-4',
        lg: 'h-14 rounded-xl px-8',
        icon: 'h-12 w-12',
        pill: 'h-12 rounded-full px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  'text-base font-semibold font-["Nunito_600SemiBold"]',
  {
    variants: {
      variant: {
        default: 'text-white',
        destructive: 'text-white',
        danger: 'text-white',
        outline: 'text-[#111322]',
        secondary: 'text-[#111322]',
        ghost: 'text-[#111322]',
        link: 'text-[#004CFF]',
        soft: 'text-[#004CFF]',
      },
      size: {
        default: '',
        sm: 'text-sm',
        lg: 'text-lg',
        icon: '',
        pill: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    title?: string;
    loading?: boolean;
    fullWidth?: boolean;
  };

function Button({ className, variant, size, title, loading, fullWidth, disabled, style: customStyle, ...props }: ButtonProps) {
  const elevationStyle: React.ComponentProps<typeof Pressable>['style'] = Platform.OS !== 'web' && variant === 'default' ? {
    shadowColor: '#004CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  } : undefined;

  const combinedStyle = elevationStyle
    ? (state: any) => {
        const resolved = typeof customStyle === 'function' ? customStyle(state) : customStyle;
        return [elevationStyle, resolved].filter(Boolean);
      }
    : customStyle;
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(
          disabled && 'opacity-50',
          loading && 'opacity-80',
          fullWidth && 'w-full',
          buttonVariants({ variant, size }),
          className
        )}
        role="button"
        disabled={disabled || loading}
        style={combinedStyle}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' || variant === 'ghost' || variant === 'link' || variant === 'secondary' ? '#111322' : '#fff'} size="small" />
        ) : title ? (
          <Text className={cn('font-["Nunito_600SemiBold"]', buttonTextVariants({ variant, size }))}>{title}</Text>
        ) : props.children}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
