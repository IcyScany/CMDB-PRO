import { notification } from 'ant-design-vue';

const opsNoticeModal = ({type ='success', message, description }, args = {}) => {
    notification[type]({
        message,
        description,
        duration: 2,
        ...args
    });
};

export default opsNoticeModal;
