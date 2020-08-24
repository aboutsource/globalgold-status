export default {
  props: {
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
    },
    spin: {
      type: Boolean,
      default() { return false; },
    }
  },
  computed: {
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
  },
  template: `
    <div :class="wrapperClasses">
      <div :class="iconClasses"></div>
    </div>
  `,
};
