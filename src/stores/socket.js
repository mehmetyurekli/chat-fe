import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import { useChatStore } from "./chats";
import Stomp from "webstomp-client";
import SockJS from 'sockjs-client/dist/sockjs'

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
        stompClient.connect({}, (frame) => {
          console.log("Connected: " + frame);
    
          stompClient.subscribe("/queue/" + userId, (message) => {
            handleMessage(JSON.parse(message.body));
          });
    
          this.connected = true;
        },
        error => {
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

    sendMessage(createMessage){
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
            console.log('Retrying WebSocket connection...');
            connect();
          }, 5000); // Retry after 5 seconds
        }
      }
  },
});


function handleMessage(message) {
  const chatStore = useChatStore();

  chatStore.addMessage(message);
}


