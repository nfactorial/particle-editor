"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * nGen is a game framework for JavaScript.
 * This framework is intended to be agnostic of rendering engine used, though there is currently
 * some minor tight coupling to Babylon.js, this will be removed in the future.
 *
 * (c)2015 nfactorial
 */

var NgenCore = function () {
    function NgenCore() {
        _classCallCheck(this, NgenCore);

        this.counter = 0;

        this.systemRegistry = new Map();
        this.generatorRegistry = new Map();

        this.paused = false;
        this.displayManager = null;
        this.canvas = null;
        this.renderer = null;
        this.renderScene = null;
        this.element = null;
        this.babylonEngine = null;
        this.updateList = [];
        this.stateTree = null;
        this.timeStamp = 0;
        this.display = {
            width: 0,
            height: 0
        };
        this.renderer = null;
        this.updateArgs = {
            deltaTime: 1.0 / 60,
            camera: null
        };
        this.renderArgs = null;

        // TODO: The followig should be encapsulated within a 'CameraArgs' object?
        this.camera = null;
        this.fieldOfView = 75.0;
        this.near = 1;
        this.far = 1;

        this.Settings = {
            HDR: {}
        };
    }

    /**
     * Registers a new system object with the NGEN game engine.
     * @param name The name to register the object as.
     * @param ctor The constructor function to call when a new instance is created.
     */


    _createClass(NgenCore, [{
        key: 'system',
        value: function system(name, ctor) {
            if (this.systemRegistry.get(name)) {
                throw new Error('Cannot register system \'' + name + '\', name has already been registered.');
            }

            if (!ctor) {
                throw new Error('Cannot register system \'' + name + '\' without a constructor.');
            }

            this.systemRegistry.set(name, ctor);
        }

        /**
         * Registers a new generator object with the NGEN game system.
         * @param name The name to register the object as.
         * @param ctor The constructor function to call when a new instance is created.
         */

    }, {
        key: 'generator',
        value: function generator(name, ctor) {
            if (this.generatorRegistry.get(name)) {
                throw new Error('Cannot register generator \'' + name + '\', name has already been registered.');
            }

            if (!ctor) {
                throw new Error('Cannot register generator \'' + name + '\' without a constructor.');
            }

            this.generatorRegistry.set(name, ctor);
        }

        /**
         * Creates a new instance of a registered system object.
         * @param name
         * @returns {*}
         */

    }, {
        key: 'createSystem',
        value: function createSystem(name) {
            var system = this.systemRegistry.get(name);

            if (!system) {
                throw new Error('Cannot create system \'' + name + '\', system has not been registered.');
            }

            return new system();
        }

        /**
         * Creates a new instance of a registered generator object..
         * @param name
         * @param desc
         * @returns {*}
         */

    }, {
        key: 'createGenerator',
        value: function createGenerator(name, desc) {
            var generator = this.generatorRegistry.get(name);

            if (!generator) {
                throw new Error('Cannot create generator \'' + name + '\', generator has not been registered.');
            }

            return new generator(desc);
        }

        /**
         * Registers a scene for rendering by NGEN, currently only one scene may be registered however that may change
         * in the future. Possibly the scene should be associated with the display port rather then with NgenCore.
         * @param scene
         */

    }, {
        key: 'registerScene',
        value: function registerScene(scene) {
            this.renderScene = scene;
        }
    }, {
        key: 'onUpdate',


        /**
         * Called each frame when any per-frame processing should be evaluated.
         * @param updateArgs
         */
        value: function onUpdate(updateArgs) {
            if (!this.paused) {
                var count = NGEN.updateList.length;
                for (var loop = 0; loop < count; ++loop) {
                    this.updateList[loop].onUpdate(updateArgs);
                }

                if (this.stateTree) {
                    this.stateTree.onUpdate(updateArgs);
                }
            }
        }

        /**
         * Called each frame when it's time to render the titles display.
         */

    }, {
        key: 'onRender',
        value: function onRender() {
            // TODO: Scene will eventually come from the game state
            this.renderArgs.scene = this.scene;
            this.renderArgs.camera = this.camera;

            this.displayManager.onRender(this.renderArgs);
        }

        /**
         * Prepares nGen for use by the running application.
         * @param canvas The canvas surface to be rendered to.
         */

    }, {
        key: 'initialize',
        value: function initialize(canvas) {
            this.stateTree = new StateTree();

            // Add resize handler
            window.addEventListener('resize', function () {
                NGEN.babylonEngine.resize();
            });

            this.canvas = canvas;
            this.displayManager = new DisplayManager();
            this.babylonEngine = new BABYLON.Engine(canvas, true);

            this.updateArgs.deltaTime = 1.0 / 60.0;
            this.updateArgs.changeState = function (stateName) {
                NGEN.stateTree.changeState(stateName);
            };

            this.babylonEngine.runRenderLoop(function () {
                var count = NGEN.updateList.length;
                for (var loop = 0; loop < count; ++loop) {
                    NGEN.updateList[loop].onUpdate(NGEN.updateArgs);
                }

                if (NGEN.stateTree) {
                    NGEN.stateTree.onUpdate(NGEN.updateArgs);
                }

                if (NGEN.renderScene) {
                    NGEN.renderScene.render();
                }
            });
        }

        /**
         * This initialize method is used to prepare NGEN for use with THREE.js, eventually both initialize methods
         * will be combined into a single one that is configured by the application definition, but that isn't availale
         * yet.
         * @param element
         * @param width
         * @param height
         */

    }, {
        key: 'initializeThree',
        value: function initializeThree(element, width, height) {
            this.display.width = width;
            this.display.height = height;
            this.renderArgs = new RenderArgs();
            this.displayManager = new DisplayManager();
            this.shaderProvider = new ShaderProvider();

            this.displayManager.setDisplaySize(width, height);

            this.element = element;
            this.stateTree = new StateTree();
            this.scene = new THREE.Scene(); // TODO: Should be inside the 'World' object
            this.camera = new THREE.PerspectiveCamera(this.fieldOfView, width / height, 1, 1000);
            this.camera.position.y = 28;
            this.camera.position.z = 38;

            this.renderer = new THREE.WebGLRenderer({ antialias: false });
            this.renderer.gammeInput = false;
            this.renderer.gammaOutput = false;
            this.renderer.setSize(this.display.width, this.display.height);
            this.renderer.setClearColor(0x00000000, 1);

            this.renderArgs.renderer = this.renderer;

            // TEMP: Need a light to see stuff at the moment...
            var light = new THREE.DirectionalLight(0xffffff, 0.4); //12);
            light.color.setHSL(0.3, 0.6, 0.95);
            light.position.set(2, 1.75, 2);
            light.position.multiplyScalar(50);
            this.scene.add(light);

            this.element.appendChild(this.renderer.domElement);

            // TODO: Check if fat arrow works, instead of using a closure
            var self = this;
            /*        window.addEventListener('resize', function() {
             self.display.width = window.innerWidth;
             self.display.height= window.innerHeight;
             if ( self.camera ) {
             self.camera.aspect = self.display.width / self.display.height;
             self.camera.updateProjectionMatrix();
             }
             });
             */
            var internalUpdate = function internalUpdate() {
                if (!self.timeStamp) {
                    self.timeStamp = NgenCore.getTimeStamp();
                } else {
                    var now = NgenCore.getTimeStamp();
                    self.updateArgs.deltaTime = (now - self.timeStamp) / 1000;
                    self.updateArgs.camera = self.camera;
                    self.timeStamp = now;

                    if (self.updateArgs.deltaTime < 0.5) {
                        self.updateArgs.timer += self.updateArgs.deltaTime;
                        self.onUpdate(self.updateArgs);
                        self.onRender();
                    }
                }

                requestAnimationFrame(internalUpdate);
            };

            requestAnimationFrame(internalUpdate);
        }
    }], [{
        key: 'getTimeStamp',
        value: function getTimeStamp() {
            //console.log( 'now = ' + Date.now() );
            //return Date.now();
            //return window.performance.webkitNow();;
            return window.performance && window.performance.now ? window.performance.now() : new Date.now();
        }

        /**
         * Computes the linear interpolation of two points.
         * @param a The starting value to be interpolated.
         * @param b The second value to be interpolated.
         * @param t The interpolation factor (in the [0..1] range.
         * @returns {*} The computed result.
         */

    }, {
        key: 'lerp',
        value: function lerp(a, b, t) {
            return a + t * (b - a);
        }

        /**
         * Rotates a point in-place around the z-axis.
         * @param point {THREE.Vector3} The point to be rotated.
         * @param rotation {Number} The angle (in radians) to be rotated.
         * @returns {THREE.Vector3} The transformed point to allow for chained calls.
         */

    }, {
        key: 'rotateZ',
        value: function rotateZ(point, rotation) {
            var phi = Math.cos(rotation);
            var theta = Math.sin(rotation);

            var nx = point.x * phi - point.y * theta;
            var ny = point.x * theta + point.y * phi;

            point.x = nx;
            point.y = ny;

            return point;
        }
    }]);

    return NgenCore;
}();

var NGEN = new NgenCore();

//# sourceMappingURL=ngen-compiled.js.map
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Base class for all system objects within a running title.
 */

var GameSystem = function () {
  function GameSystem() {
    _classCallCheck(this, GameSystem);
  }

  /**
   * Called by the framework once all system objects have been created and the game is ready to begin play.
   * @param initArgs Object providing initialization support methods.
   */


  _createClass(GameSystem, [{
    key: "onInitialize",
    value: function onInitialize(initArgs) {}
    //

    /**
     * Called by the framework when it is time to shutdown.
     */

  }, {
    key: "onShutdown",
    value: function onShutdown() {}
    //

    /**
     * Called by the framework when it is time to perform any per-frame processing.
     * @param updateArgs Support methods and properties for use during update.
     */

  }, {
    key: "onUpdate",
    value: function onUpdate(updateArgs) {
      //
    }
  }]);

  return GameSystem;
}();

//# sourceMappingURL=game_system-compiled.js.map
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Manages a minimum and maximum limit within one dimension.
 */

var Range = function () {
    function Range(min, max) {
        _classCallCheck(this, Range);

        this.min = min || 0;
        this.max = max || 0;
    }

    _createClass(Range, [{
        key: "random",
        value: function random() {
            var range = this.max - this.min;
            return this.min + Math.random() * range;
        }
    }]);

    return Range;
}();

//# sourceMappingURL=range-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class is supplied to each system when it may prepare itself for use by the title.
 */

var InitArgs = function () {
    function InitArgs(stateTree) {
        _classCallCheck(this, InitArgs);

        if (stateTree) {
            this.name = null;
            this.stateTree = stateTree;
            this.gameState = null;
        } else {
            throw new Error('No StateTree was passed to InitArgs constructor.');
        }
    }

    /**
     * Retrieves the system object within the state tree with a specified name.
     * NOTE: Eventually, the systems will be tied to the active state to prevent states accessing systems that
     * do not exist within their hierarchy. For now, we allow any system to be retrieved but states should
     * ensure they don't access objects outside their hierarchy to remain future proof.
     * @param systemName Name of the system to be retrieved.
     * @returns {GameSystem} Reference to the named system object, if it could not be found this method returns null.
     */


    _createClass(InitArgs, [{
        key: 'getSystem',
        value: function getSystem(systemName) {
            return this.gameState.findSystem(systemName).instance;
        }
    }]);

    return InitArgs;
}();

//# sourceMappingURL=init_args-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class is used to manage the running state of the application.
 */

var StateTree = function () {
    function StateTree() {
        _classCallCheck(this, StateTree);

        this.stateList = [];
        this.stateMap = {};
        this.activeState = null;
        this.pendingState = null;
        this.initArgs = new InitArgs(this);
    }

    /**
     * Creates the game states based on the contents of the supplied data structure.
     * @param data Description of the game-states required by the running title.
     */


    _createClass(StateTree, [{
        key: 'onInitialize',
        value: function onInitialize(data) {
            if (0 !== this.stateList.length) {
                throw new Error('StateTree::initialize - State tree has already been initialized.');
            }

            if (data.states) {
                var count = data.states.length;

                // Create all the state objects
                for (var loop = 0; loop < count; ++loop) {
                    var state = new GameState();

                    state.onInitialize(data.states[loop]);

                    this.stateList.push(state);
                    this.stateMap[state.name] = state;
                }

                // Resolve all children
                for (var _loop = 0; _loop < count; ++_loop) {
                    this.stateList[_loop].resolveChildren(this.initArgs);
                }
            }

            this.activeState = this.stateList[0];
        }

        /**
         * Performs any per-frame processing necessary for the currently active game state.
         * @param updateArgs
         */

    }, {
        key: 'onUpdate',
        value: function onUpdate(updateArgs) {
            // TODO: States do not have any processing, instead they are containers for systems. We should be
            // invoking 'onUpdate' on the systems marked for update.
            if (this.activeState) {
                // TODO: Record performance here
                this.activeState.onUpdate(updateArgs);
            }

            // If a new game state has been requested, switch to the new state. We use a 'while' loop to allow a state
            // to request another state within its onActivate method.
            while (this.pendingState) {
                var newState = this.pendingState;
                var oldState = this.activeState;

                this.pendingState = null;

                if (newState != oldState) {
                    // At the moment, the first state change will have the oldState as null, however it may be
                    // we change it so the old state can never be null.
                    if (oldState) {
                        oldState.onDeactivate();
                    }

                    this.activeState = newState;

                    this.pendingState.onActivate();
                }
            }
        }

        /**
         * Requests a state change within the system. State changes do not occur immediately, but take effect at the
         * end of the current frames processing.
         * @param stateName Name of the state which should be switched to.
         */

    }, {
        key: 'changeState',
        value: function changeState(stateName) {
            var requestedState = this.stateMap[stateName];
            if (!requestedState) {
                console.log('State change requested for \'' + stateName + '\' but no such state could be found (ignored).');
            } else {
                this.pendingState = requestedState;
            }
        }
    }]);

    return StateTree;
}();

//# sourceMappingURL=state_tree-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a state within the running title. A game state contains a list of system objects that are accessible
 * from the state, within a state its immediate system objects and those system objects within its parent hierarchy
 * are accessible.
 */

