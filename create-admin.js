const sdk = require('node-appwrite');

const client = new sdk.Client()
    .setEndpoint('http://localhost/v1')
    .setProject('68a7fa2482608004baec')
    .setKey('your-api-key-here'); // Bạn cần tạo API key trong console

const users = new sdk.Users(client);

const promise = users.create(
    'unique()',
    'admin@localhost.local',
    '+1234567890',
    'Admin User',
    'Admin123!'
);

promise.then(function (response) {
    console.log('Admin user created:', response);
}, function (error) {
    console.log('Error creating admin:', error);
});


