document.getElementById('connectButton').addEventListener('click', () => {
    const statusElement = document.getElementById('status');
    
    // Request a Bluetooth device
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'] // array of services
    })
    .then(device => {
        statusElement.textContent = 'Connecting to ' + device.name + '...';
        return device.gatt.connect();
    })
    .then(server => {
        statusElement.textContent = 'Connected. Getting Battery Service...';
        return server.getPrimaryService('battery_service');
    })
    .then(service => {
        statusElement.textContent = 'Getting Battery Level Characteristic...';
        return service.getCharacteristic('battery_level');
    })
    .then(characteristic => {
        return characteristic.readValue();
    })
    .then(value => {
        const batteryLevel = value.getUint8(0);
        statusElement.textContent = 'Battery Level: ' + batteryLevel + '%';
    })
    .catch(error => {
        statusElement.textContent = 'Error: ' + error;
    });
});