var GameState = function () {
    function GameState() {
        _classCallCheck(this, GameState);

        this.name = null;
        this.children = null;
        this.parent = null;
        this.updateNames = [];
        this.updateList = [];
        this.systemMap = new Map();
    }

    /**
     * Prepares the game state with its basics settings as specified in the supplied description.
     * @param desc Description of the game state being initialized.
     */


    _createClass(GameState, [{
        key: 'onInitialize',
        value: function onInitialize(desc) {
            if (!desc) {
                throw new Error('GameState.onInitialize - A game state description must be provided.');
            }

            if (!desc.name) {
                throw new Error('GameState.onInitialize - A valid name must be supplied for a new GameState.');
            }

            this.name = desc.name;

            if (desc.systems) {
                var count = desc.systems.length;
                for (var loop = 0; loop < count; ++loop) {
                    var systemType = desc.systems[loop].type || desc.systems[loop].name,
                        systemName = desc.systems[loop].name || desc.systems[loop].type;

                    var instance = NGEN.createSystem(systemType);
                    if (instance) {
                        this.systemMap.set(systemName, { name: systemName, type: systemType, perf: 0, instance: instance });
                    } else {
                        console.log('Failed to create system \'' + desc.systems[loop].name + '\' of type \'' + desc.systems[loop].type + '\'.');
                    }
                }
            }

            if (desc.update) {
                var _count = desc.update.length;
                for (var _loop = 0; _loop < _count; ++_loop) {
                    this.updateNames.push(desc.update[_loop]);
                }
            }
        }

        /**
         *
         * @param initArgs (InitArgs)
         */

    }, {
        key: 'resolveChildren',
        value: function resolveChildren(initArgs) {
            // TODO: Need to convert list of child names to state references.

            this.getUpdateList(this.updateList);

            initArgs.gameState = this;

            this.systemMap.forEach(function (e) {
                return e.instance.onInitialize(initArgs);
            });
        }

        /**
         * Determines whether or not this game state contains any child states.
         * @returns {boolean} True if this game state contains children otherwise false.
         */

    }, {
        key: 'getUpdateList',


        /**
         * Adds all systems in the game states update list to the supplied array.
         * @param list
         */
        value: function getUpdateList(list) {
            if (this.parent) {
                this.parent.getUpdateList(list);
            }

            var count = this.updateNames.length;
            for (var loop = 0; loop < count; ++loop) {
                var sys = this.findSystem(this.updateNames[loop]);
                if (sys) {
                    list.push(sys);
                } else {
                    console.log('Unable to locate update system \'' + this.updateNames[loop] + '\'.');
                }
            }
        }

        /**
         * Locates a system object associated with the specified name.
         * @param name Name of the system to be located, this is not the class name but the instance name.
         * @returns {GameSystem} The game system associated with the specified name or null if one could not be found.
         */

    }, {
        key: 'findSystem',
        value: function findSystem(name) {
            var system = this.systemMap.get(name);
            if (system) {
                return system;
            }

            return this.parent ? this.parent.findSystem(name) : null;
        }

        /**
         * Called each frame when any per-frame processing may take place.
         * @param updateArgs
         */

    }, {
        key: 'onUpdate',
        value: function onUpdate(updateArgs) {
            // The update list contains all systems to be updated when we are in this state, so there's no need to
            // pass the update call to our parent object.
            var count = this.updateList.length;
            for (var loop = 0; loop < count; ++loop) {
                // TODO: Record performance here
                this.updateList[loop].perf = NgenCore.getTimeStamp();
                this.updateList[loop].instance.onUpdate(updateArgs);
                this.updateList[loop].perf = NgenCore.getTimeStamp() - this.updateList[loop].perf;
            }
        }

        /**
         * This update method is performed when the title is taking performance information.
         * @param updateArgs
         */

    }, {
        key: 'onPerfUpdate',
        value: function onPerfUpdate(updateArgs) {}
    }, {
        key: 'sendPerformanceInformation',
        value: function sendPerformanceInformation(uri) {
            //
        }
    }, {
        key: 'hasChildren',
        get: function get() {
            return null != this.children && 0 != this.children.length;
        }
    }]);

    return GameState;
}();

//# sourceMappingURL=game_state-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This class is used to manage all input arriving from the keyboard.
 */

var KeyboardHandler = function (_GameSystem) {
    _inherits(KeyboardHandler, _GameSystem);

    function KeyboardHandler() {
        _classCallCheck(this, KeyboardHandler);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(KeyboardHandler).call(this));

        _this.controller = null;
        _this.keyState = [];

        for (var loop = 0; loop < 256; ++loop) {
            _this.keyState.push({
                isPressed: false
            });
        }

        var self = _this;
        $(document.body).on('keydown', function (e) {
            self.onKeyDown(e);
        });

        $(document.body).on('keyup', function (e) {
            self.onKeyUp(e);
        });
        return _this;
    }

    _createClass(KeyboardHandler, [{
        key: 'onKeyUp',
        value: function onKeyUp(e) {
            //console.log( 'KeyUp');

            if (e.keyCode < 0 || e.keyCode >= this.keyState.length) {
                throw new Error('Key press was an unknown character code!');
            }

            this.keyState[e.keyCode].isPressed = false;
        }
    }, {
        key: 'onKeyDown',
        value: function onKeyDown(e) {
            //console.log( 'Key pressed = ' + e + '.' );
            //console.log( e );

            if (e.keyCode < 0 || e.keyCode >= this.keyState.length) {
                throw new Error('Key press was an unknown character code!');
            }

            this.keyState[e.keyCode].isPressed = true;
        }
    }, {
        key: 'isPressed',
        value: function isPressed(keyCode) {
            return this.keyState[keyCode].isPressed;
        }
    }]);

    return KeyboardHandler;
}(GameSystem);

NGEN.system('KeyboardHandler', KeyboardHandler);

//# sourceMappingURL=keyboard-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This class is used to manage all input arriving from the keyboard.
 */

var MouseHandler = function (_GameSystem) {
    _inherits(MouseHandler, _GameSystem);

    function MouseHandler() {
        _classCallCheck(this, MouseHandler);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MouseHandler).call(this));

        _this.eventReceived = false;

        _this.controller = null;
        _this.clientX = 0.0;
        _this.clientY = 0.0;
        _this.deltaX = 0.0;
        _this.deltaY = 0.0;
        _this.x = 0.0;
        _this.y = 0.0;

        _this.leftDown = false;
        _this.middleDown = false;
        _this.rightDown = false;

        var self = _this;
        $(document.body).on('mousedown', function (e) {
            self.onMouseDown(e);
        });

        $(document.body).on('mouseup', function (e) {
            self.onMouseUp(e);
        });

        $(document.body).on('mouseleave', function (e) {
            self.onMouseLeave(e);
        });

        $(document.body).on('mouseenter', function (e) {
            self.onMouseEnter(e);
        });

        $(document.body).on('mousemove', function (e) {
            self.onMouseMove(e);
        });

        $('body').on('contextmenu', function (e) {
            return false;
        });
        return _this;
    }

    _createClass(MouseHandler, [{
        key: 'onUpdate',
        value: function onUpdate(updateArgs) {
            if (this.eventReceived) {
                this.deltaX = this.clientX - this.x;
                this.deltaY = this.clientY - this.y;
            } else {
                this.deltaX = 0.0;
                this.deltaY = 0.0;
            }

            this.x = this.clientX;
            this.y = this.clientY;
        }
    }, {
        key: 'onMouseUp',
        value: function onMouseUp(e) {
            if (e.button === 0) {
                this.leftDown = false;
            } else if (e.button === 1) {
                this.middleDown = false;
            } else if (e.button === 2) {
                this.rightDown = false;
            }
        }
    }, {
        key: 'onMouseDown',
        value: function onMouseDown(e) {
            if (e.button === 0) {
                this.leftDown = true;
            } else if (e.button === 1) {
                this.middleDown = true;
            } else if (e.button === 2) {
                this.rightDown = true;
            }
        }
    }, {
        key: 'onMouseLeave',
        value: function onMouseLeave(e) {
            this.clientX = e.clientX;
            this.clientY = e.clientY;

            this.leftDown = false;
            this.rightDown = false;
            this.middleDown = false;
        }
    }, {
        key: 'onMouseEnter',
        value: function onMouseEnter(e) {
            this.clientX = e.clientX;
            this.clientY = e.clientY;
        }
    }, {
        key: 'onMouseMove',
        value: function onMouseMove(e) {
            this.clientX = e.clientX;
            this.clientY = e.clientY;
            this.eventReceived = true;
        }
    }, {
        key: 'getDeltaX',
        value: function getDeltaX() {
            return this.deltaX;
        }
    }, {
        key: 'getDeltaY',
        value: function getDeltaY() {
            return this.deltaY;
        }
    }, {
        key: 'isPressed',
        value: function isPressed(mouseButton) {
            switch (mouseButton) {
                case MouseHandler.LeftButton:
                    return this.leftDown;

                case MouseHandler.RightButton:
                    return this.rightDown;

                case MouseHandler.MiddleButton:
                    return this.middleDown;
            }

            return false;
        }
    }]);

    return MouseHandler;
}(GameSystem);

MouseHandler.LeftButton = 0;
MouseHandler.MiddleButton = 1;
MouseHandler.RightButton = 2;

NGEN.system('MouseHandler', MouseHandler);

//# sourceMappingURL=mouse-compiled.js.map
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Base class for all entity components within the engine.
 */

var Component = function () {
  function Component() {
    _classCallCheck(this, Component);
  }

  /**
   * Called by the framework once all components are available for access.
   * @param initArgs {EntityInitArgs}
   */


  _createClass(Component, [{
    key: "onInitialize",
    value: function onInitialize(initArgs) {}

    /**
     * Temporary method, components are not to be updated like this. They will exist within a component
     * provider (which will be a system oject). Those objects will be expected to update their contained components.
     * @param updateArgs
     */

  }, {
    key: "onUpdate",
    value: function onUpdate(updateArgs) {
      //
    }
  }]);

  return Component;
}();

//# sourceMappingURL=component-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Describes an Entity that exists within a game world.
 * Entities consist of multiple components, a component is a sub-object that is managed by a system.
 * Entities are not updated directly, instead individual systems are updated by the framework and they contain
 * the update logic for their contained components.
 */

var Entity = function () {
    function Entity() {
        _classCallCheck(this, Entity);

        this.componentMap = new Map();
    }

    /**
     * Prepares the contained components for use by the running title.
     */


    _createClass(Entity, [{
        key: 'onInitialize',
        value: function onInitialize(initArgs) {
            this.componentMap.forEach(function (e) {
                return e.onInitialize(initArgs);
            });
        }

        /**
         * Temporary method, entities are not to be updated like this. Their components will exist within a component
         * provider (which will be a system oject). Those objects will be expected to update their contained components.
         * @param updateArgs
         */

    }, {
        key: 'onUpdate',
        value: function onUpdate(updateArgs) {
            this.componentMap.forEach(function (e) {
                return e.onUpdate(updateArgs);
            });
        }
    }, {
        key: 'getComponent',
        value: function getComponent(name) {
            return this.componentMap.get(name);
        }

        /**
         * Adds a new component to the entity.
         * @param name {String} The name the component is to be associated with.
         * @param component {Component} The component object to be added to the entity.
         * @returns {Component} Reference to the Component object that was added.
         */

    }, {
        key: 'addComponent',
        value: function addComponent(name, component) {
            if (!name) {
                throw new Error('Cannot add component without a valid name.');
            }

            if (null == component) {
                throw new Error('Component object must be valid.');
            }

            if (this.componentMap.get(name)) {
                throw new Error('Cannot add component \'' + name + '\', name has already been registered.');
            }

            this.componentMap.set(name, component);

            return component;
        }
    }]);

    return Entity;
}();

//# sourceMappingURL=entity-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Provides input control for a camera that orbits a location in 3D space.
 */

var OrbitController = function (_Component) {
    _inherits(OrbitController, _Component);

    function OrbitController() {
        _classCallCheck(this, OrbitController);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OrbitController).call(this));

        _this.halfPI = Math.PI / 2.0;
        _this.origin = new THREE.Vector3(0.0, 0.0, 0.0);

        _this.distance = 10.0;

        _this.geometry = null;
        _this.camera = null;

        _this.keyboardHandler = null;
        _this.mouseHandler = null;

        _this.movement = new THREE.Vector3();
        _this.matrix = new THREE.Matrix4();
        return _this;
    }

    /**
     * Called by the framework when we are ready to be used by the title.
     * @param initArgs {EntityInitArgs} The EntityInitArgs for the entity being initialized.
     */


    _createClass(OrbitController, [{
        key: 'onInitialize',
        value: function onInitialize(initArgs) {
            _get(Object.getPrototypeOf(OrbitController.prototype), 'onInitialize', this).call(this, initArgs);

            this.camera = initArgs.getComponent('Camera');

            this.keyboardHandler = initArgs.getSystem('KeyboardHandler');
            this.mouseHandler = initArgs.getSystem('MouseHandler');
        }

        /**
         * Applies the current movement to the players character.
         * @param updateArgs
         */

    }, {
        key: 'onUpdate',
        value: function onUpdate(updateArgs) {
            if (this.camera && this.mouseHandler) {
                if (this.mouseHandler.isPressed(MouseHandler.LeftButton)) {
                    var deltaY = OrbitController.INVERT_Y ? -this.mouseHandler.getDeltaY() : this.mouseHandler.getDeltaY();

                    this.camera.rotationY -= Math.PI * 2 * this.mouseHandler.getDeltaX() * OrbitController.MOUSE_SENSITIVITY * updateArgs.deltaTime;
                    this.camera.rotationX += Math.PI * 2 * deltaY * OrbitController.MOUSE_SENSITIVITY * updateArgs.deltaTime;

                    this.camera.rotationX = Math.max(-this.halfPI, this.camera.rotationX);
                    this.camera.rotationX = Math.min(this.halfPI, this.camera.rotationX);
                }
            }
        }
    }]);

    return OrbitController;
}(Component);

// Eventually these properties will be exposed in the editor, for now they're globally accessible variables so they
// can be modified via the Javascript console.


OrbitController.TWO_PI = Math.PI * 2;
OrbitController.INVERT_Y = false;
OrbitController.MOUSE_SENSITIVITY = 0.1;

//# sourceMappingURL=orbit_controller-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Passed to each component during entity initialisation. Allowing them access to the arguments.
 */

var EntityInitArgs = function () {
    function EntityInitArgs() {
        _classCallCheck(this, EntityInitArgs);

        this.world = null;
        this.entity = null;
        this.gameState = null;
    }

    /**
     * Retrieves a named entity from the world.
     * @param name {String} Name of the entity to be retrieved.
     * @returns {Entity} Entity associated with the specified name.
     */


    _createClass(EntityInitArgs, [{
        key: 'getEntity',
        value: function getEntity(name) {
            return this.world.getEntity(name);
        }

        /**
         * Retrieves a component from the entity being initialized.
         * @param name {String} Name of the component to be retrieved.
         * @returns {*}
         */

    }, {
        key: 'getComponent',
        value: function getComponent(name) {
            if (this.entity) {
                var component = this.entity.getComponent(name);
                if (!component) {
                    console.log('Unable to locate component \'' + name + '\'.');
                }

                return component;
            }

            return null;
        }

        /**
         * Retrieves an accessible system from the available hierarchy.
         * @param name Name of the system to be retrieved.
         * @returns {*}
         */

    }, {
        key: 'getSystem',
        value: function getSystem(name) {
            if (this.gameState) {
                return this.gameState.findSystem(name).instance;
            }

            return null;
        }
    }]);

    return EntityInitArgs;
}();

