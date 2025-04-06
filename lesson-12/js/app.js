let btDevice;
const statusElement = document.getElementById('status');

document.getElementById('connectButton').addEventListener('click', () => {
    
    // Request a Bluetooth device
    navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information'] // array of services
    })
    .then(device => {
        statusElement.textContent = 'Connecting to ' + device.name + '...';
        btDevice = device.gatt;
        return device.gatt.connect();
    })
    .then(server => {
        statusElement.textContent = 'Connected. Getting Battery Service...';
        return server.getPrimaryService('battery_service');
        // return server.getPrimaryService('device_information');
    })
    .then(service => {
        statusElement.textContent = 'Getting Battery Level Characteristic...';
        return service.getCharacteristic('battery_level');
        // statusElement.textContent = 'Getting Manufacturer Characteristic...';
        // return service.getCharacteristic('manufacturer_name');
    })
    .then(characteristic => {
        return characteristic.readValue();
    })
    .then(value => {
        const batteryLevel = value.getUint8(0);
        statusElement.textContent = 'Battery Level: ' + batteryLevel + '%';
        // statusElement.textContent = `Manufacturer: ${value}`;
        // console.log(value);
    })
    .catch(error => {
        statusElement.textContent = 'Error: ' + error;
    });
});

document.getElementById('disconnectButton').addEventListener('click', () => {
    if (btDevice && btDevice.gatt.connected) {
        btDevice.gatt.disconnect();
        statusElement.textContent = 'Disconnecting...';
        btDevice.gatt.addEventListener('gattserverdisconnected', () => {
            statusElement.textContent = 'GATT Server Disconnected.';
            btDevice = null; // Clear the device reference
        });
    } else {
        statusElement.textContent = 'No device connected to disconnect from.';
    }
});