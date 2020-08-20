(() => {
  'use strict';

  const App = {
    data() {
      return {
        notifications: Notification.permission == 'granted',
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

        if (this.recheck.countdown > 0) {
          this.recheck.countdown--;
        }

        if (this.recheck.countdown <= 0) {
          this.load();
        }
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
          this.setIcon();
          this.notify();
        });
      },

      setIcon() {
        const element = document.querySelector('head link[rel="icon"]');
        element.href = this.servers.every(server => server.healthy) ? './success.svg' : './danger.svg';
      },

      notify() {
        if (!this.notifications || this.servers.every(server => server.healthy)) {
          return;
        }

        new Notification('At least one of your servers does not look very happy.', {
          body: 'I think it is best to panic and leave.',
        });
      },

      enableNotifications() {
        Notification.requestPermission().then(() => {
          this.notifications = Notification.permission == 'granted';
        });
      },
    },
  };

  var app = Vue.createApp(App);

  app.component('icon', {
    props: {
      icon: {
        type: String,
        required: true,
      },
      color: String,
      spin: {
        type: Boolean,
        default() { return false; },
      }
    },
    template: `
      <div v-bind:class="wrapperClasses()">
        <div v-bind:class="iconClasses()"></div>
      </div>
    `,
    methods: {
      iconClasses() {
        let classes = ['fas', `fa-${this.icon}`];

        if (this.spin) {
          classes.push('fa-spin');
        }
        return classes;
      },

      wrapperClasses() {
        let classes = ['icon']

        if (this.color !== undefined) {
          classes.push(`has-text-${this.color}`);
        }
        return classes;
      }
    }
  });

  app.component('rechecker', {
    props: ['recheck'],
    template: `
      <button class="button is-primary" v-bind:disabled="recheck.loading">
        <icon :icon="'sync-alt'" :spin="recheck.loading"></icon>
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
              <icon v-if=server.loading icon="'cog'" :spin="true"></icon>
              <icon v-else-if=server.healthy :icon="'check'" :color="'success'"></icon>
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
  })

  app.mount('#app');
}).call();
