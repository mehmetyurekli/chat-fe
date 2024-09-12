<template class="flex">
    <div class="flex flex-col min-h-screen w-full bg-peach">
        <div class="flex bg-mauve p-5 space-x-3 items-center">
            <h2 class="flex-5 grow text-2xl font-bold bg-yellow-500 text-black text-left truncate">{{ username }}</h2>

            <div class="flex">
                <button @click="showMessageModal = true" class="flex-1 pi pi-comment text-2xl"></button>
                <span
                    class="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 hidden group-hover:inline-block bg-gray-700 text-white text-sm rounded px-2 py-1 text-center">
                    Send a message
                </span>
            </div>

            <div class="flex">
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
                <h3 class="text-xl mb-2">Start a Chat</h3>
                <input v-model="createChatUsername" @keyup.enter="startChat(createChatUsername)" type="text"
                    placeholder="Enter username"
                    class="w-full p-3 border border-gray-300 rounded-lg mb-3 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button @click="startChat(createChatUsername)"
                    class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                    Start a Chat
                </button>
            </div>
        </Modal>

        <!-- Create a Group Modal -->
        <Modal v-model:isVisible="showCreateGroupModal">
            <div class="p-4">
                <h3 class="text-xl mb-3">Create a Chat</h3>
                <input v-model="groupChatName" type="text" placeholder="Enter group name"
                    class="w-full p-3 border border-gray-300 rounded-lg mb-3 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />

                <p class="text-gray-600 mb-2">Enter a username</p>
                <div class="flex mb-3">
                    <input v-model="usernameInputForGroup" @keyup.enter="addNewUser(usernameInputForGroup)" type="text"
                        placeholder="Enter username"
                        class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 mr-2" />
                    <button @click="addNewUser(usernameInputForGroup)"
                        class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                        Add
                    </button>
                </div>

                <p class="text-gray-600 mb-2">Select from existing users</p>
                <div class="flex mb-3">
                    <select v-model="dropdownSelectedUsername"
                        class="w-full p-3 border border-gray-300 rounded-lg text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 mr-2">
                        <option value="" disabled>Select a username</option>
                        <option v-for="([userId, username], index) in filteredUsernames" :key="index"
                            :value="[userId, username]">
                            {{ username }}
                        </option>
                    </select>
                    <button @click="addExisting(dropdownSelectedUsername)"
                        class="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                        Add
                    </button>
                </div>

                <div class="h-48 overflow-y-auto mb-3">
                    <ul class="list-disc">
                        <li v-for="[userId, username] in usersSelectedForGroup" :key="userId"
                            class="mb-2 bg-gray-100 p-3 rounded-lg flex justify-between items-center text-gray-800 shadow-sm">
                            {{ username }}
                            <button @click="removeUsername(userId)"
                                class="bg-red-500 text-white py-1 px-3 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                                Remove
                            </button>
                        </li>
                    </ul>
                </div>

                <button @click="startGroupChat"
                    class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                    Create Chat
                </button>
            </div>
        </Modal>

    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useChatStore } from '@/stores/chats';
import ChatListing from './ChatListing.vue';
import { useAuthStore } from '@/stores/auth';
import Modal from './Modal.vue';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const chatStore = useChatStore();
const emit = defineEmits(['selected']);
const toast = useToast();

const showMessageModal = ref(false);
const createChatUsername = ref('');

const showCreateGroupModal = ref(false);
const groupChatName = ref('');
const usersSelectedForGroup = ref(new Map()); // userId-username
const usernameInputForGroup = ref(''); //username -> will check if user exists.
const dropdownSelectedUsername = ref([]);

const addExisting = ([userId, username]) => {
    if (userId && username) {
        usersSelectedForGroup.value.set(userId, username);
    }
};

const addNewUser = async (username) => {

    const userId = await chatStore.findByUsername(username);
    if (!userId) {
        toast.error("User not found!");
    }
    else {
        if (userId === authStore.id) {
            toast.error("You will be added to group by default!");
            return;
        }
        else if (usersSelectedForGroup.value.get(userId)) {
            toast.error("User is already added!");
        }
        usersSelectedForGroup.value.set(userId, username);
    }

}

const startGroupChat = async () => {
    
    if (!groupChatName.value || groupChatName.value === '') {
        toast.error("You must enter a group name!");
        return;
    }

    if (usersSelectedForGroup.value.size < 2) {
        toast.error("You must add at least 2 people to your group!");
        return;
    }

    const createChatDto = {
        name: groupChatName.value,
        members: Array.from(usersSelectedForGroup.value.keys()),
        chatType: "GROUP",
        createdBy: authStore.id
    }

    const chat = await chatStore.createGroupChat(createChatDto);
    toast.success("Group created successfully.");
    chatStore.setSelectedChatId(chat.id);
    showCreateGroupModal.value = false;
}

const removeUsername = (userId) => {
    usersSelectedForGroup.value.delete(userId);
}

const filteredUsernames = computed(() => {
    const filteredEntries = Array.from(chatStore.usernames).filter(([userId]) => {
        return !usersSelectedForGroup.value.has(userId);
    });

    return new Map(filteredEntries);
});

onMounted(async () => {
    await chatStore.initChats();

});

const username = computed(() => {
    return chatStore.usernames.get(authStore.id);
});

const chats = computed(() => chatStore.chats.filter(chat => {
    const chatMessages = chatStore.messages.get(chat.id);
    return (chatMessages && chatMessages.length > 0) || chat.chatType === 'GROUP';

}));

const sortedChats = computed(() => {
    return chats.value.slice().sort((a, b) => {
        const messagesA = chatStore.messages.get(a.id) || [];
        const messagesB = chatStore.messages.get(b.id) || [];
        const lastMessageA = messagesA[0] || { sentAt: a.createdAt };
        const lastMessageB = messagesB[0] || { sentAt: b.createdAt };

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