//# sourceMappingURL=entity_init_args-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CameraComponent = function (_Component) {
    _inherits(CameraComponent, _Component);

    function CameraComponent() {
        _classCallCheck(this, CameraComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CameraComponent).call(this));

        _this.physics = null;
        _this.distance = 7.0;
        _this.rotationY = 0.0;
        _this.rotationX = 0.0;
        _this.direction = { x: 0, y: 0, z: 0 };
        _this.position = { x: 0, y: 0, z: 1 };
        _this.delta = { x: 0, y: 0, z: 0 };
        _this.fieldOfView = 75.0;
        _this.nearPlane = 1.0;
        _this.farPlane = 1000.0;
        _this.up = new THREE.Vector3(0.0, 1.0, 0.0);
        _this.target = new THREE.Vector3(0.0, 0.0, 0.0);
        _this.targetOffset = new THREE.Vector3(0.0, 1.0, 0.0);
        _this.matrix = new THREE.Matrix4();
        _this.orientation = new THREE.Quaternion();
        return _this;
    }

    _createClass(CameraComponent, [{
        key: 'onInitialize',
        value: function onInitialize(initArgs) {
            _get(Object.getPrototypeOf(CameraComponent.prototype), 'onInitialize', this).call(this, initArgs);

            this.physics = initArgs.getComponent('Physics');
        }
    }, {
        key: 'onUpdate',
        value: function onUpdate(updateArgs) {
            this.direction.x = Math.sin(this.rotationY) * Math.cos(this.rotationX);
            this.direction.y = Math.sin(this.rotationX);
            this.direction.z = Math.cos(this.rotationY) * Math.cos(this.rotationX);

            if (this.physics) {
                this.position.x = this.physics.position.x + this.direction.x * this.distance;
                this.position.y = this.physics.position.y + this.direction.y * this.distance;
                this.position.z = this.physics.position.z + this.direction.z * this.distance;

                this.position.y += 3;

                this.target.copy(this.physics.position);
                this.target.add(this.targetOffset);
            } else {
                this.position.x = this.direction.x * 10.0;
                this.position.y = this.direction.y * 10.0;
                this.position.z = this.direction.z * 10.0;
            }

            //this.matrix.lookAt( this.physics.position, this.position, this.up );
            this.matrix.lookAt(this.position, this.target, this.up);
            this.orientation.setFromRotationMatrix(this.matrix);
        }
    }, {
        key: 'getCameraArgs',
        value: function getCameraArgs(cameraArgs) {
            cameraArgs.fov = this.fieldOfView;
            cameraArgs.near = this.nearPlane;
            cameraArgs.far = this.farPlane;

            cameraArgs.position.x = this.position.x;
            cameraArgs.position.y = this.position.y;
            cameraArgs.position.z = this.position.z;

            cameraArgs.rotation.setFromQuaternion(this.orientation);
        }
    }]);

    return CameraComponent;
}(Component);

//# sourceMappingURL=camera_component-compiled.js.map
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Used to manage the physical representation of the game world.
 * This physics implementation is very simple, we don't need anything complicated
 * for what we're trying to achieve currently. If we want to add more complicated
 * physical properties in the future we will probably use a third-party physics engine.
 */

var Physics = function (_GameSystem) {
    _inherits(Physics, _GameSystem);

    /**
     *
     */

    function Physics() {
        _classCallCheck(this, Physics);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Physics).call(this));

        _this.objectList = [];
        _this.gravity = { x: 0, y: -9.807, z: 0 };
        _this.floor = { x: 0, y: 1, z: 0, d: 0 };
        return _this;
    }

    /**
     * Performs any per-frame processing necessary within the physics system.
     * @param updateArgs
     */


    _createClass(Physics, [{
        key: "onUpdate",
        value: function onUpdate(updateArgs) {
            var count = this.objectList.length;
            for (var loop = 0; loop < count; ++loop) {
                this.objectList[loop].applyForce(this.gravity.x, this.gravity.y, this.gravity.z);
                this.objectList[loop].onUpdate(updateArgs);
            }

            // TODO: Resolve collisions, for now we'll just hard code a floor and the box size (really bad!).
            for (var _loop = 0; _loop < count; ++_loop) {
                var obj = this.objectList[_loop];

                // Dot floor normal with object position.
                var d = obj.position.x * this.floor.x + obj.position.y * this.floor.y + obj.position.z * this.floor.z - this.floor.d;

                // If the object intersects the floor, push it back out
                if (d < obj.dimensions.height) {
                    // Hard coded to height, should be based on orientation
                    obj.position.x += this.floor.x * (obj.dimensions.height - d);
                    obj.position.y += this.floor.y * (obj.dimensions.height - d);
                    obj.position.z += this.floor.z * (obj.dimensions.height - d);

                    // Also cut the velocity that is causing the object to penetrate our object
                    obj.velocity.x -= this.floor.x * obj.velocity.x;
                    obj.velocity.y -= this.floor.y * obj.velocity.y;
                    obj.velocity.z -= this.floor.z * obj.velocity.z;
                }
            }
        }

        /**
         * Creates a new physical box primitive within the scene.
         * @param width
         * @param height
         * @param depth
         * @returns {Physics.Primitive}
         */

    }, {
        key: "createBox",
        value: function createBox(width, height, depth) {
            var primitive = new Physics.Primitive(width, height, depth);
            this.objectList.push(primitive);
            return primitive;
        }
    }]);

    return Physics;
}(GameSystem);

/**
 * Base class for all physical primitives.
 * The current implementatino does not simulate angular velocity. So you cannot current apply a force at a particular
 * location on the object. This will be added in the future.
 * @type {Physics.Primitive}
 */


Physics.Primitive = function (_Component) {
    _inherits(_class, _Component);

    function _class(w, h, d) {
        _classCallCheck(this, _class);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this));

        _this2.dimensions = { width: w / 2, height: h / 2, depth: d / 2 };
        _this2.position = new THREE.Vector3(0.0, 0.0, 0.0);
        _this2.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
        _this2.impulse = new THREE.Vector3(0.0, 0.0, 0.0);
        _this2.force = new THREE.Vector3(0.0, 0.0, 0.0);
        _this2.cor = 1.0; // Coefficient of restitution
        _this2.damping = 0.8;
        return _this2;
    }

    _createClass(_class, [{
        key: "setPosition",
        value: function setPosition(x, y, z) {
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;

            return this;
        }

        /**
         * Applies a force to the object in world space.
         * @param fx
         * @param fy
         * @param fz
         */

    }, {
        key: "applyForce",
        value: function applyForce(fx, fy, fz) {
            this.force.x += fx;
            this.force.y += fy;
            this.force.z += fz;

            return this;
        }

        /**
         * Applies a force to the object in its local space.
         * @param fx
         * @param fy
         * @param fz
         */

    }, {
        key: "applyLocalForce",
        value: function applyLocalForce(fx, fy, fz) {
            // TODO: Rotate force to objects world space and call applyForce.
            this.force.x += fx;
            this.force.y += fy;
            this.force.z += fz;

            return this;
        }

        /**
         * Applies an impulsive force to the object in world space. An impulsive force directly affects the objects velocity. Impulsive
         * forces are not really physically correct and you should prefer to apply forces with the applyForce when possible.
         * @param ix
         * @param iy
         * @param iz
         */

    }, {
        key: "applyImpulse",
        value: function applyImpulse(ix, iy, iz) {
            this.impulse.x += ix;
            this.impulse.y += iy;
            this.impulse.z += iz;

            return this;
        }

        /**
         * Applies an impulsive force to the object in local space. An impulsive force directly affects the objects velocity. Impulsive
         * forces are not really physically correct and you should prefer to apply forces with the applyForce when possible.
         * @param ix
         * @param iy
         * @param iz
         */

    }, {
        key: "applyLocalImpulse",
        value: function applyLocalImpulse(ix, iy, iz) {
            // TODO: Rotate force to objects world space and call applyImpulse
            this.impulse.x += ix;
            this.impulse.y += iy;
            this.impulse.z += iz;

            return this;
        }

        /**
         * Updates the primitives location and velocity.
         * @param updateArgs
         */

    }, {
        key: "onUpdate",
        value: function onUpdate(updateArgs) {
            this.velocity.x += this.impulse.x + this.force.x * updateArgs.deltaTime;
            this.velocity.y += this.impulse.y + this.force.y * updateArgs.deltaTime;
            this.velocity.z += this.impulse.z + this.force.z * updateArgs.deltaTime;

            // Apply damping?
            /*        let str = this.velocity.lengthSq();
             if ( str ) {
             str = Math.sqrt(str);
             str = str * str;
              this.velocity.x -= this.velocity.x * str * this.damping * updateArgs.deltaTime;
             this.velocity.y -= this.velocity.y * str * this.damping * updateArgs.deltaTime;
             this.velocity.z -= this.velocity.z * str * this.damping * updateArgs.deltaTime;
             }
             */
            //this.velocity.x -= this.velocity.x * this.damping * updateArgs.deltaTime;
            //this.velocity.y -= this.velocity.y * this.damping * updateArgs.deltaTime;
            //this.velocity.z -= this.velocity.z * this.damping * updateArgs.deltaTime;

            var theta = 1.0 - this.damping * updateArgs.deltaTime;
            this.velocity.multiplyScalar(theta);

            // Clear the forces affecting this object for the next frame.
            this.impulse.x = 0;
            this.impulse.y = 0;
            this.impulse.z = 0;
            this.force.x = 0;
            this.force.y = 0;
            this.force.z = 0;

            // Now apply forces to the objects velocity
            this.position.x += this.velocity.x * updateArgs.deltaTime;
            this.position.y += this.velocity.y * updateArgs.deltaTime;
            this.position.z += this.velocity.z * updateArgs.deltaTime;
        }
    }]);

    return _class;
}(Component);

NGEN.system("Physics", Physics);

//# sourceMappingURL=physics-compiled.js.map


//# sourceMappingURL=world-compiled.js.map
"use strict";
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Contains a collection of particle systems active within the running title.
 */

var ParticleSystemProvider = function (_GameSystem) {
    _inherits(ParticleSystemProvider, _GameSystem);

    function ParticleSystemProvider() {
        _classCallCheck(this, ParticleSystemProvider);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ParticleSystemProvider).call(this));

        _this.particleSystems = new Map();
        return _this;
    }

    /**
     * Prepares the system object for use by the application.
     * @param initArgs
     */


    _createClass(ParticleSystemProvider, [{
        key: 'onInitialize',
        value: function onInitialize(initArgs) {}
        //

        /**
         * Deletes all particle systems within the provider and any associated GPU resources.
         */

    }, {
        key: 'onShutdown',
        value: function onShutdown() {
            this.particleSystems.forEach(function (e) {
                return e.dispose();
            });
            this.particleSystems.clear();
        }

        /**
         * Called each frame when we may perform any necessary per-frame processing.
         * @param updateArgs {UpdateArgs} Miscellaneous variables for the current update frame.
         */

    }, {
        key: 'onUpdate',
        value: function onUpdate(updateArgs) {
            this.particleSystems.forEach(function (e) {
                return e.onUpdate(updateArgs);
            });
        }

        /**
         * Retreives a particle system with a specified name.
         * @param name {String} Name of the particle system to be retrieved.
         * @returns {ParticleSystem} The particle system associated with the specified name, if one could not be found returns undefined.
         */

    }, {
        key: 'getParticleSystem',
        value: function getParticleSystem(name) {
            return this.particleSystems.get(name);
        }

        /**
         * Creates a new particle system and makes it available for use by the running title.
         * @param name
         */

    }, {
        key: 'createPointParticleSystem',
        value: function createPointParticleSystem(name) {
            var system = new PointParticleSystem();

            this.particleSystems.set(name, system);

            return system;
        }
    }, {
        key: 'createLineParticleSystem',
        value: function createLineParticleSystem(name) {
            var system = new LineParticleSystem();

            this.particleSystems.set(name, system);

            return system;
        }
    }]);

    return ParticleSystemProvider;
}(GameSystem);

NGEN.system('ParticleSystemProvider', ParticleSystemProvider);

//# sourceMappingURL=particle_system_provider-compiled.js.map
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Base class for all particle systems supported by NGEN.
 *
 * Interesting links:
 * http://www.slideshare.net/proyZ/relics-fx-system
 * http://simonschreibt.de/gat/company-of-heroes-shaded-smoke/
 */

var ParticleSystem = function () {
    function ParticleSystem() {
        _classCallCheck(this, ParticleSystem);

        this.name = null;
        this.enabled = true;
        this.gravity = new THREE.Vector3(0.0, 0.0, 0.0);
        this.position = new THREE.Vector3(0, 0, 0);
        this.maxParticles = 512;
        this.particleCount = 0;
        this.particles = [];
        this.emitters = [];
        this.mesh = null;

        for (var loop = 0; loop < this.maxParticles; ++loop) {
            this.particles.push(new Particle());
        }
    }

    /**
     * Releases all GPU resources associated with this particle system.
     */


    _createClass(ParticleSystem, [{
        key: "dispose",
        value: function dispose() {
            this.clear();
        }

        /**
         * Destroys all particles that are currently live within the particle system.
         */

    }, {
        key: "clear",
        value: function clear() {
            this.particleCount = 0;
            this.geometry.drawRange.count = 0;
        }

        /**
         * Called each frame when it is time to perform any per-frame processing.
         * @param updateArgs
         */

    }, {
        key: "onUpdate",
        value: function onUpdate(updateArgs) {
            this.emitters.forEach(function (e) {
                return e.onUpdate(updateArgs);
            });
        }
    }, {
        key: "createEmitter",
        value: function createEmitter() {
            // TODO: Also need to be able to delete emitters
            var emitter = new ParticleEmitter(this);
            this.emitters.push(emitter);

            return emitter;
        }

        /**
         * Attempts to emit a new particle within the particle system.
         * @returns {Particle} The particle emitted within the particle system, if no particles are available this method returns null.
         */

    }, {
        key: "emitParticle",
        value: function emitParticle() {
            if (this.particleCount < this.maxParticles) {
                var particle = this.particles[this.particleCount++];
                particle.reset();
                return particle;
            }

            return null;
        }
    }]);

    return ParticleSystem;
}();

//# sourceMappingURL=particle_system-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Implements a particle system that represents particles as liens.
 * NOTE: Currently lines always face along the z-axis, however this will be improved in the future.
 */

