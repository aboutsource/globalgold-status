import IconComponent from './icon.js';

export default {
  props: ['recheck'],
  components: {
    icon: IconComponent,
  },
  template: `
    <button class="button is-primary" :disabled="recheck.loading">
      <icon :icon="'sync-alt'" :spin="recheck.loading"></icon>
      <div>Recheck ({{ recheck.countdown }})</div>
    </button>
  `,
};
