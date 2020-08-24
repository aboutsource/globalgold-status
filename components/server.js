import IconComponent from './icon.js';

export default {
  props: ['server'],
  components: {
    icon: IconComponent,
  },
  template: `
    <div class="box">
      <div class="level">
        <div class="level-left">
          <div class="level-item px-2">
            <icon v-if="server.loading" :icon="'cog'" :spin="true"></icon>
            <icon v-else-if="server.healthy" :icon="'check'" :color="'success'"></icon>
            <icon v-else :icon="'exclamation-triangle'" :color="'danger'"></icon>
          </div>
          <div class="level-item px-2">
            <strong>{{ server.host }}</strong>
          </div>
        </div>
        <div class="level-right">
          <div class="level-item px-2">
            <strong>{{ server.release }}</strong>
          </div>
        </div>
      </div>
    </div>
  `,
};
