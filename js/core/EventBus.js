/**
 * Simple pub/sub event bus for component communication
 * Provides decoupled communication between modules
 *
 * @example
 * EventBus.on('data:changed', (data) => console.log(data));
 * EventBus.emit('data:changed', { value: 42 });
 * EventBus.off('data:changed', callback);
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  /**
   * Emit an event with data
   * @param {string} event - Event name
   * @param {*} data - Data to pass to subscribers
   */
  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in ${event} handler:`, error);
      }
    });
  }

  /**
   * Subscribe to an event only once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(event, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  /**
   * Clear all subscribers for an event or all events
   * @param {string} [event] - Event name (optional, clears all if not provided)
   */
  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Export singleton instance
export default new EventBus();