var LineParticleSystem = function (_ParticleSystem) {
    _inherits(LineParticleSystem, _ParticleSystem);

    function LineParticleSystem() {
        _classCallCheck(this, LineParticleSystem);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LineParticleSystem).call(this));

        _this.center = new THREE.Vector3(0.0, 1.0, 0.0);
        _this.calc = new THREE.Vector3();
        _this.delta = new THREE.Vector3();

        // If using THREE.BufferGeometry, class contains a drawRange variable that contains start and count variables

        //this.texture = THREE.ImageUtils.loadTexture( 'game/textures/particles/glow_1.jpg' );
        //this.texture = THREE.ImageUtils.loadTexture( 'game/textures/particles/cloud_2.png' );
        //this.texture = THREE.ImageUtils.loadTexture( 'game/textures/particles/fire_1.jpg' );
        _this.texture = THREE.ImageUtils.loadTexture('game/textures/particles/fire_2.jpg');
        //this.texture = THREE.ImageUtils.loadTexture( 'game/textures/particles/blue_ring.jpg' );
        //this.texture = THREE.ImageUtils.loadTexture( 'game/textures/particles/flash_1.png' );
        //this.texture = THREE.ImageUtils.loadTexture( 'game/textures/particles/tracer_sprite.jpg' );
        //this.texture = THREE.ImageUtils.loadTexture( 'game/textures/particles/Particle_Cloud.png' );

        // TODO: Index buffer for collection of quads can be shared across the entire application. Rather than one per particle system

        _this.indices = new Uint16Array(_this.maxParticles * 6); // Two triangles per quad, 3 indices per triangle
        _this.uvs = new Float32Array(_this.maxParticles * 8);
        _this.positions = new Float32Array(_this.maxParticles * 4 * 3);

        for (var loop = 0; loop < _this.maxParticles; ++loop) {
            _this.indices[loop * 6 + 0] = loop * 4 + 0;
            _this.indices[loop * 6 + 1] = loop * 4 + 1;
            _this.indices[loop * 6 + 2] = loop * 4 + 3;

            _this.indices[loop * 6 + 3] = loop * 4 + 1;
            _this.indices[loop * 6 + 4] = loop * 4 + 2;
            _this.indices[loop * 6 + 5] = loop * 4 + 3;

            _this.uvs[loop * 8 + 0] = 0.0;
            _this.uvs[loop * 8 + 1] = 0.0;

            _this.uvs[loop * 8 + 2] = 1.0;
            _this.uvs[loop * 8 + 3] = 0.0;

            _this.uvs[loop * 8 + 4] = 1.0;
            _this.uvs[loop * 8 + 5] = 1.0;

            _this.uvs[loop * 8 + 6] = 0.0;
            _this.uvs[loop * 8 + 7] = 1.0;
        }

        // Custom colors coming in the future

        _this.geometry = new THREE.BufferGeometry();
        _this.geometry.addAttribute('position', new THREE.BufferAttribute(_this.positions, 3));
        _this.geometry.addAttribute('uvs', new THREE.BufferAttribute(_this.uvs, 2));
        _this.geometry.setIndex(new THREE.BufferAttribute(_this.indices, 1));

        _this.geometry.drawRange.count = 0;

        _this.material = new THREE.ShaderMaterial({
            uniforms: {
                texture: { type: 't', value: _this.texture }
            },
            vertexShader: NGEN.shaderProvider.getShader('line_particle_vs'),
            fragmentShader: NGEN.shaderProvider.getShader('line_particle_ps'),
            depthWrite: false,
            depthTest: true,
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        _this.mesh = new THREE.Mesh(_this.geometry, _this.material);
        return _this;
    }

    _createClass(LineParticleSystem, [{
        key: 'rotateZ',
        value: function rotateZ(baseIndex, count, rotation) {
            var phi = Math.cos(rotation);
            var theta = Math.sin(rotation);

            for (var loop = 0; loop < count; ++loop) {
                var x = this.positions[baseIndex + 0];
                var y = this.positions[baseIndex + 1];

                this.positions[baseIndex + 0] = x * phi - y * theta;
                this.positions[baseIndex + 1] = x * theta + y * phi;
            }
        }

        /**
         * Called each frame when it is time to perform any per-frame processing.
         * @param updateArgs
         */

    }, {
        key: 'onUpdate',
        value: function onUpdate(updateArgs) {
            _get(Object.getPrototypeOf(LineParticleSystem.prototype), 'onUpdate', this).call(this, updateArgs);

            for (var loop = 0; loop < this.particleCount;) {
                var particle = this.particles[loop];

                particle.age += updateArgs.deltaTime;
                if (particle.age >= particle.maxAge) {
                    this.particles[loop] = this.particles[--this.particleCount];
                    this.particles[this.particleCount] = particle;
                } else {
                    particle.force.aadd(this.gravity);

                    particle.velocity.x += particle.force.x * updateArgs.deltaTime;
                    particle.velocity.y += particle.force.y * updateArgs.deltaTime;
                    particle.velocity.z += particle.force.z * updateArgs.deltaTime;

                    particle.position.x += particle.velocity.x * updateArgs.deltaTime;
                    particle.position.y += particle.velocity.y * updateArgs.deltaTime;
                    particle.position.z += particle.velocity.z * updateArgs.deltaTime;

                    particle.force.set(0, 0, 0);

                    ++loop;
                }
            }

            // Create geometry for our lines
            var count = this.particleCount;
            for (var _loop = 0; _loop < count; ++_loop) {
                var _particle = this.particles[_loop];

                this.delta.subVectors(_particle.end, _particle.start);

                var rotation = Math.atan2(this.delta.y, this.delta.x);
                var length = this.delta.length();

                var t = _particle.age / _particle.maxAge;

                this.positions[_loop * 3 + 0] = _particle.position.x;
                this.positions[_loop * 3 + 1] = _particle.position.y;
                this.positions[_loop * 3 + 2] = _particle.position.z;

                this.rotateZ(_loop * 4, 4, rotation);
                //const clr = NgenCore.lerp( particle.startAlpha, particle.endAlpha, t );
            }

            this.geometry.attributes.position.needsUpdate = true;

            //this.geometry.verticesNeedUpdate = true;
            //this.geometry.colorsNeedUpdate = true;
            this.geometry.setDrawRange(0, this.particleCount * 6); // * 6 for number of indices?
        }
    }]);

    return LineParticleSystem;
}(ParticleSystem);

//# sourceMappingURL=line_particle_system-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A ParticleEmitter is an object that emits particles within a parent particle system, an emitter has a position
 * and orientation.
 *
 * QUERY: Should ParticleEmitter be a component?
 */

var ParticleEmitter = function (_Component) {
    _inherits(ParticleEmitter, _Component);

    function ParticleEmitter(particleSystem) {
        _classCallCheck(this, ParticleEmitter);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ParticleEmitter).call(this));

        _this.motionDistance = 2.0;
        _this.moveTimer = 0.0; // TODO: Should be inside a motion controller component of some kind

        _this.particleSystem = particleSystem;
        _this.timer = 0.0;
        _this.parent = null;
        _this.enabled = true;
        _this.targetEpsilon = 0.2;
        _this.targetPosition = new THREE.Vector3(0, 3, 0);
        _this.position = new THREE.Vector3(0, 3, 0);
        _this.offset = new THREE.Vector3(2, 2, 0);
        _this.orientation = new THREE.Quaternion();
        _this.emitPerSecond = 120;

        //
        // Falling sparks
        /*        this.posRangeX = new Range( -20, 20 );
                this.posRangeY = new Range( 10, 10 );
                this.posRangeZ = new Range( -20, 20 );
                this.velRangeX = new Range( -1, 1);
                this.velRangeY = new Range( -5, -1 );
                this.velRangeZ = new Range( -1, 1 );
                //this.startSize = new Range( 0.1, 0.5 );
                this.startSize = new Range( 0.0, 0.0 );
                //this.endSize = new Range( 2, 4 );
                this.endSize = new Range( 128, 128 );
                this.maxAge = new Range( 3, 5 );
                this.startAlphaRange = new Range( 0.4, 0.8 );
                this.endAlphaRange = new Range( 0, 0 );
        */
        // Glow
        /*        this.startAlphaRange = new Range( 0.08, 0.1 );
                this.endAlphaRange = new Range( 0, 0.0 );
                this.angleRangeA = new Range( -Math.PI, Math.PI );
                this.angleRangeB = new Range( -Math.PI, Math.PI );
                this.radiusRange = new Range( 0.3, 0.6 );
                this.strengthRange = new Range( 1.0, 4 );
                this.startSize = new Range( 0.1, 0.1 );
                this.endSize = new Range( 8, 8 );
                this.maxAge = new Range( 3, 5 );
        */
        // Jet
        _this.startAlphaRange = new Range(0.2, 0.3);
        _this.endAlphaRange = new Range(0, 0.0);
        _this.angleRangeA = new Range(-Math.PI / 32, Math.PI / 32);
        _this.angleRangeB = new Range(-Math.PI / 32, Math.PI / 32);
        _this.radiusRange = new Range(0.3, 0.6);
        _this.strengthRange = new Range(1, 4);
        _this.startSize = new Range(4, 8);
        _this.endSize = new Range(0, 0);
        _this.maxAge = new Range(0.3, 0.6);
        return _this;
    }

    _createClass(ParticleEmitter, [{
        key: 'onInitialize',
        value: function onInitialize(initArgs) {
            var player = initArgs.getEntity('player');
            if (player) {
                this.parent = player.getComponent('Physics');
            }
        }

        /**
         * Called each frame, allowing new particles to be emitted.
         * @param updateArgs
         */

    }, {
        key: 'onUpdate',
        value: function onUpdate(updateArgs) {
            if (this.parent) {
                this.targetPosition.addVectors(this.parent.position, this.offset);
            } else {
                this.targetPosition.copy(this.offset);
            }

            var delta = 0.2;

            this.moveTimer += updateArgs.deltaTime;
            this.position.set(Math.cos(this.moveTimer * 2), 0.0, Math.sin(this.moveTimer * 2));
            this.position.y += Math.sin(this.moveTimer * 8) * delta;

            this.position.multiplyScalar(this.motionDistance);
            this.position.add(this.offset);
            //this.position.addVectors( this.parent.position, this.offset );
            this.particleSystem.position.set(this.position.x, this.position.y, this.position.z);

            if (this.enabled) {
                this.timer += updateArgs.deltaTime;

                var d = 1.0 / this.emitPerSecond;
                while (this.timer > d) {
                    this.spawnGlow();
                    //this.spawnNormal();
                    this.timer -= d;
                }
            }
        }
    }, {
        key: 'spawnGlow',
        value: function spawnGlow() {
            var particle = this.particleSystem.emitParticle();
            if (particle) {
                var angleA = this.angleRangeA.random();
                var angleB = this.angleRangeB.random();
                var r = this.radiusRange.random();
                var strength = this.strengthRange.random();

                var theta = Math.cos(angleB);

                //particle.position.x = Math.cos( angleA ) * theta;
                //particle.position.y = Math.sin( angleB );
                //particle.position.z = Math.sin( angleA ) * theta;
                //particle.position.multiplyScalar( r );

                particle.position.set(this.position.x, this.position.y, this.position.z);

                particle.velocity.x = Math.cos(angleA) * theta;
                particle.velocity.y = Math.sin(angleB);
                particle.velocity.z = Math.sin(angleA) * theta;
                particle.velocity.multiplyScalar(strength);

                particle.startAlpha = this.startAlphaRange.random();
                particle.endAlpha = this.endAlphaRange.random();

                particle.startSize = this.startSize.random();
                particle.endSize = this.endSize.random();

                particle.maxAge = this.maxAge.random();

                // TODO: Calculate starting position
                // TODO: Calculate starting velocity
                // TODO: Calculate starting size
                // TODO: Calculate max age

                // TODO: Rotate particle position using emitter orientation and position

                particle.position.add(this.position); // Translate to particle system space based on emitter position

                //particle.
            }
        }
    }, {
        key: 'spawnNormal',
        value: function spawnNormal() {
            var particle = this.particleSystem.emitParticle();
            if (particle) {
                // TEMP: Generate some particles for testing
                particle.position.x = this.posRangeX.random();
                particle.position.y = this.posRangeY.random();
                particle.position.z = this.posRangeZ.random();

                particle.velocity.x = this.velRangeX.random();
                particle.velocity.y = this.velRangeY.random();
                particle.velocity.z = this.velRangeZ.random();

                particle.startAlpha = this.startAlphaRange.random();
                particle.endAlpha = this.endAlphaRange.random();

                particle.startSize = this.startSize.random();
                particle.endSize = this.endSize.random();

                particle.maxAge = this.maxAge.random();

                // TODO: Calculate starting position
                // TODO: Calculate starting velocity
                // TODO: Calculate starting size
                // TODO: Calculate max age

                // TODO: Rotate particle position using emitter orientation and position

                particle.position.add(this.position); // Translate to particle system space based on emitter position

                //particle.
            }
        }
    }, {
        key: 'emitCone',
        value: function emitCone() {
            var particle = this.particleSystem.emitParticle();
            if (particle) {
                var strength = this.strengthRange.random();
                var angleA = this.angleRangeA.random();
                var angleB = this.angleRangeB.random();

                var theta = Math.cos(angleB);

                particle.position.set(this.position.x, this.position.y, this.position.z);
                particle.velocity.set(Math.cos(angleA) * theta, Math.sin(angleB), Math.sin(angleA) * theta);
                particle.velocity.multiplyScalar(strength);

                particle.startSize = this.startSize.random();
                particle.endSize = this.endSize.random();
                particle.startAlpha = this.startAlpha.random();
                particle.endAlpha = this.endAlpha.random();
                particle.maxAge = this.maxAge.random();
            }
        }

        // gamedevelopment.tutsplus.com/tutorials/how-to-generate-shockingly-good-2d-lightning-effects-gamedev-2681

    }, {
        key: 'generateSprites',
        value: function generateSprites() {
            var _this2 = this;

            this.lines.forEach(function (e) {
                _this2.tangent.subVectors(e.end, e.start);
                var rotation = Math.atan2(_this2.tangent.y, _this2.tangent.x);

                _this2.addSprite(e.start, rotation, center);
            });
        }
    }, {
        key: 'addSprite',
        value: function addSprite(halfLength, halfHeight, rotation, center) {
            var baseVertex = this.vertexCount;

            // Point A
            this.vertices[baseVertex + 0] = -halfLength; // x
            this.vertices[baseVertex + 1] = halfHeight; // y
            this.vertices[baseVertex + 2] = 0.0; // z

            // Point B
            this.vertices[baseVertex + 3] = halfLength; // x
            this.vertices[baseVertex + 4] = halfHeight; // y
            this.vertices[baseVertex + 5] = 0.0; // z

            // Point C
            this.vertices[baseVertex + 6] = halfLength; // x
            this.vertices[baseVertex + 7] = -halfHeight; // y
            this.vertices[baseVertex + 8] = 0.0; // z

            // Point D
            this.vertices[baseVertex + 9] = -halfLength; // x
            this.vertices[baseVertex + 10] = -halfHeight; // y
            this.vertices[baseVertex + 11] = 0.0; // z

            // TODO: Rotate points based on rotation parameter

            // TODO: Generate other three vertices

            // Shift vertices into local space
            this.vertices[baseVertex + 0] = center.x;
            this.vertices[baseVertex + 1] = center.y;
            this.vertices[baseVertex + 2] = center.z;

            this.vertexCount += 4;
        }
    }, {
        key: 'emitLine',
        value: function emitLine() {
            //
        }
    }]);

    return ParticleEmitter;
}(Component);

//# sourceMappingURL=particle_emitter-compiled.js.map
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a single particle within a particle system.
 */

var Particle = function () {
    function Particle() {
        _classCallCheck(this, Particle);

        this.age = 0;
        this.maxAge = 0;
        this.endSize = 0;
        this.startSize = 0;
        this.startAlpha = 0;
        this.endAlpha = 0;
        this.position = new THREE.Vector3();
        this.force = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
    }

    /**
     * Ensures all internal variables are at their default setting.
     */


    _createClass(Particle, [{
        key: "reset",
        value: function reset() {
            this.age = 0;
            this.maxAge = 0;
            this.endSize = 0;
            this.startSize = 0;
            this.startAlpha = 0;
            this.endAlpha = 0;
            this.position.set(0, 0, 0);
            this.force.set(0, 0, 0);
            this.velocity.set(0, 0, 0);
        }
    }]);

    return Particle;
}();

