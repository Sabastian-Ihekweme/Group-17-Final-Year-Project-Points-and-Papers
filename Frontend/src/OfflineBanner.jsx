import { useOnlineStatus } from './useOnlineStatus';

function OfflineBanner() {
    const isOnline = useOnlineStatus();

    if (isOnline) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: '#ef4444',
            color: 'black',
            textAlign: 'center',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '500',
        }}>
            No internet connection. Please check your network and try again.
        </div>
    );
}

export default OfflineBanner;