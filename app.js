(() => {
  'use strict';

  const App = {
    data() {
      return {
        notifications: false,
        flash: null,
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
      this.notifications = (Notification.permission == 'granted' && localStorage.notifications == 'enabled');

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

        const loaders = this.servers.map(server => {
          server.loading = true;

          const fetcher = fetch(`https://${server.host}/health`)
            .then(response => response.json())
            .then(data => {
              server.healthy = (data.status == 'ok');
              server.release = data.release;
            })
            .catch(() => {
              server.healthy = false;
              server.release = undefined;
            });

          // Fake hard work ¯\_(ツ)_/¯
          const timer = new Promise((resolve) => {
            window.setTimeout(() => resolve(), (Math.random() * 2000) + 500);
          });

          return Promise.all([fetcher, timer]).finally(() => {
            server.loading = false;
          });
        });

        Promise.all(loaders).finally(() => {
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

      async updateNotifications(notifications) {
        if (notifications) await Notification.requestPermission();
        this.notifications = (notifications && Notification.permission == 'granted');
        localStorage.notifications = this.notifications ? 'enabled' : 'disabled';

        if (notifications != this.notifications)
          this.flash = `It looks like you disabled notifications in your Browser.
                        Please enable them to use the notification feature.`;
      },
    },
  };

  let app = Vue.createApp(App);

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
      <div :class="wrapperClasses()">
        <div :class="iconClasses()"></div>
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
        let classes = ['icon'];

        if (this.color !== undefined) {
          classes.push(`has-text-${this.color}`);
        }
        return classes;
      }
    }
  });

  app.component('flash', {
    props: ['flash'],
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
  });

  app.component('notifier', {
    props: ['notifications'],
    template: `
      <button class="button" @click="toggle">
        <icon :icon="icon()"></icon>
        <div>{{ text() }}</div>
      </button>
    `,
    methods: {
      icon() {
        return this.notifications ? 'bell-slash' : 'bell';
      },

      text() {
        return this.notifications ? 'Disable Notifications' : 'Get Notified';
      },

      toggle() {
        this.$emit('update:notifications', !this.notifications);
      },
    }
  });

  app.component('rechecker', {
    props: ['recheck'],
    template: `
      <button class="button is-primary" :disabled="recheck.loading">
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
  })

  app.mount('#app');
}).call();
