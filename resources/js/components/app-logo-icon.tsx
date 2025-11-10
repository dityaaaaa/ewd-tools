import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, src, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...rest}
            src={src ?? '/logo-ieb.png'}
            alt={alt ?? 'Logo'}
            loading="lazy"
            decoding="async"
            className={`object-contain ${className || ''}`}
        />
    );
}
