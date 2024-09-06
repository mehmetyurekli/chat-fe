<template>
    <div class="flex flex-col bg-mauve rounded-xl p-10">
        <p class="text-3xl text-left text-white pb-5">Login</p>
        <form @submit.prevent="onSubmit()" class="flex flex-col">
            <div class="flex flex-col justify-center">
                <label for="userId" class="mb-2 text-white">User ID</label>
                <input v-model="userId" class="p-0.5 rounded-md" required="true">
            </div>
            <button class="mt-5 bg-cyan rounded-md text-white">LOGIN</button>
        </form>
    </div>
</template>

<script setup>
import { useToast } from 'vue-toastification';
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useChatStore } from '@/stores/chats';
import axios from 'axios';
import { useRouter } from 'vue-router';

const authStore = useAuthStore()
const chatStore = useChatStore()


const userId = ref('')

const toast = useToast();
const router = useRouter();

const onSubmit = async () => {
    if (!userId.value) {
        toast.error("UserId cannot be null!");
        return;
    }
    if (userId.value.length !== 24) {
        toast.error("Enter a valid user id!")
        return;
    }

    try {
        const response = await axios.get(`/root/api/users/${userId.value}`)
        if (response.data === null) {
            toast.error("There was an unexpected error!");
            console.log(response);
        }
        authStore.setId(response.data.id);

        await chatStore.initChats();

        console.log(chatStore.usernames);
        

        router.push('/');

    }
    catch (e) {
        toast.error("Invalid ID!")
        console.log(e);
    }
    finally {
        userId.value = '';
    }
}
</script>