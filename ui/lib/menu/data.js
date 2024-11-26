const data = [
    {title: 'Home', href: ''},
    {title: 'Network', children: [
        {title: 'Interfaces',   href: '#/network/interfaces'},
        {title: 'OpenVPN',      href: '#/network/openvpn'}
    ]},
    {title: 'Developers',children: [
        {title: 'API Docs', children: [
            {title: 'Swagger',  href: '/docs',  external: true},
            {title: 'ReDoc',    href: '/redoc', external: true}
        ]}
    ]}
];

export { data as menuData };