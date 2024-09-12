<h1>Chat Application Frontend</h1>

<h2>Tech Stack:</h2>
<ul>
  <li>Vue.js</li>
  <li>Pinia (State Management)</li>
  <li>WebSockets</li>
  <li>Tailwind CSS</li>
  <li>Netlify (Deployment)</li>
</ul>

<h2>Project Overview:</h2>
<p>
  This is the frontend for a real-time chat application built with Vue.js. It leverages WebSockets to provide instant messaging between users and offers a user-friendly interface for managing chats, group conversations, and messages.
</p>
<p>
  This project was my first experience in frontend development. As a backend developer, I wanted to explore the frontend side to better understand how everything works together. I'm happy with the result, even though the ui/ux is crappy.
</p>

<h2>Features:</h2>

<h3>WebSocket-based Instant Messaging:</h3>
<ul>
  <li>Users receive real-time messages via WebSockets.</li>
  <li>Notifications, such as new messages, message reads, and group chat creation, are handled through the WebSocket connection.</li>
</ul>

<h3>Group Chat and Direct Messaging:</h3>
<ul>
  <li>Users can create group chats, send messages to new users, or continue conversations in existing chats.</li>
</ul>

<h3>Message Pagination and Caching:</h3>
<ul>
  <li>Upon login, all chats and the last 30 messages of each chat are fetched and cached.</li>
  <li><strong>Infinite Scroll:</strong> When scrolling up, older messages are fetched from the backend through API requests and are paginated. After exiting a chat, old messages are removed from the cache except for the last 30 one.</li>
</ul>

<h3>Day Separator for Messages:</h3>
<ul>
  <li>A date separator is displayed in the chat when the date changes, helping users track when messages were sent across different days.</li>
</ul>

<h3>Dynamic Username Fetching:</h3>
<ul>
  <li>On login, the frontend fetches all usernames associated with user IDs in the current user’s chats and caches them.</li>
  <li>When a message is received from an unknown user, their username is fetched dynamically and added to the cache.</li>
</ul>

<h3>State Management with Pinia:</h3>
<ul>
  <li>Pinia is used for managing application state, including chat data, usernames, and message updates.</li>
  <li>When new messages arrive, the oldest message in the chat is removed from the cache, and the new message is added.</li>
</ul>

<h3>Message Read Status:</h3>
<ul>
  <li>Each message contains a map of read statuses (&lt;userId, timestamp&gt;), allowing users to track when others in the chat have read the message.</li>
  <li>When all users have read a message, an "eye" icon is displayed under the last read message.</li>
</ul>

<h2>Deployment:</h2>
<ul>
  <li>The frontend is deployed using <strong>Netlify</strong>.</li>
</ul>

<h2>Running the Application:</h2>

<h3>Clone the Repository:</h3>
<pre><code>git clone &lt;repository-url&gt;</code></pre>

<h3>Install Dependencies:</h3>
<pre><code>npm install</code></pre>

<h3>Start the Application:</h3>
<pre><code>npm run dev</code></pre>

<h3>Connect to Backend:</h3>
<ul>
  <li>Ensure the backend is running and configured to accept WebSocket and API requests.</li>
</ul>

<h2>Screenshots</h2>
<img width="1552" alt="Screen Shot 2024-09-12 at 22 29 38" src="https://github.com/user-attachments/assets/5d5be1b3-dea2-4d45-ad87-50efdb49bf47">

<img width="1552" alt="Screen Shot 2024-09-12 at 22 30 21" src="https://github.com/user-attachments/assets/3ecfbe9f-3ee9-4dca-823f-413214c19c09">

<img width="1552" alt="Screen Shot 2024-09-12 at 22 29 06" src="https://github.com/user-attachments/assets/04cb7a16-57e1-4729-8e70-af9faa8c2719">

<img width="1552" alt="Screen Shot 2024-09-12 at 22 28 00" src="https://github.com/user-attachments/assets/da8c5c84-3cae-443b-8eee-6b2685d25e4a">

<img width="1552" alt="Screen Shot 2024-09-12 at 22 28 16" src="https://github.com/user-attachments/assets/3c8c3e1a-79c5-4d46-bad7-3d9a1a35667f">

<img width="1552" alt="Screen Shot 2024-09-12 at 22 28 40" src="https://github.com/user-attachments/assets/a0efc3a0-bc18-47dd-bdbc-b258704e0b22">

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

This README file was created using ChatGPT.