//# sourceMappingURL=particle-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * The display manager maintains a list of display resources that are shared between all display ports.
 * It also contains a list of display port definitions, allowing the title to create an instance of one.
 * The display manager always has a display resource named 'backbuffer' which describes the current display surface
 * for the title.
 */

var DisplayManager = function () {
    function DisplayManager() {
        _classCallCheck(this, DisplayManager);

        this.resourceMap = new Map();
        this.portDefinitions = new Map();
        this.displayPorts = [];
        this.backBuffer = DisplayResource.createBackBuffer();

        this.resourceMap.set(this.backBuffer.name, this.backBuffer);

        // NOTE: Might be better if we embed 'drawFullscreenTri' or something within our own renderer wrapper.

        var fullscreenVerts = new THREE.BufferAttribute(new Float32Array(3 * 3), 3); // TODO: 2D only needs two float [x,y]

        this.fullscreenTri = new THREE.BufferGeometry();
        this.fullscreenTri.addAttribute('position', fullscreenVerts);

        // TODO: This triangle currently fits the top left of the display (for debugging) eventually it should extend
        //       so that the triangle covers the entire display.
        fullscreenVerts.array[0] = -1.0;
        fullscreenVerts.array[1] = -1.0;
        fullscreenVerts.array[2] = 0.0;

        fullscreenVerts.array[3] = 1.0;
        fullscreenVerts.array[4] = -1.0;
        fullscreenVerts.array[5] = 0.0;

        fullscreenVerts.array[6] = -1.0;
        fullscreenVerts.array[7] = 1.0;
        fullscreenVerts.array[8] = 0.0;
    }

    _createClass(DisplayManager, [{
        key: 'setDisplaySize',
        value: function setDisplaySize(width, height) {
            this.backBuffer.width = width;
            this.backBuffer.height = height;

            // TODO: Resources need to be re-created if dimensions have changed.
        }
    }, {
        key: 'onInitialize',
        value: function onInitialize() {
            var _this = this;

            this.resourceMap.forEach(function (e) {
                return e.onInitialize(_this);
            });
        }

        /**
         * Destroys any GPU resources currently in use by the application.
         */

    }, {
        key: 'dispose',
        value: function dispose() {
            // First dispose all resource in use by any display ports.
            var portCount = this.displayPorts.length;
            for (var loop = 0; loop < portCount; ++loop) {
                this.displayPorts[loop].dispose();
            }

            // Next dispose of any resources in use by the shared display resources
            this.resourceMap.forEach(function (e) {
                return e.dispose();
            });
        }

        /**
         * Registers a new display configuration with the display manager.
         * @param config Description of the display that is to be made available.
         */

    }, {
        key: 'registerConfig',
        value: function registerConfig(config) {
            if (config) {
                if (config.resources) {
                    // Register shared resources, note that the actual GPU resources are not created at this point.
                    var count = config.resources.length;
                    for (var loop = 0; loop < count; ++loop) {
                        var def = config.resources[loop];
                        if (this.resourceMap.get(def.name)) {
                            console.log('Unable to create resource \'' + def.name + '\', name already in use.');
                        } else {
                            var resource = new DisplayResource(def);
                            if (resource) {
                                this.resourceMap.set(resource.name, resource);
                            }
                        }
                    }
                }

                if (config.displayPorts) {
                    // Register the display port definitions that are available for use within the application.
                    var _count = config.displayPorts.length;
                    for (var _loop = 0; _loop < _count; ++_loop) {
                        var _def = config.displayPorts[_loop];
                        if (this.portDefinitions[_def.name]) {
                            console.log('Unable to register display port \'' + _def.name + '\', name already in use.');
                        } else {
                            var port = new DisplayPortDefinition(_def);
                            if (port) {
                                this.portDefinitions.set(_def.name, port);
                            }
                        }
                    }
                }
            } else {
                console.log('DisplayManager.registerConfig - Cannot process null configuration.');
            }
        }

        /**
         * Attempts to locate a display resource that has been associated with a specified name.
         * @param name The name of the resource to be retrieved.
         * @returns {*} The resource associated with the specified name if one could not be found this method returns null.
         */

    }, {
        key: 'findResource',
        value: function findResource(name) {
            if (!name) {
                throw new Error('DisplayManager - Unable to locate display resource without a valid name.');
            }

            var resource = this.resourceMap.get(name);
            if (!resource) {
                console.log('Unable to locate resource \'' + name + '\'.');
                return null;
            }

            return this.resourceMap.get(name);
        }

        /**
         * Renders all display ports that are currently enabled.
         * @param renderArgs {RenderArgs} Description of the frame currently being rendered.
         */

    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            this.displayPorts.forEach(function (e) {
                return e.onRender(renderArgs);
            });
        }

        /**
         * Creates a display port using a specified description.
         * @param name {String} Name of the display port definition to be created.
         * @returns {DisplayPort} A new instance of the specified display port, if the definition could not be found this method returns undefined.
         */

    }, {
        key: 'createDisplayPort',
        value: function createDisplayPort(name) {
            var def = this.portDefinitions.get(name);
            if (!def) {
                console.log('Unable to create display port \'' + name + '\', definition could not be found.');
                return undefined;
            }

            console.log('Creating display port ' + name);

            var displayPort = def.create(this, name);
            this.displayPorts.push(displayPort);

            displayPort.onInitialize();

            return displayPort;
        }
    }]);

    return DisplayManager;
}();

//# sourceMappingURL=display_manager-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A display port describes a renderable view within the title. Each display port is defined by a JSON
 * description, which also specifies the resources necessary for the display port to be correctly rendered.
 * Each display port belongs to a display manager, the display manager may contain further resources that
 * are shared between display ports.
 */

var DisplayPort = function () {
    /**
     * Prepares the display port for use by the application.
     * @param displayManager {DisplayManager}
     * @param definition {DisplayPortDefinition}
     */

    function DisplayPort(displayManager, definition) {
        var _this = this;

        _classCallCheck(this, DisplayPort);

        if (!displayManager) {
            throw new Error('Cannot create display port without a valid display manager.');
        }

        if (displayManager instanceof DisplayManager === false) {
            throw new Error('DisplayManager must be of correct type.');
        }

        this.scene = null;
        this.camera = null;
        this.enabled = true;
        this.displayManager = displayManager;
        this.resourceMap = new Map();
        this.stageList = [];

        definition.resources.forEach(function (e) {
            var resource = new DisplayResource(e);
            _this.resourceMap.set(resource.name, resource);
        });

        definition.stages.forEach(function (e) {
            var stage = new DisplayStage(e);
            _this.stageList.push(stage);
        });
    }

    /**
     *
     */


    _createClass(DisplayPort, [{
        key: 'onInitialize',
        value: function onInitialize() {
            var _this2 = this;

            this.resourceMap.forEach(function (e) {
                return e.onInitialize(_this2);
            });

            this.stageList.forEach(function (e) {
                return e.onInitialize(_this2);
            });
        }

        /**
         * Attempts to locate a display resource that has been associated with a specified name.
         * @param name The name of the resource to be retrieved.
         * @returns {*} The resource associated with the specified name if one could not be found this method returns null.
         */

    }, {
        key: 'findResource',
        value: function findResource(name) {
            if (!name) {
                throw new Error('DisplayPort - Unable to locate display resource without a valid name.');
            }

            var resource = this.resourceMap.get(name);
            if (resource) {
                return resource;
            }

            return this.displayManager.findResource(name);
        }

        /**
         * Release any and all GPU resources currently in use.
         */

    }, {
        key: 'dispose',
        value: function dispose() {
            this.resourceMap.forEach(function (e) {
                return e.dispose();
            });
        }

        /**
         * Called each frame when it is time to render our content.
         * @param renderArgs {RenderArgs} Miscellaneous support parameters for the rendered frame.
         */

    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            if (this.enabled) {
                renderArgs.displayPort = this;

                var stageCount = this.stageList.length;
                for (var loop = 0; loop < stageCount; ++loop) {
                    renderArgs.displayStage = this.stageList[loop];
                    renderArgs.displayStage.onRender(renderArgs);
                }
                renderArgs.displayStage = null;
                renderArgs.displayPort = null;
            }
        }
    }]);

    return DisplayPort;
}();

//# sourceMappingURL=display_port-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A DisplayResource describes a texture surface that may be used during the rendering of a display port within the title.
 * There are two types of rendered resource used by nGen, shared resources are globally accessible within the renderer
 * whilst display port resources are instantiated per-display port instance and are unique within that display port.
 */

var DisplayResource = function () {
    function DisplayResource(desc) {
        _classCallCheck(this, DisplayResource);

        if (!desc) {
            throw new Error('Unable to create DisplayResource without a description.');
        }

        if (!desc.name) {
            throw new Error('Unable to create DisplayResource with no specified name.');
        }

        this.name = desc.name;
        this.width = desc.width ? desc.width : null;
        this.height = desc.height ? desc.height : null;
        this.format = desc.format ? desc.format : null;
        this.scaleX = desc.scaleX ? desc.scaleX : 1.0;
        this.scaleY = desc.scaleY ? desc.scaleY : 1.0;
        this.inherit = desc.inherit ? desc.inherit : null;
        this.parent = null;
        this.threeFormat = null;
        this.texture = null;

        if (desc.scale) {
            this.scaleX = desc.scale;
            this.scaleY = desc.scale;
        }
    }

    /**
     * Prepares the resource for use by the application.
     * @param container {DisplayPort|DisplayManager} The display port or display manager the resource belongs to.
     */


    _createClass(DisplayResource, [{
        key: 'onInitialize',
        value: function onInitialize(container) {
            if (this.name !== DisplayResource.BackBufferName) {
                if (this.inherit) {
                    this.parent = container.findResource(this.inherit);
                    if (!this.parent) {
                        throw new Error('Couldn\'t find parent resource \'' + this.inherit + '\'.');
                    }

                    if (!this.format) {
                        this.format = this.parent.format;
                    }

                    this.width = Math.floor(this.parent.width * this.scaleX);
                    this.height = Math.floor(this.parent.height * this.scaleY);
                }

                if (!this.format) {
                    this.format = DisplayResource.toThreeFormat(this.format);
                }

                if (!this.format) {
                    throw new Error('Unable to initialize resource \'' + this.name + '\', texture format was not specified.');
                }

                this.texture = new THREE.WebGLRenderTarget(this.width, this.height, {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    generateMipmaps: false,
                    format: THREE.RGBFormat, //this.threeFormat,
                    stencilBuffer: false
                });
            }
        }

        /**
         * Destroys any GPU resources currently in use by this object.
         */

    }, {
        key: 'dispose',
        value: function dispose() {
            if (this.texture) {
                this.texture.dispose();
                this.texture = null;
            }
        }

        /**
         * Called when a scene is to be rendered to this resource.
         * @param renderArgs {RenderArgs} Frame information for the current render.
         * @param scene {THREE.Scene} The scene to be rendered.
         * @param camera {THREE.Camera} The camera to use for rendering.
         */

    }, {
        key: 'onRender',
        value: function onRender(renderArgs, scene, camera) {
            // TODO: Perhaps have camera supplied, generators don't all use the same camera or scene.
            if (this.texture) {
                renderArgs.renderer.render(scene, camera, this.texture);
            } else {
                renderArgs.renderer.render(scene, camera);
            }
        }

        /**
         * Creates a new DisplayResource instance that represents the applications current back-buffer.
         */

    }], [{
        key: 'createBackBuffer',
        value: function createBackBuffer() {
            var desc = {
                name: DisplayResource.BackBufferName,
                width: 0,
                height: 0,
                format: 'RGB',
                scaleX: 1.0,
                scaleY: 1.0
            };

            var resource = new DisplayResource(desc);

            // TODO: Initialize data here

            return resource;
        }

        /**
         * Converts a string based texture format to the appropriate THREEjs texture format.
         * @param ngenFormat The string representation of the desired format.
         * @returns {number} The THREEjs texture format version of the supplied string.
         */

    }, {
        key: 'toThreeFormat',
        value: function toThreeFormat(ngenFormat) {
            switch (ngenFormat) {
                case 'RGB':
                    return THREE.RGBFormat;

                case 'RGBA':
                    return THREE.RGBAFormat;
            }

            throw new Error('Unknown texture format \'' + ngenFormat + '\'.');
        }
    }]);

    return DisplayResource;
}();

DisplayResource.BackBufferName = 'backbuffer';

//# sourceMappingURL=display_resource-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A display port describes a renderable view within the title. Each display port is defined by a JSON
 * description, which also specifies the resources necessary for the display port to be correctly rendered.
 * Each display port belongs to a display manager, the display manager may contain further resources that
 * are shared between display ports.
 */

var DisplayPortDefinition = function () {
    function DisplayPortDefinition(desc) {
        _classCallCheck(this, DisplayPortDefinition);

        if (!desc) {
            throw new Error('Cannot create display port definition without a description.');
        }

        if (!desc.name) {
            throw new Error('Cannot create display port definition without a name.');
        }

        this.name = desc.name;
        this.resources = [];
        this.stages = [];

        if (desc.resources) {
            var count = desc.resources.length;
            for (var loop = 0; loop < count; ++loop) {
                this.resources.push(desc.resources[loop]);
            }
        }

        if (desc.stages) {
            var _count = desc.stages.length;
            for (var _loop = 0; _loop < _count; ++_loop) {
                this.stages.push(desc.stages[_loop]);
            }
        }
    }

    /**
     * Creates a new DisplayPort instance using this definition.
     * @param displayManager {DisplayManager} The display manager the port will belong to.
     * @returns {DisplayPort} A new DisplayPort instance based on this definition.
     */


    _createClass(DisplayPortDefinition, [{
        key: 'create',
        value: function create(displayManager) {
            return new DisplayPort(displayManager, this);
        }
    }]);

    return DisplayPortDefinition;
}();

//# sourceMappingURL=display_port_definition-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A display stage represents a block of rendering instructions for a particular stage within a rendered frame.
 * A display stage contains a list of 'generator' objects, these objects are executed in-turn when the stage is
 * to be rendered.
 */

