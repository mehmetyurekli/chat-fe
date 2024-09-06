<template>
    <div class="flex">
        <!-- Message from the current user -->
        <div v-if="authStore.id === props.message.from" class="max-w-[50vw] min-w-[10vw] bg-mint p-3 rounded-2xl ml-auto">
            <div class="mb-1">
                <p class="text-white font-semibold text-lg break-words">{{ sender }}</p>
                <p class="text-white break-words">{{ props.message.content }}</p>
            </div>
            <p class="text-right text-sm text-gray-200">{{ formatTime(props.message.sentAt) }}</p>
        </div>

        <!-- Message from others -->
        <div v-else class="max-w-[50vw] min-w-[10vw] bg-lavender p-3 rounded-2xl">
            <div class="mb-1">
                <p class="text-white font-semibold text-lg break-words">{{ sender }}</p>
                <p class="text-white break-words">{{ props.message.content }}</p>
            </div>
            <p class="text-right text-sm text-gray-200">{{ formatTime(props.message.sentAt) }}</p>
        </div>
    </div>
</template>




<script setup>
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chats';
import { computed, ref } from 'vue';

const authStore = useAuthStore();
const chatStore = useChatStore();

const props = defineProps({
    message: {
        type: Object,
        required: true,
    }
})

const sender = computed(() => {
    return chatStore.usernames.get(props.message.from);
})


function formatTime(localDateTime) {
    const date = new Date(localDateTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

</script>