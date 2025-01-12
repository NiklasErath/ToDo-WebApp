import { useMediaQuery } from 'react-responsive';

// This function will check and return the device type
export const getDevice = () => {
    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1223px)' });

    return { isDesktopOrLaptop, isTabletOrMobile };
};