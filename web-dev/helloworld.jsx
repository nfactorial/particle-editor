// TODO: This is temporary data for testing purposes. Eventually this information will be retrieved from the server
var testEmitters = [
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

var selectedElement = testEmitters[0];


ReactDOM.render(
    <div>
        <AssetNavigator data={testEmitters}/>
        <PropertyExplorer data={selectedElement} />
    </div>,
    document.getElementById('example')
);
