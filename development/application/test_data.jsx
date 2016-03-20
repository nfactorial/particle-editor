/**
 * This data will eventually be retrieved from the server.
 * It is used to represent the current asset being edited within the application.
 */
module.exports.testEmitters = [
    {
        name: 'Emitter A',
        modules: [
            {
                name: 'Lifetime',
                enabled: true,
                properties: [
                    {
                        name: 'Minimum Age',
                        type: 'scalar',
                        minimum: 0.0,
                        maximum: 10.0,
                        value: 0.5
                    },
                    {
                        name: 'Maximum Age',
                        type: 'scalar',
                        minimum: 0.0,
                        maximum: 10.0,
                        value: 1
                    }
                ]
            },
            {
                name: 'Age',
                enabled: true
            },
            {
                name: 'Size',
                enabled: true
            }
        ]
    },
    {
        name: 'Second Emitter',
        modules: [
            {
                name: 'Property',
                enabled: true
            }
        ]
    },
    {
        name: 'Third',
        modules: [
            {
                name: 'Discover',
                enabled: true
            }
        ]
    }
];

module.exports.selectedEmitter = module.exports.testEmitters[0];
module.exports.selectedModule = module.exports.selectedEmitter.modules[0];
