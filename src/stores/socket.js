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

            stompClient.subscribe("/queue/" + userId, (message) => {
              handleMessage(JSON.parse(message.body));
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
      stompClient.send("/app/sendMessage", JSON.stringify(createMessage));
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

async function handleMessage(message) {
  const chatStore = useChatStore();

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
}
