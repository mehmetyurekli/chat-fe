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
        const socket = new SockJS("https://firm-retina-435112-j9.uc.r.appspot.com/ws");
        stompClient = Stomp.over(socket);
        stompClient.connect(
          {},
          (frame) => {
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

    notifyNewGroup(chatId){
      sendNotification("GROUP_CREATED", chatId);
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
          this.connect();
        }, 2000); // Retry after 2 seconds
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
  const chatStore = useChatStore();

  if (notification.type === "MSG_RECEIVED") {
    const message = notification.body;

    if (!chatStore.chats.some((chat) => chat.id === message.chatId)) {
      await chatStore.addChat(message.chatId);

      const chat = chatStore.chats.find((chat) => chat.id === message.chatId);

      const userIds = new Set();

      chat.members.forEach((memberId) => {
        userIds.add(memberId);
        var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
        chatStore.colors.set(memberId, randomColor);
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

      const notifyReadDto = {
        chatId: message.chatId,
        messageId: message.id,
        readBy: useAuthStore().id,
      };
      sendNotification("MSG_READ", notifyReadDto);
    }
  } else if (notification.type === "MSG_READ") {
    const readDto = notification.body;

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
  }

  else if(notification.type === "MSG_READ_BULK"){
    const bulkReadDto = notification.body;
    await chatStore.updateChatMessages(bulkReadDto.chatId);
  }

  else if(notification.type === "ADDED_TO_GROUP"){
    
    const chat = notification.body;
    chatStore.chats.push(chat);

    const userIds = new Set();

    chat.members.forEach((memberId) => {
      if(!chatStore.usernames.has(memberId)){
        userIds.add(memberId);
        var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
        chatStore.colors.set(memberId, randomColor);
      }
    });

    const map = await chatStore.fetchUsernames(Array.from(userIds));

    Object.entries(map.data).forEach(([userId, username]) => {
      chatStore.usernames.set(userId, username);
    });
  }
  
}
