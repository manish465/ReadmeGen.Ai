import { useEffect } from "react";

interface NotificationProps {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
    message,
    type,
    onClose,
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    return (
        <div className={`notification notification-${type}`}>
            <span>{message}</span>
            <button onClick={onClose} className='notification-close-btn'>
                &times;
            </button>
        </div>
    );
};

export default Notification;
