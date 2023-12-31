/*global  require:true, module:true */
/*jshint boss:true, browser:true */

(function() {
  var VERSION = "1.2.2";
  var Backbone = this.Backbone;
  var _ = this._;

  // Load Backbone and Underscore using require if we don't have the global for
  // some reason
  if (typeof require === "function") {
    if (!Backbone) Backbone = require("backbone");
    if (!_) _ = require("underscore");
  }

  function ensureArray(ob){
    return _.isArray(ob) ? ob : [ob];
  }

  function isConstructor(o) {
    return o.prototype && o === o.prototype.constructor;
  }

  /**
   * Few tested opinions on how to handle deeply nested views in Backbone.js
   * focusing on encapsulation and reusability.
   *
   * <https://github.com/epeli/backbone.viewmaster>
   *
   * @class Viewmaster
   * @extends Backbone.View
   * */
  var Viewmaster = Backbone.View.extend({

    constructor: function() {
      Backbone.View.prototype.constructor.apply(this, arguments);


      /**
       * Boolean indicating whether this view has been rendered at least once.
       * Set by the `render` method and used by the parent view.
       *
       * @property rendered
       * @type Boolean
       **/
      this.rendered = false;

      /**
      * Reference to the parent view.
      *
      * @property parent
      * @type Object
      **/
      this.parent = null;

      /**
      * Object containing all child views. Key are CSS selectors and values
      * are arrays of views
      *
      * @private
      * @property _views
      * @type Object
      **/
      this._views = {};

      /**
      * Array of views to be removed on next `refreshViews` call.
      *
      * @private
      * @property _remove
      * @type Array
      **/
      this._remove = [];

      /**
      * Record of view container with changes
      *
      * @private
      * @type Object
      **/
      this._dirty = {};
    },


    /**
     * Template function. User must override this!
     *
     * @method template
     * @param {Object} context
     * @return {String / DOM object} rendered template
     **/
    template: function(){
      throw new Error("Template function not defined!");
    },

    /**
     * Returns the context object for the `template` method.
     *
     * Default: `this.model.toJSON()` or an empty object if view has no model.
     *
     * @method context
     * @return {Object} context
     **/
    context: function() {
      if (this.model) return this.model.toJSON();
      return {};
    },


    /**
     * Render this view with `this.template(this.context())` and refresh child
     * views with `this.refreshViews(options)`.
     *
     * @method render
     * @param {Object} options
     *   @param {Boolean} [options.force]
     *   force rerendering of child views
     * @return {Object} this
     **/
    render: function(opts) {
      opts = _.extend({}, opts);

      // Remove subviews with detach. This way they don't lose event handlers
      // and parent view can rerender itself
      this.eachView(function(sel, view) {
        view.$el.detach();
      });

      opts.detached = true;

      this.$el.html(this.template(this.context()));

      this.afterTemplate();

      // Mark this view as rendered. Parent view wont try to render this
      // anymore unless force:true is passed
      this.rendered = true;

      this.refreshViews(opts);

      return this;
    },

    /**
     * Overrideable by the view implementor.
     *
     * Called after the template has been rendered but before adding child
     * views.  This is perfect place to hook up any jQuery plugings using
     * `this.$` or `this.$el` or set access points to view DOM elements
     *
     *     this.$el("button").tooltipPlugin();
     *     this.$saveButton = this.$("button.save");
     *
     * because they cannot have any side affects to child views.
     *
     * @method afterTemplate
     **/
    afterTemplate: function() {},

    /**
     * Refresh any child view changes made with `setView`, `appendView`,
     * `prependView` or `insertView`. Tries to avoid doing any work unless it
     * is absolutely necessary or `{ force: true }` is passed.
     *
     * It calls `render` on child views only when a child has never been
     * rendered before.
     *
     * @method refreshViews
     * @param {Object} options
     *   @param {Boolean} [options.force]
     *   force rerendering of child views
     * @return {Object} this
     **/
    refreshViews: function(opts) {
      opts = _.extend({}, opts);
      var self = this;
      var dirty = this._dirty;

      var oldView;
      while (oldView = this._remove.shift()) oldView.remove();

      this.eachView(function(sel, view) {
        // Detach view from container if it is dirty to update possible view
        // order changes.
        var refresh = dirty[sel] || opts.force;

        if (refresh && !opts.detached) view.$el.detach();
        if (!view.rendered || opts.force) view.render(opts);
        if (refresh || opts.detached) self.$(sel).append(view.el);
      });

      this._dirty = {};
      return this;
    },

    /**
     * Detach view from its parent but keep it in DOM.
     *
     * @private
     * @method _removeParent
     * @return {Object} this
     **/
    _removeParent: function() {

      if (!this.parent) return;

      var key;
      for (key in this.parent._views) {
        this.parent._views[key] = _.without(
          this.parent._views[key], this
        );
      }

      this.parent = null;

      return this;
    },


    /**
     * Prepare views to be nested in this view. Set up event bubbling and
     * remove possible previous parent.
     *
     * @private
     * @method _prepareViews
     * @param {Object/Constructor/Array} view(s) One or array of view objects
     * or Constructors
     **/
    _prepareViews: function(views) {
      var self = this;
      views = _.map(ensureArray(views), _.bind(this._createInstance, this));

      _.each(views, function(view) {
        // when parent is changing remove it from previous
        if (view.parent && view.parent !== self) view._removeParent();
        view.parent = self;
      });

      return views;
    },

    _createInstance: function(view) {
      return isConstructor(view) ? new view({
        model: this.model,
        collection: this.collection
      }) : view;
    },

    /**
    * Like `trigger` but the events are bubbled all the way up to all
    * parent views too.
    *
    * @method bubble
    * @param {String} event
    * @param {any} [args*] Zero or more objects to be passed along with the
    * event
    * @return {Object} this
    **/
    bubble: function() {
      var args = _.toArray(arguments);
      this.trigger.apply(this, args);
      if (this.parent) this.parent.bubble.apply(this.parent, args);
      return this;
    },

    /**
    * Opposite of `bubble`. The events are broadcasted all the way down to all
    * child views too.
    *
    * @method broadcast
    * @param {String} event
    * @param {any} [args*] Zero or more objects to be passed along with the
    * event
    * @return {Object} this
    **/
    broadcast: function() {
      var args = _.toArray(arguments);
      this.trigger.apply(this, args);
      this.eachView(function(sel, view) {
        view.broadcast.apply(view, args);
      });
      return this;
    },

    /**
     * Iterate each child view.
     *
     * @method eachView
     * @param {Function} iterator
     *   @param {String} iterator.selector CSS selector for the view container
     *   @param {Object} iterator.view The view object
     * @return {Object} this
     **/
    eachView: function(fn) {
      _.each(this._views, function(views, sel) {
        _.each(views, function(view) {
          fn(sel, view);
        });
      });
    },


    /**
     * Set a view or an array of views to a given view container.
     *
     * If previous set of views is replaced by a new set — the views not
     * present in the new set will be discarded with `remove` on the next
     * `refreshViews` call unless detached with `detach` method.
     *
     * If `views` parameter is a constructor function it will be instantiated
     * with `model` and `collection` of the parent. This applies to
     * `appendView`, `prependview` and `insertView` too.
     *
     * @protected
     * @method setView
     * @param {String} selector CSS selector for the view container
     * @param {Object/Constructor/Array} view(s) One or array of view objects
     * or Constructors
     **/
    setView: function(sel, currentViews) {
      var previousViews;
      currentViews = this._prepareViews(currentViews);

      if (previousViews = this._views[sel]) {
        this._remove = this._remove.concat(
          _.difference(previousViews, currentViews)
        );
      }

      this._views[sel] = currentViews;
      this._dirty[sel] = true;
      return this;
    },

    /**
     * Insert views to specific index in the view array.
     *
     * @protected
     * @method insertView
     * @param {String} selector CSS selector for the view container
     * @param {Number} index Index to insert view(s)
     * @param {Object/Constructor/Array} view(s) Views to insert
     **/
    insertView: function(sel, index, views) {
      var current;
      views = this._prepareViews(views);
      if (current = this._views[sel]) {
        current.slice().splice.apply(current, [index, 0].concat(views));
      }
      else {
        this._views[sel] = views;
      }

      this._dirty[sel] = true;
      return this;
    },

    /**
     * Append a views to a given view container.
     *
     * @protected
     * @method appendView
     * @param {String} selector CSS selector for the view container
     * @param {Object/Constructor/Array} view(s) Views to append
     **/
    appendView: function(sel, views) {
      this._views[sel] = (this._views[sel] || []).concat(
        this._prepareViews(views)
      );

      this._dirty[sel] = true;
      return this;
    },

    /**
     * Prepend a views to a given view container.
     *
     * @protected
     * @method prependView
     * @param {String} selector CSS selector for the view container
     * @param {Object/Constructor/Array} view(s) Views to prepend
     **/
    prependView: function(sel, views) {
      this._views[sel] = this._prepareViews(views).concat(
        this._views[sel] || []
      );

      this._dirty[sel] = true;
      return this;
    },

    /**
     * Return array of views for given container or null if the container have
     * not been used.
     *
     * @protected
     * @method getViews
     * @param {String} selector container CSS selector
     * @return {Array/null} views
     **/
    getViews: function(sel) {
      var views;
      if (views = this._views[sel]) return views.slice();
      return null;
    },

    /**
     * Detaches view from its parent and DOM.
     *
     * @method detach
     * @return {Object} this
     **/
    detach: function() {
      this._removeParent();
      this.$el.detach();
      return this;
    },


    /**
     * Discard this view and all its children for good. Clears all events bound
     * for the view. Use `detach` instead if you need to use the view again
     * some time later.
     *
     * @method remove
     * @return {Object} this
     **/
    remove: function() {
      Backbone.View.prototype.remove.apply(this, arguments);
      this._removeParent();
      this.eachView(function(sel, view) {
        view.remove();
      });
      return this;
    }

  });

  Viewmaster.VERSION = VERSION;
  if (typeof module !== 'undefined') {
    module.exports = Backbone.Viewmaster;
  }
  else {
    Backbone.Viewmaster = Backbone.ViewMaster = Viewmaster;
  }

})();