var DisplayStage = function () {
    function DisplayStage(desc) {
        var _this = this;

        _classCallCheck(this, DisplayStage);

        if (!desc) {
            throw new Error('Unable to create display stage without a valid definition.');
        }

        if (!desc.name) {
            throw new Error('Unable to create display stage without a valid name.');
        }

        this.name = name;
        this.enabled = desc.enabled === undefined ? true : desc.enabled;
        this.displayPort = null;
        this.depthTarget = null;
        this.renderTarget = null;
        this.target = desc.target || null;
        this.depthWrite = desc.depthWrite ? desc.depthWrite : true;
        this.depthRead = desc.depth ? desc.depth : true; // Should be in the generator?
        this.generators = [];

        if (desc.generators) {
            desc.generators.forEach(function (e) {
                var generator = NGEN.createGenerator(e.type, e);
                if (generator) {
                    _this.generators.push(generator);
                } else {
                    console.log('Unable to create generator \'' + desc.generators[loop].type + '\'.');
                }
            });
        }
    }

    /**
     * Destroys any GPU resources allocated by this DisplayStage.
     */


    _createClass(DisplayStage, [{
        key: 'dispose',
        value: function dispose() {
            this.generators.forEach(function (e) {
                return e.dispose();
            });
        }

        /**
         * Called when we may obtain the resources we have access to. Resources are generally not available during
         * construction, they may also be disposed and re-created at run-time.
         * @param displayPort {DisplayPort} The display port to which we belong.
         */

    }, {
        key: 'onInitialize',
        value: function onInitialize(displayPort) {
            var _this2 = this;

            this.displayPort = displayPort;
            this.renderTarget = this.target ? displayPort.findResource(this.target) : displayPort.findResource(DisplayResource.BackBufferName);

            this.generators.forEach(function (e) {
                return e.onInitialize(_this2);
            });
        }
    }, {
        key: 'findResource',
        value: function findResource(name) {
            return this.displayPort.findResource(name);
        }

        /**
         * Called each frame when it is time to render our content.
         * @param renderArgs [RenderArgs} Miscellaneous support parameters for the rendered frame.
         */

    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            if (this.enabled) {
                this.generators.forEach(function (e) {
                    return e.onRender(renderArgs);
                });
            }
        }
    }]);

    return DisplayStage;
}();

//# sourceMappingURL=display_stage-compiled.js.map
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Base class for all generators available within NGEN.
 */

var GeneratorBase = function () {
    function GeneratorBase(desc) {
        var _this = this;

        _classCallCheck(this, GeneratorBase);

        this.input = [];
        this.output = [];

        this.inputNames = [];
        this.outputNames = [];

        if (desc.input) {
            desc.input.forEach(function (e) {
                return _this.inputNames.push(e);
            });
        }

        if (desc.output) {
            desc.output.forEach(function (e) {
                return _this.outputNames.push(e);
            });
        }
    }

    /**
     * Discards all GPU resources referenced by this generator.
     */


    _createClass(GeneratorBase, [{
        key: "dispose",
        value: function dispose() {
            this.input = [];
            this.output = [];
        }

        /**
         * Prepares the generator for use by the application.
         * @param displayStage {DisplayStage} The DisplayStage which contains the generator.
         */

    }, {
        key: "onInitialize",
        value: function onInitialize(displayStage) {
            var _this2 = this;

            this.inputNames.forEach(function (e) {
                return _this2.input.push(displayStage.findResource(e));
            });
            this.outputNames.forEach(function (e) {
                return _this2.output.push(displayStage.findResource(e));
            });
        }

        /**
         * Renders the output of the generator.
         * @param renderArgs {RenderArgs}
         */

    }, {
        key: "onRender",
        value: function onRender(renderArgs) {}
    }]);

    return GeneratorBase;
}();

//# sourceMappingURL=generator_base-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This generator is used to render the sceen assigned to the active display port.
 */

var BrightPassGenerator = function (_GeneratorBase) {
    _inherits(BrightPassGenerator, _GeneratorBase);

    function BrightPassGenerator(desc) {
        _classCallCheck(this, BrightPassGenerator);

        // Seems very heavy weight to have to create a scene, camera and quad for every generator.
        // This is what the THREE examples do, but we can probably do better in the future once it's working.

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BrightPassGenerator).call(this, desc));

        _this.scene = new THREE.Scene();
        _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        return _this;
    }

    _createClass(BrightPassGenerator, [{
        key: 'onInitialize',
        value: function onInitialize(displayStage) {
            _get(Object.getPrototypeOf(BrightPassGenerator.prototype), 'onInitialize', this).call(this, displayStage);

            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: 't', value: this.input[0].texture },
                    exposure: { type: 'f', value: 0.18 },
                    exposureBias: { type: 'f', value: 2.0 },
                    bloomThreshold: { type: 'f', value: 0.2 },
                    W: { type: 'f', value: 11.2 }
                },
                depthWrite: false,
                depthTest: false,
                transparent: true,
                vertexShader: ['varying vec2 vTex;', '', 'void main() {', ' gl_Position = vec4( position.x, position.y, 0.0, 1.0 );', ' vTex = uv;', '}'].join('\n'),
                fragmentShader: ['uniform sampler2D texture;', 'uniform float exposureBias;', 'uniform float exposure;', 'uniform float bloomThreshold;', '', 'varying vec2 vTex;', '', 'float A = 0.15;', 'float B = 0.50;', 'float C = 0.10;', 'float D = 0.20;', 'float E = 0.02;', 'float F = 0.30;', 'uniform float W;', '//float W = 0.5;//11.2;', '', 'vec3 filmicTonemap( vec3 x ) {', '  return ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F;', '}', '', 'float calcLuminance(vec3 color) {', '  return max( dot( color, vec3( 0.212656, 0.715158, 0.072185 ) ), 0.0001 );	// sRGB', '}', '', 'vec3 calcExposedColor(vec3 color, float avgLuminance, float threshold, out float outExposure) {', ' avgLuminance = max(avgLuminance, 0.001);', ' float keyValue = exposure;', ' float linearExposure = ( keyValue / avgLuminance);', ' outExposure = log2(max(linearExposure, 0.0001));', ' //outExposure -= threshold;', ' return exp2(outExposure) * color;', '}', '', 'void main() {', ' vec3 color = texture2D( texture, vTex ).xyz;', ' color = 16.0 * color;  // Hardcoded exposure constant', '', ' float avgLuminance = 0.2;', ' float exposure = 0.0;', ' float pixelLuminance = calcLuminance( color );', ' color = calcExposedColor(color, avgLuminance, bloomThreshold, exposure );', ' color = filmicTonemap( exposureBias * color );', ' vec3 whiteScale = 1.0 / filmicTonemap( vec3( W ) );', ' color *= whiteScale;', ' color = color - vec3( bloomThreshold );//min( color, vec3( 1.0 ) );', ' if ( dot( color, vec3( 0.333 ) ) <= 0.001 ) {', '   color = vec3( 0.0 );', ' }', '', ' gl_FragColor = vec4( color, 1.0 );', ' //gl_FragColor = vec4( vTex.x, vTex.y, 1.0, 1.0 );', '}'].join('\n')
            });

            this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);

            this.scene.add(this.quad);
        }
    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            this.material.uniforms.W.value = NGEN.Settings.HDR.BloomW;
            this.material.uniforms.bloomThreshold.value = NGEN.Settings.HDR.BloomThreshold;
            this.material.uniforms.exposure.value = NGEN.Settings.HDR.Exposure;
            this.material.uniforms.exposureBias.value = NGEN.Settings.HDR.ExposureBias;

            renderArgs.renderer.autoClearColor = false;
            this.output[0].onRender(renderArgs, this.scene, this.camera);
            renderArgs.renderer.autoClearColor = true;

            // TODO: Eventually scene and camera will be attached to the display port
            //renderArgs.displayStage.rendeTarget.onRender( renderArgs, renderArgs.displayPort.scene, renderArgs.displayPort.camera );
        }
    }]);

    return BrightPassGenerator;
}(GeneratorBase);

NGEN.generator('BrightPass', BrightPassGenerator);

NGEN.Settings.HDR.BloomW = 2;
NGEN.Settings.HDR.BloomThreshold = 0.9;
NGEN.Settings.HDR.ExposureBias = 2.0;

var Cell = function Cell() {
    _classCallCheck(this, Cell);

    this.x = 0.0;
    this.z = 0.0;
    this.type = Cell.SOLID;
    this.y = Number.POSITIVE_INFINITY;
    this.height = Number.POSITIVE_INFINITY;
};

var TestMap = function () {
    function TestMap(cellsWide, cellsDeep) {
        _classCallCheck(this, TestMap);

        this.cellSize = 1.0;
        this.baseY = 0.0;
        this.cellsWide = cellsWide;
        this.cellsDeep = cellsDeep;
        this.cells = [];
        this.invalidCell = new Cell();

        var halfX = cellsWide * this.cellSize / 2;
        var halfZ = cellsDeep * this.cellSize / 2;

        for (var z = 0; z < cellsDeep; ++z) {
            for (var x = 0; x < cellsWide; ++x) {
                var cell = new Cell();

                cell.x = x * this.cellSize - halfX + this.cellSize / 2;
                cell.z = z * this.cellSize - halfZ + this.cellSize / 2;
            }
        }
    }

    _createClass(TestMap, [{
        key: 'getCell',
        value: function getCell(x, z) {
            if (x >= 0 && x < this.cellsWide) {
                if (z >= 0 && z < this.cellsDeep) {
                    return this.cells[z * this.cellsWide + x];
                }
            }

            return this.invalidCell;
        }
    }, {
        key: 'getCellType',
        value: function getCellType(x, z) {
            if (x >= 0 && x < this.cellsWide) {
                if (z >= 0 && z < this.cellsDeep) {
                    return this.cells[z * this.cellsWide + x].type;
                }
            }

            return this.invalidCell.type;
        }
    }, {
        key: 'buildGeometry',
        value: function buildGeometry(mesh) {
            for (var z = 0; z < this.cellsDeep; ++z) {
                for (var x = 0; x < this.cellsWide; ++x) {
                    this.buildCellGeometry(mesh, x, z);
                }
            }
        }
    }, {
        key: 'buildCellGeometry',
        value: function buildCellGeometry(mesh, x, z) {
            var cell = this.getCell(x, z);

            if (cell.type === Cell.EMPTY) {
                var halfSize = this.cellSize / 2;

                if (this.getCellType(x - 1, z) === Cell.SOLID) {
                    var baseVertex = mesh.getPointCount();

                    var _x = cell.x - halfSize;

                    mesh.addPoint(_x, py, pz);
                    mesh.addPoint(_x, py, pz);
                    mesh.addPoint(_x, ny, pz);
                    mesh.addPoint(_x, ny, nz);

                    // Build west wall
                    mesh.addQuad(baseVertex + 0, baseVertex + 1, baseVertex + 2, baseVertex + 3);
                }

                if (this.getCellType(x, z - 1) === Cell.SOLID) {
                    var _baseVertex = mesh.getPointCount();

                    var _z = cell.z - halfSize;

                    mesh.addPoint(nx, ny, _z);
                    mesh.addPoint(nx, ny, _z);
                    mesh.addPoint(nx, ny, _z);
                    mesh.addPoint(nx, ny, _z);

                    // Build north wall
                    mesh.addQuad(_baseVertex + 0, _baseVertex + 1, _baseVertex + 2, _baseVertex + 3);
                }

                if (this.getCellType(x + 1, z) === Cell.SOLID) {
                    var _baseVertex2 = mesh.getPointCount();

                    var _x2 = cell.x + halfSize;

                    mesh.addPoint(_x2, py, pz);
                    mesh.addPoint(_x2, py, pz);
                    mesh.addPoint(_x2, ny, pz);
                    mesh.addPoint(_x2, ny, nz);

                    // Build east wall
                    mesh.addQuad(_baseVertex2 + 0, _baseVertex2 + 1, _baseVertex2 + 2, _baseVertex2 + 3);
                }

                if (this.getCellType(x, z + 1) === Cell.SOLID) {
                    var _baseVertex3 = mesh.getPointCount();

                    var _z2 = cell.z + halfSize;

                    mesh.addPoint(nx, ny, _z2);
                    mesh.addPoint(nx, ny, _z2);
                    mesh.addPoint(nx, ny, _z2);
                    mesh.addPoint(nx, ny, _z2);

                    // Build south wall
                    mesh.addQuad(_baseVertex3 + 0, _baseVertex3 + 1, _baseVertex3 + 2, _baseVertex3 + 3);
                }

                // Add floor
                var floorBaseVertex = mesh.getPointCount();

                var floorx = cell.x - halfSize;
                var floory = cell.y;
                var floorz = cell.z - halfSize;

                mesh.addPoint(floorx, floory, floorz);
                mesh.addPoint(floorx + this.cellSize, floory, floorz);
                mesh.addPoint(floorx + this.cellSize, floory, floorz + this.cellSize);
                mesh.addPoint(floorx, floory, floorz + this.cellSize);

                mesh.addQuad(floorBaseVertex + 0, floorBaseVertex + 1, floorBaseVertex + 2, floorBaseVertex + 3);

                // TODO: Add Ceiling
            }
        }
    }]);

    return TestMap;
}();

Cell.SOLID = 0;
Cell.EMPTY = 1;

var MapGenerator = function () {
    function MapGenerator() {
        _classCallCheck(this, MapGenerator);

        this.map = null;
        this.mesh = null;
    }

    _createClass(MapGenerator, [{
        key: 'generate',
        value: function generate(cellsWide, cellsDeep) {
            this.map = new TestMap(cellsWide, cellsDeep);
            this.mesh = new Mesh();

            var startX = 1;
            var startZ = 1;
            var endX = cellsWide - 1;
            var endZ = cellsDeep - 1;

            for (var z = startZ; z < endZ; ++z) {
                for (var x = startX; x < endX; ++x) {
                    var cell = this.map.getCell(x, z);

                    cell.type = Cell.EMPTY;
                    cell.y = 0.0;
                }
            }

            this.map.buildGeometry(this.mesh);
        }
    }]);

    return MapGenerator;
}();

//# sourceMappingURL=bright_pass-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This generator is used to render the sceen assigned to the active display port.
 */

var BlurHorzGenerator = function (_GeneratorBase) {
    _inherits(BlurHorzGenerator, _GeneratorBase);

    function BlurHorzGenerator(desc) {
        _classCallCheck(this, BlurHorzGenerator);

        // Seems very heavy weight to have to create a scene, camera and quad for every generator.
        // This is what the THREE examples do, but we can probably do better in the future once it's working.

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BlurHorzGenerator).call(this, desc));

        _this.scene = new THREE.Scene();
        _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        return _this;
    }

    _createClass(BlurHorzGenerator, [{
        key: 'onInitialize',
        value: function onInitialize(displayStage) {
            _get(Object.getPrototypeOf(BlurHorzGenerator.prototype), 'onInitialize', this).call(this, displayStage);

            var texelSize = 1.0 / this.input[0].width;

            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: 't', value: this.input[0].texture },
                    texelSize: { type: 'v4', value: new THREE.Vector4(texelSize, 0.0, 0.0, 0.0) }
                },
                depthWrite: false,
                depthTest: false,
                transparent: true,
                vertexShader: ['varying vec2 vTex;', '', 'void main() {', ' gl_Position = vec4( position.x, position.y, 0.0, 1.0 );', ' vTex = uv;', '}'].join('\n'),
                fragmentShader: ['uniform sampler2D texture;', 'uniform vec4 texelSize;', '', 'varying vec2 vTex;', '', 'float bloomSigma = 2.0;', '', 'float calcGaussianWeight( int sampleDist, float sigma ) {', ' float g = 1.0 / sqrt( 2.0 * 3.14159 * sigma * sigma );', ' return ( g * exp( -float( sampleDist * sampleDist ) / ( 2.0 * sigma * sigma ) ) );', '}', '', 'vec3 blur( vec2 texCoord, vec2 texScale, float sigma ) {', ' vec3 color = vec3( 0.0 );', ' for ( int i = -6; i <= 6; ++i ) {', '   float weight = calcGaussianWeight( i, sigma );', '   vec2 blurTex = texCoord + ( float( i ) * texelSize.xy ) * texScale;', '   vec3 sample = texture2D( texture, blurTex ).xyz;', '   color += sample * vec3( weight );', ' }', ' return color;', '}', '', 'void main() {', ' gl_FragColor = vec4( blur( vTex, vec2( 2.0, 0.0 ), bloomSigma ), 1.0 );', '}'].join('\n')
            });

            this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);

            this.scene.add(this.quad);
        }
    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            renderArgs.renderer.autoClearColor = false;
            this.output[0].onRender(renderArgs, this.scene, this.camera);
            renderArgs.renderer.autoClearColor = true;

            // TODO: Eventually scene and camera will be attached to the display port
            //renderArgs.displayStage.rendeTarget.onRender( renderArgs, renderArgs.displayPort.scene, renderArgs.displayPort.camera );
        }
    }]);

    return BlurHorzGenerator;
}(GeneratorBase);

