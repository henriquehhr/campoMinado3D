import { mount } from 'svelte';
import App from './flat UI/App.svelte';

const appDiv = document.getElementById('app') ?? new Element();
mount(App, { target: appDiv });