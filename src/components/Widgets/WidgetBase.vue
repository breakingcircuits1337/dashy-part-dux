<template>
  <div :class="`widget-base ${ loading ? 'is-loading' : '' }`">
    <!-- Update Action Button -->
    <Button :click="update" class="action-btn update-btn" v-if="!hideControls && !loading">
      <UpdateIcon />
    </Button>
    <!-- Edit Action Button (visible in edit mode) -->
    <Button :click="emitEdit" class="action-btn edit-btn" v-if="isEditMode && !loading">
      <EditIcon />
    </Button>
    <!-- Remove Action Button (visible in edit mode) -->
    <Button :click="emitRemove" class="action-btn remove-btn" v-if="isEditMode && !loading">
      <BinIcon />
    </Button>
    <!-- Loading Spinner -->
    <div v-if="loading" class="loading">
      <LoadingAnimation v-if="loading" class="loader" />
    </div>
    <!-- Error Message Display -->
    <div v-if="error" class="widget-error">
      <p class="error-msg">An error occurred, see the logs for more info.</p>
      <p class="error-output">{{ errorMsg }}</p>
      <p class="retry-link" @click="update">Retry</p>
    </div>
    <!-- Widget Label -->
    <div class="widget-label" v-if="widgetOptions.label">{{ widgetOptions.label }}</div>
    <!-- Widget -->
    <div :class="`widget-wrap ${ error ? 'has-error' : '' }`">
      <component
        v-bind:is="component"
        :options="widgetOptions"
        @loading="setLoaderState"
        @error="handleError"
        :ref="widgetRef"
      />
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
// Import form elements, icons and utils
import ErrorHandler from '@/utils/logging/ErrorHandler';
import Button from '@/components/FormElements/Button';
import UpdateIcon from '@/assets/interface-icons/widget-update.svg';
import EditIcon from '@/assets/interface-icons/config-edit-json.svg';
import BinIcon from '@/assets/interface-icons/interactive-editor-remove.svg';
import LoadingAnimation from '@/assets/interface-icons/loader.svg';
import WIDGET_REGISTRY from './widgetRegistry';

const widgetModules = import.meta.glob('./*.vue');

export default {
  name: 'Widget',
  components: {
    // Register form elements
    Button,
    UpdateIcon,
    EditIcon,
    BinIcon,
    LoadingAnimation,
  },
  props: {
    widget: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  emits: ['editWidget', 'removeWidget'],
  data: () => ({
    loading: false,
    error: false,
    errorMsg: null,
  }),
  computed: {
    appConfig() {
      return this.$store.getters.appConfig;
    },
    isEditMode() {
      return this.$store.state.editMode;
    },
    /* Returns the widget type, shows error if not specified */
    widgetType() {
      if (!this.widget.type) {
        ErrorHandler('Missing type attribute for widget');
        return null;
      }
      return this.widget.type.toLowerCase();
    },
    /* Returns users specified widget options, or empty object */
    widgetOptions() {
      const options = this.widget.options || {};
      const timeout = this.widget.timeout || null;
      const ignoreErrors = this.widget.ignoreErrors || false;
      const label = this.widget.label || null;
      const useProxy = this.appConfig.widgetsAlwaysUseProxy || !!this.widget.useProxy;
      const updateInterval = this.widget.updateInterval !== undefined
        ? this.widget.updateInterval : null;
      return {
        timeout, ignoreErrors, label, useProxy, updateInterval, ...options,
      };
    },
    /* A unique string to reference the widget by */
    widgetRef() {
      return `widget-${this.widgetType}-${this.index}`;
    },
    hideControls() {
      return this.widget.hideControls;
    },
    component() {
      const type = WIDGET_REGISTRY[this.widgetType] || this.widget.type;
      if (!type) {
        ErrorHandler('Widget type was not found');
        return null;
      }
      const path = `./${type}.vue`;
      const loader = widgetModules[path];
      if (!loader) {
        const known = Object.keys(WIDGET_REGISTRY).join(', ');
        ErrorHandler(`Unknown widget type '${this.widgetType}'. Valid types: ${known}`);
        return defineAsyncComponent(() => import('./Blank.vue'));
      }
      return defineAsyncComponent(() => loader().catch(() => import('./Blank.vue')));
    },
  },
  methods: {
    /* Calls update data method on widget */
    update() {
      this.error = false;
      const ref = this.$refs[this.widgetRef];
      if (ref && typeof ref.update === 'function') ref.update();
    },
    /* Shows message when error occurred */
    handleError(msg) {
      this.error = true;
      this.errorMsg = msg;
    },
    /* Toggles loading state */
    setLoaderState(loading) {
      this.loading = loading;
    },
    emitEdit() { this.$emit('editWidget'); },
    emitRemove() { this.$emit('removeWidget'); },
  },
};
</script>

<style scoped lang="scss">
@import "@/styles/media-queries.scss";

.widget-base {
  position: relative;
  padding: 0.75rem 0.5rem 0.5rem 0.5rem;
  background: var(--widget-base-background);
  box-shadow: var(--widget-base-shadow, none);

  // Refresh and full-page action buttons
  button.action-btn {
    height: 1rem;
    min-width: auto;
    width: 1.25rem;
    margin: 0;
    padding: 0.25rem;
    position: absolute;
    top: 0;
    border: none;
    opacity: var(--dimming-factor);
    color: var(--widget-text-color);
    svg { width: 0.75rem; height: 0.75rem; }

    &:hover {
      opacity: 1;
      color: var(--widget-background-color);
    }

    &.update-btn { right: -0.25rem; }
    &.edit-btn { right: 1rem; }
    &.remove-btn { right: 2.25rem; }
  }

  // Optional widget label
  .widget-label {
    color: var(--widget-text-color);
  }

  // Actual widget container
  .widget-wrap {
    &.has-error {
      cursor: not-allowed;
      opacity: 0.5;
      border-radius: var(--curve-factor);
      background: #ffff0040;

      &:hover { background: none; }
    }
  }

  // Error message output
  .widget-error {
    p.error-msg {
      color: var(--warning);
      font-weight: bold;
      font-size: 1rem;
      margin: 0 auto 0.5rem auto;
    }

    p.error-output {
      font-family: var(--font-monospace);
      color: var(--widget-text-color);
      font-size: 0.85rem;
      margin: 0.5rem auto;
    }

    p.retry-link {
      cursor: pointer;
      text-decoration: underline;
      color: var(--widget-text-color);
      font-size: 0.85rem;
      margin: 0;
    }
  }

  // Loading spinner
  .loading {
    margin: 0.2rem auto;
    text-align: center;

    svg.loader {
      width: 100px;
    }
  }

  // Hide widget contents while loading
  &.is-loading {
    .widget-wrap {
      display: none;
    }
  }
}
</style>
