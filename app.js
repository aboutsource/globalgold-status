(function() {
  const App = {
    data() {
      return {
        servers: [
          {host: 'gg1.aboutsource.net'},
          {host: 'gg-staging.aboutsource.net'},
          {host: 'gg-testing.aboutsource.net'},
        ]
      }
    },

    mounted() {
      this.load();
      window.setInterval(() => this.load(), 60 * 1000);
    },

    methods: {
      load() {
        this.servers.forEach(function(server) {
          server.loading = true

          fetch(`https://${server.host}/health`)
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
            })
        });
      }
    },
  };

  var app = Vue.createApp(App);

  app.component('server', {
    props: ['server'],
    template: `
      <div class="box">
        <div class="columns is-mobile is-multiline">
          <div class="column is-2-mobile is-1-tablet">
            <div class="icon" v-if=server.loading>
              <div class="fas fa-cog fa-spin">
              </div>
            </div>
            <div class="icon" v-else v-bind:class="{'has-text-success': server.healthy, 'has-text-danger': !server.healthy}">
              <div class="fas" v-bind:class="{'fa-check': server.healthy, 'fa-exclamation-triangle': !server.healthy}">
              </div>
            </div>
          </div>
          <div class="column is-10-mobile is-6-tablet">
            <strong>
              {{ server.host }}
            </strong>
          </div>
          <div class="column is-10-mobile is-5-tablet is-offset-2-mobile has-text-right-tablet">
            <strong>
              {{ server.release }}
            </strong>
          </div>
        </div>
      </div>
    `,
  })

  app.mount('#app');
}).call(this);
