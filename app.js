(() => {
  'use strict';

  const App = {
    data() {
      return {
        recheck: {
          countdown: 0,
          interval: 60,
        },
        servers: [
          {host: 'gg1.aboutsource.net'},
          {host: 'gg-staging.aboutsource.net'},
          {host: 'gg-testing.aboutsource.net'},
        ]
      }
    },

    mounted() {
      this.tick();
      window.setInterval(() => this.tick(), 1000);
    },

    methods: {
      tick() {
        if (this.recheck.loading) {
          return;
        }
        if (this.recheck.countdown > 1) {
          this.recheck.countdown--;
          return;
        }
        this.load();
      },

      load() {
        this.recheck.loading = true;

        const loads = this.servers.map(function(server) {
          server.loading = true

          return fetch(`https://${server.host}/health`)
            .then(response => response.json())
            .then(data => {
              server.healthy = (data.status == 'ok');
              server.release = data.release;
            })
            .catch(() => {
              server.healthy = false;
              server.release = undefined;
            })
            .finally(() => {
              server.loading = false;
            });
        });

        Promise.all(loads).finally(() => {
          this.recheck.loading = false;
          this.recheck.countdown = this.recheck.interval;
        });
      }
    },
  };

  var app = Vue.createApp(App);

  app.component('rechecker', {
    props: ['recheck'],
    template: `
      <button class="button is-primary" v-bind:disabled="recheck.loading">
        <div class="icon">
          <div class="fas fa-sync-alt" v-bind:class="{'fa-spin': recheck.loading}"></div>
        </div>
        <div>Recheck ({{ recheck.countdown }})</div>
      </button>
    `,
  });

  app.component('server', {
    props: ['server'],
    template: `
      <div class="box">
        <div class="level">
          <div class="level-left">
            <div class="level-item px-2">
              <div class="icon" v-if=server.loading>
                <div class="fas fa-cog fa-spin"></div>
              </div>
              <div class="icon" v-else v-bind:class="[server.healthy ? 'has-text-success' : 'has-text-danger']">
                <div class="fas" v-bind:class="[server.healthy ? 'fa-check': 'fa-exclamation-triangle']"></div>
              </div>
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
  })

  app.mount('#app');
}).call();