NGEN.generator('BlurHorz', BlurHorzGenerator);

//# sourceMappingURL=blur_horz-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This generator is used to render the sceen assigned to the active display port.
 */

var BlurVertGenerator = function (_GeneratorBase) {
    _inherits(BlurVertGenerator, _GeneratorBase);

    function BlurVertGenerator(desc) {
        _classCallCheck(this, BlurVertGenerator);

        // Seems very heavy weight to have to create a scene, camera and quad for every generator.
        // This is what the THREE examples do, but we can probably do better in the future once it's working.

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BlurVertGenerator).call(this, desc));

        _this.scene = new THREE.Scene();
        _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        return _this;
    }

    _createClass(BlurVertGenerator, [{
        key: 'onInitialize',
        value: function onInitialize(displayStage) {
            _get(Object.getPrototypeOf(BlurVertGenerator.prototype), 'onInitialize', this).call(this, displayStage);

            var texelSize = 1.0 / this.input[0].height;

            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: 't', value: this.input[0].texture },
                    texelSize: { type: 'v4', value: new THREE.Vector4(0.0, texelSize, 0.0, 0.0) }
                },
                depthWrite: false,
                depthTest: false,
                transparent: true,
                vertexShader: ['varying vec2 vTex;', '', 'void main() {', ' gl_Position = vec4( position.x, position.y, 0.0, 1.0 );', ' vTex = uv;', '}'].join('\n'),
                fragmentShader: ['uniform sampler2D texture;', 'uniform vec4 texelSize;', '', 'varying vec2 vTex;', '', 'float bloomSigma = 2.0;', '', 'float calcGaussianWeight( int sampleDist, float sigma ) {', ' float g = 1.0 / sqrt( 2.0 * 3.14159 * sigma * sigma );', ' return ( g * exp( -float( sampleDist * sampleDist ) / ( 2.0 * sigma * sigma ) ) );', '}', '', 'vec3 blur( vec2 texCoord, vec2 texScale, float sigma ) {', ' vec3 color = vec3( 0.0 );', ' for ( int i = -6; i <= 6; ++i ) {', '   float weight = calcGaussianWeight( i, sigma );', '   vec2 blurTex = texCoord + ( float( i ) * texelSize.xy ) * texScale;', '   vec3 sample = texture2D( texture, blurTex ).xyz;', '   color += sample * vec3( weight );', ' }', ' return color;', '}', '', 'void main() {', ' gl_FragColor = vec4( blur( vTex, vec2( 0.0, 2.0 ), bloomSigma ), 1.0 );', '}'].join('\n')
            });

            this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);

            this.scene.add(this.quad);
        }
    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            renderArgs.renderer.autoClearColor = false;
            this.output[0].onRender(renderArgs, this.scene, this.camera);
            renderArgs.renderer.autoClearColor = true;

            // TODO: Eventually scene and camera will be attached to the display port
            //renderArgs.displayStage.rendeTarget.onRender( renderArgs, renderArgs.displayPort.scene, renderArgs.displayPort.camera );
        }
    }]);

    return BlurVertGenerator;
}(GeneratorBase);

NGEN.generator('BlurVert', BlurVertGenerator);

//# sourceMappingURL=blur_vert-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This generator is used to render the sceen assigned to the active display port.
 */

var AddBlendGenerator = function (_GeneratorBase) {
    _inherits(AddBlendGenerator, _GeneratorBase);

    function AddBlendGenerator(desc) {
        _classCallCheck(this, AddBlendGenerator);

        // Seems very heavy weight to have to create a scene, camera and quad for every generator.
        // This is what the THREE examples do, but we can probably do better in the future once it's working.

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AddBlendGenerator).call(this, desc));

        _this.scene = new THREE.Scene();
        _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        return _this;
    }

    _createClass(AddBlendGenerator, [{
        key: 'onInitialize',
        value: function onInitialize(displayStage) {
            _get(Object.getPrototypeOf(AddBlendGenerator.prototype), 'onInitialize', this).call(this, displayStage);

            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: 't', value: this.input[0].texture }
                },
                depthWrite: false,
                depthTest: false,
                transparent: true,
                blending: THREE.AdditiveBlending,
                vertexShader: ['varying vec2 vTex;', '', 'void main() {', ' gl_Position = vec4( position.x, position.y, 0.0, 1.0 );', ' vTex = uv;', '}'].join('\n'),
                fragmentShader: ['uniform sampler2D texture;', '', 'varying vec2 vTex;', '', 'void main() {', ' gl_FragColor = texture2D( texture, vTex );', '}'].join('\n')
            });

            this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);

            this.scene.add(this.quad);
        }
    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            renderArgs.renderer.autoClearColor = false;
            this.output[0].onRender(renderArgs, this.scene, this.camera);
            renderArgs.renderer.autoClearColor = true;

            // TODO: Eventually scene and camera will be attached to the display port
            //renderArgs.displayStage.rendeTarget.onRender( renderArgs, renderArgs.displayPort.scene, renderArgs.displayPort.camera );
        }
    }]);

    return AddBlendGenerator;
}(GeneratorBase);

NGEN.generator('AddBlend', AddBlendGenerator);

//# sourceMappingURL=add_blend-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This generator is used to render the sceen assigned to the active display port.
 */

var LinearScaleGenerator = function (_GeneratorBase) {
    _inherits(LinearScaleGenerator, _GeneratorBase);

    function LinearScaleGenerator(desc) {
        _classCallCheck(this, LinearScaleGenerator);

        // Seems very heavy weight to have to create a scene, camera and quad for every generator.
        // This is what the THREE examples do, but we can probably do better in the future once it's working.

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LinearScaleGenerator).call(this, desc));

        _this.scene = new THREE.Scene();
        _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        return _this;
    }

    _createClass(LinearScaleGenerator, [{
        key: 'onInitialize',
        value: function onInitialize(displayStage) {
            _get(Object.getPrototypeOf(LinearScaleGenerator.prototype), 'onInitialize', this).call(this, displayStage);

            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: 't', value: this.input[0].texture }
                },
                depthWrite: false,
                depthTest: false,
                transparent: true,
                vertexShader: ['varying vec2 vTex;', '', 'void main() {', ' gl_Position = vec4( position.x, position.y, 0.0, 1.0 );', ' vTex = uv;', '}'].join('\n'),
                fragmentShader: ['uniform sampler2D texture;', '', 'varying vec2 vTex;', '', 'void main() {', ' gl_FragColor = vec4( texture2D( texture, vTex ).xyz, 1.0 );', '}'].join('\n')
            });

            this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);

            this.scene.add(this.quad);
        }
    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            renderArgs.renderer.autoClearColor = false;
            this.output[0].onRender(renderArgs, this.scene, this.camera);
            renderArgs.renderer.autoClearColor = true;

            // TODO: Eventually scene and camera will be attached to the display port
            //renderArgs.displayStage.rendeTarget.onRender( renderArgs, renderArgs.displayPort.scene, renderArgs.displayPort.camera );
        }
    }]);

    return LinearScaleGenerator;
}(GeneratorBase);

NGEN.generator('LinearScale', LinearScaleGenerator);

//# sourceMappingURL=linear_scale-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This generator is used to render the sceen assigned to the active display port.
 *
 * Useful references for implementation:
 * http://www.xnainfo.com/content.php?content=28
 * https://mynameismjp.wordpress.com/2010/04/30/a-closer-look-at-tone-mapping/
 * http://kalogirou.net/2006/05/20/how-to-do-good-bloom-for-hdr-rendering/
 */

var HdrGenerator = function (_GeneratorBase) {
    _inherits(HdrGenerator, _GeneratorBase);

    function HdrGenerator(desc) {
        _classCallCheck(this, HdrGenerator);

        // Seems very heavy weight to have to create a scene, camera and quad for every generator.
        // This is what the THREE examples do, but we can probably do better in the future once it's working.

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(HdrGenerator).call(this, desc));

        _this.scene = new THREE.Scene();
        _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        return _this;
    }

    _createClass(HdrGenerator, [{
        key: 'onInitialize',
        value: function onInitialize(displayStage) {
            _get(Object.getPrototypeOf(HdrGenerator.prototype), 'onInitialize', this).call(this, displayStage);

            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: 't', value: this.input[0].texture },
                    bloomTexture: { type: 't', value: this.input[1].texture },
                    bloomStrength: { type: 'f', value: 2.0 },
                    exposure: { type: 'f', value: 0.18 },
                    exposureBias: { type: 'f', value: 2.0 },
                    W: { type: 'f', value: 11.2 }
                },
                depthWrite: false,
                depthTest: false,
                transparent: true,
                vertexShader: ['varying vec2 vTex;', '', 'void main() {', ' gl_Position = vec4( position.x, position.y, 0.0, 1.0 );', ' vTex = uv;', '}'].join('\n'),
                fragmentShader: ['uniform sampler2D texture;', 'uniform sampler2D bloomTexture;', '', 'uniform float bloomStrength;', 'uniform float exposure;', 'uniform float exposureBias;', '', 'varying vec2 vTex;', '', 'float A = 0.15;', 'float B = 0.50;', 'float C = 0.10;', 'float D = 0.20;', 'float E = 0.02;', 'float F = 0.30;', 'uniform float W;', '//float W = 2.0;//11.2;', '', 'vec3 filmicTonemap( vec3 x ) {', ' return ( ( x * ( A * x + C * B ) + D * E ) / ( x * ( A * x + B ) + D * F ) ) - E / F;', '}', '', 'float calcLuminance( vec3 color ) {', ' return max( dot( color, vec3( 0.212656, 0.715158, 0.072185 ) ), 0.0001 );	// sRGB', '}', '', 'vec3 calcExposedColor(vec3 color, float avgLuminance, float threshold, out float outExposure) {', ' avgLuminance = max(avgLuminance, 0.001);', ' float keyValue = exposure;', ' float linearExposure = ( keyValue / avgLuminance);', ' outExposure = log2(max(linearExposure, 0.0001));', ' outExposure -= threshold;', ' return exp2(outExposure) * color;', '}', '', 'vec3 toneMap(vec3 color, float avgLuminance, float threshold, out float exposure) {', ' float pixelLuminance = calcLuminance(color);', ' color = calcExposedColor(color, avgLuminance, threshold, exposure);', ' vec3 whiteScale = 1.0 / filmicTonemap( vec3( W ) );', '', ' color = filmicTonemap(exposureBias * color);', ' return color * whiteScale;', '}', '', 'vec4 composite( vec2 texCoord ) {', ' float avgLuminance = 0.2;', ' float exposure = 0.0;', '', ' vec3 color = texture2D( texture, texCoord ).xyz;', ' color = 16.0 * color;  // Hardcoded exposure constant', '', ' color = toneMap( color, avgLuminance, 0.0, exposure );', '', ' vec3 bloomColor = bloomStrength * texture2D( bloomTexture, texCoord ).xyz;', '', ' return vec4( bloomColor + color, 1.0 );', '}', '', 'void main() {', ' gl_FragColor = composite( vTex );', '}'].join('\n')
            });

            this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);

            this.scene.add(this.quad);
        }
    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            this.material.uniforms.W.value = NGEN.Settings.HDR.W;
            this.material.uniforms.exposure.value = NGEN.Settings.HDR.Exposure;
            this.material.uniforms.bloomStrength.value = NGEN.Settings.HDR.BloomStrength;
            this.material.uniforms.exposureBias.value = NGEN.Settings.HDR.ExposureBias;

            renderArgs.renderer.autoClearColor = false;
            this.output[0].onRender(renderArgs, this.scene, this.camera);
            renderArgs.renderer.autoClearColor = true;

            // TODO: Eventually scene and camera will be attached to the display port
            //renderArgs.displayStage.rendeTarget.onRender( renderArgs, renderArgs.displayPort.scene, renderArgs.displayPort.camera );
        }
    }]);

    return HdrGenerator;
}(GeneratorBase);

NGEN.generator('HdrGenerator', HdrGenerator);

NGEN.Settings.HDR.W = 11.2;
NGEN.Settings.HDR.Exposure = 0.18;
NGEN.Settings.HDR.BloomStrength = 2.0;

//# sourceMappingURL=hdr_generator-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This generator is used to render the sceen assigned to the active display port.
 */

var CopyGenerator = function (_GeneratorBase) {
    _inherits(CopyGenerator, _GeneratorBase);

    function CopyGenerator(desc) {
        _classCallCheck(this, CopyGenerator);

        // Seems very heavy weight to have to create a scene, camera and quad for every generator.
        // This is what the THREE examples do, but we can probably do better in the future once it's working.

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CopyGenerator).call(this, desc));

        _this.scene = new THREE.Scene();
        _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        return _this;
    }

    _createClass(CopyGenerator, [{
        key: 'onInitialize',
        value: function onInitialize(displayStage) {
            _get(Object.getPrototypeOf(CopyGenerator.prototype), 'onInitialize', this).call(this, displayStage);

            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    texture: { type: 't', value: this.input[0].texture }
                },
                depthWrite: false,
                depthTest: false,
                transparent: true,
                vertexShader: ['varying vec2 vTex;', '', 'void main() {', ' gl_Position = vec4( position.x, position.y, 0.0, 1.0 );', ' vTex = uv;', '}'].join('\n'),
                /*          //www.geeks3d.com/20100909/shader-library-blur-post-processing-filter-in-glsl
                            fragmentShader: [
                                'uniform sampler2D texture;',
                                '',
                                'varying vec2 vTex;',
                                '',
                                'void main() {',
                                ' vec3 tc = vec3( 1.0, 0.0, 0.0 );',
                                ' vec3 pixcol = texture2D( texture, vTex ).xyz;',
                                ' vec3 colors[ 3 ];',
                                ' colors[ 0 ] = vec3( 0.0, 0.0, 1.0 );',
                                ' colors[ 1 ] = vec3( 1.0, 1.0, 0.0 );',
                                ' colors[ 2 ] = vec3( 1.0, 0.0, 0.0 );',
                                ' float lum = ( pixcol.r + pixcol.g + pixcol.b ) / 3.0;',
                                ' if ( lum < 0.5 ) {',
                                '   tc = mix( colors[ 0 ], colors[ 1 ], vec3( lum * 0.5 ) ) / 0.5;',
                                ' } else {',
                                '   tc = mix( colors[ 1 ], colors[ 2 ], vec3( lum - 1.0 * 0.5 ) ) / 0.5;',
                                '}',
                                ' //int ix = ( lum < 0.5 ) ? 0 : 1;',
                                ' //tc = mix( colors[ ix ], colors[ ix + 1 ], vec3( ( lum - float( ix ) * 0.5 ) ) ) / 0.5;',
                                ' gl_FragColor = vec4( tc, 1.0 );',
                                '}'
                            ].join( '\n' )
                */
                fragmentShader: ['uniform sampler2D texture;', '', 'varying vec2 vTex;', '', 'void main() {', ' gl_FragColor = texture2D( texture, vTex );', ' //gl_FragColor = vec4( vTex.x, vTex.y, 1.0, 1.0 );', '}'].join('\n')
            });

            this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);

            this.scene.add(this.quad);
        }
    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            renderArgs.renderer.autoClearColor = false;
            this.output[0].onRender(renderArgs, this.scene, this.camera);
            renderArgs.renderer.autoClearColor = true;

            // TODO: Eventually scene and camera will be attached to the display port
            //renderArgs.displayStage.rendeTarget.onRender( renderArgs, renderArgs.displayPort.scene, renderArgs.displayPort.camera );
        }
    }]);

    return CopyGenerator;
}(GeneratorBase);

