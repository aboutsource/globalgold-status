import IconComponent from './icon.js';

export default {
  props: ['notifications'],
  computed: {
    icon() {
      return this.notifications ? 'bell-slash' : 'bell';
    },
    text() {
      return this.notifications ? 'Disable Notifications' : 'Get Notified';
    },
  },
  methods: {
    toggle() {
      this.$emit('update:notifications', !this.notifications);
    },
  },
  components: {
    icon: IconComponent,
  },
  template: `
    <button class="button" @click="toggle">
      <icon :icon="icon"></icon>
      <div>{{ text }}</div>
    </button>
  `,
};
