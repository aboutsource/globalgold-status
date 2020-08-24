import {createApp} from 'https://cdn.jsdelivr.net/npm/vue@3.0.0-rc.6/dist/vue.esm-browser.js';

import FlashComponent from './components/flash.js';
import NotifierComponent from './components/notifier.js';
import RecheckerComponent from './components/rechecker.js';
import ServerComponent from './components/server.js';

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
      ],
    };
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
  components: {
    flash: FlashComponent,
    notifier: NotifierComponent,
    rechecker: RecheckerComponent,
    server: ServerComponent,
  },
  template: `
    <div class="level">
      <div class="level-left">
        <div class="level-item">
          <div class="title">GlobalGold Status</div>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <notifier :notifications="notifications" @update:notifications="updateNotifications"></notifier>
        </div>
        <div class="level-item">
          <rechecker :recheck="recheck" @click="load"></rechecker>
        </div>
      </div>
    </div>
    <flash v-if="flash" :flash="flash"></flash>
    <server v-for="server in servers" :server="server"></server>
  `,
};

createApp(App).mount('#app');