NGEN.generator('SimpleCopy', CopyGenerator);

//# sourceMappingURL=copy_generator-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This generator is used to render the sceen assigned to the active display port.
 */

var SceneGenerator = function (_GeneratorBase) {
    _inherits(SceneGenerator, _GeneratorBase);

    function SceneGenerator(desc) {
        _classCallCheck(this, SceneGenerator);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SceneGenerator).call(this, desc));
    }

    _createClass(SceneGenerator, [{
        key: 'onInitialize',
        value: function onInitialize(displayStage) {
            _get(Object.getPrototypeOf(SceneGenerator.prototype), 'onInitialize', this).call(this, displayStage);
            //
        }
    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            this.output[0].onRender(renderArgs, renderArgs.scene, renderArgs.camera);

            // TODO: Eventually scene and camera will be attached to the display port
            //renderArgs.displayStage.rendeTarget.onRender( renderArgs, renderArgs.displayPort.scene, renderArgs.displayPort.camera );
        }
    }]);

    return SceneGenerator;
}(GeneratorBase);

NGEN.generator('SceneGenerator', SceneGenerator);

//# sourceMappingURL=scene_generator-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A RenderStageGenerator is an object that performs rendering operations within the title.
 * A generator may render geometry, or produce a texture or some other render operation.
 */

var ShaderGenerator = function (_GeneratorBase) {
    _inherits(ShaderGenerator, _GeneratorBase);

    function ShaderGenerator(desc) {
        _classCallCheck(this, ShaderGenerator);

        // Seems very heavy weight to have to create a scene, camera and quad for every generator.
        // This is what the THREE examples do, but we can probably do better in the future once it's working.

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ShaderGenerator).call(this, desc));

        _this.scene = new THREE.Scene();
        _this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        _this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);

        _this.scene.add(_this.quad);
        return _this;
    }

    _createClass(ShaderGenerator, [{
        key: 'onInitialize',
        value: function onInitialize(displayStage) {
            _get(Object.getPrototypeOf(ShaderGenerator.prototype), 'onInitialize', this).call(this, displayStage);
            //
        }
    }, {
        key: 'onRender',
        value: function onRender(renderArgs) {
            //renderArgs.displayStage.renderTarget.onRender( renderArgs, this.scene, this.camera );

            //renderArgs.displayStage.renderTarget.onRender( renderArgs, renderArgs.scene, renderArgs.displayPort.camera );
        }
    }]);

    return ShaderGenerator;
}(GeneratorBase);

NGEN.generator('ShaderGenerator', ShaderGenerator);

//# sourceMappingURL=shader_generator-compiled.js.map
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Simple object to contain variables associated with the frame being rendered.
 *
 *  time {Number} Contains the current time within the game title.
 *  scene {Scene} Contains the current scene object being rendered.
 *  renderer {WebGLRenderer} Contains the GPU rendering object.
 *  displayPort {DisplayPort} Contains the display port currently being rendered.
 *  displayStage {DisplayStage} Contains the display stage being rendered.
 *  displayManager {DisplayManager} Contains the display manager for the current rendered frame.
 *
 *  Some of these variables may be null depending on where in the rendered frame we are.
 */

var RenderArgs = function RenderArgs() {
    _classCallCheck(this, RenderArgs);

    this.time = 0;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.displayPort = null;
    this.displayStage = null;
    this.displayManager = null;
};

//# sourceMappingURL=render_args-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This class provides Geometry components for use by the running title.
 */

var GeometryComponentProvider = function (_GameSystem) {
    _inherits(GeometryComponentProvider, _GameSystem);

    function GeometryComponentProvider() {
        _classCallCheck(this, GeometryComponentProvider);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GeometryComponentProvider).call(this));

        _this.conuter = 0;
        return _this;
    }

    /**
     * Creates a geometry object that can be rendered by the framework.
     * @param desc
     */


    _createClass(GeometryComponentProvider, [{
        key: 'createGeometry',
        value: function createGeometry(desc) {
            if (!desc.shape) {
                throw new Error('Cannot create geometry object without a geometry shape.');
            }

            switch (desc.shape) {
                case 'Box':
                    this.counter++; // Just so webstorm doesn't complain about the function not being static
                    return GeometryComponentProvider.createBoxGeometry(desc);

                case 'Ground':
                    // Temporary for testing purposes
                    return GeometryComponentProvider.createGroundGeometry(desc);

                case 'Sphere':
                    break;

                case 'Mesh':
                    break;

                case 'Monster':
                    return GeometryComponentProvider.createMonsterGeometry(desc);

                case 'ConstructionPlane':
                    return GeometryComponentProvider.createConstructionPlane(desc);

                default:
                    throw new Error('Unable to create unknown geometry shape \'' + desc.type + '\'.');
            }
        }

        /**
         * Creates a Geometry component that represents a construction plane.
         * @param desc Description of the mesh to be created.
         */

    }], [{
        key: 'createConstructionPlane',
        value: function createConstructionPlane(desc) {
            var geometry = new THREE.BufferGeometry();

            var count = 4 * 10;
            var delta = 1.0;
            var base = -(count / 2) * delta;
            var l = count * delta;

            // Line geometry demo
            // http://threejs.org/examples/#webgl_buffergeometry_lines

            var positions = new Float32Array(count * 4 * 3);
            //const colors = new Float32Array( count * 4 * 2 );

            var index = 0;
            for (var i = 0; i < count; ++i) {
                var pos = base + i * delta;

                positions[index++] = pos;
                positions[index++] = base;
                positions[index++] = 0.0;

                positions[index++] = pos;
                positions[index++] = base + l;
                positions[index++] = 0.0;

                positions[index++] = base;
                positions[index++] = pos;
                positions[index++] = 0.0;

                positions[index++] = base + l;
                positions[index++] = pos;
                positions[index++] = 0.0;
            }

            geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.computeBoundingSphere();

            var material = new THREE.LineBasicMaterial({
                color: 0x40404040
            });
            var mesh = new THREE.LineSegments(geometry, material);

            mesh.rotation.x = -Math.PI / 2;

            return new MeshComponent(mesh);
        }

        /**
         * Creates a Geometry component that represents a rendered mesh in the world.
         * @param desc Description of the mesh to be created.
         * @returns {Mesh|*|i}
         */

    }, {
        key: 'createBoxGeometry',
        value: function createBoxGeometry(desc) {
            var texture = THREE.ImageUtils.loadTexture('game/textures/at_symbol_white-512.png');
            //let texture = THREE.ImageUtils.loadTexture( 'game/textures/m_symbol_white-512.png' );

            var geometry = new THREE.BoxGeometry(desc.width, desc.height, desc.depth);
            var material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(0.4, 0.4, 0.4),
                metal: true,
                specular: 0x05050505,
                emissive: 0xFF222299,
                emissiveMap: texture
            });

            var mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = desc.castShadow === undefined ? true : desc.castShadow;
            mesh.receiveShadow = desc.receiveShadow === undefined ? true : desc.receiveShadow;

            if (desc.position) {
                mesh.position.x = desc.position.x;
                mesh.position.y = desc.position.y;
                mesh.position.z = desc.position.z;
            }

            // TODO: Add mesh to scene
            return new MeshComponent(mesh);
        }

        /**
         * Creates a Geometry component that represents a rendered mesh in the world.
         * @param desc Description of the mesh to be created.
         * @returns {Mesh|*|i}
         */

    }, {
        key: 'createMonsterGeometry',
        value: function createMonsterGeometry(desc) {
            var texture = THREE.ImageUtils.loadTexture('game/textures/m_symbol_white-512.png');

            var monsterColor = desc.color || 0xFF662222;

            var geometry = new THREE.BoxGeometry(desc.width, desc.height, desc.depth);
            var material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(0.4, 0.4, 0.4),
                metal: true,
                shininess: 30.0,
                //specular: 0x05050505,
                emissive: monsterColor,
                emissiveMap: texture
            });

            var mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = desc.castShadow === undefined ? true : desc.castShadow;
            mesh.receiveShadow = desc.receiveShadow === undefined ? true : desc.receiveShadow;

            if (desc.position) {
                mesh.position.x = desc.position.x;
                mesh.position.y = desc.position.y;
                mesh.position.z = desc.position.z;
            }

            // TODO: Add mesh to scene
            return new MeshComponent(mesh);
        }

        /**
         * Creates a Geometry component that represents a rendered mesh in the world.
         * @param desc Description of the mesh to be created.
         * @returns {Mesh|*|i}
         */

    }, {
        key: 'createGroundGeometry',
        value: function createGroundGeometry(desc) {
            var texture = THREE.ImageUtils.loadTexture('game/textures/cracked_ground.jpg');

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(64, 64);

            var geometry = new THREE.PlaneBufferGeometry(desc.width, desc.height);
            var material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0.05, 0.05, 0.05),
                map: texture
            });
            /*        let material = new THREE.MeshPhongMaterial({
             color: new THREE.Color( 0.3, 0.3, 0.3 ),
             specular: new THREE.Color( 0.0, 0.0, 0.0 ),//0,//0x01010101,
             map: texture
             });
             */
            var mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = desc.castShadow === undefined ? true : desc.castShadow;
            mesh.receiveShadow = desc.receiveShadow === undefined ? true : desc.receiveShadow;

            mesh.rotation.x = -Math.PI / 2;

            if (desc.position) {
                mesh.position.x = desc.position.x;
                mesh.position.y = desc.position.y;
                mesh.position.z = desc.position.z;
            }

            // TODO: Add mesh to scene
            return new MeshComponent(mesh);
        }
    }]);

    return GeometryComponentProvider;
}(GameSystem);

// TODO: Maybe componentProvider instead of .system?


NGEN.system('GeometryProvider', GeometryComponentProvider);

//# sourceMappingURL=geometry_provider_threejs-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class manages a collection of shaders available within the running title.
 */

var ShaderProvider = function () {
    function ShaderProvider() {
        _classCallCheck(this, ShaderProvider);

        this.shaderMap = new Map();
    }

    /**
     * Loads a collection of shaders from the specified JSON data.
     * @param jsonData {String} JSON data containing the shader source code to be loaded.
     */


    _createClass(ShaderProvider, [{
        key: 'loadJSON',
        value: function loadJSON(jsonData) {
            if (jsonData) {
                var count = jsonData.shaders.length;
                for (var loop = 0; loop < count; ++loop) {
                    var name = jsonData.shaders[loop].name;
                    //                const shader = new Shader( jsonData[ loop ].name, jsonData[ loop ].type, jsonData[ loop ].source.join() );
                    //                this.shaderMap.set( shader.name, shader );
                    this.shaderMap.set(name, jsonData.shaders[loop].source.join('\n'));
                }
            }
        }

        /**
         * Retrieves the shader associated with a specified name.
         * @param name {String} Name of the shader to be retrieved.
         * @returns {V} The shader associated with the specified name, if one could not be found this method returns undefined.
         */

    }, {
        key: 'getShader',
        value: function getShader(name) {
            if (!this.shaderMap.get(name)) {
                console.log('Unable to find ' + name);
            }

            return this.shaderMap.get(name);
        }
    }]);

    return ShaderProvider;
}();

NGEN.system('ShaderProvider', ShaderProvider);

//# sourceMappingURL=shader_provider-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * This class manages a collection of materials available within the running title.
 */

var MaterialProvider = function (_GameSystem) {
    _inherits(MaterialProvider, _GameSystem);

    function MaterialProvider() {
        _classCallCheck(this, MaterialProvider);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MaterialProvider).call(this));

        _this.materialMap = new Map();
        return _this;
    }

    /**
     * Retrieves the shader associated with a specified name.
     * @param name {String} Name of the shader to be retrieved.
     * @returns {V} The shader associated with the specified name, if one could not be found this method returns undefined.
     */


    _createClass(MaterialProvider, [{
        key: 'getMaterial',
        value: function getMaterial(name) {
            return this.materialMap.get(name);
        }

        /**
         * Loads a material definition file from the specified URL. Once complete, the supplied callback is invoked.
         * @param url {String} Location of the JSON document to be loaded.
         * @param callback {Function} Method to be invoked once loading has completed, the callback should take a single 'error' parameter. If no error was encountered this parameter will be undefined.
         */

    }, {
        key: 'loadJSON',
        value: function loadJSON(url, callback) {
            var self = this;
            $.getJSON(url, function (data) {
                // TODO: Load materials
            }).fail(function () {
                if (callback) {
                    callback('Failed');
                }
            });
        }
    }]);

    return MaterialProvider;
}(GameSystem);

NGEN.system('MaterialProvider', MaterialProvider);

//# sourceMappingURL=material_provider-compiled.js.map
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Represents a renderable mesh component within the game.
 */

var MeshComponent = function (_Component) {
    _inherits(MeshComponent, _Component);

    function MeshComponent(mesh) {
        _classCallCheck(this, MeshComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MeshComponent).call(this));

        _this.mesh = mesh;
        return _this;
    }

    /**
     * Called by the framework when it's time for us to initialize ourselves.
     * @param entity {Entity} The entity to which we belong.
     */


    _createClass(MeshComponent, [{
        key: 'onInitialize',
        value: function onInitialize(entity) {
            _get(Object.getPrototypeOf(MeshComponent.prototype), 'onInitialize', this).call(this, entity);
            console.log('adding mesh to scene');
            NGEN.scene.add(this.mesh);
        }

        /**
         * Assigns a position to the rendered geometry.
         * @param x {Number} Distance along the x axis.
         * @param y {Number} Distance along the y axis.
         * @param z {Number} Distance along the z axis.
         */

    }, {
        key: 'setPosition',
        value: function setPosition(x, y, z) {
            this.mesh.position.x = x;
            this.mesh.position.y = y;
            this.mesh.position.z = z;
        }
    }]);

    return MeshComponent;
}(Component);

//# sourceMappingURL=mesh_component-compiled.js.map