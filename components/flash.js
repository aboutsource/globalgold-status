import IconComponent from './icon.js';

export default {
  props: ['flash'],
  components: {
    icon: IconComponent,
  },
  template: `
    <div class="box has-background-warning">
      <div class="level">
        <div class="level-left">
          <div class="level-item px-2">
            <icon :icon="'exclamation-circle'"></icon>
          </div>
          <div class="level-item px-2">
            <strong>{{ flash }}</strong>
          </div>
        </div>
    </div>
  `,
};
