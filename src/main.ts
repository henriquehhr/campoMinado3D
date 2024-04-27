import { mount } from 'svelte';
import App from './flat UI/App.svelte';

const app = mount(App, {
  //@ts-ignore
  target: document.getElementById('app'),
});

export default app;