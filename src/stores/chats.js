import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import axios from "axios";

var authStore = null;

export const useChatStore = defineStore("chats", {
  state: () => ({
    chats: [], // Chat objects
    messages: new Map(), // Mapping chat IDs with arrays of messages
    usernames: new Map(), // Map to store userids-usernames
    selectedChatId: ''
  }),
  actions: {
    async initChats() {
      authStore = useAuthStore(); // Use store within the action
      authStore.loadId();
      const userId = authStore.id; // Get the user ID from the auth store
      if (!userId) {
        console.error("Auth failed! Login first!");
        return;
      }

      try {
        const response = await axios.get(`/root/api/chats/memberId/${userId}`);

        this.chats = response.data; //sets the chats.
        const userIds = new Set();

        await Promise.all(
          this.chats.map(async (chat) => {
            chat.members.forEach((memberId) => {
              userIds.add(memberId);
            });

            // Fetch and store messages for this group
            const messages = await this.fetchMessages(chat.id, 0, 30); // Adjust pagination parameters as needed
            this.messages.set(chat.id, messages.data.content); // Store messages (accessing response data)
          })
        );

        // Fetch and store usernames
        const usernames = await this.fetchUsernames(Array.from(userIds));

        this.usernames = new Map(Object.entries(usernames.data)); // Update state with fetched usernames
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    },

    async fetchMessages(groupId, page, size) {
      try {
        const response = await axios.get(
          `/root/api/messages/chat/${groupId}?page=${page}&size=${size}`
        );
        return response; // Return the Axios response object
      } catch (error) {
        console.error(`Failed to fetch messages for chat ${groupId}:`, error);
        return { data: [] }; // Return an empty array in case of error
      }
    },

    async fetchUsernames(ids) {
      try {
        const idsString = ids.join(",");
        const response = await axios.get(
          `/root/api/users/getUsernames?ids=${encodeURIComponent(idsString)}`
        );
        return response; // Return the Axios response object
      } catch (error) {
        console.error("Failed to fetch usernames:", error);
        return {}; // Return an empty object in case of error
      }
    },

    addMessage(newMessage) {
      const chatId = newMessage.chatId;
      if (this.messages.has(chatId)) {
        let chatMessages = this.messages.get(chatId);

        chatMessages.unshift(newMessage);
        if (chatMessages.length >= 30) {
          chatMessages.pop(); // remove the oldest message
        }

        this.messages.set(chatId, chatMessages);
      } else {
        this.messages.set(chatId, [newMessage]); // If the chatId doesn't exist, create a new array with the new message
      }
    },
    setSelectedChatId(chatId){
      this.selectedChatId = chatId;
    },

    async updateChatMessages(chatId){
      const newMessages = await this.fetchMessages(chatId, 0, 30); // Adjust pagination parameters as needed
      this.messages.set(chatId, newMessages.data.content); 
    }
  },
});
