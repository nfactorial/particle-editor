"use strict";

// Horrible file, will clean it up once everythings working. Mostly due to ngenjs
// still being in development.

var defaultStates = {
    metaData: {
        content: "states",
        version: 1.0
    },
    states: [
        {
            name: "root",
            systems: [
                {
                    name: "KeyboardHandler"
                },
                {
                    name: "MouseHandler"
                },
                {
                    name: "GeometryProvider"
                },
                {
                    name: "ParticleSystemProvider"
                },
                {
                    name: "Physics"
                },
                {
                    name: "EditorWorld"
                }
            ],
            update: [
                "KeyboardHandler", "MouseHandler", "Physics", "ParticleSystemProvider", "EditorWorld"
            ]
        }
    ]
};


var defaultRenderConfig = {
    metaData: {
        content: "display",
        version: "1.0"
    },
    resources: [
        {
            name: "renderTarget",
            format: "RGB",
            inherit: "backbuffer",
            scale: 1.0
        }
    ],
    displayPorts: [
        {
            name: "standard",
            stages: [
                {
                    name: "scene",
                    generators: [
                        {
                            type: "SceneGenerator",
                            output: [ "renderTarget" ]
                        }
                    ]
                },
                {
                    name: "present",
                    generators: [
                        {
                            type: "SimpleCopy",
                            input: [ "renderTarget" ],
                            output: [ "backbuffer" ]
                        }
                    ]
                }
            ]
        }
    ]
};


/**
 * This service manages the 3D rendering system for the application.
 */
class RendererService {
    constructor(canvasElement) {
        this.canvas = canvasElement;

        //NGEN.initializeThree( this.canvas, 640, 480 );
        NGEN.initializeThree( this.canvas, this.canvas.clientWidth, this.canvas.clientHeight );

        NGEN.shaderProvider.loadJSON( defaultShaders );
        NGEN.stateTree.onInitialize( defaultStates );
        NGEN.displayManager.registerConfig( defaultRenderConfig );

        NGEN.displayManager.onInitialize();
    }

    createDisplayPort() {
        return NGEN.displayManager.createDisplayPort( 'standard' );
    }
}


var defaultShaders = {
    metaData: {
        content: "shaders",
        version: "1.0"
    },
    shaders: [
        {
            name: "point_particle_vs",
            type: "vertex",
            comments: [
                "taken from: http://threejs.org/examples/webgl_interactive_points.html",
                "will be customised soon."
            ],
            source: [
                "attribute float size;",
                "attribute vec3 customColor;",
                "",
                "varying vec3 vColor;",
                "",
                "void main() {",
                " vColor = customColor;",
                " vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                " gl_PointSize = size * ( 100.0 / length( mvPosition.xyz ) );",
                " gl_Position = projectionMatrix * mvPosition;",
                "}"
            ]
        },
        {
            name: "point_particle_ps",
            type: "pixel",
            source: [
                "uniform vec3 color;",
                "uniform sampler2D texture;",
                "",
                "varying vec3 vColor;",
                "",
                "void main() {",
                " gl_FragColor = vec4( vColor, 1.0 );//vec4( color * vColor, 1.0 );",
                " gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );",
                "}"
            ]
        },
        {
            name: "line_particle_vs",
            type: "vertex",
            source: [
                "attribute vec2 uvs;",
                "",
                "varying vec3 vColor;",
                "varying vec2 vUv;",
                "",
                "void main() {",
                " vColor = vec3(1.0,1.0,1.0);//customColor;",
                " vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
                " vUv = uvs;",
                " gl_Position = projectionMatrix * mvPosition;",
                "}"
            ]
        },
        {
            name: "line_particle_ps",
            type: "pixel",
            source: [
                "uniform sampler2D texture;",
                "",
                "varying vec3 vColor;",
                "varying vec2 vUv;",
                "",
                "void main() {",
                " gl_FragColor = vec4( vColor, 1.0 );//vec4( color * vColor, 1.0 );",
                " gl_FragColor = gl_FragColor * texture2D( texture, vUv );",
                "}"
            ]
        }
    ]
};
