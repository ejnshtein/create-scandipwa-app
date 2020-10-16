const path = require('path');

const dirName = path.parse(process.cwd()).name;
const cacheName = '.create-scandipwa-app-cache';

const cachePath = path.join(process.cwd(), 'node_modules', cacheName);
const templatePath = path.join(__dirname, 'templates');

// docker

const dockerServiceName = `create-scandipwa-app-${dirName}`;

// docker network
const dockerNetworkName = `${dirName}_network`;

// docker volume
const dockerMysqlVolume = {
    name: `${dirName}_mysql-data`
};
const dockerRedisVolume = {
    name: `${dirName}_redis-data`
};
const dockerElasticsearchVolume = {
    name: `${dirName}_elasticsearch-data`
};
const dockerNginxVolume = {
    name: `${dirName}_nginx-data`,
    // driver: 'local',
    opts: [
        'type=nfs',
        `device=${cachePath}/nginx/conf.d`,
        'o=bind'
    ]
};
const dockerVarnishVolume = {
    name: `${dirName}_varnish-data`,
    // driver: 'local',
    opts: [
        'type=nfs',
        `device=${cachePath}/varnish`,
        'o=bind'
    ]
};

const dockerVolumeList = [
    dockerMysqlVolume,
    dockerRedisVolume,
    dockerElasticsearchVolume,
    dockerNginxVolume,
    dockerVarnishVolume
];

// docker container
// const dockerContainerList = ['nginx', 'varnish', 'redis', 'mysql', 'elasticsearch'].map(c => `${dirName}_${c}`)
const dockerNginxContainer = () => ({
    expose: [80],
    mountVolumes: [`${dockerNginxVolume.name}:/etc/nginx/conf.d`],
    restart: 'unless-stopped',
    // TODO: use connect instead
    network: dockerNetworkName,
    image: 'nginx:1.18.0',
    name: `${dirName}_nginx`
});

// console.log(path.join(cachePath, 'varnish', 'default.vcl'))

// const dockerVarnishContainer = ({ ports = {} } = {}) => ({
//     expose: [80],
//     ports: [`${ports.app || 0}:80`],
//     mountVolumes: [`${dockerVarnishVolume.name}:/etc/varnish`],
//     restart: 'unless-stopped',
//     // TODO: use connect instead
//     network: dockerNetworkName,
//     image: 'scandipwa/varnish:latest',
//     name: `${dirName}_varnish`
// });

const dockerRedisContainer = ({ ports = {} } = {}) => ({
    ports: [ports.redis],
    mounts: [`source=${dockerRedisVolume.name},target=/data`],
    // TODO: use connect instead
    network: dockerNetworkName,
    image: 'redis:alpine',
    name: `${dirName}_redis`
});

const dockerMysqlContainer = ({ ports = {} } = {}) => ({
    expose: ['3306'],
    ports: [`${ports.mysql}:3306`],
    mounts: [`source=${dockerMysqlVolume.name},target=/var/lib/mysql`],
    env: {
        MYSQL_PORT: 3306,
        MYSQL_ROOT_PASSWORD: 'scandipwa',
        MYSQL_USER: 'magento',
        MYSQL_PASSWORD: 'magento',
        MYSQL_DATABASE: 'magento'
    },
    // TODO: use connect instead
    network: dockerNetworkName,
    image: 'mysql:5.7',
    name: `${dirName}_mysql`
});

const dockerElasticsearchContainer = ({ ports = {} } = {}) => ({
    ports: [`${ports.elasticsearch}:9200`],
    mounts: [`source=${dockerElasticsearchVolume.name},target=/usr/share/elasticsearch/data`],
    env: {
        'bootstrap.memory_lock': true,
        'xpack.security.enabled': false,
        'discovery.type': 'single-node',
        ES_JAVA_OPTS: '"-Xms512m -Xmx512m"'
    },
    // TODO: use connect instead
    network: dockerNetworkName,
    image: 'docker.elastic.co/elasticsearch/elasticsearch:7.6.2',
    name: `${dirName}_elasticsearch`
});

const dockerContainerList = [
    dockerNginxContainer,
    // dockerVarnishContainer,
    dockerRedisContainer,
    dockerMysqlContainer,
    dockerElasticsearchContainer
];

// php

// php version
const requiredPHPVersion = '7.3.22';
const requiredPHPVersionRegex = new RegExp(requiredPHPVersion);

// php bin path
const phpBinPath = `~/.phpbrew/php/php-${requiredPHPVersion}/bin/php`;

// php extensions
const phpExtensions = ['gd', 'intl'];

module.exports = {
    dirName,
    cachePath,
    templatePath,
    docker: {
        serviceName: dockerServiceName,
        networkName: dockerNetworkName,
        volumeList: dockerVolumeList,
        containerList: dockerContainerList,
        container: {
            nginx: dockerNginxContainer,
            // varnish: dockerVarnishContainer,
            redis: dockerRedisContainer,
            mysql: dockerMysqlContainer,
            elasticsearch: dockerElasticsearchContainer
        }
    },
    php: {
        requiredPHPVersion,
        requiredPHPVersionRegex,
        phpBinPath,
        phpExtensions
    }
};
