const data = [
    {title: 'Home', href: ''},
    {title: 'Network', children: [
        {title: 'Interfaces', href: '#/network/interfaces'},
        {title: 'OpenVPN', href: '#/network/openvpn'}
    ]},
    {title: 'Dervelopers', children: [
        {title: 'API Docs', children: [
            {title: 'Swagger', href: '/docs'},
            {title: 'ReDoc', href: '/redoc'}
        ]}
    ]}
];

export { data as menuData };