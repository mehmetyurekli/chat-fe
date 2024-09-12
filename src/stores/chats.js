import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import axios from "axios";
import { useSocketStore } from "./socket";

var authStore = null;

export const useChatStore = defineStore("chats", {
  state: () => ({
    chats: [],
    messages: new Map(), // chatId - message array map
    usernames: new Map(), // userId - username map
    selectedChatId: "", // current chat id
    colors: new Map() //userid-color map
  }),
  actions: {
    async initChats() {
      authStore = useAuthStore();
      authStore.loadId();
      const userId = authStore.id;
      if (!userId) {
        console.error("Auth failed! Login first!");
        return;
      }

      try {
        const response = await axios.get(`/root/api/chats/memberId/${userId}`);
      
        this.chats = response.data; //sets the chats.
        const userIds = new Set();
        console.log("chats loaded");
        

        await Promise.all(
          this.chats.map(async (chat) => {
            chat.members.forEach((memberId) => {
              userIds.add(memberId); //get all unique user id's in every chat.
              var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
              this.colors.set(memberId, randomColor);
            });
            console.log("userIds added.");
            

            // get last 30 messages for every group
            const messages = await this.fetchMessages(chat.id, 0, 30);
            this.messages.set(chat.id, messages.data.content);
            console.log("messages set");
            
          })
        );

        // get usernames for user ids
        const usernames = await this.fetchUsernames(Array.from(userIds));
        const currentUsername = await this.fetchUsername(authStore.id);
        this.usernames = new Map(Object.entries(usernames.data));
        this.usernames.set(authStore.id, currentUsername.data);
        console.log("usernames setted");
        console.log(this.messages);
        console.log(this.usernames);
        
        
        
        
        
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    },

    async fetchMessages(groupId, page, size) {
      try {
        const response = await axios.get(
          `/root/api/messages/chat/${groupId}?page=${page}&size=${size}`
        );
        return response;
      } catch (error) {
        console.error(`Failed to fetch messages for chat ${groupId}:`, error);
        return { data: [] };
      }
    },

    async fetchUsernames(ids) {
      try {
        const idsString = ids.join(",");
        const response = await axios.get(
          `/root/api/users/getUsernames?ids=${encodeURIComponent(idsString)}`
        );
        return response;
      } catch (error) {
        console.error("Failed to fetch usernames:", error);
        return {};
      }
    },

    async fetchUsername(id){
      const response = await axios.get(
        `/root/api/users/getUsername?id=${id}`
      );
      return response;
    },

    addMessage(newMessage) {
      const chatId = newMessage.chatId;
      if (this.messages.has(chatId)) {
        let chatMessages = this.messages.get(chatId);

        chatMessages.unshift(newMessage);
        if (chatMessages.length > 30) {
          chatMessages.pop(); // remove the oldest message
        }

        this.messages.set(chatId, chatMessages);
      } else {
        this.messages.set(chatId, [newMessage]);
      }
    },
    setSelectedChatId(chatId) {
      this.selectedChatId = chatId;
    },

    async addChat(chatId){
      const response = await axios.get(`/root/api/chats/${chatId}`);
      this.chats.push(response.data);
      return response.data;
    },

    async updateChatMessages(chatId) {
      const newMessages = await this.fetchMessages(chatId, 0, 30);
      this.messages.set(chatId, newMessages.data.content);
    },

    async findByUsername(username) {
      try{
        const response = await axios.post(
          `/root/api/users/findByUsername?username=${username}`
        ); 
        
        this.usernames.set(response.data.id, username);
        return response.data.id;
      }
      catch(e){
        console.log(e);
        
      }
    },

    async createPrivateChat(userId) {
      const response = await axios.post("/root/api/chats", {
        members: [userId], 
        chatType: "PRIVATE", 
        createdBy: authStore.id,
      });

      await this.initChats();

      return response.data;
    },

    async createGroupChat(createChatDto){
      const response = await axios.post("/root/api/chats", createChatDto);

      useSocketStore().notifyNewGroup(response.data.id);
      
      return response.data;
    },

    clear(){
      this.chats = []
      this.messages = new Map()
      this.usernames = new Map()
      this.selectedChatId = ''
    }
  },
});
