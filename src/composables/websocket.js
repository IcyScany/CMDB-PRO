/**
 * 创建 WebSocket 连接：通过传入的 url 参数创建一个 WebSocket 实例。
 *监听连接打开事件：当连接成功建立时，执行传入的 onOpen 回调函数。
 *
 * 监听消息接收事件：当接收到消息时，将消息解析为 JSON
 * 格式，然后执行传入的 onMessage 回调函数，并将解析后的消息作为参数传递给回调函数。如果未传入 onMessage 回调函数，则禁止重新连接。
 *
 * 监听错误事件：当发生错误时尝试重新连接。
 *
 * 监听连接关闭事件：当连接关闭时，如果不需要重新连接，则关闭WebSocket 连接，否则尝试重新连接。
 *
 * 重新连接：在可以重新连接且未锁定重新连接状态时，延迟 5 秒后重新连接。
 *
 * 发送消息：如果 WebSocket 连接已经打开，则发送消息给服务器；否则打印错误信息。
 * 关闭WebSocket 连接：设置标志位 needReconnect 为 false，然后关闭 WebSocket 连接。
 *
 * **/



export function createWebSocket({connect_url, onOpen, onMessage,onError,onClose}) {
    let baseUrl = window.location.host;
    let url = window.location.protocol === 'https:' ? 'wss://': 'ws://';
    let last_url = `${url}${baseUrl}/${connect_url}`;
    if (!connect_url) {
        return;
    }
    let canReconnect = true;
    // 避免重复连接
    let lockReconnect = false;
    let needReconnect = true;
    let ws = ref(null);
    connect();


    // 网络断开处理
    window.onoffline = () => {
        ws.value?.close(); // 断开之前如果有ws.value需先关闭之前的，以防
        //connect();
        reconnect();
    };

    return {
        ws,
        sendMessage,
        closeWs,
        connect,
    };

    // 连接服务端
    function connect() {
        ws.value = new WebSocket(last_url);
        ws.value.onopen = function () {
            if (onOpen) {
                onOpen();
            }
        };
        ws.value.onmessage = function (msg) {
            if (msg && msg.data) {
                let response = JSON.parse(msg.data);
                if (onMessage) {
                    onMessage(response);
                } else {
                    canReconnect = false;
                }
            }
        };
        ws.value.onerror = function () { // 失败需重连
            reconnect();
            if (onError) {
                onError();
            }
        };
        ws.value.onclose = function () {
            if (!needReconnect) {
                ws.value.close();
            } else {
                reconnect();
            }
            if (onClose) {
                onClose();
            }
        };
    }
    // 重新连接服务端
    function reconnect() {
        ws.value?.close(); // 重连需关闭之前的
        if (!canReconnect || lockReconnect) {
            return;
        }
        console.log("reconnect", "reconnect");
        lockReconnect = true;
        setTimeout(function () {
            connect();
            lockReconnect = false;
        }, 5000);
    }

    // 【暂时：后续还需迭代】发送信息
    function sendMessage(message) {
        if (ws && ws.value.readyState === 1) {
            ws.value.send(message);
        } else {
            console.log("WebSocket is not open");
        }
        console.log("sendMessage", ws.value.readyState,  ws.value);
    }
    function closeWs() {
        needReconnect = false;
        ws.value.close();
    }


}

