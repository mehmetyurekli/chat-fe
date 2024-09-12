<template>
    <div class="flex">
        <!-- Message from the current user -->
        <div v-if="authStore.id === props.message.from"
            class="max-w-[50vw] min-w-[10vw] bg-mint p-3 rounded-2xl ml-auto">
            <div class="mb-1">
                <p class="text-white font-semibold text-lg break-words">{{ sender }}</p>
                <p class="text-white break-words">{{ props.message.content }}</p>
            </div>
            <div class="flex flex-row justify-end">
                <p class="text-right text-sm text-gray-200">{{ formatTime(props.message.sentAt) }}</p>
            </div>
        </div>

        <!-- Message from others -->
        <div v-else class="max-w-[50vw] min-w-[10vw] p-3 rounded-2xl" :style="{
            backgroundColor: color }">
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
import { computed } from 'vue';
import moment from 'moment-timezone';

const authStore = useAuthStore();
const chatStore = useChatStore();

const props = defineProps({
    message: {
        type: Object,
        required: true,
    }
})

const color = computed(() => {
  const message = props.message;
  if (message) {
    const chat = chatStore.chats.find(chat => chat.id === message.chatId)
    if (chat && chat.chatType === 'PRIVATE') {
      return '#AE9AC6'; // Color for private chats
    } else {
      return chatStore.colors.get(message.from);
    }
  }
  return '#FFFFFF'; // Default color if message is not available
});


const sender = computed(() => {
    return chatStore.usernames.get(props.message.from);
})

function formatTime(localDateTime) {
    const localTimezone = moment.tz.guess();
    const formattedDate = moment.utc(localDateTime).tz(localTimezone).format('HH:mm');
    return formattedDate;
}

</script>
