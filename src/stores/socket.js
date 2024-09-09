import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import { useChatStore } from "./chats";
import Stomp from "webstomp-client";
import SockJS from "sockjs-client/dist/sockjs";

let stompClient;

export const useSocketStore = defineStore("socket", {
  state: () => ({
    connected: false,
  }),
  actions: {
    async connect() {
      const authStore = useAuthStore();
      authStore.loadId();
      const userId = authStore.id;

      if (!userId) {
        console.error("Auth failed! Login first!");
        return;
      }

      try {
        const socket = new SockJS("http://localhost:8080/ws");
        stompClient = Stomp.over(socket);
        stompClient.connect(
          {},
          (frame) => {
            console.log("Connected: " + frame);

            stompClient.subscribe("/queue/" + userId, (notification) => {
              handleMessage(JSON.parse(notification.body));
            });

            this.connected = true;
          },
          (error) => {
            console.log(error);

            this.connected = false;
          }
        );

        stompClient.onDisconnect = () => {
          this.connected = false;
        };
      } catch (error) {
        console.error("Connection error: ", error);
        this.retryConnection();
      }
    },

    sendMessage(createMessage) {
      sendNotification("MSG_SENT", createMessage);
    },

    updateBulkMessage(notifyBulkReadDto){
      sendNotification("MSG_READ_BULK", notifyBulkReadDto);
    },

    disconnect() {
      if (stompClient) {
        stompClient.disconnect(() => {
          console.log("Disconnected");
          this.connected = false;
        });
      }
    },

    isConnected() {
      return this.connected;
    },

    retryConnection() {
      if (!this.connected) {
        setTimeout(() => {
          console.log("Retrying WebSocket connection...");
          connect();
        }, 5000); // Retry after 5 seconds
      }
    },
  },
});

async function sendNotification(type, data) {
  const notification = {
    type: type,
    body: data,
  };
  stompClient.send("/app/sendNotification", JSON.stringify(notification));
}

async function handleMessage(notification) {
  console.log("handle");
  console.log(notification);

  const chatStore = useChatStore();

  if (notification.type === "MSG_RECEIVED") {
    const message = notification.body;

    if (!chatStore.chats.some((chat) => chat.id === message.chatId)) {
      await chatStore.addChat(message.chatId);

      const chat = chatStore.chats.find((chat) => chat.id === message.chatId);

      const userIds = new Set();

      chat.members.forEach((memberId) => {
        userIds.add(memberId);
      });

      const map = await chatStore.fetchUsernames(Array.from(userIds));

      Object.entries(map.data).forEach(([userId, username]) => {
        chatStore.usernames.set(userId, username);
      });
    }

    chatStore.addMessage(message);

    if (
      chatStore.selectedChatId === message.chatId &&
      message.from !== useAuthStore().id
    ) {
      console.log("okudum");

      const notifyReadDto = {
        chatId: message.chatId,
        messageId: message.id,
        readBy: useAuthStore().id,
      };
      sendNotification("MSG_READ", notifyReadDto);
    }
  } else if (notification.type === "MSG_READ") {
    const readDto = notification.body;
    console.log(readDto);

    const existingMessages = chatStore.messages.get(readDto.chatId);

    if (existingMessages) {
      const msg = existingMessages.find(
        (message) => message.id === readDto.messageId
      );

      if (msg) {
        if (!msg.readAt) {
          msg.readAt = { ...msg.readAt };
        }

        // Update the readAt field reactively
        msg.readAt = { ...msg.readAt, [readDto.readBy]: readDto.readAt };
      }
    }

    console.log(chatStore.messages);
  }

  else if(notification.type === "MSG_READ_BULK"){
    const bulkReadDto = notification.body;
    console.log(bulkReadDto);
    await chatStore.updateChatMessages(bulkReadDto.chatId);
  }
  
}
