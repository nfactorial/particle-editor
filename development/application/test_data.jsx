/**
 * This data will eventually be retrieved from the server.
 * It is used to represent the current asset being edited within the application.
 */
module.exports.testEmitters = [
    {
        name: 'Emitter A',
        properties: [
            {
                name: 'Lifetime',
                enabled: true
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
        properties: [
            {
                name: 'Property',
                enabled: true
            }
        ]
    },
    {
        name: 'Third',
        properties: [
            {
                name: 'Discover',
                enabled: true
            }
        ]
    }
];

module.exports.selectedElement = module.exports.testEmitters[0];
