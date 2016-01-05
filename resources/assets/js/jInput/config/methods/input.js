/**
 * input.js
 *
 * Input methods
 */

;module.exports = function(self) {

  /**
   * Set up some convenience variables
   */
  var oAtts = function() { return self.options.atts },
      runopts = self.runopts;

  return {

  /**
   * Set the instance options
   * @method function
   * @return {[type]} [description]
   */
  setOptions : function( options ) {
    // insulate against options being null
    options = options || {};
    // set the runtime values for the options
    var atts = options.atts || {};

    $.extend(true,
      self.options,   // target
      self.defaults,  // default options
      {               // additional computed defaults
        atts : {
            'id' : atts.name || null
        }
      },
      options || {}   // runtime options
    );

    // alias to attributes object
    //self.options.atts = self.options.atts || {};

    return self.fn; // for chaining methods
  }, // end fn

  /**
   * Resolve the input name
   * @return {[type]} [description]
   */
  resolveInputName : function() {
    if ( self.fn.isMultiple() ) {
      self.options.atts.name = self.options.atts.name.replace('[]','') + '[]';
    }
  }, // end fn

  /**
   * Does the input accept multiple values
   * @return {[type]} [description]
   */
  isMultiple : function() {
    return ( !!self.options.atts.multiple || self.options.atts.multiple === 'multiple' );
  },

  /**
   * Process form field from parameters
   * @method function
   * @param  {[type]} params [description]
   * @param  {[type]} target [description]
   * @return {[type]}        [description]
   */
  processField : function( params, target ) {
    var inpt;

    jApp.log('B. Processing Field');
    //jApp.log(params);
    //jApp.log(obj);


    // check if the type is array
    //if (params.type == 'array') return self.fn.processArrayField(params, target);

    inpt = new jInput( { atts : params, form: self.form }, self );
    self.oInpts[ params.name ] = inpt;
    target.append( inpt.fn.handle() );
    if (params.readonly === 'readonly') self.readonlyFields.push(params.name);

  }, // end fn

  /**
   * Get input attributes
   * @method function
   * @return {[type]} [description]
   */
  getAtts : function( ) {
    var gblAtts = self.globalAtts;
    var stdAtts = self.allowedAtts[ self.type ];
    var allowedAttributes = _.union(stdAtts,gblAtts);


    var filteredAtts = _.pick( self.options.atts, function( value, key) {
      if ( 	typeof value === 'undefined' ||
          typeof value === 'object' ||
          !value ||
          value == '__OFF__' ||
          value == '__off__' ||
          ( _.indexOf( allowedAttributes, key ) === -1 && key.indexOf('data-') === -1 )
      ) {
        return false;
      } else {
        return true;
      }
    });
    return filteredAtts;
  }, // end fn


  /**
   * Set time to live on the store value
   * @method function
   * @param  {[type]} ttl [description]
   * @return {[type]}     [description]
   */
  setTTL : function(ttl) {
    self.store.setTTL( ttl );
  }, //end fn

  /**
   * Attribute handler function
   * @method function
   * @param  {[type]} key   [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  attr : function( key, value ) {
    if (typeof key === 'object') {
      _.each( key, function( v, k ) {
        self.options.atts[k] = v;
      });
      self.fn.refresh();
    } else if (!!value) {
      self.options.atts[key] = value;
      self.fn.refresh();
    } else {
      return self.options.atts[key];
    }
  },

  /**
   * Value handler function
   * @method function
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  val : function( value ) {

    if (!!value) {
      if (typeof value !== 'object') {
        if (self.options.atts.name == '_labelssource' || self.options.atts.name == '_optionssource') {
          value = value.replace(/\,/gi,'|');
        }
        self.$().attr('data-value',value);
        return self.fn.attr('value',[value]);
      } else {
        self.$().attr('data-value',value.join('|'));
        return self.fn.attr('value',value);
      }
    }

    switch( self.type ) {
      case 'radio' :
      case 'checkbox' :
        return $.map( self.DOM.$prnt.find(':checked'), function(i, elm) {
          return $(elm).val();
        });

      default :
        return self.DOM.$inpt.val();
    }
  },

  /**
   * Refresh the attributes of the element
   * @method function
   * @return {[type]} [description]
   */
  refresh : function() {
    _.each( self.fn.getAtts(), function(v, k) {
      if ( k !== 'type' ) { // cannot refresh type
        self.DOM.$inpt.attr(k,v);
      }
    });

    self.DOM.$inpt.val( self.options.atts.value );
  },

  /**
   * Render the html of the element
   * @method function
   * @return {[type]} [description]
   */
  render : function() {
    return self.DOM.$prnt.prop('outerHTML');
  },

  /**
   * jQuery reference to the parent of the element
   * @method function
   * @return {[type]} [description]
   */
  handle : function() {
    return self.DOM.$prnt;
  },

  /**
   * pre-initialize the object
   * @method function
   * @return {[type]} [description]
   */
  _preInit : function() {
    self.store = jApp.store;
    self.readonly = false;

    // Get the default options and config
    self.options  = {};
    self.defaults = require('../defaults');

    // allowable html attributes
    self.globalAtts = require('../globalAttributes');
    self.allowedAtts = require('../allowedAttributes');

    // allowable column parameters
    self.globalColParams = require('../globalColParams');
    self.allowedColParams = require('../allowedColParams');
    self.disallowedColParams = require('../disallowedColParams');

    /**  **  **  **  **  **  **  **  **  **
       *   DOM ELEMENTS
       *
       *  These placeholders get replaced
       *  by their jQuery handles
       **  **  **  **  **  **  **  **  **  **/
    self.DOM = {
      $prnt : false,
      $inpt : false,
      $lbl  : false,
    };

    /**
     * [oInpts description]
     * @type {Array}
     */
    self.oInpts = [];

    /**
     * Is self an array field
     * @type {Boolean}
     */
    self.arrayField = false;

    /**
     * Shortcut function to the $inpt
     * @method function
     * @return {[type]} [description]
     */
    self.$ = function() {
      return self.DOM.$inpt;
    };

    // set the instance options to the runtime options
    self.fn.setOptions( self.runopts );

    // set the separator
    self.$separator = (!!self.options.separator) ? $('<br/>') : false;

    // set the type
    self.type = self.options.atts.type;

    // get the input name
    self.fn.resolveInputName();

    // set readonly flag on the input
    self.readonly = (self.options.atts.readonly === 'readonly') ? true : false;

    // set the form
    self.form = runopts.form || self.options.atts.form || {};

    //set the parent element
    self.DOM.$prnt = self.options.parent.clone();

    // initialize
    self.fn._init();

  }, // end fn

  /**
   * Build a label for the input
   * @method function
   * @return {[type]} [description]
   */
  labelHandler : function() {
    if (self.type === 'hidden' || !self.options.atts._label ) return false;

    self.DOM.$lbl = self.factory.label();

    // append the label to the DOM
    self.DOM.$prnt
      .append(  ( !!self.DOM.$lbl.parents().length ) ?
                  self.DOM.$lbl.parents().last() :
                  self.DOM.$lbl
      );

    //append the separator, if applicable
    if (!!self.options.separator) {
      self.DOM.$prnt.append( self.$separator.clone() );
    }

  }, // end fn

  /**
   * A jquery handle to the input
   * @method function
   * @return {[type]} [description]
   */
  inputHandle : function() {
    if ( self.DOM.$inpt.parents().length ) {
      return self.DOM.$inpt.parents().last();
    }
    return self.DOM.$inpt;
  }, // end fn

  /**
   * Append the input, feedback icon
   * container and help block
   * to the $prnt object
   *
   * @method function
   * @return {[type]} [description]
   */
  appendInput : function() {
    self.DOM.$prnt.append( [
      self.fn.inputHandle(),
      self.factory.feedbackIcon(),
      self.factory.helpTextBlock()
    ]);

  }, // end fn

  /**
   * Append the $prnt object to the specified target
   * @method function
   * @param  {[type]} $target [description]
   * @return {[type]}         [description]
   */
  appendTo : function($target) {
    self.DOM.$prnt.appendTo( $target );
  }, // end fn

  /**
   * Initialize the object
   * @method function
   * @return {[type]} [description]
   */
  _init : function() {

    //handle the label
    self.fn.labelHandler();

    //create and append the input element
    self.DOM.$inpt = self.factory._build();

    //append the input
    self.fn.appendInput();

    // run any postbuild subroutines
    self.factory._postbuild();

    // //update reference to $inpt for radio groups
    // if (self.type === 'radio') {
    // 	self.DOM.$inpt = self.DOM.$prnt.find( '[name=' + self.options.atts.name + ']' );
    // }

  }, // end fn
}

}