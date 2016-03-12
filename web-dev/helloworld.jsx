// TODO: This is temporary data for testing purposes. Eventually this information will be retrieved from the server
var testEmitters = [
    {
        name: 'Example A',
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
        name: 'Example B',
        properties: [
            {
                name: 'Property',
                enabled: true
            }
        ]
    },
    {
        name: 'Example C',
        properties: [
            {
                name: 'Discover',
                enabled: true
            }
        ]
    }
];



ReactDOM.render(
    <AssetNavigator data={testEmitters}/>,
    document.getElementById('example')
);
