<template class="flex">
    <div class="flex flex-col min-h-screen w-full bg-peach">
        <div class="flex bg-mauve p-5 space-x-3 items-center">
            <h2 class="flex-5 text-2xl font-bold bg-yellow-500 text-black text-left">{{ username }}</h2>

            <div class="relative group flex items-center">
                <button @click="showMessageModal = true" class="flex-1 pi pi-comment text-2xl"></button>
                <span
                    class="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 hidden group-hover:inline-block bg-gray-700 text-white text-sm rounded px-2 py-1 text-center">
                    Send a message
                </span>
            </div>

            <div class="relative group flex items-center">
                <button @click="showCreateGroupModal = true" class="flex-1 pi pi-plus text-2xl"></button>
                <span
                    class="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 hidden group-hover:inline-block bg-gray-700 text-white text-sm rounded px-2 py-1 text-center">
                    Create a group
                </span>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-2">
            <ChatListing class="hover:bg-mauve/15" @click="handleClick(chat.id)" v-for="chat in sortedChats"
                :key="chat.id" :chatId="chat.id" />
        </div>

        <!-- Send a Message Modal -->
        <Modal v-model:isVisible="showMessageModal">
            <div class="p-4">
                <h3 class="text-xl mb-2">Send a Message</h3>
                <input v-model="userId" @keyup.enter="startChat(userId)" type="text" placeholder="Enter username"
                    class="w-full p-2 border border-gray-300 rounded mb-2" />
                <button @click="startChat(userId)" class="w-full bg-green-500 text-white py-2 rounded">
                    Start a Chat
                </button>
            </div>
        </Modal>

        <!-- Create a Group Modal -->
        <Modal v-model:isVisible="showCreateGroupModal">
            <div>
                <!-- Content for Create a Group -->
                <h3 class="text-xl">Create a Group</h3>
                <!-- Your form or content goes here -->
            </div>
        </Modal>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useChatStore } from '@/stores/chats'; // Adjust the import path as needed
import ChatListing from './ChatListing.vue'; // Import your ChatListing component
import { useAuthStore } from '@/stores/auth';
import Modal from './Modal.vue'; // Import the modal component
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const chatStore = useChatStore();
const emit = defineEmits(['selected']);
const toast = useToast();

const showMessageModal = ref(false);
const showCreateGroupModal = ref(false);
const userId = ref('');

onMounted(async () => {
    await chatStore.initChats();
});

const username = computed(() => chatStore.usernames.get(authStore.id));

const chats = computed(() => chatStore.chats.filter(chat => {
    const chatMessages = chatStore.messages.get(chat.id);
    return (chatMessages && chatMessages.length > 0) || chat.chatType === 'GROUP';
}));

const sortedChats = computed(() => {
    return chats.value.slice().sort((a, b) => {
        const messagesA = chatStore.messages.get(a.id) || [];
        const messagesB = chatStore.messages.get(b.id) || [];
        const lastMessageA = messagesA[0] || {};
        const lastMessageB = messagesB[0] || {};

        const dateA = new Date(lastMessageA.sentAt);
        const dateB = new Date(lastMessageB.sentAt);

        return dateB - dateA;
    });
});

const handleClick = (chatId) => {
    emit("selected", chatId);
}

const startChat = async (input) => {
    const userId = await chatStore.findByUsername(input);

    if (!userId) {
        toast.error("User not found!");
    }
    else {
        if (userId === authStore.id) {
            toast.error("You can't message to yourself.");
        }
        const chat = await chatStore.createPrivateChat(userId);
        chatStore.setSelectedChatId(chat.id);
        showMessageModal.value = false;
    }
}
</script>